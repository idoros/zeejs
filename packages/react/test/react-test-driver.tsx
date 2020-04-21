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
    query: (query: string) => Element | null;
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
            query: (querySelector: string) => container.querySelector(querySelector),
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
    public query(element: HTMLElement, querySelector: string) {
        const result = element.querySelector(querySelector);

        return result;
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
