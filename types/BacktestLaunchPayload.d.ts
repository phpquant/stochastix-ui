declare interface BacktestLaunchPayload {
    strategyAlias: string;
    inputs: Record<string, any>;
    symbols: string[];
    timeframe: string;
    initialCapital: string;
    dataSourceExchangeId: string;
    stakeCurrency: string;
    startDate?: string | null;
    endDate?: string | null;
    commissionConfig?: any[];
}
