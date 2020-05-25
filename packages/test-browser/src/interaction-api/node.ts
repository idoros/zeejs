import { constants } from './shared';
import { Page } from 'playwright';

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
            return await current.apply(context, args);
        }
        return current;
    });
}
