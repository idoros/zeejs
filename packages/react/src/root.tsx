import { bindOverlay } from '@zeejs/browser';
import { createLayer, Layer } from '@zeejs/core';
import React, {
    useRef,
    useMemo,
    createContext,
    CSSProperties,
    ReactNode,
    useEffect,
    useCallback,
} from 'react';

const overlapBind = Symbol(`overlap-bind`);

interface LayerSettings {
    overlap: `window` | HTMLElement;
    backdrop: `none` | `block`; // | `hide`
}
interface LayerExtended {
    element: HTMLElement;
    settings: LayerSettings;
    [overlapBind]: ReturnType<typeof bindOverlay>;
}
type ReactLayer = Layer<LayerExtended, LayerSettings>;
export const zeejsContext = createContext<ReactLayer>((null as any) as ReactLayer);

const defaultLayerSettings: LayerSettings = {
    overlap: `window`,
    backdrop: `none`,
};

export interface RootProps {
    className?: string;
    style?: CSSProperties;
    children: ReactNode;
}

const css = `
    zeejs-block {
        position: fixed;top: 0;left: 0;right: 0;bottom: 0;
    }
    zeejs-layer {
        pointer-events: none;
    }
    zeejs-layer > * {
        pointer-events: initial;
    }
    .zeejs--overlapWindow {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
`;

export const Root = ({ className, style, children }: RootProps) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const parts = useMemo(() => {
        const style = document.createElement(`style`);
        style.innerText = css;
        const block = document.createElement(`zeejs-block`);
        return { style, block };
    }, []);

    const updateLayers = useCallback(() => {
        const root = rootRef.current!;
        if (!root) {
            return;
        }
        const layers = layer.generateDisplayList();
        // ToDo: reorder/remove/add with minimal changes
        root.textContent = ``;
        for (const { element, settings } of layers) {
            if (settings.backdrop === `block`) {
                root.appendChild(parts.block);
            }
            root.appendChild(element);
        }
    }, []);

    const layer = useMemo(() => {
        return createLayer({
            extendLayer: {
                element: (null as unknown) as HTMLElement,
                settings: defaultLayerSettings,
            } as LayerExtended,
            defaultSettings: defaultLayerSettings,
            onChange() {
                updateLayers();
            },
            init(layer, settings) {
                layer.settings = settings;
                layer.element = document.createElement(`zeejs-layer`); // ToDo: test that each layer has a unique element
                if (layer.parentLayer) {
                    // ToDo: reset pointer events under layers
                    if (settings.overlap === `window`) {
                        layer.element.classList.add(`zeejs--overlapWindow`);
                    } else if (settings.overlap instanceof HTMLElement) {
                        layer.element.classList.add(`zeejs--overlapElement`);
                        layer[overlapBind] = bindOverlay(settings.overlap, layer.element);
                    }
                }
            },
            destroy(layer) {
                if (layer[overlapBind]) {
                    layer[overlapBind].stop(); // not tested because its a side effect:/
                }
            },
        });
    }, []);

    useEffect(() => {
        document.head.appendChild(parts.style);
        layer.element = rootRef.current!.firstElementChild! as HTMLElement;
        updateLayers();
        () => {
            document.head.removeChild(parts.style);
        };
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
