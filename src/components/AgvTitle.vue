<template>
  <div class="agv-title">
    <div class="d-flex jc-center">
      <decoration-10 class="dv-dec-10" />
      <div class="d-flex jc-center">
        <Decoration8 class="dv-dec-8" :color="['#568aea', '#000000']" />
        <div class="title">
          <span class="title-text">{{ title }}</span>
          <Decoration6
            class="dv-dec-6"
            :reverse="true"
            :color="['#50e3c2', '#67a1e5']"
          />
        </div>
        <Decoration8
          class="dv-dec-8"
          :reverse="true"
          :color="['#568aea', '#000000']"
        />
      </div>
      <Decoration10 class="dv-dec-10-s" />
    </div>

    <!-- 第二行 -->
    <div class="d-flex jc-between px-2">
      <div class="d-flex aside-width">
        <div class="react-left ml-4 react-l-s">
          <span class="react-before"></span>
          <span class="text">JABIL</span>
        </div>
        <div class="react-left ml-3"></div>
      </div>
      <div class="d-flex aside-width">
        <div class="react-right mr-3"></div>
        <div class="react-right mr-4 react-l-s">
          <span class="react-after"></span>
          <span class="text">
            {{ timeInfo.dateYear }} {{ timeInfo.dateWeek }}
            {{ timeInfo.dateDay }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from "vue";
import { Decoration6, Decoration8, Decoration10 } from "@kjgl77/datav-vue3";
import { formatTime } from "@/utils/utils";
import { WEEK } from "@/constant/constant";
withDefaults(
  defineProps<{
    title?: string;
  }>(),
  {
    title: "AGV可视化平台",
  }
);

const timeInfo = reactive({
  setInterval: null as unknown as ReturnType<typeof setInterval>,
  dateDay: "",
  dateYear: "",
  dateWeek: "",
});
// 处理时间监听
const handleTime = () => {
  timeInfo.setInterval = setInterval(() => {
    const date = new Date();
    timeInfo.dateDay = formatTime(date, "HH: mm: ss");
    timeInfo.dateYear = formatTime(date, "yyyy-MM-dd");
    timeInfo.dateWeek = WEEK[date.getDay()];
  }, 1000);
};
onMounted(() => {
  handleTime();
});
onUnmounted(() => {
  clearInterval(timeInfo.setInterval);
});
</script>
<style lang="less" scoped>
.agv-title {
  width: 100%;
  color: #d3d6dd;
  background-color: transparent;
  overflow: hidden;

  .dv-dec-10,
  .dv-dec-10-s {
    width: 33.3%;
    height: 5px;
  }
  .dv-dec-10-s {
    transform: rotateY(180deg);
  }
  .dv-dec-8 {
    width: 200px;
    height: 50px;
  }
  .title {
    position: relative;
    width: 500px;
    text-align: center;
    background-size: cover;
    background-repeat: no-repeat;

    .title-text {
      font-size: 33px;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%);
    }

    .dv-dec-6 {
      position: absolute;
      bottom: -30px;
      left: 50%;
      width: 250px;
      height: 8px;
      transform: translate(-50%);
    }
  }

  // 第二行
  .aside-width {
    width: 40%;
  }
  .react-r-s,
  .react-l-s {
    background-color: #0f1325;
  }

  // 平行四边形
  .react-right {
    &.react-l-s {
      text-align: right;
      width: 62.5%;
    }
    font-size: 18px;
    width: 37.5%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    transform: skewX(-45deg);
    background-color: #0f1325;

    .react-after {
      position: absolute;
      right: -25px;
      top: 0;
      height: 50px;
      width: 50px;
      transform: skewX(45deg);
      background-color: #0f1325;
    }

    .text {
      display: inline-block;
      transform: skewX(45deg);
    }
    &.react-l-s.mr-4 .text {
      font-size: 20px;
    }
  }

  .react-left {
    &.react-l-s {
      width: 62.5%;
      text-align: left;
    }
    font-size: 18px;
    width: 37.5%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    transform: skewX(45deg);
    background-color: #0f1325;

    .react-before {
      position: absolute;
      left: -25px;
      top: 0;
      height: 50px;
      width: 50px;
      background-color: #0f1325;
      transform: skewX(-45deg);
    }

    .text {
      display: inline-block;
      transform: skewX(-45deg);
    }
    &.react-l-s.ml-4 .text {
      font-size: 30px;
      margin-left: 20px;
    }
  }
}
</style>
