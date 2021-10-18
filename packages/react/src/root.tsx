import {
    watchFocus,
    watchClickOutside,
    watchMouseInside,
    createRoot,
    DOMLayer,
    updateLayers,
    createBackdropParts,
    css,
    isBrowser,
} from '@zeejs/browser';
import React, { useRef, useMemo, createContext, CSSProperties, ReactNode, useEffect } from 'react';

export const zeejsContext = createContext<DOMLayer>(null as any as DOMLayer);

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

export const Root = ({ className, style, children }: RootProps) => {
    const rootRef = useRef<HTMLDivElement>(null);

    const { rootLayer, parts } = useMemo(() => {
        const style = isBrowser ? document.createElement(`style`) : { innerText: `` };
        style.innerText = css;
        const parts = { style: style as HTMLStyleElement, ...createBackdropParts() };
        const rootLayer = createRoot({
            onChange() {
                const wrapper = rootRef.current;
                if (!wrapper) {
                    return;
                }
                // buffer delay blur/re-focus because Layer renders and updates during render
                updateLayers(wrapper, rootLayer, parts, { asyncFocusChange: true });
            },
        });
        return { rootLayer, parts };
    }, []);

    useEffect(() => {
        const wrapper = rootRef.current!;
        document.head.appendChild(parts.style);
        rootLayer.element = wrapper.firstElementChild! as HTMLElement;
        const { stop: stopFocus } = watchFocus(wrapper, rootLayer);
        const { stop: stopClickOutside } = watchClickOutside(wrapper, rootLayer, parts);
        const { stop: stopMouseInside } = watchMouseInside(wrapper, rootLayer, parts);
        updateLayers(wrapper, rootLayer, parts);
        () => {
            // ToDo: check why not removed in tests
            document.head.removeChild(parts.style);
            stopFocus();
            stopClickOutside();
            stopMouseInside();
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
