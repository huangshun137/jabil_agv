<script setup lang="ts">
import { onMounted, ref } from "vue";
import gridMap from "@/assets/img/grid-map.jpg";

const height = ref(720),
  width = ref(579),
  rowList = ref<number[]>([]),
  columnList = ref<number[]>([]);

onMounted(() => {
  rowList.value = new Array(Math.ceil(height.value / 30))
    .fill(0)
    .map((_, index) => index * 30);
  columnList.value = new Array(Math.ceil(width.value / 30))
    .fill(0)
    .map((_, index) => index * 30);
});
</script>

<template>
  <div
    class="container"
    :style="{
      width: width + 'px',
      height: height + 'px',
      background: `url(${gridMap})`,
    }"
  >
    <div
      class="line row-line"
      v-for="item in rowList"
      :style="{ top: item + 'px' }"
    ></div>
    <div
      class="line column-line"
      v-for="item in columnList"
      :style="{ left: item + 'px' }"
    ></div>
  </div>
</template>

<style lang="less">
.container {
  margin: auto;
  position: relative;

  .line {
    display: block;
    position: absolute;
  }
  .row-line {
    width: 100%;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.5);
  }
  .column-line {
    height: 100%;
    border-right: 1px dashed rgba(255, 255, 255, 0.5);
  }
}
</style>
