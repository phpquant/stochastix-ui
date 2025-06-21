<template>
    <div class="space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
            <h1 class="text-2xl font-bold">Chart Explorer</h1>

            <div class="flex items-center justify-end grow gap-2 flex-wrap">
                <USelectMenu
                    v-model="selectedDataset"
                    :items="availableDatasets"
                    placeholder="Select a Dataset"
                    class="w-72"
                    value-key="id"
                    label-key="label"
                />

                <UButton
                    icon="i-heroicons-plus-circle"
                    label="Indicators"
                    :disabled="!store.currentSymbol"
                    @click="isIndicatorDrawerOpen = true"
                />

                <UButton
                    icon="i-heroicons-arrow-path"
                    variant="ghost"
                    color="gray"
                    :disabled="!store.currentSymbol || store.isLoading"
                    @click="store.loadChart()"
                />
            </div>
        </div>

        <ExploreChart v-if="store.currentSymbol" />
        <UAlert v-else icon="i-heroicons-arrow-up" title="Select a dataset to begin" />

        <ExploreIndicatorDrawer v-model:open="isIndicatorDrawerOpen" />
    </div>
</template>

<script setup lang="ts">
const dataAvailabilityStore = useDataAvailabilityStore();
const store = useChartExplorerStore();

const isIndicatorDrawerOpen = ref(false);

const availableDatasets = computed(() => {
    return dataAvailabilityStore.manifest.flatMap(item =>
        item.timeframes.map(tf => ({
            id: `${item.exchange}:${item.symbol}:${tf.timeframe}`,
            label: `${item.symbol} (${tf.timeframe}) on ${item.exchange}`,
            exchange: item.exchange,
            symbol: item.symbol,
            timeframe: tf.timeframe
        }))
    );
});

const selectedDatasetId = ref<string | null>(null);

const selectedDataset = computed({
    get() {
        if (!store.currentSymbol || !store.currentTimeframe || !store.currentExchange) return null;
        return availableDatasets.value.find(d =>
            d.exchange === store.currentExchange &&
            d.symbol === store.currentSymbol &&
            d.timeframe === store.currentTimeframe
        ) || null;
    },
    set(dataset) {
        if (dataset) {
            store.currentExchange = dataset.exchange;
            store.currentSymbol = dataset.symbol;
            store.currentTimeframe = dataset.timeframe;
            store.currentIndicators = [];
            store.currentLayoutId = null;
            store.loadChart();
        }
    }
});

onMounted(() => {
    dataAvailabilityStore.fetchManifest();
    store.fetchAvailableIndicators();
    store.fetchLayouts();
});

onUnmounted(() => {
    store.resetCurrentChart();
})
</script>
