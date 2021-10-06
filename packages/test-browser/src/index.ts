import glob from 'glob';
import findUp from 'find-up';
import type webpack from 'webpack';
import path from 'path';
import { runTests, RunTestsOptions } from './run-tests';

export { hookImageSnapshot } from './image-snapshot/node';
export { hookInteractionApi } from './interaction-api/node';
export { hookServerFixtures } from './server-fixtures/node';
export * from './browser';

const availableBrowsers = ['chromium', 'firefox', 'webkit'];

export const browserTest = ({
    files,
    dev,
    browsers = `chromium, firefox`,
    webpackConfig: webpackConfigPath = findUp.sync('webpack.config.js'),
    pageHook,
    process,
}: {
    files: string;
    dev: boolean;
    browsers?: string;
    webpackConfig?: string;
    pageHook?: RunTestsOptions['pageHook'];
    process: NodeJS.Process;
}) => {
    const testFiles: string[] = [];
    for (const foundFile of glob.sync(files, { absolute: true })) {
        testFiles.push(foundFile);
    }
    const { length: numFound } = testFiles;
    if (numFound === 0) {
        printErrorAndExit(`Cannot find any test files`);
    }
    console.log(`Found ${numFound} test files in ${process.cwd()}`);

    const webpackConfig: webpack.Configuration = webpackConfigPath
        ? require(path.resolve(webpackConfigPath))
        : {};
    if (typeof webpackConfig === 'function') {
        printErrorAndExit(
            'Webpack configuration file exports a function, which is not yet supported.'
        );
    }

    const browserList = browsers
        .split(',')
        .map((browser) => browser.trim())
        .filter(
            (browser) => !browser || availableBrowsers.includes(browser)
        ) as RunTestsOptions['browserList'];

    runTests({
        webpackConfig,
        testFiles,
        dev,
        browserList,
        pageHook,
    }).catch(printErrorAndExit);

    function printErrorAndExit(message: unknown) {
        console.error(message);
        if (!dev) {
            // keep process open in dev mode
            process.exit(1);
        }
    }
};
