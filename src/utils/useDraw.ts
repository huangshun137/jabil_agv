import { ref } from "vue";

export default function useDraw() {
  // * 指向最外层容器
  const appRef = ref();
  // * 定时函数
  const timer = ref(0);
  // * 默认缩放值
  const scale = {
    width: "1",
    height: "1",
  };
  // * 设计稿尺寸（px）
  let baseWidth = 1920;
  let baseHeight = 1080;
  let innerWidth = window.innerWidth;
  let innerHeight = window.innerHeight;
  const calcRate = (
    container: HTMLElement | null = null,
    width = 1920,
    height = 1080
  ) => {
    if (container) {
      innerWidth = container.clientWidth;
      innerHeight = container.clientHeight;
    }
    baseWidth = width;
    baseHeight = height;
    console.log("innerWidth::::", innerWidth);
    console.log("baseWidth::::", baseWidth);
    // * 需保持的比例（默认1.77778）
    const baseProportion = parseFloat((baseWidth / baseHeight).toFixed(5));
    // 当前宽高比
    const currentRate = parseFloat((innerWidth / innerHeight).toFixed(5));
    if (appRef.value) {
      if (currentRate > baseProportion) {
        // 表示更宽
        scale.width = ((innerHeight * baseProportion) / baseWidth).toFixed(5);
        scale.height = (innerHeight / baseHeight).toFixed(5);
        appRef.value.style.transform = `scale(${scale.width}, ${scale.height}) translate(-50%, -50%)`;
      } else {
        // 表示更高
        scale.height = (innerWidth / baseProportion / baseHeight).toFixed(5);
        scale.width = (innerWidth / baseWidth).toFixed(5);
        appRef.value.style.transform = `scale(${scale.width}, ${scale.height}) translate(-50%, -50%)`;
      }
    }
  };

  const resize = () => {
    clearTimeout(timer.value);
    timer.value = window.setTimeout(() => {
      calcRate();
    }, 200);
  };

  // 改变窗口大小重新绘制
  const windowDraw = () => {
    window.addEventListener("resize", resize);
  };

  // 改变窗口大小重新绘制
  const unWindowDraw = () => {
    window.removeEventListener("resize", resize);
  };

  return {
    appRef,
    calcRate,
    windowDraw,
    unWindowDraw,
  };
}
