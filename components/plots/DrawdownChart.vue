<template>
    <UCard>
        <template #header>
            <h3 class="font-semibold text-base">{{ t('results.visualAnalysis.drawdownCurve') }}</h3>
        </template>
        <div class="relative">
            <div v-if="plotsStore.loadingStates.drawdown" class="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-900/75 z-10 rounded-lg">
                <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8" />
            </div>
            <div ref="chartContainer" style="width: 100%; height: 250px;" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { createChart, AreaSeries, LineStyle, type IChartApi, type ISeriesApi } from 'lightweight-charts';

const { t } = useI18n();
const props = defineProps<{ runId: string }>();
const plotsStore = usePlotsStore();

const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let areaSeries: ISeriesApi<'Area'> | null = null;

onMounted(() => {
    if (chartContainer.value) {
        chart = createChart(chartContainer.value, {
            width: chartContainer.value.clientWidth,
            height: 250,
            layout: { background: { color: 'transparent' }, textColor: '#d1d5db' },
            grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(75, 85, 99, 0.5)' } },
            rightPriceScale: {
                borderVisible: false,
                autoScale: false,
                scaleMargins: { bottom: 0, top: 0 },
                priceFormatter: (price: number) => `${(price * 100).toFixed(2)}%`,
            },
            timeScale: { borderVisible: false },
            handleScale: false,
            handleScroll: false,
        });

        areaSeries = chart.addSeries(AreaSeries, {
            topColor: 'rgba(239, 83, 80, 0.56)',
            bottomColor: 'rgba(239, 83, 80, 0.04)',
            lineColor: 'rgba(239, 83, 80, 1)',
            lineWidth: 2,
            priceLineVisible: false,
            axisLabelVisible: false,
            invertFilledArea: true,
        });

        // Add a zero line for reference
        areaSeries.createPriceLine({
            price: 0,
            color: '#787b86',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: false,
        });
    }

    plotsStore.fetchPlot('drawdown', props.runId);
});

watch(() => plotsStore.plotData.drawdown, (drawdownData) => {
    if (drawdownData && drawdownData.length > 0 && areaSeries) {
        // Restore the dynamic zoom calculation as requested
        const dataPointCount = drawdownData.length;
        const chartWidth = chartContainer.value.clientWidth - 70; // Subtract the width of the price scale
        const dynamicMinBarSpacing = chartWidth / dataPointCount;

        chart.applyOptions({
            timeScale: {
                minBarSpacing: dynamicMinBarSpacing,
            },
        });

        areaSeries.setData(drawdownData);

        // Find the lowest point of the drawdown.
        const minValue = Math.min(...drawdownData.map(p => p.value));

        // Manually set the visible range, capping the top at 0 and adding 10% padding to the bottom.
        chart.priceScale('right').setVisibleRange({
            from: minValue * 1.1, // e.g., if min is -0.10, `from` becomes -0.11
            to: 0,
        });

        chart.timeScale().fitContent();
    }
});

onUnmounted(() => {
    if (chart) {
        chart.remove();
        chart = null;
    }
    // The store reset is handled by the EquityChart component
});
</script>
