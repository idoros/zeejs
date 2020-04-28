export type Layer<T = {}, S = any> = T & {
    parentLayer: Layer<T, S> | null;
    createLayer: (options?: { onChange?: () => void; settings?: S }) => Layer<T>;
    removeLayer: (layer: Layer<T>) => void;
    generateDisplayList: () => Layer<T>[];
};
export type LayerOptions<T, S> = {
    parentLayer?: Layer<T, S>;
    init?: (layer: Layer<T, S>, settings: S) => void;
    onChange?: () => void;
    extendLayer?: T;
    defaultSettings?: S;
    settings?: S;
};

export function createLayer(): Layer;
export function createLayer<T, S>(options: LayerOptions<T, S>): Layer<T, S>;
export function createLayer<T, S>({
    parentLayer,
    onChange = noop,
    init,
    extendLayer,
    defaultSettings,
    settings,
}: LayerOptions<T, S> = {}): Layer | Layer<T> {
    const children: Layer<T, S>[] = [];
    settings = {
        ...(defaultSettings || {}),
        ...(settings || {}),
    } as S;
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
                onChange();
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
        init(layer, settings);
    }
    return layer;
}

const noop = () => {
    /*do nothing*/
};
