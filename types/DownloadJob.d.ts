declare interface DownloadJob {
    key: string; // e.g., "okx-BTC/USDT-5m"
    exchangeId: string;
    symbol: string;
    timeframe: string;
    startDate: string;
    endDate: string;
    status: 'pending' | 'downloading' | 'completed' | 'failed';
    progress: number;
    message: string;
    jobId?: string; // Mercure Job ID
}
