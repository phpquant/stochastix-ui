declare interface BacktestStatistics {
    pairStats: StatsTableEntry[];
    enterTagStats: StatsTableEntry[];
    exitTagStats: StatsTableEntry[];
    summaryMetrics: SummaryMetrics;
}
