declare interface IndicatorMetadata {
    name: string;
    overlay: boolean;
    plots: IndicatorPlot[];
    annotations?: IndicatorAnnotation[];
}
