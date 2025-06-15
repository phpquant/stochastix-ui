<template>
    <div class="mb-8">
        <h3 class="text-xl font-semibold mb-3">{{ title }}</h3>
        <UCard>
            <UTable :data="data" :columns="columns" />
        </UCard>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    data: StatsTableEntry[];
    columns: { key: string, label: string, sortable?: boolean }[];
}>();
</script>
