/**
 * Represents the data returned for an on-demand chart request.
 */
declare interface OnDemandChartData {
    ohlcv: OhlcvData[];
    indicators: {
        [key: string]: {
            [plotKey: string]: { time: UTCTimestamp; value: number }[];
        };
    };
}
