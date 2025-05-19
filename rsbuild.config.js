"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@rsbuild/core");
const plugin_react_1 = require("@rsbuild/plugin-react");
const plugin_node_polyfill_1 = require("@rsbuild/plugin-node-polyfill");
exports.default = (0, core_1.defineConfig)({
    plugins: [
        (0, plugin_react_1.pluginReact)(),
        (0, plugin_node_polyfill_1.pluginNodePolyfill)()
    ],
    server: {
        port: 3000,
        host: true // 允许局域网访问
    },
    source: {
        define: {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
        }
    }
});
