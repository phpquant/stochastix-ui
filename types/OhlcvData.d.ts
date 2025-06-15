import type { UTCTimestamp } from 'lightweight-charts';

declare interface OhlcvData {
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
}
