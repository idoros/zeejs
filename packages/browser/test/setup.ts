import { browserTest } from '@zeejs/test-browser';

browserTest({
    files: `./test/**/*.spec.ts?(x)`,
    dev: true,
    process,
});
