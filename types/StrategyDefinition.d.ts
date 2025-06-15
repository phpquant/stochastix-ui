declare interface StrategyDefinition {
    alias: string;
    name: string;
    description?: string | null;
    inputs: StrategyInput[];
}
