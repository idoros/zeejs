export const constants = {
    imgSnapshotHook: `__image_snapshot_Hook__`,
} as const;

export interface ImageSnapshotOptions {
    filePath: string;
}
export interface ImageSnapshotHookMessage {
    type: `success` | `error` | `warning`;
    msg: string;
}
