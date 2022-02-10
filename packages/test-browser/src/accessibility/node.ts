import { constants, A11yResponse, SnapshotOptions } from './shared';
import type { Page } from 'playwright';

export function hookA11yApi(page: Page): void {
    page.exposeFunction(
        constants.browserPageHook,
        async ({
            root = ``,
            interestingOnly = true,
        }: SnapshotOptions = {}): Promise<A11yResponse> => {
            let value: any;
            try {
                const element = root ? await page.$(root) : undefined;
                value = await page.accessibility.snapshot({
                    interestingOnly,
                    root: element || undefined,
                });
            } catch (e) {
                if (e instanceof Error) {
                    return { type: `error`, msg: e.message, stack: e.stack };
                }
                return { type: `error`, msg: JSON.stringify(e), stack: `` };
            }
            return { type: `success`, value };
        }
    );
}
