import { zeejsContext } from './root';
import React, { useMemo, useContext, ReactNode, useEffect, CSSProperties } from 'react';
import ReactDOM from 'react-dom';

export interface LayerProps {
    className?: string;
    style?: CSSProperties;
    children: ReactNode;
    overlap?: `window` | HTMLElement;
    backdrop?: `none` | `block` | `hide`;
}

// ToDo: handle styling on portal root
export const Layer = ({ children, overlap = `window`, backdrop = `none` }: LayerProps) => {
    const parentLayer = useContext(zeejsContext);
    const layer = useMemo(
        () =>
            parentLayer.createLayer({
                settings: {
                    overlap,
                    backdrop,
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
            <span style={{ display: `none` }}>
                {layer.element ? ReactDOM.createPortal(children, layer.element) : null}
            </span>
        </zeejsContext.Provider>
    );
};
