<template>
  <div class="task-info-content">
    <BorderBox13>
      <!-- <div class="bg-color-black">
        <div class="d-flex pt-2 pl-2 mt-2">
          <span>
            <svg-icon name="icon-vector" :size="20" color="#5cd9e8"></svg-icon>
          </span>
          <div class="d-flex ml-1 ai-center">
            <span style="font-size: 18px; color: white">任务详情</span>
          </div>
        </div>
      </div> -->
      <div class="mt-1 board-content">
        <scroll-board
          ref="scrollBoard1"
          class="dv-scr-board"
          :config="{
            header: ['任务详情'],
            data: null,
            rowNum: 19, //表格行数
            headerHeight: 35,
            headerBGC: '#0f1325', //表头
            oddRowBGC: '#0f1325', //奇数行
            evenRowBGC: '#171c33', //偶数行
            index: true,
            columnWidth: [50],
            align: ['left'],
          }"
        />
      </div>
    </BorderBox13>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { ScrollBoard, BorderBox13 } from "@kjgl77/datav-vue3";

const scrollBoard1 = ref<InstanceType<typeof ScrollBoard>>(null);
const updateRows = (tableData: string[][]) => {
  scrollBoard1.value && scrollBoard1.value.updateRows(tableData);
};
defineExpose({
  updateRows,
});
</script>
<style lang="less" scoped>
@box-width: 280px;
@box-height: 430px;

.task-info-content {
  height: @box-height;
  width: @box-width;

  .dv-border-box-13 {
    padding: 16px;

    .board-content {
      height: calc(100% - 24px);
      overflow: hidden;
    }
  }
}
</style>
