<template>
    <div>
        <h2 class="text-2xl font-semibold mb-1">
            {{ t('history.title') }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {{ t('history.description') }}
        </p>

        <div v-if="backtestStore.savedBacktestsStatus === 'loading'" class="space-y-2">
            <USkeleton class="h-12 w-full" v-for="i in 5" :key="i" />
        </div>

        <UTable v-else-if="backtestStore.savedBacktests?.length" :data="backtestStore.savedBacktests" :columns="columns">
            <template #timestamp-cell="{ row }">
                <span>{{ new Date(row.original.timestamp * 1000).toLocaleString() }}</span>
            </template>

            <template #actions-cell="{ row }">
                <div class="space-x-2">
                    <UButton
                        class="cursor-pointer"
                        icon="i-heroicons-arrow-top-right-on-square-20-solid"
                        size="sm"
                        color="neutral"
                        variant="solid"
                        :aria-label="t('history.load')"
                        @click="loadBacktest(row.original.runId)"
                    />
                    <UButton
                        class="cursor-pointer"
                        icon="i-heroicons-trash-20-solid"
                        size="sm"
                        color="neutral"
                        variant="ghost"
                        :aria-label="t('history.delete')"
                        @click="handleDelete(row.original.runId)"
                    />
                </div>
            </template>
        </UTable>

        <UAlert v-else icon="i-heroicons-circle-stack" :title="t('history.empty')" />
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const backtestStore = useBacktestStore();

onMounted(() => {
    backtestStore.fetchSavedBacktests();
});

const columns = [
    { accessorKey: 'runId', header: t('history.cols.runId') },
    { accessorKey: 'strategyAlias', header: t('history.cols.strategy') },
    { accessorKey: 'timestamp', header: t('history.cols.date') },
    { accessorKey: 'actions', header: t('history.cols.actions'), class: 'text-right' },
];

const loadBacktest = (runId: string) => {
    navigateTo(`/backtest/${runId}`);
};

const handleDelete = (runId: string) => {
    if (confirm(`Are you sure you want to permanently delete the backtest run "${runId}"?`)) {
        backtestStore.deleteBacktest(runId);
    }
};
</script>
