<template>
    <div v-if="trades && trades.length > 0" class="mt-8">
        <h3 class="text-2xl font-semibold mb-4">
            {{ t('results.tradesLog.title') }}
        </h3>
        <UTable :data="trades" :columns="columns" />
    </div>
</template>

<script setup lang="ts">
defineProps<{
    trades: ClosedTrade[];
}>();

const { t } = useI18n();

const columns = [
    {
        accessorKey: 'tradeNumber',
        header: t('results.tradesLog.columns.tradeNumber'),
    },
    {
        accessorKey: 'direction',
        header: t('results.tradesLog.columns.direction'),
    },
    {
        accessorKey: 'symbol',
        header: t('results.tradesLog.columns.symbol'),
    },
    {
        accessorKey: 'entryTime',
        header: t('results.tradesLog.columns.entryTime'),
    },
    {
        accessorKey: 'exitTime',
        header: t('results.tradesLog.columns.exitTime'),
    },
    {
        accessorKey: 'entryPrice',
        header: t('results.tradesLog.columns.entryPrice'),
    },
    {
        accessorKey: 'exitPrice',
        header: t('results.tradesLog.columns.exitPrice'),
    },
    {
        accessorKey: 'quantity',
        header: t('results.tradesLog.columns.quantity'),
    },
    {
        accessorKey: 'pnl',
        header: t('results.tradesLog.columns.pnl'),
    },
    {
        accessorKey: 'enterTags',
        header: t('results.tradesLog.columns.enterTags'),
        cell: (props: any) => h('span', props.getValue()?.join(', ')),
    },
    {
        accessorKey: 'exitTags',
        header: t('results.tradesLog.columns.pnl'),
        cell: (props: any) => h('span', props.getValue()?.join(', ')),
    },
];
</script>
