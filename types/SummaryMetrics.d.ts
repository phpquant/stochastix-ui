declare interface SummaryMetrics {
    backtestingFrom: string;
    backtestingTo: string;
    maxOpenTrades: number;
    totalTrades: number;
    dailyAvgTrades: number;
    startingBalance: number;
    finalBalance: number;
    balanceCurrency: string;
    absProfit: number;
    totalProfitPercentage: number;
    profitFactor: number;
    sharpe: number;
    sortino: number;
    calmar: number;
    cagrPercentage: number;
    expectancy: number;
    expectancyRatio: number;
    avgDurationWinnersMin: number;
    avgDurationLosersMin: number;
    maxConsecutiveWins: number;
    maxConsecutiveLosses: number;
    maxAccountUnderwaterPercentage: number;
    absoluteDrawdown: number;
    marketChangePercentage: number;
}
