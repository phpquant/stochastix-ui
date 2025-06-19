export const useDataAvailabilityStore = defineStore('dataAvailability', () => {
    const manifest = ref<DataAvailabilityManifestItem[]>([]);
    const status = ref<LoadingStatus>('idle');
    const toast = useToast();

    const isLoading = computed(() => status.value === 'loading');

    async function fetchManifest(force = false) {
        if (manifest.value.length > 0 && !force) return;

        status.value = 'loading';
        try {
            manifest.value = await $fetch<DataAvailabilityManifestItem[]>('/api/data-availability');
            status.value = 'success';
        } catch (e: any) {
            toast.add({
                title: 'Error Loading Market Data',
                description: e.data?.error || 'Could not connect to the API to get available market data.',
                color: 'error',
                icon: 'i-heroicons-exclamation-triangle',
            });
            console.error('Failed to fetch data availability manifest:', e);
            status.value = 'error';
        }
    }

    const availableSymbols = computed(() => manifest.value.map(item => item.symbol).sort());

    const getTimeframesForSymbol = (symbol: string | null): TimeframeData[] => {
        if (!symbol) return [];
        const symbolData = manifest.value.find(item => item.symbol === symbol);
        return symbolData?.timeframes ?? [];
    };

    const getDateRangeFor = (symbol: string | null, timeframe: string | null): { min?: string, max?: string } => {
        if (!symbol || !timeframe) return {};

        const symbolTimeframes = getTimeframesForSymbol(symbol);
        const timeframeData = symbolTimeframes.find(tf => tf.timeframe === timeframe);

        if (!timeframeData) return {};

        return {
            min: timeframeData.startDate.split('T')[0],
            max: timeframeData.endDate.split('T')[0],
        };
    };


    return {
        manifest,
        status,
        isLoading,
        fetchManifest,
        availableSymbols,
        getTimeframesForSymbol,
        getDateRangeFor,
    };
});
