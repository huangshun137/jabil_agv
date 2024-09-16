<template>
  <div
    v-if="svgContent"
    v-html="svgContent"
    class="svg-content"
    :style="{ width: size + 'px', height: size + 'px', fill: color }"
  ></div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { getApiWithoutLoading } from "@/api/http";
import { hexToRgb } from "@/utils/utils";

const props = withDefaults(
  defineProps<{
    svgUrl: string;
    size?: number;
    color: string;
  }>(),
  {
    iconClass: "",
    size: 24,
  }
);

const svgContent = ref<string>();
const _color = computed<string>(() => {
  return props.color.includes("rgb") ? props.color : hexToRgb(props.color);
});

const fetchSvg = async (url: string) => {
  try {
    const response: any = await getApiWithoutLoading(
      url,
      {},
      { responseType: "text" }
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch SVG:", error);
  }
};

const initData = async () => {
  svgContent.value = await fetchSvg(props.svgUrl);

  if (svgContent.value) {
    if (svgContent.value.includes("fill")) {
      svgContent.value = svgContent.value.replace(
        new RegExp(`fill="[^"]+"`, "g"),
        `fill="${_color}"`
      );
    } else {
      svgContent.value = svgContent.value.replace(
        new RegExp(`<path`, "g"),
        `<path fill="${_color}"`
      );
    }
    if (svgContent.value.includes("width")) {
      svgContent.value = svgContent.value.replace(
        new RegExp(`width="[^"]+"`, "g"),
        `width="${props.size}"`
      );
      svgContent.value = svgContent.value.replace(
        new RegExp(`height="[^"]+"`, "g"),
        `height="${props.size}"`
      );
    } else {
      svgContent.value = svgContent.value.replace(
        new RegExp(`<svg`, "g"),
        `<svg width="${props.size}" height="${props.size}"`
      );
    }
  }
};

watch(
  () => [_color, props.size],
  ([newColor, newSize], [oldColor, oldSize]) => {
    if (svgContent.value) {
      svgContent.value = svgContent.value.replace(
        new RegExp(`fill="${oldColor}"`, "g"),
        `fill="${newColor}"`
      );
      svgContent.value = svgContent.value.replace(
        new RegExp(`width="${oldSize}" height="${oldSize}"`, "g"),
        `width="${newSize}" height="${newSize}"`
      );
    }
  }
);

watch(
  () => props.svgUrl,
  () => initData()
);

onMounted(() => {
  initData();
});
</script>
<style scoped>
.svg-content {
  width: 100px; /* 定义 SVG 的宽度 */
  height: 100px; /* 定义 SVG 的高度 */
}

/* 更改 SVG 的颜色 */
.svg-content path {
  fill: currentColor; /* 使用当前颜色 */
}
</style>
