import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./seo-tests',timeout:60000,workers:1,use:{baseURL:'http://127.0.0.1:4177/',screenshot:'only-on-failure'},webServer:{command:'node scripts/preview-static.mjs',url:'http://127.0.0.1:4177/',reuseExistingServer:false}});
