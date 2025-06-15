<template>
    <div class="space-y-4">
        <UFormField
            v-for="input in inputs"
            :key="input.name"
            :name="`inputs.${input.name}`"
            :label="input.description ? input.description : labelize(input.name)"
        >
            <USelectMenu
                v-if="input.type === 'array'"
                class="w-full"
                v-model="model[input.name]"
                :items="input.choices"
                multiple
                :placeholder="t('backtest.new.form.array.placeholder')"
            />

            <USelectMenu
                v-else-if="input.choices && input.choices.length > 0"
                class="w-full"
                v-model="model[input.name]"
                :items="input.choices"
            />
            <USwitch
                v-else-if="input.type === 'boolean'"
                class="w-full"
                v-model="model[input.name]"
            />
            <UInput
                v-else-if="input.type === 'number' || input.type === 'integer'"
                class="w-full"
                v-model.number="model[input.name]"
                type="number"
                :step="input.type === 'integer' ? 1 : 0.001"
                :min="input.min ?? undefined"
                :max="input.max ?? undefined"
            />
            <UInput
                v-else
                class="w-full"
                v-model="model[input.name]"
                type="text"
            />
        </UFormField>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

defineProps<{
    inputs: StrategyInput[];
}>();

const model = defineModel<Record<string, any>>({ required: true });

const labelize = (text: string) => {
    const result = text.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
};
</script>
