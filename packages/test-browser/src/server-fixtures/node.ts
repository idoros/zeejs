import { constants, ServerFixturesOptions } from './shared';
import { Page } from 'playwright';
import { nodeFs } from '@file-services/node';

export interface ServerFixturesHookOptions {
    rootPath: string;
}

const { exists } = nodeFs.promises;
export function hookServerFixtures(page: Page, { rootPath }: ServerFixturesHookOptions) {
    page.exposeFunction(
        constants.serverFixturesHook,
        async ({
            fixtureFileName,
            exportName = `default`,
        }: ServerFixturesOptions): Promise<unknown> => {
            const path = nodeFs.join(rootPath, fixtureFileName);
            if (!(await exists(path))) {
                return { type: `error`, msg: `fixture not found: "${path}"` };
            }
            // clear fixture cache
            // ToDo: run only in dev mode
            for (const key of Object.keys(require.cache)) {
                delete require.cache[key];
            }
            // try to load fixture
            let fixtureModule = null;
            try {
                fixtureModule = require(path);
                // would be nice if worked:
                // fixtureModule = await import(path + `?invalidateCache=xxx`);
            } catch (e) {
                return {
                    type: `error`,
                    msg: `evaluation error in: "${path}" - ${String(e.message ?? e)}\n${String(
                        e ? e.stack : ``
                    )}`,
                };
            }
            if (typeof fixtureModule[exportName] !== `function`) {
                return { type: `error`, msg: `unknown expert "${exportName}" in: "${path}"` };
            }
            // run and catch errors
            let fixtureResult = null;
            try {
                fixtureResult = await fixtureModule[exportName]();
            } catch (e) {
                return {
                    type: `error`,
                    msg: `execution error in: "${path}" - ${String(e.message ?? e)}\n${String(
                        e ? e.stack : ``
                    )}`,
                };
            }
            // return results
            return { type: `success`, msg: ``, value: fixtureResult };
        }
    );
}