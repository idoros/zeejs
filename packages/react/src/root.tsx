import { bindOverlay, watchFocus } from '@zeejs/browser';
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
    backdrop: `none` | `block` | `hide`;
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

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'zeejs-origin': any;
            'zeejs-layer': any;
        }
    }
}

const css = `
    zeejs-block {
        position: fixed;top: 0;left: 0;right: 0;bottom: 0;
    }
    zeejs-hide {
        position: fixed;top: 0;left: 0;right: 0;bottom: 0;
        background: rgba(66, 66, 66, 0.50);
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
        const hide = document.createElement(`zeejs-hide`);
        return { style, block, hide };
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
            if (settings.backdrop !== `none`) {
                if (settings.backdrop === `hide`) {
                    root.appendChild(parts.hide);
                }
                root.appendChild(parts.block);
            }
            root.appendChild(element);
            element.removeAttribute(`inert`);
        }
        const indexOfBlock = Array.from(root.children).indexOf(parts.block);
        if (indexOfBlock !== -1) {
            for (let i = indexOfBlock; i >= 0; --i) {
                root.children[i].setAttribute(`inert`, ``);
            }
        }
    }, []);

    const layer = useMemo(() => {
        let idCounter = 0;
        return createLayer({
            extendLayer: {
                element: (null as unknown) as HTMLElement,
                settings: defaultLayerSettings,
            } as LayerExtended,
            defaultSettings: defaultLayerSettings,
            onChange() {
                // console.log(`onChange!!!`, document.activeElement?.tagName);
                updateLayers();
            },
            init(layer, settings) {
                layer.settings = settings;
                layer.element = document.createElement(`zeejs-layer`); // ToDo: test that each layer has a unique element
                layer.element.dataset[`id`] = `layer-${idCounter++}`;
                if (layer.parentLayer) {
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
        const wrapper = rootRef.current!;
        document.head.appendChild(parts.style);
        layer.element = wrapper.firstElementChild! as HTMLElement;
        const { stop: stopFocus } = watchFocus(wrapper);
        updateLayers();
        () => {
            document.head.removeChild(parts.style);
            stopFocus();
        };
    }, []);

    return (
        <div ref={rootRef} className={className} style={style}>
            <zeejsContext.Provider value={layer}>
                <zeejs-layer>{children}</zeejs-layer>
                {/* layers injected here*/}
            </zeejsContext.Provider>
        </div>
    );
};
