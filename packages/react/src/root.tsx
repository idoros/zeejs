import {
    watchFocus,
    createRoot,
    DOMLayer,
    updateLayers,
    createBackdropParts,
} from '@zeejs/browser';
import React, { useRef, useMemo, createContext, CSSProperties, ReactNode, useEffect } from 'react';

export const zeejsContext = createContext<DOMLayer>((null as any) as DOMLayer);

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

    const { rootLayer, parts } = useMemo(() => {
        const style = document.createElement(`style`);
        style.innerText = css;
        const parts = { style, ...createBackdropParts() };
        const rootLayer = createRoot({
            onChange() {
                const wrapper = rootRef.current;
                if (!wrapper) {
                    return;
                }
                // ToDo: fix: "unstable_flushDiscreteUpdates: Cannot flush updates when React is already rendering"
                // Layer component creates layer, causing sync changes to wrapper DOM.
                // React console.error with "Warning: unstable_flushDiscreteUpdates" when there is a focused element withing a changing DOM element.
                updateLayers(wrapper, rootLayer, parts);
            },
        });
        return { rootLayer, parts };
    }, []);

    useEffect(() => {
        const wrapper = rootRef.current!;
        document.head.appendChild(parts.style);
        rootLayer.element = wrapper.firstElementChild! as HTMLElement;
        const { stop: stopFocus } = watchFocus(wrapper);
        updateLayers(wrapper, rootLayer, parts);
        () => {
            document.head.removeChild(parts.style);
            stopFocus();
        };
    }, []);

    return (
        <div ref={rootRef} className={className} style={style}>
            <zeejsContext.Provider value={rootLayer}>
                <zeejs-layer>{children}</zeejs-layer>
                {/* layers injected here*/}
            </zeejsContext.Provider>
        </div>
    );
};
