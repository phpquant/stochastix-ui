<template>
    <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField :label="t('backtest.new.form.strategy.label')" name="symbol" required>
                <USelectMenu
                    class="w-full"
                    v-model="model.symbol"
                    :items="availableSymbols"
                    :placeholder="t('backtest.new.form.strategy.placeholder')"
                    :disabled="availableSymbols.length === 0"
                />
            </UFormField>

            <UFormField :label="t('backtest.new.form.timeframe.label')" name="timeframe" required>
                <USelectMenu
                    class="w-full"
                    v-model="model.timeframe"
                    :items="availableTimeframes"
                    value-key="timeframe"
                    label-key="timeframe"
                    :disabled="!model.symbol"
                />
            </UFormField>
        </div>

        <div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4" :class="{ 'opacity-50': !model.useDateRange }">
                <UFormField :label="t('backtest.new.form.startDate.label')" name="startDate">
                    <UInput
                        class="w-full"
                        v-model="model.startDate"
                        type="date"
                        :min="dateRange.min"
                        :max="dateRange.max"
                        :disabled="!model.useDateRange"/>
                </UFormField>
                <UFormField :label="t('backtest.new.form.endDate.label')" name="endDate">
                    <UInput
                        class="w-full"
                        v-model="model.endDate"
                        type="date"
                        :min="dateRange.min"
                        :max="dateRange.max"
                        :disabled="!model.useDateRange"/>
                </UFormField>
            </div>
            <UCheckbox v-model="model.useDateRange" :label="t('backtest.new.form.useDateRange.label')" class="mt-2" />
        </div>

        <UFormField :label="t('backtest.new.form.initialCapital.label')" name="initialCapital" required>
            <UInput
                class="w-full"
                v-model.number="model.initialCapital"
                type="number"
                :min="1">
                <template #leading>
                    <span class="text-gray-500 dark:text-gray-400 text-xs">$</span>
                </template>
            </UInput>
        </UFormField>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const model = defineModel<Record<string, any>>({ required: true });

defineProps<{
    availableSymbols: string[];
    availableTimeframes: TimeframeData[];
    dateRange: { min?: string, max?: string };
}>();
</script>
