<template>
    <UtilityHeader>
        <template #left>
            <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl">
                <img src="~/assets/images/logo.svg" alt="Stochastix Logo" class="w-7 h-7" />
                {{ t('app.name') }}
            </NuxtLink>
        </template>

        <template #right>
            <UtilityColorModeButton />
        </template>
    </UtilityHeader>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>
