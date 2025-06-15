<template>
    <div>
        <ViewBacktestResult :run-id="runId" />
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const runId = computed(() => route.params.id as string);
</script>
