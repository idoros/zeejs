import { constants, ImageSnapshotOptions } from './shared';

export async function expectImageSnapshot(options: ImageSnapshotOptions) {
    const result = await (window as any)[constants.imgSnapshotHook](options);
    switch (result.type) {
        case `error`:
            throw new Error(`${result.msg} for ${options.filePath}`);
        case `warning`:
            console.warn(`${result.msg} for ${options.filePath}`);
    }
}
