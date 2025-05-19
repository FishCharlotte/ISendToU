import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [
    pluginReact()
  ],
  server: {
    port: 3000,
    host: true // 允许局域网访问
  }
}); 