import { ElScrollbar } from "element-plus";

/**
 * 模拟请求池工厂函数
 * @param {number} concurrency 最大并发数
 * @returns
 */
const requestQueue = (concurrency: number) => {
  concurrency = concurrency || 6; // 最大并发数
  const queue: Promise<any>[] = []; // 请求池
  let current = 0;

  const dequeue = () => {
    while (current < concurrency && queue.length) {
      current++;
      const requestPromiseFactory: Promise<any> = queue.shift()!; // 出列
      requestPromiseFactory.finally(() => {
        current--;
        dequeue();
      });
    }
  };

  return (requestPromiseFactory: Promise<any>) => {
    queue.push(requestPromiseFactory); // 入队
    dequeue();
  };
};

/**
 * @param {date} time 需要转换的时间
 * @param {String} fmt 需要转换的格式 如 yyyy-MM-dd、yyyy-MM-dd HH:mm:ss
 * @returns {String}
 */
const formatTime = (time: string | number | Date, fmt: string): string => {
  if (!time) return "";
  const date = new Date(time);
  const o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "H+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (const k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        // @ts-ignore: Unreachable code error
        RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return fmt;
};

// 将Blob转换为图片URL
const blobToImageUrl = (blob: Blob | MediaSource): string => {
  return window.URL.createObjectURL(blob);
};

/**
 * hex转rgb
 * @param {string} str  色值，如：#409EFF
 * @returns rgb(64, 158, 255)
 */
function hexToRgb(hex: string): string {
  // 移除可能存在的 '#' 符号
  const cleanHex = hex.replace("#", "");

  // 检查输入是否有效
  if (cleanHex.length !== 6) {
    throw new Error("Invalid hex color format. Expected 6 characters.");
  }

  // 将每部分转换为十进制数
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
}

// 提取数字
function extractNumber(str: string): number | null {
  const matchResult = str.match(/\d+/);
  if (matchResult) {
    return parseInt(matchResult[0], 10);
  }
  return null;
}

// 自动循环滚动
const autoScroll = (
  scrollbarRef: HTMLElement | InstanceType<typeof ElScrollbar>,
  scrollHeight: number
): (() => void) => {
  let scrollInterval: NodeJS.Timeout | null,
    scrollTimeout: NodeJS.Timeout | null;
  let isScrolling = false; // 添加一个标志变量
  const handleAutoScroll = () => {
    if (isScrolling) return; // 避免重复调用
    isScrolling = true;

    if (scrollbarRef) {
      (scrollbarRef as HTMLElement).scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    const startScroll = () => {
      let _scrollHeight = 0;

      const intervalCallback = () => {
        _scrollHeight += 4;
        if (scrollbarRef) {
          (scrollbarRef as HTMLElement).scrollTo({
            top: _scrollHeight,
            behavior: "smooth",
          });
        }

        if (_scrollHeight >= scrollHeight) {
          if (scrollInterval) {
            clearInterval(scrollInterval);
            scrollInterval = null;
          }
          isScrolling = false; // 标记滚动结束
          setTimeout(handleAutoScroll, 2000); // 重新执行滚动
        }
      };

      scrollInterval = setInterval(intervalCallback, 100);
    };

    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
      scrollTimeout = null;
    }

    scrollTimeout = setTimeout(() => {
      startScroll();
    }, 3000);
  };

  // 清除定时器和间隔器的函数
  const clearScrollTimers = () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
      scrollTimeout = null;
    }

    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  };

  clearScrollTimers();
  handleAutoScroll();

  return clearScrollTimers;
};

export {
  requestQueue,
  formatTime,
  blobToImageUrl,
  hexToRgb,
  extractNumber,
  autoScroll,
};
