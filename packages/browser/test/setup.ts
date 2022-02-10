import {
    browserTest,
    hookImageSnapshot,
    hookInteractionApi,
    hookA11yApi,
} from '@zeejs/test-browser';
import { join } from 'path';

const { DEV, BROWSERS } = process.env;

browserTest({
    files: `./dist/test/**/*.spec.js?(x)`,
    dev: DEV === `true`,
    browsers: BROWSERS,
    pageHook: (page) => {
        hookInteractionApi(page);
        hookImageSnapshot(page, {
            rootPath: join(__dirname, `__snapshots__`),
        });
        hookA11yApi(page);
    },
    process,
});
