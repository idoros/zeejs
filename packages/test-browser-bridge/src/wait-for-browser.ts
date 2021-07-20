export async function waitForBrowser(browserMatch: RegExp, time = 10): Promise<void> {
    if (browserMatch.exec(window._testEnv.browserName)) {
        await new Promise((e) => setTimeout(e, time));
    }
}