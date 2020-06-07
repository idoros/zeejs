const destroyLayer = Symbol(`destroy-layer`);

export type Layer<T = Record<string, unknown>, S = any> = T & {
    parentLayer: Layer<T, S> | null;
    createLayer: (options?: { onChange?: () => void; settings?: Partial<S> }) => Layer<T, S>;
    removeLayer: (layer: Layer<T>) => void;
    generateDisplayList: () => Layer<T, S>[];
    [destroyLayer]: () => void;
};
export type TopLayerOptions<T, S> = {
    parentLayer?: Layer<T, S>;
    init?: (layer: Layer<T, S>, settings: S) => void;
    destroy?: (layer: Layer<T, S>) => void;
    onChange?: () => void;
    extendLayer?: T;
    defaultSettings?: S;
    settings?: Partial<S>;
};

export function createLayer(): Layer;
export function createLayer<T, S>(options: TopLayerOptions<T, S>): Layer<T, S>;
export function createLayer<T, S>(
    {
        parentLayer,
        onChange = noop,
        init,
        destroy,
        extendLayer,
        defaultSettings = {} as S,
        settings,
    }: TopLayerOptions<T, S> = { defaultSettings: {} as S }
): Layer | Layer<T, S> {
    const children: Layer<T, S>[] = [];
    const extendedData: T = extendLayer ? extendLayer : ({} as T);
    const layer: Layer<T, S> = {
        ...extendedData,
        parentLayer: parentLayer || null,
        createLayer: (nestedOptions = {}) => {
            const childLayer = createLayer({
                parentLayer: layer,
                onChange: () => {
                    if (nestedOptions.onChange) {
                        nestedOptions.onChange();
                    }
                    onChange();
                },
                extendLayer,
                init,
                destroy,
                defaultSettings,
                settings: nestedOptions.settings,
            });
            children.push(childLayer);
            onChange();
            return childLayer;
        },
        removeLayer: (layer) => {
            const layerIndex = children.indexOf(layer);
            if (layerIndex !== -1) {
                children.splice(layerIndex, 1);
                layer[destroyLayer]();
                onChange();
            }
        },
        [destroyLayer]: () => {
            if (destroy) {
                for (const childLayer of children) {
                    childLayer[destroyLayer]();
                }
                destroy(layer);
            }
        },
        generateDisplayList: () => {
            const list = [layer];
            for (const childLayer of children) {
                list.push(...childLayer.generateDisplayList());
            }
            return list;
        },
    };
    if (init) {
        init(layer, {
            ...defaultSettings,
            ...(settings || {}), // ToDo: fix fallback for undefined
        });
    }
    return layer;
}

const noop = () => {
    /*do nothing*/
};
