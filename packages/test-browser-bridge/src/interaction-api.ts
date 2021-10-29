import { interactionApiShared } from '@zeejs/test-browser';
import type { InteractionApi } from '@zeejs/test-browser';
const { constants, serializedApi } = interactionApiShared;

export function getInteractionApi(): InteractionApi {
    const callServer = (window as any)[constants.browserPageHook];
    const api = JSON.parse(serializedApi, (_key, value) => {
        if (typeof value === `string` && value.startsWith(constants.funcPrefix)) {
            const path = value.substring(constants.funcPrefix.length);
            return async (...args: any[]) => {
                const response = await callServer(path, ...args);
                if (window._testEnv.browserName === `webkit`) {
                    await new Promise((e) => setTimeout(e, 10));
                }
                if (response.type === `success`) {
                    return response.value;
                } else if (response.type === `error`) {
                    throw new Error(response.msg as string);
                }
            };
        }
        return value;
    });

    api.clickIfPossible = async (selector: string) => {
        try {
            await api.click(selector, { timeout: 500 });
        } catch (e) {
            return false;
        }
        return true;
    };

    return api;
}
