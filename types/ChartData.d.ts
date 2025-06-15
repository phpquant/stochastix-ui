declare interface ChartData {
    ohlcv: OhlcvData[];
    trades: ChartTrade[];
    openPositions: OpenPosition[];
    indicators: {
        [key: string]: Indicator;
    };
}
