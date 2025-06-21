export const useChartExplorerStore = defineStore('chartExplorer', () => {
    const toast = useToast();

    // --- State ---
    const availableIndicators = ref<{ builtIn: AvailableIndicator[]; custom: AvailableIndicator[] } | null>(null);
    const layouts = ref<ChartLayout[]>([]);
    const status = ref<LoadingStatus>('idle');

    // State for the current chart view
    const currentSymbol = ref<string | null>(null);
    const currentExchange = ref<string | null>(null);
    const currentTimeframe = ref<string | null>(null);
    const currentIndicators = ref<IndicatorConfig[]>([]);
    const currentLayoutId = ref<string | null>(null);

    const ohlcv = ref<OhlcvData[]>([]);
    const indicatorsData = ref<Record<string, any>>({});
    const isLoading = ref(false);

    // --- Actions ---

    async function fetchAvailableIndicators() {
        if (availableIndicators.value) return;
        try {
            availableIndicators.value = await $fetch('/api/charts/available-indicators');
        } catch (e: any) {
            toast.add({ title: 'Error fetching indicators', description: e.data?.message, color: 'error' });
        }
    }

    async function fetchLayouts() {
        try {
            layouts.value = await $fetch<ChartLayout[]>('/api/charts/layouts');
        } catch (e: any) {
            toast.add({ title: 'Error fetching layouts', description: e.data?.message, color: 'error' });
        }
    }

    async function loadChart(countback = 1500, toTimestamp: number | null = null) {
        if (!currentSymbol.value || !currentTimeframe.value || !currentExchange.value) return;

        isLoading.value = true;
        try {
            const payload = {
                exchangeId: currentExchange.value,
                symbol: currentSymbol.value,
                timeframe: currentTimeframe.value,
                countback,
                toTimestamp,
                indicators: currentIndicators.value,
            };

            const response = await $fetch<OnDemandChartData>('/api/charts/indicators', { method: 'POST', body: payload });

            if (toTimestamp) {
                // Prepend older data when scrolling back
                ohlcv.value = [...response.ohlcv, ...ohlcv.value];
                for (const key in response.indicators) {
                    if (!indicatorsData.value[key]) {
                        indicatorsData.value[key] = { data: {} };
                    }
                    for (const plotKey in response.indicators[key]) {
                        if (!indicatorsData.value[key].data[plotKey]) {
                            indicatorsData.value[key].data[plotKey] = [];
                        }
                        indicatorsData.value[key].data[plotKey] = [...response.indicators[key][plotKey], ...indicatorsData.value[key].data[plotKey]];
                    }
                }
            } else {
                // Initial load or refresh
                ohlcv.value = response.ohlcv;
                indicatorsData.value = {}; // Reset
                const fullIndicatorData: Record<string, any> = {};

                // The backend response for on-demand indicators is slightly different,
                // so we remap it to match the structure expected by the chart component.
                for (const key in response.indicators) {
                    const originalIndicator = response.indicators[key];
                    const metadata = findIndicatorMetadata(key);
                    if (metadata) {
                        fullIndicatorData[key] = {
                            metadata,
                            data: originalIndicator
                        };
                    }
                }
                indicatorsData.value = fullIndicatorData;
            }

        } catch (e: any) {
            toast.add({ title: 'Error loading chart data', description: e.data?.message, color: 'error' });
        } finally {
            isLoading.value = false;
        }
    }

    function findIndicatorMetadata(indicatorKey: string): AvailableIndicator | null {
        if (!availableIndicators.value) return null;
        const config = currentIndicators.value.find(c => c.key === indicatorKey);
        if (!config) return null;
        return [...availableIndicators.value.builtIn, ...availableIndicators.value.custom].find(i => i.alias === config.function) || null;
    }

    async function saveLayout(name: string) {
        if (!currentSymbol.value || !currentTimeframe.value) return;
        const payload = {
            name,
            symbol: currentSymbol.value,
            timeframe: currentTimeframe.value,
            indicators: currentIndicators.value,
        };
        try {
            if (currentLayoutId.value) {
                await $fetch(`/api/charts/layouts/${currentLayoutId.value}`, { method: 'PUT', body: payload });
                toast.add({ title: 'Layout Updated', color: 'success' });
            } else {
                const newLayout = await $fetch<ChartLayout>('/api/charts/layouts', { method: 'POST', body: payload });
                currentLayoutId.value = newLayout.id;
                toast.add({ title: 'Layout Saved', color: 'success' });
            }
            fetchLayouts(); // Refresh layout list
        } catch (e: any) {
            toast.add({ title: 'Error saving layout', description: e.data?.message, color: 'error' });
        }
    }

    async function loadLayout(layout: ChartLayout) {
        currentLayoutId.value = layout.id;
        currentSymbol.value = layout.symbol;
        currentTimeframe.value = layout.timeframe;
        currentIndicators.value = JSON.parse(JSON.stringify(layout.indicators)); // Deep copy

        const manifestStore = useDataAvailabilityStore();
        const manifestItem = manifestStore.manifest.find(i => i.symbol === layout.symbol);
        if (manifestItem) {
            currentExchange.value = manifestItem.exchange;
        }

        await loadChart();
    }

    async function deleteLayout(id: string) {
        try {
            await $fetch(`/api/charts/layouts/${id}`, { method: 'DELETE' });
            toast.add({ title: 'Layout Deleted', color: 'success' });
            if (currentLayoutId.value === id) {
                currentLayoutId.value = null;
            }
            fetchLayouts();
        } catch (e: any) {
            toast.add({ title: 'Error deleting layout', description: e.data?.message, color: 'error' });
        }
    }

    function addIndicator(indicatorConfig: IndicatorConfig) {
        currentIndicators.value.push(indicatorConfig);
        loadChart(); // Refresh chart with new indicator
    }

    function removeIndicator(key: string) {
        currentIndicators.value = currentIndicators.value.filter(i => i.key !== key);
        loadChart(); // Refresh chart
    }

    function resetCurrentChart() {
        currentSymbol.value = null;
        currentExchange.value = null;
        currentTimeframe.value = null;
        currentIndicators.value = [];
        currentLayoutId.value = null;
        ohlcv.value = [];
        indicatorsData.value = {};
    }

    return {
        availableIndicators,
        layouts,
        status,
        currentSymbol,
        currentExchange,
        currentTimeframe,
        currentIndicators,
        currentLayoutId,
        ohlcv,
        indicatorsData,
        isLoading,
        fetchAvailableIndicators,
        fetchLayouts,
        loadChart,
        saveLayout,
        loadLayout,
        deleteLayout,
        addIndicator,
        removeIndicator,
        resetCurrentChart
    };
});
