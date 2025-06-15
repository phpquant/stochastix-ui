<template>
    <UCard>
        <template #header>
            <h3 class="text-lg font-semibold">{{ t('results.summary.title') }}</h3>
        </template>
        <dl class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div v-for="metric in summaryMetrics" :key="metric.label" class="flex flex-col p-4 border rounded-lg dark:border-gray-800">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ metric.label }}</dt>
                <dd class="mt-1 text-xl font-semibold tracking-tight" :class="metric.color">{{ metric.value }}</dd>
            </div>
        </dl>
    </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
    results: any;
}>();

const { t } = useI18n();

const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
};

const summaryMetrics = computed(() => {
    const initial = Number(props.results.config.initialCapital);
    const final = Number(props.results.finalCapital);
    const pnl = final - initial;
    const pnlPercent = initial > 0 ? (pnl / initial) * 100 : 0;
    const trades = props.results.closedTrades;
    const winningTrades = trades.filter((t: any) => Number(t.pnl) > 0).length;
    const losingTrades = trades.length - winningTrades;

    return [
        { label: t('results.summary.finalCapital'), value: formatCurrency(props.results.finalCapital), color: 'text-gray-900 dark:text-white' },
        { label: t('results.summary.netPnl'), value: formatCurrency(String(pnl)), color: pnl >= 0 ? 'text-green-500' : 'text-red-500' },
        { label: t('results.summary.netPnlPercent'), value: `${pnlPercent.toFixed(2)}%`, color: pnl >= 0 ? 'text-green-500' : 'text-red-500' },
        { label: t('results.summary.totalTrades'), value: trades.length, color: 'text-gray-900 dark:text-white' },
        { label: t('results.summary.winningTrades'), value: winningTrades, color: 'text-green-500' },
        { label: t('results.summary.losingTrades'), value: losingTrades, color: 'text-red-500' },
        { label: t('results.summary.winRate'), value: trades.length > 0 ? `${((winningTrades / trades.length) * 100).toFixed(2)}%` : 'N/A', color: 'text-gray-900 dark:text-white' },
    ];
});
</script>
