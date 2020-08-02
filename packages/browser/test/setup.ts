import { browserTest, hookImageSnapshot, hookInteractionApi } from '@zeejs/test-browser';
import { join } from 'path';

const { DEV, BROWSERS } = process.env;

browserTest({
    files: `./test/**/*.spec.ts?(x)`,
    dev: DEV === `true`,
    browsers: BROWSERS,
    pageHook: (page) => {
        hookInteractionApi(page);
        hookImageSnapshot(page, {
            rootPath: join(__dirname, `__snapshots__`),
        });
    },
    process,
});
