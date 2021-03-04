import {
    browserTest,
    hookImageSnapshot,
    hookInteractionApi,
    hookServerFixtures,
} from '@zeejs/test-browser';
import { join } from 'path';

const { DEV, BROWSERS } = process.env;

const testDistPath = join(__dirname, `..`, `dist`, `test`);

browserTest({
    files: `./dist/test/**/*.spec.js?(x)`,
    dev: DEV === `true`,
    browsers: BROWSERS || `chromium, firefox`,
    pageHook: (page) => {
        hookInteractionApi(page);
        hookImageSnapshot(page, {
            rootPath: join(__dirname, `__snapshots__`),
        });
        hookServerFixtures(page, {
            rootPath: join(testDistPath, `server-fixtures`),
        });
    },
    process,
});
