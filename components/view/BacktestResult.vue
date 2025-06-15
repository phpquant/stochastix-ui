<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-xl font-bold">
                    {{ t('results.page.title') }}
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ t('results.page.idLabel') }} {{ runId }}
                </p>
            </div>
        </div>

        <div v-if="!isProcessFinished && !backtestStore.backtestResult" class="border border-dashed border-gray-200 dark:border-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-1">
                <p class="font-semibold text-primary">{{ progressTitle }}</p>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ backtestStore.backtestProgress.progress }}%
                </span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {{ progressMessage }}
            </p>
            <UProgress :value="backtestStore.backtestProgress.progress" />
        </div>

        <UAlert
            v-if="backtestStore.backtestProgress.status === 'failed'"
            icon="i-heroicons-exclamation-triangle-20-solid"
            color="error"
            variant="soft"
            :title="t('results.page.progress.alertTitleFailed')"
            :description="progressMessage"
        />

        <div v-if="backtestStore.backtestResult" class="space-y-6">
            <ResultsSummary :results="backtestStore.backtestResult" />
            <ResultsOpenPositionsLog
                v-if="backtestStore.backtestResult.openPositions?.length > 0"
                :positions="backtestStore.backtestResult.openPositions"
            />
            <ResultsTradesLog :trades="backtestStore.backtestResult.closedTrades" />
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    runId: string;
}>();

const { t } = useI18n();
const backtestStore = useBacktestStore();
const { public: { apiUrl } } = useRuntimeConfig();
let eventSource: EventSource | null = null;

const isProcessFinished = computed(() => {
    const status = backtestStore.backtestProgress.status;
    return status === 'completed' || status === 'failed';
});

const progressTitle = computed(() => {
    const status = backtestStore.backtestProgress.status;
    if (status === 'running') {
        return t('results.page.progress.titleRunning');
    }
    return t('results.page.progress.titleConnecting');
});

const progressMessage = computed(() => {
    const progress = backtestStore.backtestProgress;
    // Handle error messages from Mercure payload
    if (progress.status === 'failed' && progress.error) {
        return progress.error;
    }
    // Handle translated messages from Mercure payload
    if (progress.messageKey) {
        return t(progress.messageKey, progress.messageParams || {});
    }
    return '...';
});

const setupMercureListener = () => {
    const mercureUrl = new URL(apiUrl || window.location.origin);
    mercureUrl.pathname = '/.well-known/mercure';
    const topic = `/backtests/${props.runId}/progress`;

    eventSource = new EventSource(mercureUrl.toString() + `?topic=${encodeURIComponent(topic)}`);

    eventSource.onopen = () => {
        // Set initial state to connecting if we successfully open a connection
        if (backtestStore.backtestProgress.status === 'loading') {
            backtestStore.backtestProgress.status = 'connecting';
        }
    };

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        backtestStore.backtestProgress = data;

        if (data.status === 'completed') {
            backtestStore.fetchResult(props.runId);
            eventSource?.close();
        }
        if (data.status === 'failed') {
            eventSource?.close();
        }
    };

    eventSource.onerror = () => {
        // Only set to failed if we aren't already in a completed state
        if (backtestStore.backtestProgress.status !== 'completed') {
            backtestStore.backtestProgress = {
                status: 'failed',
                progress: backtestStore.backtestProgress.progress,
                messageKey: 'results.page.progress.messageConnectionFailed',
                error: t('results.page.progress.messageConnectionFailed')
            };
        }
        eventSource?.close();
    };
};

onMounted(async () => {
    backtestStore.resetResultState();

    // 1. Attempt to fetch the final results immediately on page load.
    const alreadyCompleted = await backtestStore.fetchResult(props.runId);

    // 2. If results were not found (i.e., backtest is not yet complete),
    // then and only then, connect to Mercure to listen for live updates.
    if (!alreadyCompleted) {
        setupMercureListener();
    }
});
</script>
