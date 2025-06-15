<template>
    <UCard>
        <template #header>
            <div class="flex justify-between items-center">
                <h3 class="font-semibold text-base">{{ t('results.visualAnalysis.equityCurve') }}</h3>
                <div class="flex items-center gap-x-4 text-sm">
                    <div class="flex items-center gap-x-2">
                        <USwitch v-model="showEquity" size="sm" />
                        <span class="flex-shrink-0 w-3 h-3 rounded-full bg-green-500" />
                        <span>Equity</span>
                    </div>
                    <div class="flex items-center gap-x-2">
                        <USwitch v-model="showBenchmark" size="sm" />
                        <span class="flex-shrink-0 w-3 h-0.5 bg-blue-500" />
                        <span>Benchmark</span>
                    </div>
                </div>

            </div>
        </template>
        <div class="relative">
            <div v-if="plotsStore.loadingStates.equity || plotsStore.loadingStates.benchmark" class="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-900/75 z-10 rounded-lg">
                <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8" />
            </div>
            <div ref="chartContainer" style="width: 100%; height: 400px;" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { createChart, AreaSeries, LineSeries, type IChartApi, type ISeriesApi } from 'lightweight-charts';

const { t } = useI18n();
const props = defineProps<{ runId: string }>();
const plotsStore = usePlotsStore();

const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let equitySeries: ISeriesApi<'Area'> | null = null;
let benchmarkSeries: ISeriesApi<'Line'> | null = null;

const showEquity = ref(true);
const showBenchmark = ref(true);

onMounted(() => {
    if (chartContainer.value) {
        chart = createChart(chartContainer.value, {
            width: chartContainer.value.clientWidth,
            height: 400,
            layout: { background: { color: 'transparent' }, textColor: '#d1d5db' },
            grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(75, 85, 99, 0.5)' } },
            rightPriceScale: { borderVisible: false },
            timeScale: { borderVisible: false },
        });

        equitySeries = chart.addSeries(AreaSeries, {
            topColor: 'rgba(76, 175, 80, 0.56)',
            bottomColor: 'rgba(76, 175, 80, 0.04)',
            lineColor: 'rgba(76, 175, 80, 1)',
            lineWidth: 2,
        });

        benchmarkSeries = chart.addSeries(LineSeries, {
            color: '#2962FF',
            lineWidth: 2,
        });
    }

    plotsStore.fetchPlot('equity', props.runId);
    plotsStore.fetchPlot('benchmark', props.runId);
});

// Watcher to toggle equity series visibility
watch(showEquity, (isVisible) => {
    if (equitySeries) {
        equitySeries.applyOptions({ visible: isVisible });
    }
});

// Watcher to toggle benchmark series visibility
watch(showBenchmark, (isVisible) => {
    if (benchmarkSeries) {
        benchmarkSeries.applyOptions({ visible: isVisible });
    }
});

// Use an explicit watch on multiple sources instead of watchEffect
watch(
    [() => plotsStore.plotData.equity, () => plotsStore.plotData.benchmark],
    ([equityData, benchmarkData]) => {
        // Guard against running before the chart and series are initialized
        if (!chart || !equitySeries || !benchmarkSeries || !chartContainer.value) {
            return;
        }

        let dataWasSet = false;

        if (equityData && equityData.length > 0) {
            // Restore the dynamic zoom calculation as requested
            const dataPointCount = equityData.length;
            const chartWidth = chartContainer.value.clientWidth - 70; // Subtract the width of the price scale
            const dynamicMinBarSpacing = chartWidth / dataPointCount;

            chart.applyOptions({
                timeScale: {
                    minBarSpacing: dynamicMinBarSpacing,
                },
            });

            equitySeries.setData(equityData);
            dataWasSet = true;
        }

        if (benchmarkData && benchmarkData.length > 0) {
            benchmarkSeries.setData(benchmarkData);
            dataWasSet = true;
        }

        if (dataWasSet) {
            chart.timeScale().fitContent();
        }
    },
    { deep: true } // Watch deeply to detect changes within the arrays
);


onUnmounted(() => {
    if (chart) {
        chart.remove();
        chart = null;
    }
    plotsStore.reset();
});
</script>
