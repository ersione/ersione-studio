import { defineConfig } from 'vite';
export default defineConfig({base:'/ersione-studio/',build:{rollupOptions:{output:{manualChunks:{three:['three','three/addons/controls/OrbitControls.js'],react:['react','react-dom/client']}}}}});
