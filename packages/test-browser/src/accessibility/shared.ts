import type { Page } from 'playwright';

export const constants = {
    browserPageHook: `__a11y_snapshot_Hook__`,
} as const;

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
export type A11yNode = NonNullable<Awaited<ReturnType<Page['accessibility']['snapshot']>>>;
/**
 * Captures the current state of the accessibility tree. The returned object represents the root accessible node of the
 * page.
 *
 * > NOTE: The Chromium accessibility tree contains nodes that go unused on most platforms and by most screen readers.
 * Playwright will discard them as well for an easier to process tree, unless `interestingOnly` is set to `false`.
 * ```
 *
 * @param options
 */
export type A11ySnapshot = (options?: SnapshotOptions) => Promise<A11yNode | null>;

export interface SnapshotOptions {
    /**
     * Prune uninteresting nodes from the tree. Defaults to `true`.
     */
    interestingOnly?: boolean;
    /**
     * The root DOM SELECTOR for the snapshot. Defaults to the whole page.
     */
    root?: string;
}

export type A11yResponse =
    | {
          type: `success`;
          value?: any;
      }
    | {
          type: `error`;
          msg: string;
          value?: any;
          stack?: string;
      };

export function queryA11yNode(node: A11yNode | null, query: Partial<A11yNode>): A11yNode | null {
    let current = node;
    const stack: A11yNode[] = [];
    while (current) {
        const queryKeys = Object.keys(query) as any as Array<keyof A11yNode>;
        while (queryKeys.length) {
            const key = queryKeys.shift()!;
            if (current[key] !== query[key]) {
                break; // this is not the node we are looking for
            }
            if (queryKeys.length === 0) {
                return current;
            }
        }
        if (current.children) {
            stack.unshift(...current.children);
        }
        current = stack.shift() || null;
    }
    return null;
}
