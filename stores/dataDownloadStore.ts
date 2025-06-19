export const useDataDownloadStore = defineStore('dataDownload', () => {
    const toast = useToast();
    const { public: { apiUrl } } = useRuntimeConfig();

    // --- State ---
    const exchanges = ref<string[]>([]);
    const exchangesStatus = ref<LoadingStatus>('idle');
    const symbolsByExchange = reactive<Record<string, { list: string[], status: LoadingStatus }>>({});
    const downloadQueue = ref<DownloadJob[]>([]);
    const isQueueRunning = ref(false);

    // --- Actions ---

    /**
     * Fetches the list of available exchanges from the API.
     */
    async function fetchExchanges() {
        if (exchanges.value.length > 0 || exchangesStatus.value === 'loading') {
            return;
        }

        exchangesStatus.value = 'loading';
        try {
            exchanges.value = await $fetch<string[]>('/api/data/exchanges');
            exchangesStatus.value = 'success';
        } catch (e: any) {
            exchangesStatus.value = 'error';
            toast.add({
                title: 'Error Fetching Exchanges',
                description: e.data?.error || 'Could not fetch the list of exchanges.',
                color: 'error',
                icon: 'i-heroicons-exclamation-triangle-20-solid',
            });
        }
    }

    /**
     * Fetches symbols for a given exchange.
     */
    async function fetchSymbols(exchangeId: string) {
        if (!exchangeId || symbolsByExchange[exchangeId]?.status === 'loading') {
            return;
        }

        symbolsByExchange[exchangeId] = { list: [], status: 'loading' };
        try {
            const symbols = await $fetch<string[]>(`/api/data/symbols/${exchangeId}`);
            // The API returns symbols like "BTC/USDT:USDT", we strip the trailing part.
            symbolsByExchange[exchangeId] = {
                list: symbols.map(s => s.replace(/:.+$/, '')).sort(),
                status: 'success'
            };
        } catch (e: any) {
            symbolsByExchange[exchangeId] = { list: [], status: 'error' };
            toast.add({
                title: 'Error Fetching Symbols',
                description: e.data?.error || `Could not fetch symbols for ${exchangeId}.`,
                color: 'error',
                icon: 'i-heroicons-exclamation-triangle-20-solid',
            });
        }
    }

    /**
     * Adds a batch of download requests to the queue and starts processing if not already running.
     */
    function queueDownloads(request: DataDownloadRequest) {
        if (!request.exchangeId || request.symbols.length === 0 || request.timeframes.length === 0) {
            return;
        }

        for (const symbol of request.symbols) {
            for (const timeframe of request.timeframes) {
                const key = `${request.exchangeId}-${symbol}-${timeframe}`;
                // Avoid adding duplicates to the queue
                if (downloadQueue.value.some(job => job.key === key)) continue;

                downloadQueue.value.push({
                    key,
                    exchangeId: request.exchangeId,
                    symbol,
                    timeframe,
                    startDate: request.startDate,
                    endDate: request.endDate,
                    status: 'pending',
                    progress: 0,
                    message: 'Waiting in queue...'
                });
            }
        }

        if (!isQueueRunning.value) {
            processQueue();
        }
    }

    /**
     * Processes the download queue one by one.
     */
    async function processQueue() {
        if (downloadQueue.value.length === 0) {
            isQueueRunning.value = false;
            return;
        }

        isQueueRunning.value = true;
        const job = downloadQueue.value[0];
        job.status = 'downloading';
        job.message = 'Initiating download...';

        try {
            const response = await $fetch<{ jobId: string; }>('/api/data/download', {
                method: 'POST',
                body: {
                    exchangeId: job.exchangeId,
                    symbol: job.symbol,
                    timeframe: job.timeframe,
                    startDate: job.startDate,
                    endDate: job.endDate,
                }
            });
            job.jobId = response.jobId;
            await listenToMercureProgress(job);
        } catch (e: any) {
            job.status = 'failed';
            job.message = e.data?.error || 'Failed to start download.';
            toast.add({ title: 'Download Error', description: job.message, color: 'error' });
            downloadQueue.value.shift();
            processQueue();
        }
    }

    /**
     * Sends a cancellation request for a specific job.
     * @param jobId The ID of the job to cancel.
     */
    async function cancelDownload(jobId: string) {
        try {
            await $fetch(`/api/data/download/${jobId}`, {
                method: 'DELETE'
            });
            toast.add({
                title: 'Cancellation Requested',
                description: `A request to cancel job ${jobId} has been sent.`,
                color: 'info'
            });
        } catch (e: any) {
            toast.add({
                title: 'Cancellation Error',
                description: e.data?.error || `Could not request cancellation for job ${jobId}.`,
                color: 'error'
            });
        }
    }

    /**
     * Listens to a Mercure stream for a specific download job.
     */
    function listenToMercureProgress(job: DownloadJob): Promise<void> {
        return new Promise((resolve) => {
            const mercureUrl = new URL(apiUrl || window.location.origin);
            mercureUrl.pathname = '/.well-known/mercure';
            const topic = `/data/download/${job.jobId}/progress`;
            const eventSource = new EventSource(`${mercureUrl.toString()}?topic=${encodeURIComponent(topic)}`);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                job.progress = data.progress || job.progress;
                job.message = data.message || job.message;

                if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
                    job.status = data.status;
                    eventSource.close();
                    downloadQueue.value.shift();
                    processQueue();
                    resolve();
                }
            };

            eventSource.onerror = () => {
                job.status = 'failed';
                job.message = 'Connection to progress stream failed.';
                eventSource.close();
                downloadQueue.value.shift();
                processQueue();
                resolve();
            };
        });
    }

    return {
        exchanges,
        exchangesStatus,
        symbolsByExchange,
        downloadQueue,
        isQueueRunning,
        fetchExchanges,
        fetchSymbols,
        queueDownloads,
        cancelDownload,
    };
});
