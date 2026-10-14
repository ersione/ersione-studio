import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:120000,workers:1,use:{screenshot:'only-on-failure',baseURL:'http://127.0.0.1:4174/'},webServer:{command:'npm run dev -- --port 4174',url:'http://127.0.0.1:4174/',reuseExistingServer:false}});
