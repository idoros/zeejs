import { A11yShared } from '@zeejs/test-browser';
import type { A11ySnapshot, A11yNode } from '@zeejs/test-browser';
const { constants } = A11yShared;
export const queryA11yNode = A11yShared.queryA11yNode;
export { A11yNode };

export const a11ySnapshot: A11ySnapshot = async (...args: any[]) => {
    const callServer = (window as any)[constants.browserPageHook];
    const response = await callServer(...args);
    if (response.type === `success`) {
        return response.value;
    } else if (response.type === `error`) {
        throw new Error(response.msg as string);
    }
};
