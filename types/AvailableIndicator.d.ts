declare interface AvailableIndicator {
    name: string;
    description: string | null;
    alias: string;
    type: 'talib' | 'custom';
    inputs: AvailableIndicatorInput[];
}
