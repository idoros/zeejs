import { imageSnapshotShared } from '@zeejs/test-browser';
import type { ImageSnapshotOptions, ImageSnapshotHookMessage } from '@zeejs/test-browser';
const { constants } = imageSnapshotShared;

export async function expectImageSnapshot(options: ImageSnapshotOptions) {
    const result: ImageSnapshotHookMessage = await (window as any)[constants.imgSnapshotHook](
        options
    );
    switch (result.type) {
        case `error`:
            throw new Error(`${result.msg} for ${options.filePath}`);
        case `warning`:
            console.warn(`${result.msg} for ${options.filePath}`);
    }
}
