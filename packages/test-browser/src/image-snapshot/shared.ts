export const constants = {
    imgSnapshotHook: `__image_snapshot_Hook__`,
} as const;

export interface ImageSnapshotOptions {
    filePath: string;
}
export interface HookMessage {
    type: `success` | `error` | `warning`;
    msg: string;
}
