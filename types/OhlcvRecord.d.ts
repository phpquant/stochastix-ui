/**
 * Represents a single OHLCV record with its UTC timestamp.
 */
declare interface OhlcvRecord {
    timestamp: number;
    utc: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
