import glob from 'glob';
import findUp from 'find-up';
import webpack from 'webpack';
import path from 'path';
import { runTests, RunTestsOptions } from './run-tests';

export { hookImageSnapshot } from './image-snapshot/node';
export { hookInteractionApi } from './interaction-api/node';
export { hookServerFixtures } from './server-fixtures/node';

export const browserTest = ({
    files,
    dev,
    webpackConfig: webpackConfigPath = findUp.sync('webpack.config.js'),
    pageHook,
    process,
}: {
    files: string;
    dev: boolean;
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

    runTests({
        webpackConfig,
        testFiles,
        dev,
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
