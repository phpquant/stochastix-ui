<template>
    <UCard>
        <template #header>
            <h2 class="text-xl font-bold">
                {{ t('backtest.new.title') }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('backtest.new.description') }}
            </p>
        </template>

        <div v-if="['idle', 'loading'].includes(strategyStore.status) || ['idle', 'loading'].includes(dataAvailabilityStore.status)" class="space-y-8">
            <div class="space-y-2">
                <USkeleton class="h-5 w-1/4" />
                <USkeleton class="h-10 w-full" />
            </div>
            <div class="space-y-4">
                <USkeleton class="h-5 w-1/3" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <USkeleton class="h-10 w-full" />
                    <USkeleton class="h-10 w-full" />
                </div>
                <USkeleton class="h-10 w-full" />
            </div>
        </div>

        <UForm
            v-else-if="strategyStore.status === 'success' && strategyStore.strategies.length > 0"
            id="launch-backtest-form"
            ref="form"
            :schema="validationSchema"
            :state="formState"
            @submit="handleLaunch"
        >
            <div class="space-y-6">
                <UFormField :label="t('backtest.new.form.strategy.label')" name="strategyAlias" required>
                    <USelectMenu
                        class="w-full"
                        v-model="formState.strategyAlias"
                        :items="strategyStore.strategies"
                        value-key="alias"
                        label-key="name"
                        :placeholder="t('backtest.new.form.strategy.placeholder')"
                    />
                </UFormField>

                <div>
                    <USeparator :label="t('backtest.new.coreConfigTitle')" />
                    <div class="mt-4">
                        <BacktestFormCoreConfigEditor
                            v-model="formState.core"
                            :available-symbols="dataAvailabilityStore.availableSymbols"
                            :available-timeframes="availableTimeframesForSelectedSymbol"
                            :date-range="dateRangeForSelectedTimeframe"
                        />
                    </div>
                </div>

                <div v-if="selectedStrategyObject">
                    <USeparator :label="t('backtest.new.inputsFor', { strategyName: selectedStrategyObject.name })" />
                    <div class="mt-4">
                        <BacktestFormParameterEditor
                            v-if="selectedStrategyObject.inputs.length > 0"
                            v-model="formState.inputs"
                            :inputs="selectedStrategyObject.inputs"
                        />
                        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
                            {{ t('backtest.new.noInputs') }}
                        </p>
                    </div>
                </div>
            </div>
        </UForm>

        <div v-else>
            <UAlert
                icon="i-heroicons-exclamation-triangle"
                color="warning"
                variant="soft"
                :title="t('backtest.new.noStrategiesFound')"
                :description="t('backtest.new.noStrategiesFoundDetail')"
            />
        </div>

        <template #footer>
            <UButton
                v-if="strategyStore.status === 'success' && strategyStore.strategies.length > 0"
                class="cursor-pointer"
                type="submit"
                form="launch-backtest-form"
                icon="i-heroicons-paper-airplane-20-solid"
                size="lg"
                :loading="backtestStore.isLoading"
                :disabled="form?.errors?.length > 0"
                :class="{ '!opacity-50 cursor-not-allowed': form?.errors?.length > 0 }"
            >
                {{ backtestStore.isLoading ? t('backtest.new.launchingButton') : t('backtest.new.launchButton') }}
            </UButton>
        </template>
    </UCard>
</template>

<script setup lang="ts">
import { z } from 'zod';
import type { Form } from '#ui/types';

const { t } = useI18n();
const strategyStore = useStrategyStore();
const backtestStore = useBacktestStore();
const dataAvailabilityStore = useDataAvailabilityStore();

const form = ref<Form<any> | null>(null);

const formState = reactive({
    strategyAlias: null,
    inputs: {},
    core: {
        symbol: null,
        timeframe: null,
        initialCapital: 10000,
        useDateRange: false,
        startDate: '',
        endDate: '',
    }
});

const selectedStrategyObject = computed(() => {
    if (!formState.strategyAlias) return null;
    return strategyStore.strategies.find(s => s.alias === formState.strategyAlias) ?? null;
});

const validationSchema = computed(() => {
    const inputsShape: Record<string, z.ZodTypeAny> = {};

    if (selectedStrategyObject.value?.inputs) {
        for (const input of selectedStrategyObject.value.inputs) {
            if (input.type === 'array') {
                let rule = z.array(z.string(), { required_error: 'Please select at least one item.' });
                if (input.minChoices) {
                    rule = rule.min(input.minChoices, `Please select at least ${input.minChoices} items.`);
                }
                if (input.maxChoices) {
                    rule = rule.max(input.maxChoices, `Please select no more than ${input.maxChoices} items.`);
                }
                inputsShape[input.name] = rule;
            }
        }
    }

    return z.object({
        strategyAlias: z.string().min(1, 'Strategy is required'),
        core: z.object({
            symbol: z.string().min(1, 'Symbol is required'),
            timeframe: z.string().min(1, 'Timeframe is required'),
            // FIX: Add all core fields to the schema to prevent them from being stripped
            initialCapital: z.number().min(1, 'Initial capital must be at least 1.'),
            useDateRange: z.boolean(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
        }),
        inputs: z.object(inputsShape).passthrough(),
    });
});

const availableTimeframesForSelectedSymbol = computed(() => {
    return dataAvailabilityStore.getTimeframesForSymbol(formState.core.symbol);
});

const dateRangeForSelectedTimeframe = computed(() => {
    return dataAvailabilityStore.getDateRangeFor(formState.core.symbol, formState.core.timeframe);
});

// --- Pre-selection and Dynamic Form Logic ---

watch(() => strategyStore.status, (status) => {
    if (status === 'success' && strategyStore.strategies.length > 0 && !formState.strategyAlias) {
        formState.strategyAlias = strategyStore.strategies[0].alias;
    }
}, { immediate: true });

watch(() => dataAvailabilityStore.status, (status) => {
    if (status === 'success' && dataAvailabilityStore.availableSymbols.length > 0 && !formState.core.symbol) {
        formState.core.symbol = dataAvailabilityStore.availableSymbols[0];
    }
}, { immediate: true });

watch(() => formState.core.symbol, (newSymbol) => {
    const timeframes = dataAvailabilityStore.getTimeframesForSymbol(newSymbol);
    if (timeframes.length > 0) {
        formState.core.timeframe = timeframes[0].timeframe;
    } else {
        formState.core.timeframe = null;
    }
}, { immediate: true });

watch(() => formState.core.timeframe, () => {
    const range = dateRangeForSelectedTimeframe.value;
    formState.core.startDate = range.min ?? '';
    formState.core.endDate = range.max ?? '';
}, { immediate: true });

watch(selectedStrategyObject, (newStrategy) => {
    const newInputsState: Record<string, any> = {};
    if (newStrategy?.inputs) {
        for (const input of newStrategy.inputs) {
            newInputsState[input.name] = input.defaultValue;
        }
    }
    formState.inputs = newInputsState;
}, { immediate: true });


const handleLaunch = async () => {
    if (!formState.strategyAlias || !formState.core.symbol || !formState.core.timeframe) {
        return;
    }

    const payload = {
        strategyAlias: formState.strategyAlias,
        inputs: formState.inputs,
        symbols: [formState.core.symbol],
        timeframe: formState.core.timeframe,
        initialCapital: String(formState.core.initialCapital),
        startDate: formState.core.useDateRange ? formState.core.startDate : null,
        endDate: formState.core.useDateRange ? formState.core.endDate : null,
    };

    await backtestStore.launchBacktest(payload as any);
};

onMounted(() => {
    strategyStore.fetchStrategies();
    dataAvailabilityStore.fetchManifest();
});
</script>
