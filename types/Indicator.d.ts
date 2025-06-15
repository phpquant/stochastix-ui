import type { UTCTimestamp } from 'lightweight-charts';

declare interface Indicator {
    metadata: IndicatorMetadata;
    data: {
        [key: string]: { time: UTCTimestamp; value: number }[];
    };
}
