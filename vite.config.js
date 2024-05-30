
import { defineConfig } from 'vite';


export default defineConfig(({ command, mode }) => ({
    base: command === 'build' ? 'tempname' : '/',



}));
