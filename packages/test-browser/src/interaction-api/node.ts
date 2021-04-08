import { constants } from './shared';
import type { Page } from 'playwright';

export function hookInteractionApi(page: Page): void {
    page.exposeFunction(constants.browserPageHook, async (path: string, ...args: any) => {
        const refNames = path.split(`.`);
        let context: any = undefined;
        let current: any = page;
        while (refNames.length) {
            const currentName = refNames.shift()!;
            const next = current[currentName];
            if (next === undefined && refNames) {
                return `ERROR: calling browser API with unknown path: "${path}"`;
            }
            context = current;
            current = next;
        }
        if (typeof current === `function`) {
            let value: any;
            try {
                value = await current.apply(context, args);
            } catch (e) {
                if (e instanceof Error) {
                    return { type: `error`, msg: e.message, stack: e.stack };
                }
                return { type: `error`, msg: JSON.stringify(e), stack: `` };
            }
            return { type: `success`, value };
        }
        return { type: `success`, value: current };
    });
}
