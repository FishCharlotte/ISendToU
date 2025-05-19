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
  },
  source: {
    define: {
      'process.env.API_URL': JSON.stringify(process.env.NODE_ENV === 'production' 
        ? 'https://send.xxsfish.com/'
        : 'http://192.168.3.171:3001')
    }
  }
});
