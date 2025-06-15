/**
 * Defines the shape of the form state for a new data download request.
 */
declare interface DataDownloadRequest {
    exchangeId: string | null;
    symbols: string[];
    timeframes: string[];
    startDate: string;
    endDate: string;
}
