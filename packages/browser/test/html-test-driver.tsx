interface RenderOptions {
    container?: HTMLElement;
}

interface RenderOutput {
    container: HTMLElement;
    expectQuery: (query: string) => Element;
    expectHTMLQuery: (query: string) => HTMLElement;
    query: (query: string) => Element | null;
}
export class HTMLTestDriver {
    private stages: HTMLElement[] = [];

    public render(
        createHTML: () => string,
        { container: inputContainer }: RenderOptions = {}
    ): RenderOutput {
        const container = inputContainer || this.createContainer();
        if (!this.stages.includes(container)) {
            this.stages.push(container);
        }
        if (!container.parentElement) {
            container.dataset.insertedByTestDriver = 'true';
            document.body.appendChild(container);
        }
        container.innerHTML = createHTML();
        return {
            container,
            expectQuery: this.expectQuery.bind(null, container),
            expectHTMLQuery: this.expectHTMLQuery.bind(null, container),
            query: (querySelector: string) => container.querySelector(querySelector),
        };
    }

    public clean() {
        for (const element of this.stages) {
            element.innerHTML = ``;
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
