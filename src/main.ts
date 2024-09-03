import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router/router";
import "./style.less";
import "virtual:svg-icons-register";

import VueDragResizeRotate from "@gausszhou/vue3-drag-resize-rotate";
import "@gausszhou/vue3-drag-resize-rotate/lib/bundle.esm.css";

import gloablComponent from "./components/index";

createApp(App)
  .use(createPinia())
  .use(router)
  .use(gloablComponent)
  .use(VueDragResizeRotate)
  .mount("#app");
