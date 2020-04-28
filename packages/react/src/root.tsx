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

interface LayerExtended {
    element: Element;
}
type ReactLayer = Layer<LayerExtended>;
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
        root.textContent = ``;
        for (const { element } of layers) {
            root.appendChild(element);
        }
    }, []);

    const layer = useMemo(
        () =>
            createLayer({
                extendLayer: {
                    element: document.createElement(`div`),
                } as LayerExtended,
                onChange() {
                    updateLayers();
                }
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
