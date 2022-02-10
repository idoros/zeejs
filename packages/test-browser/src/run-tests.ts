import { safeListeningHttpServer } from 'create-listening-server';
import express from 'express';
import playwright from 'playwright';
import HtmlWebpackPlugin from 'html-webpack-plugin';
const webpackDevMiddleware = require('webpack-dev-middleware') as (
    compiler: webpack.Compiler
) => express.Handler & { close(): unknown };
import { hookPageConsole } from './hook-page-console';
import webpack from 'webpack';

const mochaSetupPath = require.resolve('../static/mocha-setup.js');

type Browser = 'chromium' | 'firefox' | 'webkit';

export interface RunTestsOptions {
    webpackConfig: webpack.Configuration;
    testFiles: string[];
    dev: boolean;
    browserList: Browser[];
    pageHook?: (page: playwright.Page) => Promise<void> | void;
}

export async function runTests({
    webpackConfig,
    testFiles,
    dev,
    browserList,
    pageHook,
}: RunTestsOptions): Promise<void> {
    const closables: Array<{ close(): unknown | Promise<unknown> }> = [];
    const colors = true;
    const preferredPort = 3000;

    try {
        console.log(`Bundling using webpack...`);
        const compiler = webpack({
            mode: 'development',
            ...webpackConfig,
            entry: {
                mocha: mochaSetupPath,
                units: testFiles,
            },
            plugins: createPluginsConfig(webpackConfig.plugins, {
                ui: `bdd`,
                colors,
                timeout: 8000,
                reporter: `spec`,
            }),
            stats: `errors-warnings`,
        });

        const devMiddleware = webpackDevMiddleware(compiler);

        closables.push(devMiddleware);

        const webpackStats = await new Promise<webpack.Stats>((resolve) => {
            compiler.hooks.done.tap('test-browser hook', resolve);
        });

        if (webpackStats.hasErrors()) {
            throw new Error(webpackStats.toString({ colors }));
        } else if (webpackStats.hasWarnings()) {
            console.warn(webpackStats.toString({ colors }));
        }

        console.log(`Done bundling.`);

        const app = express();
        app.use(devMiddleware);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        app.use(express.static(compiler.options.context || process.cwd()) as any);

        const { httpServer, port } = await safeListeningHttpServer(preferredPort, app);
        closables.push(httpServer);
        console.log(`HTTP server is listening on port ${port}`);

        if (!browserList.length) {
            browserList = ['chromium'];
        }
        if (dev) {
            browserList = [browserList[0]];
        }

        console.log(`Testing in ${browserList.join(`/`)}`);

        for (const browserName of browserList) {
            const browser = await playwright[browserName].launch({
                headless: !dev,
                devtools: dev,
                args: [...browserArgs[browserName]],
            });
            closables.push(browser);

            const context = await browser.newContext({
                viewport: { width: 800, height: 600 },
            });
            const page = await context.newPage();

            if (pageHook) {
                await pageHook(page);
            }
            hookPageConsole(page, browserName);
            await page.addInitScript(`_testEnv = {browserName: "${browserName}"}`);
            page.on('dialog', (dialog) => {
                dialog.dismiss();
            });
            page.on('framenavigated', () => {
                try {
                    page.addStyleTag({ content: `x-pw-glass {display: none!important;}` });
                } catch (_e) {
                    /**/
                }
            });
            const failsOnPageError = new Promise((_resolve, reject) => {
                page.once('pageerror', (e) => {
                    reject(e);
                });
                page.on(`crash`, () => {
                    reject(`${browserName} page crash`);
                });
            });
            await page.goto(`http://localhost:${port}/mocha.html`);

            const failedCount = await Promise.race([waitForTestResults(page), failsOnPageError]);
            if (failedCount) {
                throw `${failedCount as number} tests failed!`;
            }
        }
    } finally {
        if (!dev) {
            await Promise.all(closables.map((closable) => closable.close()));
            closables.length = 0;
        }
    }
}

const browserArgs = {
    chromium: [`--no-sandbox`],
    firefox: [],
    webkit: [],
};

async function waitForTestResults(page: playwright.Page): Promise<number> {
    await page.waitForFunction('mochaStatus.finished', ``, { timeout: 0 });
    return page.evaluate('mochaStatus.failed');
}

interface MochaOptions {
    ui: string;
    reporter: string;
    timeout: number;
    colors: boolean;
}
function createPluginsConfig(
    existingPlugins: webpack.WebpackPluginInstance[] = [],
    options: MochaOptions
): webpack.WebpackPluginInstance[] {
    return [
        ...(existingPlugins as any),

        // insert html webpack plugin that targets our own chunks
        new HtmlWebpackPlugin({
            filename: 'mocha.html',
            title: 'mocha tests',
            chunks: ['mocha', 'units'],
        }),

        // inject options to mocha-setup.js (in "static" folder)
        new webpack.DefinePlugin({
            'process.env': {
                MOCHA_UI: JSON.stringify(options.ui),
                MOCHA_COLORS: options.colors,
                MOCHA_REPORTER: JSON.stringify(options.reporter),
                MOCHA_TIMEOUT: options.timeout,
            },
        }),
    ];
}
