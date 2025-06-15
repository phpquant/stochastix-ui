import type { UTCTimestamp } from 'lightweight-charts';

declare interface OpenPosition {
    symbol: string;
    direction: 'long' | 'short';
    quantity: string;
    entryPrice: string;
    entryTime: string | UTCTimestamp;
    currentPrice: string;
    unrealizedPnl: string;
}
