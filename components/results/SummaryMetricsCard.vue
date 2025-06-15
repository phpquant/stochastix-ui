<template>
    <div>
        <h3 class="text-xl font-semibold mb-3">{{ title }}</h3>
        <div class="flex flex-col xl:flex-row items-start justify-between gap-6">
            <UCard v-for="(group, index) in metricGroups" :key="index" class="w-full">
                <template #header>
                    <h4 class="font-semibold text-base">{{ t(group.title) }}</h4>
                </template>

                <template #default>
                    <dl class="space-y-4">
                        <div
                            v-for="key in group.keys"
                            :key="key"
                            class="flex justify-between border-b border-dashed border-gray-200 dark:border-gray-800 py-1 gap-5"
                        >
                            <dt class="text-sm text-gray-500 dark:text-gray-400">{{
                                    t(`results.detailed.metrics.${key}`)
                                }}
                            </dt>
                            <dd class="text-sm font-medium text-gray-900 dark:text-gray-50">
                                {{ formatMetric(key, metrics[key]) }}
                            </dd>
                        </div>
                    </dl>
                </template>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const props = defineProps<{
    title: string;
    metrics: SummaryMetrics;
}>();

// Group metrics into logical categories for separate cards.
const metricGroups = [
    {
        title: 'results.detailed.groups.general',
        keys: ['backtestingFrom', 'backtestingTo', 'maxOpenTrades', 'marketChangePercentage'],
    },
    {
        title: 'results.detailed.groups.performance',
        keys: [
            'startingBalance', 'finalBalance', 'absProfit', 'totalProfitPercentage',
            'cagrPercentage', 'profitFactor', 'expectancy', 'expectancyRatio',
            'sortino', 'sharpe', 'calmar',
        ],
    },
    {
        title: 'results.detailed.groups.timing',
        keys: ['totalTrades', 'dailyAvgTrades', 'avgDurationWinnersMin', 'avgDurationLosersMin', 'maxConsecutiveWins', 'maxConsecutiveLosses'],
    },
    {
        title: 'results.detailed.groups.drawdown',
        keys: ['maxAccountUnderwaterPercentage', 'absoluteDrawdown'],
    },
];

/**
 * Formats a duration from total minutes into a human-readable string like "2d 4h 30m".
 */
const formatDetailedDuration = (totalMinutes: number): string => {
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

/**
 * Formats the metric value based on its key for proper presentation.
 */
const formatMetric = (key: keyof SummaryMetrics, value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value !== 'number') return String(value);

    // Handle Durations with the new detailed formatter
    if (key === 'avgDurationWinnersMin' || key === 'avgDurationLosersMin') {
        return formatDetailedDuration(value);
    }

    // Handle plain integers
    if (['totalTrades', 'maxOpenTrades', 'maxConsecutiveWins', 'maxConsecutiveLosses'].includes(key)) {
        return value.toString();
    }

    // Handle percentages
    if (key.toLowerCase().includes('percentage') || key.toLowerCase().includes('pct')) {
        return `${value.toFixed(2)}%`;
    }

    // Handle currency values
    if (['startingBalance', 'finalBalance', 'absProfit', 'absoluteDrawdown'].includes(key)) {
        return `${value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} ${props.metrics.balanceCurrency || ''}`;
    }

    // Default number formatting for ratios etc.
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
