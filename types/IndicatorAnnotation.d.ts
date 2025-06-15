import type { LineStyle } from 'lightweight-charts';

declare interface IndicatorAnnotation {
    type: 'horizontal_line';
    value: number;
    color: string;
    style: keyof typeof LineStyle;
}
