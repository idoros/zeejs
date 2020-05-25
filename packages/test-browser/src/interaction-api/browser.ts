import { constants, InteractionApi, serializedApi } from './shared';

export function getInteractionApi(): InteractionApi {
    const callServer = (window as any)[constants.browserPageHook];
    return JSON.parse(serializedApi, (_key, value) => {
        if (typeof value === `string` && value.startsWith(constants.funcPrefix)) {
            const path = value.substring(constants.funcPrefix.length);
            return (...args: any[]) => {
                callServer(path, ...args);
            };
        }
        return value;
    });
}
