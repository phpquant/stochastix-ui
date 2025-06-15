import type { UTCTimestamp, SeriesMarkerPosition, SeriesMarkerShape } from 'lightweight-charts';

declare interface TradeMarker {
    time: UTCTimestamp;
    position: SeriesMarkerPosition;
    color: string;
    shape: SeriesMarkerShape;
    text?: string;
}
