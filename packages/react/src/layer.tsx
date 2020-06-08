import { zeejsContext } from './root';
import React, { useMemo, useContext, ReactNode, useEffect, CSSProperties } from 'react';
import ReactDOM from 'react-dom';

export interface LayerProps {
    className?: string;
    style?: CSSProperties;
    children: ReactNode;
    overlap?: `window` | HTMLElement;
    backdrop?: `none` | `block` | `hide`;
    onClickOutside?: () => void;
}

// ToDo: handle styling on portal root
export const Layer = ({
    children,
    overlap = `window`,
    backdrop = `none`,
    onClickOutside,
}: LayerProps) => {
    const parentLayer = useContext(zeejsContext);
    const layer = useMemo(
        () =>
            parentLayer.createLayer({
                settings: {
                    overlap,
                    backdrop,
                    onClickOutside,
                },
            }),
        []
    );

    useEffect(() => {
        return () => {
            parentLayer.removeLayer(layer);
        };
    }, []);

    return (
        <zeejsContext.Provider value={layer}>
            <zeejs-origin tabIndex={0} data-origin={layer.id}>
                {layer.element ? ReactDOM.createPortal(children, layer.element) : children}
            </zeejs-origin>
        </zeejsContext.Provider>
    );
};
