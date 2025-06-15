<template>
    <UCard>
        <template #header>
            <h3 class="font-semibold text-base">{{ t('results.visualAnalysis.alphaChart') }}</h3>
        </template>
        <div class="relative">
            <div v-if="plotsStore.loadingStates.alpha" class="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-900/75 z-10 rounded-lg">
                <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8" />
            </div>
            <div ref="chartContainer" style="width: 100%; height: 250px;" />
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { createChart, LineSeries, LineStyle, type IChartApi, type ISeriesApi } from 'lightweight-charts';

const { t } = useI18n();
const props = defineProps<{ runId: string }>();
const plotsStore = usePlotsStore();

const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let lineSeries: ISeriesApi<'Line'> | null = null;

onMounted(() => {
    if (chartContainer.value) {
        chart = createChart(chartContainer.value, {
            width: chartContainer.value.clientWidth,
            height: 250,
            layout: { background: { color: 'transparent' }, textColor: '#d1d5db' },
            grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(75, 85, 99, 0.5)' } },
            rightPriceScale: {
                borderVisible: false,
                priceFormatter: (price: number) => `${(price * 100).toFixed(2)}%`,
            },
            timeScale: { borderVisible: false },
        });

        lineSeries = chart.addSeries(LineSeries, {
            color: '#1e88e5', // A blue color for Alpha
            lineWidth: 2,
        });

        // Add a zero line for reference
        lineSeries.createPriceLine({
            price: 0,
            color: '#787b86',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'Benchmark',
        });
    }

    plotsStore.fetchPlot('alpha', props.runId);
});

watch(() => plotsStore.plotData.alpha, (alphaData) => {
    if (alphaData && alphaData.length > 0 && lineSeries) {
        lineSeries.setData(alphaData);
        chart?.timeScale().fitContent();
    }
});

onUnmounted(() => {
    if (chart) {
        chart.remove();
        chart = null;
    }
});
</script>
