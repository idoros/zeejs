export { getInteractionApi } from './interaction-api';
export { expectImageSnapshot } from './image-snapshot';
export { expectServerFixture } from './server-fixtures';
export { waitForBrowser } from './wait-for-browser';
declare global {
    interface Window {
        _testEnv: {
            browserName: 'chromium' | 'firefox' | 'webkit';
        };
    }
}
export function getTestEnv() {
    return window?._testEnv;
}
