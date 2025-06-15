declare interface BacktestLaunchConfig {
    strategy_alias: string;
    inputs: Record<string, any>;
    // Add other core config: symbols, timeframe, dates, capital etc.
}

