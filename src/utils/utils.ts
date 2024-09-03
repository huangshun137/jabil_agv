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

export { requestQueue, formatTime };
