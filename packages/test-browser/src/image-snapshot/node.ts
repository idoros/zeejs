import { constants, ImageSnapshotOptions, HookMessage } from './shared';
import { Page } from 'playwright';
import { nodeFs } from '@file-services/node';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export interface ImageSnapshotHookOptions {
    rootPath: string;
    threshold?: number;
}

const { writeFile, readFile, exists } = nodeFs.promises;
// ToDo: collect/allow image diff upload for CI
export function hookImageSnapshot(
    page: Page,
    { rootPath, threshold = 0.001 }: ImageSnapshotHookOptions
) {
    page.exposeFunction(
        constants.imgSnapshotHook,
        async ({ filePath }: ImageSnapshotOptions): Promise<HookMessage> => {
            const pathSplit = filePath.split(`/`);
            const file = pathSplit.pop()!;
            const folder = nodeFs.join(rootPath, pathSplit.join(`/`));
            const actual = PNG.sync.read(await page.screenshot({ fullPage: false, type: `png` }));
            const path = nodeFs.join(folder, file + `.png`);
            const expectationExists = await exists(path);
            if (!expectationExists) {
                nodeFs.ensureDirectorySync(folder);
                await writeFile(path, PNG.sync.write(actual));
                return { type: `warning`, msg: `first run - not checked against expectation!` };
            }
            const { width, height } = actual;
            const expectation = PNG.sync.read(await readFile(path));
            if (width !== expectation.width || height !== expectation.height) {
                return { type: `error`, msg: `expectation dimensions don't match actual snapshot` };
            }
            const diff = new PNG({ width, height });
            const diffPixels = pixelmatch(actual.data, expectation.data, diff.data, width, height);
            const diffRatio = diffPixels / (width * height);
            if (diffRatio >= threshold) {
                await writeFile(nodeFs.join(folder, file + `[diff].png`), PNG.sync.write(diff));
                return { type: `error`, msg: `expectation diff pass ratio` };
            }
            // else if (diffRatio > 0) {
            //     console.log({ diffRatio })
            //     await writeFile(nodeFs.join(folder, file + `[slight-diff].png`), PNG.sync.write(actual));
            // }
            return { type: `success`, msg: `` };
        }
    );
}
