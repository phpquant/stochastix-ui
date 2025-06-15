<template>
    <UTooltip :text="tooltipText" :prevent="!tooltip">
        <UButton
            :icon="buttonIcon"
            color="neutral"
            variant="ghost"
            aria-label="Theme"
            @click="toggleMode"
        />
    </UTooltip>
</template>

<script setup lang="ts">
const colorMode = useColorMode();
const { t } = useI18n();

const isDark = computed(() => colorMode.value === 'dark');

const buttonIcon = computed(() => {
    return isDark.value ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid';
});

const tooltipText = computed(() => {
    return isDark.value ? t('colorMode.light') : t('colorMode.dark');
});

const toggleMode = () => {
    colorMode.preference = isDark.value ? 'light' : 'dark';
};

defineProps({
    tooltip: {
        type: Boolean,
        default: true
    }
});
</script>
