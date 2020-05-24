import { Page } from 'playwright';

const CONSTS = {
    funcPrefix: `__func::`,
    browserPageApi: `__browserApi__`,
    browserPageHook: `__browserHook__`
} as const;
const serializedApi = JSON.stringify({
    mouse: {
        click: CONSTS.funcPrefix + `mouse.click`,
        dblclick: CONSTS.funcPrefix + `mouse.dblclick`,
        down: CONSTS.funcPrefix + `mouse.down`,
        move: CONSTS.funcPrefix + `mouse.move`,
        up: CONSTS.funcPrefix + `mouse.up`,
    },
    keyboard: {
        down: CONSTS.funcPrefix + `keyboard.down`,
        insertText: CONSTS.funcPrefix + `keyboard.insertText`,
        press: CONSTS.funcPrefix + `keyboard.press`,
        type: CONSTS.funcPrefix + `keyboard.type`,
        up: CONSTS.funcPrefix + `keyboard.up`,
    },
    click: CONSTS.funcPrefix + `click`,
    dblclick: CONSTS.funcPrefix + `dblclick`,
    press: CONSTS.funcPrefix + `press`,
    hover: CONSTS.funcPrefix + `hover`
});
interface BrowserApi {
    mouse: Page['mouse'],
    keyboard: Page['keyboard'],
    click: Page['click']
    dblclick: Page['dblclick'],
    press: Page['press'],
    hover: Page['hover']
}
export function hookBrowserApi(page: Page): void {
    page.exposeFunction(CONSTS.browserPageHook, async (path: string, ...args: any) => {
        console.log({ path, args })
        const refNames = path.split(`.`);
        let context: any = undefined;
        let current: any = page;
        while (refNames.length) {
            const currentName = refNames.shift()!;
            const next = current[currentName]
            if (next === undefined && refNames) {
                return `ERROR: calling browser API with unknown path: "${path}"`;
            }
            context = current;
            current = next;
        }
        if (typeof current === `function`) {
            return await current.apply(context, args);
        }
        return current
    })

    page.addInitScript(({ serializedApi, CONSTS }: any) => {
        const callServer = (window as any)[CONSTS.browserPageHook];
        (window as any)[CONSTS.browserPageApi] = JSON.parse(serializedApi, (_key, value) => {
            if (typeof value === `string` && value.startsWith(CONSTS.funcPrefix)) {
                const path = value.substring(CONSTS.funcPrefix.length);
                return (...args: any[]) => {
                    callServer(path, ...args);
                }
            }
            return value;
        })
    }, { serializedApi, CONSTS });
}
export function getBrowserApi(): BrowserApi {
    return (window as any)[CONSTS.browserPageApi];
}
