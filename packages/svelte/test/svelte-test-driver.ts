import { compile } from 'svelte/compiler';
import * as svelteInternal from 'svelte/internal';
import { SvelteComponent } from 'svelte';

export class SvelteTestDriver {
    private stages: HTMLElement[] = [];
    private env: Record<string, any>;

    constructor(customEnv: Record<string, any>) {
        this.env = {
            'svelte/internal': svelteInternal,
            ...customEnv,
        };
    }

    public render(fixture: string, props: Record<string, any> = {}) {
        const container = this.createContainer(); // inputContainer ||
        if (!this.stages.includes(container)) {
            this.stages.push(container);
        }
        if (!container.parentElement) {
            container.dataset.insertedByTestDriver = 'true';
            document.body.appendChild(container);
        }
        const FixtureComp = this.evaluateFixture(fixture);
        const { $set } = new FixtureComp({
            target: container,
            props,
        });
        return {
            updateProps: async (props: Record<string, any>) => {
                $set(props);
                await Promise.resolve().then(() => {
                    /**/
                });
            },
            container,
            expectQuery: this.expectQuery.bind(null, container),
            expectHTMLQuery: this.expectHTMLQuery.bind(null, container),
            query: (querySelector: string) => container.querySelector(querySelector),
        };
    }

    private evaluateFixture(fixture: string) {
        const r = compile(fixture, { format: `cjs` }) as { js: { code: string } };
        const _module: any = {
            id: `test-fixture`,
            exports: {},
        };
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        new Function(`module`, `exports`, `require`, r.js.code)(
            _module,
            _module.exports,
            (path: string) => {
                if (this.env[path]) {
                    return this.env[path];
                }
                throw new Error(`unknown test fixture import: "${path}"`);
            }
        );
        return _module.exports.default as typeof SvelteComponent;
    }

    public clean() {
        for (const element of this.stages) {
            // ToDo: distroy fixture component instance; .$destroy()? 
            if (element.dataset.insertedByTestDriver === 'true') {
                document.body.removeChild(element);
            }
        }
        this.stages.length = 0;
    }

    public createContainer(): HTMLDivElement {
        return document.createElement('div');
    }

    public expectQuery(element: HTMLElement, querySelector: string) {
        const result = element.querySelector(querySelector);
        if (!result) {
            throw new Error(`query for "${querySelector}" failed with no result`);
        }
        return result;
    }
    public expectHTMLQuery(element: HTMLElement, querySelector: string): HTMLElement {
        const result = element.querySelector(querySelector);
        if (!result) {
            throw new Error(`query for "${querySelector}" failed with no result`);
        }
        if (result instanceof HTMLElement) {
            return result;
        }
        throw new Error(
            `query for "${querySelector}" failed with result that is not an HTMLElement`
        );
    }
    public query(element: HTMLElement, querySelector: string) {
        const result = element.querySelector(querySelector);

        return result;
    }
}
