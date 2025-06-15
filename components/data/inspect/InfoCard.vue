<template>
    <UCard>
        <template #header>
            <h3 class="font-semibold text-base">{{ title }}</h3>
        </template>
        <dl class="space-y-2">
            <div
                v-for="(value, key) in items"
                :key="key"
                class="flex justify-between text-sm"
            >
                <dt class="text-gray-500 dark:text-gray-400">{{ labelize(key) }}</dt>
                <dd class="font-mono text-gray-900 dark:text-gray-50 break-all">{{ formatValue(key, value) }}</dd>
            </div>
        </dl>
    </UCard>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    items: Record<string, any>;
}>();

const labelize = (text: string) => {
    const result = text.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
};

const formatValue = (key: string, value: any): string => {
    if (key === 'fileSize' && typeof value === 'number') {
        if (value < 1024) return `${value} B`;
        if (value < 1024 * 1024) return `${(value / 1024).toFixed(2)} KB`;
        return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    }
    if (typeof value === 'number') {
        return value.toLocaleString();
    }
    return String(value);
};
</script>
