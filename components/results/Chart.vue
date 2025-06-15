<template>
    <UCard>
        <div ref="chartContainer" />
    </UCard>
</template>

<script setup lang="ts">
import {
    createChart,
    CandlestickSeries,
    LineSeries,
    HistogramSeries,
    createSeriesMarkers,
    LineStyle,
    type IChartApi,
    type ISeriesApi,
    type SeriesType,
    type UTCTimestamp,
    type WhitespaceData,
} from 'lightweight-charts';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import type { OhlcvData } from '~/types/OhlcvData';
import type { ChartTrade } from '~/types/ChartTrade';
import type { Indicator } from '~/types/Indicator';
import type { TradeMarker } from '~/types/TradeMarker';
import type { OpenPosition } from '~/types/OpenPosition';

const props = defineProps<{
    ohlcvData: OhlcvData[];
    trades: ChartTrade[];
    openPositions: OpenPosition[];
    indicators: { [key: string]: Indicator };
    showMarkerText: boolean;
}>();

const chartContainer = ref<HTMLElement | null>(null);
let chart: IChartApi | null = null;
let markersPrimitive: ISeriesPrimitive<'SeriesMarkers'> | null = null;
const indicatorSeriesMap = new Map<string, ISeriesApi<SeriesType>>();

/**
 * Transforms raw trade and position data into the marker format required by the chart.
 * This is now reactive to the `showMarkerText` prop.
 */
const computedMarkers = computed((): TradeMarker[] => {
    const closedTradeMarkers = props.trades.flatMap(trade => {
        const entryMarker: TradeMarker = {
            time: trade.entryTime as UTCTimestamp,
            position: trade.direction === 'long' ? 'belowBar' : 'aboveBar',
            color: trade.direction === 'long' ? '#26a69a' : '#ef5350',
            shape: trade.direction === 'long' ? 'arrowUp' : 'arrowDown',
            text: props.showMarkerText ? `Entry @ ${parseFloat(trade.entryPrice).toFixed(2)}` : undefined
        };
        const exitMarker: TradeMarker = {
            time: trade.exitTime as UTCTimestamp,
            position: trade.direction === 'long' ? 'aboveBar' : 'belowBar',
            color: '#787b86',
            shape: 'square',
            text: props.showMarkerText ? `Exit @ ${parseFloat(trade.exitPrice).toFixed(2)}` : undefined
        };
        return [entryMarker, exitMarker];
    });

    const openPositionMarkers = props.openPositions.map((pos): TradeMarker => ({
        time: pos.entryTime as UTCTimestamp,
        position: pos.direction === 'long' ? 'belowBar' : 'aboveBar',
        color: '#ff9800',
        shape: 'circle',
        text: props.showMarkerText ? `Open @ ${parseFloat(pos.entryPrice).toFixed(2)}` : undefined,
    }));

    return [...closedTradeMarkers, ...openPositionMarkers];
});

/**
 * Renders all indicators, creating new panes as needed.
 */
const renderIndicators = () => {
    if (!chart || !props.indicators) return;

    indicatorSeriesMap.forEach(series => chart!.removeSeries(series));
    indicatorSeriesMap.clear();

    let paneIndex = 1;

    Object.values(props.indicators).forEach(indicator => {
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
    });
};

onMounted(() => {
    if (chartContainer.value) {
        chart = createChart(chartContainer.value, {
            width: chartContainer.value.clientWidth,
            height: 600,
            autoSize: true,
            layout: { background: { color: 'transparent' }, textColor: '#d1d5db' },
            grid: { vertLines: { color: 'rgba(75, 85, 99, 0.5)' }, horzLines: { color: 'rgba(75, 85, 99, 0.5)' } },
            rightPriceScale: { borderVisible: false },
            timeScale: { borderVisible: false },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, { pane: 0 });
        candlestickSeries.setData(props.ohlcvData);

        // Create the markers primitive ONCE and store its reference
        markersPrimitive = createSeriesMarkers(candlestickSeries);
        markersPrimitive.setMarkers(computedMarkers.value);

        renderIndicators();

        chart.timeScale().fitContent();
    }
});

// This watcher now correctly updates the single, persistent markers primitive
watch(computedMarkers, (newMarkers) => {
    if (markersPrimitive) {
        markersPrimitive.setMarkers(newMarkers);
    }
});

onUnmounted(() => {
    if (chart) {
        indicatorSeriesMap.forEach(series => chart!.removeSeries(series));
        chart.remove();
        chart = null;
    }
});
</script>
