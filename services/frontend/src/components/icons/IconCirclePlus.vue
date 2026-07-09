<template>
    <svg
        class="icon-circle-btn"
        :width="size"
        :height="size"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        :style="{ width: size + 'px', height: size + 'px', display: 'block' }"
    >
        <path d="M0 40C0 17.9086 17.9086 0 40 0C62.0914 0 80 17.9086 80 40C80 62.0914 62.0914 80 40 80C17.9086 80 0 62.0914 0 40Z" class="icon-circle-btn-bg"/>
        <path d="M29.6291 39.7042H50.3709M40 29.3333V50.0751" stroke="white" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
    </svg>
</template>
<script setup>
import { defineProps } from 'vue'
defineProps({
    size: { type: [Number, String], default: 35 }
})
</script>
