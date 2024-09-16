<template>
  <div class="agv-task-statistic">
    <BorderBox12>
      <div class="bg-color-black">
        <div class="d-flex pt-2 pl-2">
          <span>
            <svg-icon
              name="icon-statistic"
              :size="20"
              color="#5cd9e8"
            ></svg-icon>
          </span>
          <div class="d-flex ml-1 ai-center">
            <span style="font-size: 18px; color: white">任务统计</span>
            <Decoration3 class="dv-dec-3" />
          </div>
        </div>
        <div class="d-flex jc-center">
          <div ref="chartRef" style="width: 260px; height: 220px" />
        </div>
        <div class="bottom-data">
          <div
            class="item-box mt-4"
            v-for="(item, index) in numberData"
            :key="index"
          >
            <div class="d-flex jc-end">
              <svg-icon :name="item.icon" :size="30" color="#5cd9e8"></svg-icon>
              <digital-flop class="dv-digital-flop" :config="item.config" />
            </div>
            <p class="mt-3">
              <span> {{ item.text }} </span>
              <span class="colorYellow">(件)</span>
            </p>
          </div>
        </div>
      </div>
    </BorderBox12>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { Decoration3, DigitalFlop, BorderBox12 } from "@kjgl77/datav-vue3";
import * as echarts from "echarts";
import { getTaskStatisticApi } from "@/api/api";

const numberData = reactive([
  {
    text: "今日任务总量",
    key: "todayCount",
    config: {
      number: [0],
      content: "{nt}",
      style: {
        fontSize: 24,
      },
    },
    icon: "icon-diagnose",
  },
  {
    text: "本周完成数量",
    key: "allCount",
    config: {
      number: [0],
      content: "{nt}",
      style: {
        fontSize: 24,
      },
    },
    icon: "icon-monitoring",
  },
]);

const options = computed(() => {
  return {
    color: [
      "#9fe6b8",
      "#32c5e9",
      "#9fe6b8",
      "#ffdb5c",
      "#ff9f7f",
      "#fb7293",
      "#e7bcf3",
      "#8378ea",
    ],
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b} : {c} ({d}%)",
    },
    toolbox: {
      show: true,
    },
    calculable: true,
    legend: {
      orient: "horizontal",
      icon: "circle",
      bottom: 0,
      x: "center",
      data: ["本周完成数量", "今日任务总量"],
      textStyle: {
        color: "#fff",
      },
    },
    series: [
      {
        name: "通过率统计",
        type: "pie",
        radius: [10, 50],
        // roseType: 'area',
        center: ["50%", "40%"],
        itemStyle: {
          borderRadius: 5,
        },
        label: {
          show: true,
          color: "#fff",
        },
        emphasis: {
          label: {
            show: false,
          },
        },
        data: numberData.map((item) => ({
          name: item.text,
          value: item.config.number[0],
        })),
      },
    ],
  };
});

let interval: NodeJS.Timeout | null = null;
let chart: echarts.ECharts;
const chartRef = ref();
const getTaskStatistic = () => {
  getTaskStatisticApi().then((res: any) => {
    numberData.forEach((item) => {
      item.config.number = [res.data[item.key]];
    });
    chart.setOption(options.value);
  });
};
const initData = () => {
  getTaskStatistic();
  interval = setInterval(getTaskStatistic, 5000);
};
onMounted(() => {
  chart = echarts.init(chartRef.value);
  initData();
});
onUnmounted(() => {
  interval && clearInterval(interval);
});
</script>
<style lang="less" scoped>
@box-width: 300px;
@box-height: 407px;

.agv-task-statistic {
  height: @box-height;
  width: @box-width;
  .dv-border-box-12 {
    padding: 16px;
  }
  .bg-color-black {
    height: @box-height - 30px;
    border-radius: 10px;
  }
  .text {
    color: #c3cbde;
  }
  .dv-dec-3 {
    position: relative;
    width: 100px;
    height: 20px;
    top: -3px;
  }

  .bottom-data {
    .item-box {
      & > div {
        padding-right: 5px;
      }
      font-size: 14px;
      float: right;
      position: relative;
      width: 50%;
      color: #d3d6dd;
      .dv-digital-flop {
        width: 90px;
        height: 30px;
      }
      i {
        font-size: 20px;
        line-height: 30px;
        margin-left: 20px;
      }
      .colorYellow {
        color: yellowgreen;
      }
      p {
        text-align: center;
      }
    }
  }
}
</style>
