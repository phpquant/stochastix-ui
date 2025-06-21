<template>
    <UCard>
        <div ref="chartContainer" class="relative">
            <div v-if="store.isLoading" class="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-gray-900/75 z-10 rounded-lg">
                <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8" />
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import {
    createChart,
    CandlestickSeries,
    LineSeries,
    HistogramSeries,
    LineStyle,
    type IChartApi,
    type ISeriesApi,
    type SeriesType,
    type UTCTimestamp,
    type WhitespaceData,
} from 'lightweight-charts';

const store = useChartExplorerStore();
const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let mainSeries: ISeriesApi<'Candlestick'> | null = null;
const indicatorSeriesMap = new Map<string, ISeriesApi<SeriesType>>();
let isFetchingOlderData = false;

const renderChart = () => {
    if (!chartContainer.value) return;

    chart = createChart(chartContainer.value, {
        width: chartContainer.value.clientWidth,
        height: 600,
        autoSize: true,
        layout: { background: { color: 'transparent' }, textColor: '#d1d5db' },
        grid: { vertLines: { color: 'rgba(75, 85, 99, 0.5)' }, horzLines: { color: 'rgba(75, 85, 99, 0.5)' } },
        rightPriceScale: { borderVisible: false },
        timeScale: { borderVisible: false },
    });

    mainSeries = chart.addSeries(CandlestickSeries, { pane: 0 });

    chart.timeScale().subscribeVisibleTimeRangeChange(async (timeRange) => {
        if (isFetchingOlderData || !timeRange?.from || !store.ohlcv.length) return;

        const firstTimestamp = store.ohlcv[0].time;
        if (timeRange.from <= firstTimestamp) {
            isFetchingOlderData = true;
            await store.loadChart(1000, firstTimestamp as number);
            isFetchingOlderData = false;
        }
    });

    updateChartData();
};

const renderIndicators = () => {
    if (!chart || !store.indicatorsData) return;

    // Clear existing indicators
    indicatorSeriesMap.forEach(series => chart!.removeSeries(series));
    indicatorSeriesMap.clear();

    let paneIndex = 1;

    for (const key in store.indicatorsData) {
        const indicator = store.indicatorsData[key];
        if (!indicator || !indicator.metadata) continue;

        const isOverlay = indicator.metadata.overlay;
        const targetPane = isOverlay ? 0 : paneIndex;
        let firstSeriesInPane: ISeriesApi<SeriesType> | null = null;

        indicator.metadata.plots.forEach(plot => {
            const seriesOptions = {
                color: plot.color,
                lineWidth: (plot as any).width ?? 1,
                priceLineVisible: false,
                lastValueVisible: false,
            };

            let newSeries: ISeriesApi<SeriesType> | null = null;
            const plotData = (indicator.data[plot.key] || []) as (WhitespaceData | { time: UTCTimestamp; value: number })[];
            if (!plotData.length) return;

            if (plot.type === 'line') {
                newSeries = chart!.addSeries(LineSeries, seriesOptions, targetPane);
            } else if (plot.type === 'histogram') {
                newSeries = chart!.addSeries(HistogramSeries, seriesOptions, targetPane);
            }

            if (newSeries) {
                newSeries.setData(plotData);
                indicatorSeriesMap.set(`${indicator.metadata.name}_${plot.key}`, newSeries);
                if (!firstSeriesInPane) firstSeriesInPane = newSeries;
            }
        });

        if (firstSeriesInPane && indicator.metadata.annotations) {
            indicator.metadata.annotations.forEach(annotation => {
                if (annotation.type === 'horizontal_line') {
                    firstSeriesInPane!.createPriceLine({
                        price: annotation.value,
                        color: annotation.color,
                        lineWidth: (annotation as any).width ?? 1,
                        lineStyle: LineStyle[annotation.style.charAt(0).toUpperCase() + annotation.style.slice(1) as keyof typeof LineStyle],
                        axisLabelVisible: true,
                    });
                }
            });
        }

        if (!isOverlay) {
            paneIndex++;
        }
    }
};

const updateChartData = () => {
    if (!chart || !mainSeries) return;

    if (store.ohlcv.length > 0) {
        mainSeries.setData(store.ohlcv);
    }

    renderIndicators();

    if (store.ohlcv.length > 0) {
        chart.timeScale().fitContent();
    }
};

onMounted(() => {
    renderChart();
});

watch(() => store.ohlcv, updateChartData, { deep: true });
watch(() => store.indicatorsData, updateChartData, { deep: true });

onUnmounted(() => {
    if (chart) {
        chart.remove();
        chart = null;
    }
});
</script>
