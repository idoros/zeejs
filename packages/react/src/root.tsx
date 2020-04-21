import React, {
    useRef,
    useMemo,
    createContext,
    CSSProperties,
    ReactNode,
    useEffect,
    useCallback,
} from 'react';

/********LAYERS API*********/
// ToDo: extract to a better place/package
export interface Layer {
    element: Element;
    createLayer: (onChange?: () => void) => Layer;
    removeLayer: (layer: Layer) => void;
    generateDisplayList: () => Layer[];
}
const noop = () => {
    /*do nothing*/
};
const createLayer: Layer['createLayer'] = (onChange = noop): Layer => {
    const children: Layer[] = [];
    const layer: Layer = {
        element: document.createElement(`div`),
        createLayer: () => {
            const childLayer = createLayer(() => {
                onChange();
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
};
/*****************/

export const zeejsContext = createContext<Layer>((null as any) as Layer);

export interface RootProps {
    className?: string;
    style?: CSSProperties;
    children: ReactNode;
}

export const Root = ({ className, style, children }: RootProps) => {
    const rootRef = useRef<HTMLDivElement>(null);

    const updateLayers = useCallback(() => {
        const root = rootRef.current!;
        if (!root) {
            return;
        }
        const layers = layer.generateDisplayList();
        root.textContent = ``;
        for (const { element } of layers) {
            root.appendChild(element);
        }
    }, []);

    const layer = useMemo(
        () =>
            createLayer(() => {
                updateLayers();
            }),
        []
    );

    useEffect(() => {
        layer.element = rootRef.current!.firstElementChild!;
        updateLayers();
    }, []);

    return (
        <div ref={rootRef} className={className} style={style}>
            <zeejsContext.Provider value={layer}>
                <div>{children}</div>
                {/* layers injected here*/}
            </zeejsContext.Provider>
        </div>
    );
};
