<template>
    <div v-if="downloadStore.downloadQueue.length > 0">
        <h3 class="text-lg font-semibold mt-8 mb-2">{{ t('data.download.progress.title') }}</h3>
        <UCard>
            <div class="space-y-6">
                <div v-for="job in downloadStore.downloadQueue" :key="job.key">
                    <div class="flex justify-between items-center gap-4">
                        <div class="flex items-center gap-2 min-w-0">
                            <UIcon v-if="job.status === 'completed'" name="i-heroicons-check-circle-20-solid" class="text-green-500 w-5 h-5 flex-shrink-0" />
                            <UIcon v-else-if="job.status === 'downloading'" name="i-heroicons-arrow-down-tray-20-solid" class="w-5 h-5 flex-shrink-0" />
                            <UIcon v-else-if="job.status === 'failed'" name="i-heroicons-exclamation-circle-20-solid" class="text-red-500 w-5 h-5 flex-shrink-0" />
                            <UIcon v-else-if="job.status === 'cancelled'" name="i-heroicons-x-circle-20-solid" class="text-red-500 w-5 h-5 flex-shrink-0" />
                            <UIcon v-else name="i-heroicons-pause-circle-20-solid" class="text-gray-400 w-5 h-5 flex-shrink-0" />
                            <p class="text-sm truncate">
                                <strong>{{ job.symbol }}</strong> [{{ job.timeframe }}]
                            </p>
                        </div>
                        <UButton
                            v-if="job.jobId && ['pending', 'downloading'].includes(job.status)"
                            icon="i-heroicons-x-mark-20-solid"
                            size="2xs"
                            color="error"
                            variant="soft"
                            square
                            class="cursor-pointer"
                            :aria-label="`Cancel download for ${job.key}`"
                            @click="downloadStore.cancelDownload(job.jobId)"
                        />
                    </div>
                    <div class="mt-1 space-y-1">
                        <p class="text-xs text-gray-500 dark:text-gray-400" :class="{ 'text-center': job.status === 'downloading' }">
                            {{ formatJobMessage(job.message) }}
                        </p>
                        <UProgress v-if="job.status === 'downloading'" v-model="job.progress" />
                    </div>
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const downloadStore = useDataDownloadStore();

/**
 * Formats the job message to be more concise.
 * If the message contains "until", it extracts and displays only that part.
 * @param message The original message from the backend.
 */
const formatJobMessage = (message: string): string => {
    const untilIndex = message.toLowerCase().indexOf('up to');
    if (untilIndex !== -1) {
        return `Until ${message.slice(untilIndex + 6)}`;
    }
    return message;
};
</script>
