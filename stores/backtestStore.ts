export const useBacktestStore = defineStore('backtest', () => {
    const isLoading = ref(false);
    const isChartDataLoading = ref(false);
    const currentBacktestId = ref<string | null>(null);

    const backtestProgress = ref({ status: 'loading', progress: 0, message: 'Connecting...', error: null as string | null });
    const backtestResult = ref<any>(null);
    const chartData = ref<ChartData | null>(null);

    const toast = useToast();
    const dataAvailabilityStore = useDataAvailabilityStore();

    const savedBacktests = ref<BacktestSummary[] | null>(null);
    const savedBacktestsStatus = ref<LoadingStatus>('idle');

    async function fetchSavedBacktests() {
        if (savedBacktests.value !== null) return;

        savedBacktestsStatus.value = 'loading';
        try {
            savedBacktests.value = await $fetch<BacktestSummary[]>('/api/backtests');
            savedBacktestsStatus.value = 'success';
        } catch (e: any) {
            toast.add({
                title: 'Error Loading History',
                description: e.data?.error || 'Could not connect to the API.',
                color: 'error',
                icon: 'i-heroicons-exclamation-triangle',
            });
            savedBacktestsStatus.value = 'error';
        }
    }

    async function launchBacktest(payload: BacktestLaunchPayload) {
        isLoading.value = true;
        currentBacktestId.value = null;

        try {
            const symbol = payload.symbols[0];
            const manifestItem = dataAvailabilityStore.manifest.find(item => item.symbol === symbol);

            const finalPayload: Partial<BacktestLaunchPayload> = {
                ...payload,
                dataSourceExchangeId: manifestItem?.exchange || '',
                stakeCurrency: symbol.split('/')[1],
            };

            if (!finalPayload.commissionConfig || finalPayload.commissionConfig.length === 0) {
                delete finalPayload.commissionConfig;
            }

            const response = await $fetch<{ backtestRunId: string; status: string }>('/api/backtests', {
                method: 'POST',
                body: finalPayload,
            });

            toast.add({
                title: 'Backtest Queued',
                description: 'Your backtest run has started. Redirecting to results...',
                icon: 'i-heroicons-check-circle-20-solid',
                color: 'success',
            });

            currentBacktestId.value = response.backtestRunId;

            if (currentBacktestId.value) {
                await navigateTo(`/backtest/${currentBacktestId.value}`);
            }

        } catch (e: any) {
            toast.add({
                title: 'Error Launching Backtest',
                description: e.data?.error || 'An unexpected error occurred.',
                color: 'error',
                icon: 'i-heroicons-exclamation-triangle-20-solid',
            });
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchResult(runId: string): Promise<boolean> {
        isLoading.value = true;
        try {
            backtestResult.value = await $fetch(`/api/backtests/${runId}`);
            backtestProgress.value = { status: 'completed', progress: 100, message: 'Backtest finished successfully.', error: null };
            return true;
        } catch (e: any)
        {
            if (e.statusCode !== 404) {
                toast.add({
                    title: 'Error Fetching Results',
                    description: e.data?.error || 'Could not load backtest results.',
                    color: 'error',
                    icon: 'i-heroicons-exclamation-triangle-20-solid',
                });
            }
            return false;
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchChartData(runId: string) {
        isChartDataLoading.value = true;
        chartData.value = null;
        try {
            chartData.value = await $fetch<ChartData>(`/api/chart-data/${runId}`);
        } catch (e: any) {
            toast.add({
                title: 'Error Loading Chart Data',
                description: e.data?.error || 'Could not connect to the API.',
                color: 'error',
                icon: 'i-heroicons-exclamation-triangle',
            });
        } finally {
            isChartDataLoading.value = false;
        }
    }

    function resetResultState() {
        backtestProgress.value = { status: 'loading', progress: 0, message: 'Connecting...', error: null };
        backtestResult.value = null;
        chartData.value = null;
    }

    async function deleteBacktest(runId: string) {
        try {
            await $fetch(`/api/backtests/${runId}`, {
                method: 'DELETE',
            });

            // On success, remove the item from the local state for an immediate UI update
            if (savedBacktests.value) {
                savedBacktests.value = savedBacktests.value.filter(b => b.runId !== runId);
            }

            toast.add({
                title: 'Backtest Deleted',
                description: `Run ID ${runId} has been successfully deleted.`,
                color: 'success',
                icon: 'i-heroicons-check-circle',
            });
        } catch (e: any) {
            toast.add({
                title: 'Error Deleting Backtest',
                description: e.data?.error || 'The backtest could not be deleted.',
                color: 'error',
                icon: 'i-heroicons-exclamation-triangle',
            });
        }
    }

    return {
        isLoading,
        isChartDataLoading,
        currentBacktestId,
        backtestProgress,
        backtestResult,
        chartData,
        savedBacktests,
        savedBacktestsStatus,
        fetchSavedBacktests,
        deleteBacktest,
        launchBacktest,
        fetchResult,
        fetchChartData,
        resetResultState,
    };
});
