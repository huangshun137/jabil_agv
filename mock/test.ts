export default [
  {
    url: "/test",
    method: "POST",
    response: (request: any) => {
      // 如果有返回成功信息
      return { code: 200, data: { results: [] } };
    },
    timeout: 1000,
  },
  {
    url: "/task/getCountByFinish",
    method: "GET",
    response: (request: any) => {
      // 如果有返回成功信息
      return {
        code: 200,
        data: {
          todayCount: 111,
          allCount: 2222,
        },
      };
    },
    timeout: 1000,
  },
];
