/**
 * Defines the structure of the API response for the data inspection endpoint.
 */
declare interface DataInspectResult {
    filePath: string;
    fileSize: number;
    header: {
        magic: string;
        version: number;
        headerLength: number;
        recordLength: number;
        tsFormat: number;
        ohlcvFormat: number;
        numRecords: number;
        symbol: string;
        timeframe: string;
    };
    sample: {
        head: OhlcvRecord[];
        tail: OhlcvRecord[];
    };
    validation: {
        status: 'passed' | 'failed' | 'skipped';
        message: string;
        gaps?: any[];
        duplicates?: any[];
        outOfOrder?: any[];
    };
}
