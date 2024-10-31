
import { defineConfig } from 'vite';


export default defineConfig(({ command, mode }) => ({
    base: command === 'build' ? 'tempname' : '/',

    server: {
        port: 3333,
    },

}));
