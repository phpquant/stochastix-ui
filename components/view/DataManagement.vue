<template>
    <div class="space-y-8">
        <div>
            <h2 class="text-2xl font-semibold mb-1">
                {{ t('data.management.title') }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('data.management.description') }}
            </p>
        </div>

        <DataDownloadForm />
        <DataProgressList />

        <div>
            <h3 class="text-xl font-semibold mb-3">
                {{ t('data.management.availableTitle') }}
            </h3>

            <div v-if="dataAvailabilityStore.isLoading" class="space-y-6">
                <UCard v-for="i in 2" :key="i">
                    <template #header>
                        <USkeleton class="h-6 w-1/4" />
                    </template>
                    <USkeleton class="h-24 w-full" />
                </UCard>
            </div>

            <div v-else-if="processedManifest.length > 0" class="space-y-8">
                <div v-for="item in processedManifest" :key="item.symbol">
                    <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
                        <UIcon name="i-heroicons-arrows-right-left-20-solid" />
                        {{ item.symbol }}
                        <UBadge color="neutral" variant="soft">{{ item.exchange }}</UBadge>
                    </h3>
                    <UCard>
                        <UTable :data="item.timeframes" :columns="timeframeColumns">
                            <template #actions-cell="{ row }">
                                <UButton
                                    icon="i-heroicons-magnifying-glass-20-solid"
                                    size="sm"
                                    color="neutral"
                                    variant="ghost"
                                    :aria-label="t('data.management.inspect')"
                                    @click="inspectDataset(item.exchange, item.symbol, row.original.timeframe)"
                                />
                            </template>
                        </UTable>
                    </UCard>
                </div>
            </div>

            <UAlert v-else icon="i-heroicons-circle-stack" :title="t('data.management.empty')" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const dataAvailabilityStore = useDataAvailabilityStore();

/**
 * Converts a timeframe string (e.g., "5m", "1h", "1M") into a numerical value in minutes for sorting.
 */
const timeframeToMinutes = (tf: string): number => {
    const unit = tf.slice(-1);
    const value = parseInt(tf.slice(0, -1), 10);
    switch (unit) {
        case 'm': return value;
        case 'h': return value * 60;
        case 'd': return value * 60 * 24;
        case 'w': return value * 60 * 24 * 7;
        case 'M': return value * 60 * 24 * 30;
        default: return Infinity;
    }
};

const processedManifest = computed(() => {
    if (!dataAvailabilityStore.manifest) return [];
    return dataAvailabilityStore.manifest
        .map(item => ({
            ...item,
            timeframes: [...item.timeframes].sort((a, b) =>
                timeframeToMinutes(a.timeframe) - timeframeToMinutes(b.timeframe)
            ),
        }))
        .sort((a, b) => a.symbol.localeCompare(b.symbol));
});


const timeframeColumns = computed(() => [
    { accessorKey: 'timeframe', header: t('data.management.timeframe') },
    {
        accessorKey: 'startDate',
        header: t('data.management.startDate'),
        sortable: true,
        cell: (props: { getValue: () => string }) => new Date(props.getValue()).toLocaleDateString()
    },
    {
        accessorKey: 'endDate',
        header: t('data.management.endDate'),
        sortable: true,
        cell: (props: { getValue: () => string }) => new Date(props.getValue()).toLocaleDateString()
    },
    {
        accessorKey: 'recordCount',
        header: t('data.management.records'),
        sortable: true,
        cell: (props: { getValue: () => number }) => props.getValue()?.toLocaleString() ?? '0'
    },
    { accessorKey: 'actions', header: t('data.management.actions') }
]);


const inspectDataset = (exchange: string, symbol: string, timeframe: string) => {
    const safeSymbol = symbol.replace('/', '-');
    navigateTo(`/data/inspect/${exchange}/${safeSymbol}/${timeframe}`);
};

onMounted(() => {
    if (dataAvailabilityStore.manifest.length === 0) {
        dataAvailabilityStore.fetchManifest();
    }
});
</script>
