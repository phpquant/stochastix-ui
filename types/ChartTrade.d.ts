import type { UTCTimestamp } from 'lightweight-charts';

declare interface ChartTrade {
    direction: 'long' | 'short';
    quantity: string;
    entryTime: UTCTimestamp;
    entryPrice: string;
    exitTime: UTCTimestamp;
    exitPrice: string;
    pnl: string;
}
