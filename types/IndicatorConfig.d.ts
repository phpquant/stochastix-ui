/**
 * Represents the configuration for a single indicator to be plotted on the chart.
 */
declare interface IndicatorConfig {
    key: string; // e.g., 'ema_fast'
    type: 'talib' | 'custom';
    function: string; // e.g., 'ema' or a custom indicator alias
    params: Record<string, any>;
    source?: string; // e.g., 'close'
}
