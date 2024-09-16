import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

// vue项目自带路由
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/agv-list",
    // name: "Home",
    // component: () => import("@/views/home.vue"),
  },
  {
    path: "/storeTest",
    name: "StoreTest",
    component: () => import("@/views/storeTest.vue"),
  },
  {
    path: "/agv-edit/:id",
    name: "AGVEdit",
    component: () => import("@/views/agvEdit/index.vue"),
    props: true,
  },
  {
    path: "/agv-preview",
    name: "AGVPreview",
    component: () => import("@/views/agvPreview/index.vue"),
  },
  {
    path: "/grid-demo",
    name: "GridDemo",
    component: () => import("@/views/gridDemo.vue"),
  },
  {
    path: "/modbus-debug",
    name: "ModbusDebug",
    component: () => import("@/views/modbusDebug.vue"),
  },
  {
    path: "/agv",
    name: "AGVPage",
    component: () => import("@/views/agv/index.vue"),
  },
  {
    path: "/agv-list",
    name: "AGVList",
    component: () => import("@/views/agvList/index.vue"),
  },
  // {
  //   path: "/about",
  //   name: "About",
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ "../views/About.vue"),
  // },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_BASE_URL),
  routes: [...routes],
});

export default router;
