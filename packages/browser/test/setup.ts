import { browserTest, hookImageSnapshot, hookInteractionApi } from '@zeejs/test-browser';
import { join } from 'path';

browserTest({
    files: `./test/**/*.spec.ts?(x)`,
    dev: true,
    pageHook: (page) => {
        hookInteractionApi(page);
        hookImageSnapshot(page, {
            rootPath: join(__dirname, `__snapshots__`),
        });
    },
    process,
});
