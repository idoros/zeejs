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

const overlayBind = Symbol(`overlay-bind`);
interface LayerExtended {
    element: HTMLElement;
    [overlayBind]: ReturnType<typeof bindOverlay>;
}
interface LayerSettings {
    relativeTo?: `window` | HTMLElement;
}
type ReactLayer = Layer<LayerExtended, LayerSettings>;
export const zeejsContext = createContext<ReactLayer>((null as any) as ReactLayer);

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
        // ToDo: reorder/remove/add with minimal changes
        root.textContent = ``;
        for (const { element } of layers) {
            root.appendChild(element);
        }
    }, []);

    const layer = useMemo(() => {
        return createLayer({
            extendLayer: {
                element: (null as unknown) as HTMLElement,
            } as LayerExtended,
            defaultSettings: {
                relativeTo: `window`,
            } as LayerSettings,
            onChange() {
                updateLayers();
            },
            init(layer, settings) {
                layer.element = document.createElement(`div`); // ToDo: test that each layer has a unique element
                if (layer.parentLayer) {
                    if (settings.relativeTo === 'window') {
                        layer.element.setAttribute(
                            `style`,
                            `position: fixed;top: 0;left: 0;right: 0;bottom: 0;`
                        );
                    } else if (settings.relativeTo instanceof HTMLElement) {
                        layer[overlayBind] = bindOverlay(settings.relativeTo, layer.element);
                    }
                }
            },
            destroy(layer) {
                if (layer[overlayBind]) {
                    layer[overlayBind].stop(); // not tested because its a side effect:/
                }
            },
        });
    }, []);

    useEffect(() => {
        layer.element = rootRef.current!.firstElementChild! as HTMLElement;
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
