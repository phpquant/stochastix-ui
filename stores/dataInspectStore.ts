export const useDataInspectStore = defineStore('dataInspect', () => {
    const inspectResult = ref<DataInspectResult | null>(null);
    const status = ref<LoadingStatus>('idle');
    const toast = useToast();

    const isLoading = computed(() => status.value === 'loading');

    async function fetchInspectResult(exchangeId: string, symbol: string, timeframe: string) {
        status.value = 'loading';
        inspectResult.value = null;

        try {
            // The API expects the symbol's slash to be replaced with a dash for URL safety.
            const safeSymbol = symbol.replace('/', '-');
            const url = `/api/data/inspect/${exchangeId}/${safeSymbol}/${timeframe}`;
            inspectResult.value = await $fetch<DataInspectResult>(url);
            status.value = 'success';
        } catch (e: any) {
            toast.add({
                title: 'Error Inspecting Data',
                description: e.data?.error || 'Could not load inspection results.',
                color: 'error',
                icon: 'i-heroicons-exclamation-triangle-20-solid',
            });
            status.value = 'error';
            inspectResult.value = null; // Ensure data is cleared on error
        }
    }

    function reset() {
        inspectResult.value = null;
        status.value = 'idle';
    }

    return {
        inspectResult,
        status,
        isLoading,
        fetchInspectResult,
        reset,
    };
});
