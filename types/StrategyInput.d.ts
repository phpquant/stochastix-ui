declare interface StrategyInput {
    name: string;
    description?: string | null;
    type: 'string' | 'number' | 'boolean' | 'integer' | 'array';
    defaultValue?: any;
    min?: number | null;
    max?: number | null;
    choices?: any[] | null;
    minChoices?: number | null;
    maxChoices?: number | null;
}
