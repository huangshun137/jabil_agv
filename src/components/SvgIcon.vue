<template>
  <svg
    :class="`icon${iconClass ? ' ' + iconClass : ''}`"
    :width="size"
    :height="size"
  >
    <use :xlink:href="`#${name}`" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    iconClass?: string;
    size?: number | string;
    name: string;
    color?: string;
  }>(),
  {
    iconClass: "",
    size: 24,
    color: "",
  }
);
</script>
