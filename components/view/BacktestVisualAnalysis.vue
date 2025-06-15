<template>
    <div>
        <h2 class="text-2xl font-semibold mb-6">
            {{ t('results.visualAnalysis.title') }}
        </h2>

        <div class="space-y-8">
            <PlotsEquityChart :run-id="runId" />
            <PlotsDrawdownChart :run-id="runId" />
            <PlotsBetaChart :run-id="runId" />
            <PlotsAlphaChart :run-id="runId" />
        </div>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();
const runId = route.params.id as string;
</script>
