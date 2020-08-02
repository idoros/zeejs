import {
    browserTest,
    hookImageSnapshot,
    hookInteractionApi,
    hookServerFixtures,
} from '@zeejs/test-browser';
import { join } from 'path';
const svelteRegister = require('svelte/register');

svelteRegister({ generate: `ssr` });

const { DEV } = process.env;

browserTest({
    files: `./test/**/*.spec.ts?(x)`,
    dev: DEV === `true`,
    pageHook: (page) => {
        hookInteractionApi(page);
        hookImageSnapshot(page, {
            rootPath: join(__dirname, `__snapshots__`),
        });
        hookServerFixtures(page, {
            rootPath: join(__dirname, `server-fixtures`),
        });
    },
    process,
});
