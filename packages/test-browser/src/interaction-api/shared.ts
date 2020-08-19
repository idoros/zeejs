import { Page } from 'playwright';

export const constants = {
    funcPrefix: `__func::`,
    browserPageHook: `__browserHook__`,
} as const;

export const serializedApi = JSON.stringify({
    mouse: {
        click: constants.funcPrefix + `mouse.click`,
        dblclick: constants.funcPrefix + `mouse.dblclick`,
        down: constants.funcPrefix + `mouse.down`,
        move: constants.funcPrefix + `mouse.move`,
        up: constants.funcPrefix + `mouse.up`,
    },
    keyboard: {
        down: constants.funcPrefix + `keyboard.down`,
        insertText: constants.funcPrefix + `keyboard.insertText`,
        press: constants.funcPrefix + `keyboard.press`,
        type: constants.funcPrefix + `keyboard.type`,
        up: constants.funcPrefix + `keyboard.up`,
    },
    click: constants.funcPrefix + `click`,
    dblclick: constants.funcPrefix + `dblclick`,
    press: constants.funcPrefix + `press`,
    hover: constants.funcPrefix + `hover`,
    setViewportSize: constants.funcPrefix + `setViewportSize`,
    viewportSize: constants.funcPrefix + `viewportSize`,
});
export interface InteractionApi {
    mouse: Page['mouse'];
    keyboard: Page['keyboard'];
    click: Page['click'];
    dblclick: Page['dblclick'];
    press: Page['press'];
    hover: Page['hover'];
    setViewportSize: Page['setViewportSize'];
    viewportSize: () => Promise<ReturnType<Page['viewportSize']>>;
    clickIfPossible: (selector: string) => Promise<boolean>;
}
