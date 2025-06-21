/**
 * Represents a saved chart layout.
 */
declare interface ChartLayout {
    id: string;
    name: string;
    symbol: string;
    timeframe: string;
    indicators: IndicatorConfig[];
    createdAt: string;
    updatedAt: string;
}
