export type Layer<T = {}> = T & {
    createLayer: (onChange?: () => void) => Layer<T>;
    removeLayer: (layer: Layer<T>) => void;
    generateDisplayList: () => Layer<T>[];
};

export type LayerOptions<T> = {
    onChange?: () => void;
    extendLayer?: () => T;
};

export function createLayer(): Layer;
export function createLayer<T>(options: LayerOptions<T>): Layer<T>;
export function createLayer<T>({ onChange = noop, extendLayer }: LayerOptions<T> = {}):
    | Layer
    | Layer<T> {
    const children: Layer<T>[] = [];
    const extendedData: T = extendLayer ? extendLayer() : ({} as T);
    const layer: Layer<T> = {
        ...extendedData,
        createLayer: (nestedOnChange = noop) => {
            const childLayer = createLayer({
                onChange: () => {
                    nestedOnChange();
                    onChange();
                },
                extendLayer,
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
    return layer;
}

const noop = () => {
    /*do nothing*/
};
