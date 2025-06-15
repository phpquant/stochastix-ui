import type { IChartApi, ChartOptions } from 'lightweight-charts';

declare module '#app' {
    interface NuxtApp {
        $createChart(container: HTMLElement | string, options?: ChartOptions): IChartApi;
    }
}

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $createChart(container: HTMLElement | string, options?: ChartOptions): IChartApi;
    }
}

export {};
