
import { defineConfig } from 'vite';


export default defineConfig(({ command, mode }) => ({
    base: command === 'build' ? 'website' : '/',

    server: {
        port: 3333,
    },

}));
