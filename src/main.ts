import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./router/router";
import "./style.css";
import "virtual:svg-icons-register";

import gloablComponent from "./components/index";

createApp(App)
  .use(createPinia())
  .use(router)
  .use(gloablComponent)
  .mount("#app");
