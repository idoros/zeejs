import {
    browserTest,
    hookImageSnapshot,
    hookInteractionApi,
    hookServerFixtures,
} from '@zeejs/test-browser';
import { join } from 'path';
const svelteRegister = require('svelte/register');

svelteRegister({ generate: `ssr` });

const { DEV, BROWSERS } = process.env;

const testPath = join(__dirname);

browserTest({
    files: join(testPath, `**`, `*.spec.ts?(x)`),
    dev: DEV === `true`,
    browsers: BROWSERS || `chromium, firefox`,
    pageHook: (page) => {
        hookInteractionApi(page);
        hookImageSnapshot(page, {
            rootPath: join(__dirname, `__snapshots__`),
        });
        hookServerFixtures(page, {
            rootPath: join(testPath, `server-fixtures`),
        });
    },
    process,
});
