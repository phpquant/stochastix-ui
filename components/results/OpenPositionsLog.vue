<template>
    <UCard>
        <template #header>
            <h3 class="text-lg font-semibold">{{ t('results.openPositionsLog.title') }}</h3>
        </template>
        <template #default>
            <UTable :data="positions" :columns="columns" />
        </template>
    </UCard>
</template>

<script setup lang="ts">
defineProps<{ positions: OpenPosition[] }>();
const { t } = useI18n();

const columns = computed(() => [
    { accessorKey: 'symbol', header: t('results.openPositionsLog.columns.symbol') },
    { accessorKey: 'direction', header: t('results.openPositionsLog.columns.direction') },
    { accessorKey: 'entryTime', header: t('results.openPositionsLog.columns.entryTime') },
    { accessorKey: 'entryPrice', header: t('results.openPositionsLog.columns.entryPrice') },
    { accessorKey: 'quantity', header: t('results.openPositionsLog.columns.quantity') },
    { accessorKey: 'currentPrice', header: t('results.openPositionsLog.columns.currentPrice') },
    { accessorKey: 'unrealizedPnl', header: t('results.openPositionsLog.columns.unrealizedPnl') },
]);
</script>
