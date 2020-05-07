import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

type DataRootFactory<T> = (options: {
    initialData?: T;
    onSet: () => void;
}) => {
    getData: () => T;
    setData: (data: T) => void;
};

interface RenderOptions<DATA> {
    container?: HTMLElement;
    initialData?: DATA;
    dataRoot?: DataRootFactory<DATA>;
}

interface RenderOutput<DATA> {
    container: HTMLElement;
    expectQuery: (query: string) => Element;
    expectHTMLQuery: (query: string) => HTMLElement;
    query: (query: string) => Element | null;
    click: (selector: string) => void;
    getData: () => DATA;
    setData: (newData: DATA) => void;
}
export class ReactTestDriver<T = unknown> {
    private stages: HTMLElement[] = [];

    public render<DATA extends T = T>(
        createVdom: (data: DATA, updateData: (newData: DATA) => void) => React.ReactElement,
        {
            container: inputContainer,
            initialData = undefined,
            dataRoot = defaultDataFactory as DataRootFactory<DATA>,
        }: RenderOptions<DATA> = {}
    ): RenderOutput<DATA> {
        const container = inputContainer || this.createContainer();
        if (!this.stages.includes(container)) {
            this.stages.push(container);
        }
        if (!container.parentElement) {
            container.dataset.insertedByTestDriver = 'true';
            document.body.appendChild(container);
        }
        const render = () => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            act(() => {
                ReactDOM.render(createVdom(getData(), setData), container);
            });
        };
        const { getData, setData } = dataRoot({ initialData, onSet: render });
        render();
        return {
            container,
            expectQuery: this.expectQuery.bind(null, container),
            expectHTMLQuery: this.expectHTMLQuery.bind(null, container),
            query: (querySelector: string) => container.querySelector(querySelector),
            click: this.click.bind(this, container),
            getData,
            setData,
        };
    }

    public clean() {
        for (const element of this.stages) {
            ReactDOM.unmountComponentAtNode(element);
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
    public click(element: HTMLElement, querySelector: string) {
        const elementToClick = this.expectQuery(element, querySelector);
        elementToClick.scrollIntoView(true);
        const bounds = elementToClick.getBoundingClientRect();
        // ToDo: search for mouse "visible" point
        const x = bounds.left + bounds.width / 2;
        const y = bounds.top + bounds.height / 2;
        const ev = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            screenX: x,
            screenY: y,
        });
        const el = document.elementFromPoint(x, y);
        if (!el) {
            throw new Error(
                `element with selector ${querySelector} cannot be clicked (not visible to mouse)`
            );
        }
        el.dispatchEvent(ev);
    }
}

const defaultDataFactory: DataRootFactory<unknown> = ({ initialData, onSet }) => {
    let data = initialData;
    return {
        getData: () => data,
        setData: (newData) => {
            data = newData;
            onSet();
        },
    };
};
