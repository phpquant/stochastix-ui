<template>
    <div>
        <UNavigationMenu :items="defaultLinks" orientation="vertical" />
        <div v-if="shouldShowBacktestMenu" class="mt-4">
            <USeparator :label="t('navigation.backtestSeparator')" />
            <UNavigationMenu :items="backtestLinks" orientation="vertical" class="mt-2" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const backtestStore = useBacktestStore();

// The "active" run is simply the one currently tracked by the store.
const activeRunId = computed(() => backtestStore.currentBacktestId);

// The menu should be visible whenever there is an active backtest in the store.
const shouldShowBacktestMenu = computed(() => !!activeRunId.value);

const defaultLinks = computed(() => [
    {
        label: t('navigation.newBacktest'),
        icon: 'i-heroicons-document-plus-20-solid',
        to: '/',
    },
    {
        label: t('navigation.loadBacktest'),
        icon: 'i-heroicons-clock-20-solid',
        to: '/history',
    },
    {
        label: t('navigation.dataManagement'),
        icon: 'i-heroicons-circle-stack-20-solid',
        to: '/data',
    },
]);

const backtestLinks = computed(() => {
    if (!activeRunId.value) {
        return [];
    }

    // The links are enabled only if the full result object is present in the store.
    // This is the most reliable indicator of a completed and loaded backtest.
    const isCompleteAndLoaded = !!backtestStore.backtestResult;

    return [
        {
            label: t('navigation.summary'),
            icon: 'i-heroicons-chart-pie-20-solid',
            to: `/backtest/${activeRunId.value}`,
            exact: true,
        },
        {
            label: t('navigation.detailedResults'),
            icon: 'i-heroicons-table-cells-20-solid',
            to: `/backtest/${activeRunId.value}/detailed-results`,
            disabled: !isCompleteAndLoaded,
        },
        {
            label: t('navigation.visualAnalysis'),
            icon: 'i-heroicons-chart-bar-square-20-solid',
            to: `/backtest/${activeRunId.value}/visual-analysis`,
            disabled: !isCompleteAndLoaded,
        },
        {
            label: t('navigation.chart'),
            icon: 'i-heroicons-presentation-chart-line-20-solid',
            to: `/backtest/${activeRunId.value}/chart`,
            disabled: !isCompleteAndLoaded,
        },
    ];
});
</script>
