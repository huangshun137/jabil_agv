/// <reference types="vite/client" />

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@gausszhou/vue3-drag-resize-rotate" {
  import type { App } from "vue";
  const _default: {
    install: (app: App, ...args: any[]) => void;
  };
  export default _default;
}
