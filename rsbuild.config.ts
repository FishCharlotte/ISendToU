import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  html: {
    title: 'ISendToU - 我发俾你',
    template: 'index.html',
    inject: true,
    favicon: './src/assets/favicon.ico',
  },
  plugins: [
    pluginReact()
  ],
  server: {
    port: 3000,
  }
});
