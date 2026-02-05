// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL?: string;
  // 在这里添加更多环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}