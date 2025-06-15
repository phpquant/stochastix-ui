declare interface BacktestResult {
    status: string;
    config: Record<string, any>;
    finalCapital: string;
    closedTrades: ClosedTrade[];
    openPositions: OpenPosition[];
    statistics: BacktestStatistics;
}
