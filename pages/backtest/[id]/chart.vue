<template>
    <div>
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold">
                {{ t('navigation.chart') }}
            </h2>
            <div class="flex items-center gap-2">
                <label for="marker-text-switch" class="text-sm font-medium">{{ t('results.chart.showLabels') }}</label>
                <USwitch id="marker-text-switch" v-model="showMarkerText" />
            </div>
        </div>

        <div v-if="store.isChartDataLoading" class="flex items-center justify-center h-96">
            <UIcon name="i-heroicons-arrow-path-20-solid" class="animate-spin h-8 w-8" />
        </div>
        <ResultsChart
            v-else-if="store.chartData"
            :ohlcv-data="store.chartData.ohlcv"
            :trades="store.chartData.trades"
            :open-positions="store.chartData.openPositions"
            :indicators="store.chartData.indicators"
            :show-marker-text="showMarkerText"
        />
        <div v-else class="text-center py-12">
            <p>{{ t('results.chart.noData') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const store = useBacktestStore();

const runId = route.params.id as string;
const showMarkerText = ref(true);

onMounted(() => {
    if (runId) {
        store.fetchChartData(runId);
    }
});
</script>
