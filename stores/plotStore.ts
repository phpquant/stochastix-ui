export const usePlotsStore = defineStore('plots', () => {
    // Use reactive objects to store data and loading states dynamically by metric key.
    const plotData = reactive<Record<string, PlotData[] | null>>({});
    const loadingStates = reactive<Record<string, boolean>>({});

    const toast = useToast();

    /**
     * A generic action to fetch data for any given plot metric.
     * @param metric The name of the plot metric (e.g., 'equity', 'benchmark').
     * @param runId The ID of the backtest run.
     */
    async function fetchPlot(metric: string, runId: string) {
        // Avoid re-fetching if data already exists or is currently loading.
        if (plotData[metric] || loadingStates[metric]) {
            return;
        }

        loadingStates[metric] = true;
        try {
            const response = await $fetch<{ data: PlotData[] }>(`/api/plots/${metric}/${runId}`);
            plotData[metric] = response.data;
        } catch (e: any) {
            toast.add({
                title: `Error Loading ${metric} Data`,
                description: e.data?.error || 'Could not connect to the API.',
                color: 'error',
                icon: 'i-heroicons-exclamation-triangle',
            });
            plotData[metric] = []; // Set to empty array on error to prevent re-fetching.
        } finally {
            loadingStates[metric] = false;
        }
    }

    /**
     * Resets all plot data and loading states.
     */
    function reset() {
        // Clear all keys from the reactive objects.
        for (const key in plotData) {
            delete plotData[key];
        }
        for (const key in loadingStates) {
            delete loadingStates[key];
        }
    }

    return {
        plotData,
        loadingStates,
        fetchPlot,
        reset,
    };
});
