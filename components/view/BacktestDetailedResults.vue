<template>
    <div>
        <h2 class="text-2xl font-semibold mb-6">{{ t('results.detailed.title') }}</h2>

        <ResultsStatsTable
            v-if="statistics.pairStats?.length"
            :title="t('results.detailed.pairStats')"
            :data="statistics.pairStats"
            :columns="pairStatsColumns"
        />

        <ResultsStatsTable
            v-if="statistics.enterTagStats?.length"
            :title="t('results.detailed.enterTagStats')"
            :data="statistics.enterTagStats"
            :columns="enterTagStatsColumns"
        />

        <ResultsStatsTable
            v-if="statistics.exitTagStats?.length"
            :title="t('results.detailed.exitTagStats')"
            :data="statistics.exitTagStats"
            :columns="exitTagStatsColumns"
        />

        <ResultsSummaryMetricsCard
            v-if="statistics.summaryMetrics"
            :title="t('results.detailed.summaryMetrics')"
            :metrics="statistics.summaryMetrics"
        />
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

defineProps<{
    statistics: BacktestStatistics
}>();

const formatDuration = (totalMinutes: number): string => {
    if (!totalMinutes || totalMinutes <= 0) return '0m';

    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = Math.floor(totalMinutes % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

    return parts.join(' ');
};

const baseStatsColumns: ColumnDef<StatsTableEntry>[] = [
    { accessorKey: 'trades', header: t('results.detailed.cols.trades'), },
    {
        accessorKey: 'averageProfitPercentage',
        header: t('results.detailed.cols.avgProfitPct'),
        cell: props => h('span', `${props.getValue()?.toFixed(2)}%`),
    },
    {
        accessorKey: 'totalProfit',
        header: t('results.detailed.cols.totalProfit'),
        cell: props => h('span', props.getValue()?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })),
    },
    {
        accessorKey: 'totalProfitPercentage',
        header: t('results.detailed.cols.totalProfitPct'),
        cell: props => h('span', `${props.getValue()?.toFixed(2)}%`),
    },
    {
        accessorKey: 'avgDurationMin',
        header: t('results.detailed.cols.avgDurationMin'),
        cell: props => h('span', formatDuration(props.getValue() as number)),
    },
    { accessorKey: 'wins', header: t('results.detailed.cols.wins') },
    { accessorKey: 'draws', header: t('results.detailed.cols.draws') },
    { accessorKey: 'losses', header: t('results.detailed.cols.losses') },
];

const pairStatsColumns: ColumnDef<StatsTableEntry>[] = [
    { accessorKey: 'label', header: t('results.detailed.cols.pair') },
    ...baseStatsColumns,
];

const enterTagStatsColumns: ColumnDef<StatsTableEntry>[] = [
    { accessorKey: 'label', header: t('results.detailed.cols.enterTag') },
    ...baseStatsColumns,
];

const exitTagStatsColumns: ColumnDef<StatsTableEntry>[] = [
    { accessorKey: 'label', header: t('results.detailed.cols.exitReason') },
    ...baseStatsColumns,
];
</script>
