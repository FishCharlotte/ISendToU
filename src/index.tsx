import * as process from 'process';

(window as any).global = window;
(window as any).process = process;
(window as any).Buffer = [];

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';



const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <App />
    );
}
