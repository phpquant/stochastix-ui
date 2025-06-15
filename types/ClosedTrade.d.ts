import type { UTCTimestamp } from 'lightweight-charts';

declare interface ClosedTrade {
    tradeNumber: number;
    positionId: string;
    symbol: string;
    direction: 'long' | 'short';
    entryPrice: string;
    exitPrice: string;
    quantity: string;
    entryTime: string | UTCTimestamp;
    exitTime: string | UTCTimestamp;
    pnl: string;
    entryCommission: string;
    exitCommission: string;
    enterTags?: string[] | null;
    exitTags?: string[] | null;
}
