import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router/router";
import "./style.less";
import "virtual:svg-icons-register";
// dark主题
import "element-plus/theme-chalk/dark/css-vars.css";

// MessageBox 消息弹框 样式不会自动导入
import "element-plus/theme-chalk/el-overlay.css";
import "element-plus/theme-chalk/el-message-box.css";

import VueDragResizeRotate from "@gausszhou/vue3-drag-resize-rotate";
import "@gausszhou/vue3-drag-resize-rotate/lib/bundle.esm.css";

import Vue3ColorPicker from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import gloablComponent from "./components/index";

const app = createApp(App);
for (const [name, comp] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, comp);
}
app
  .use(createPinia())
  .use(router)
  .use(VueDragResizeRotate)
  .use(Vue3ColorPicker)
  .use(gloablComponent)
  .mount("#app");
