import { zeejsContext } from './root';
import React, { useMemo, useContext, CSSProperties, ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

export interface LayerProps {
    className?: string;
    style?: CSSProperties;
    children: ReactNode;
}

// ToDo: handle styling on portal root
export const Layer = ({ children }: LayerProps) => {
    const parentLayer = useContext(zeejsContext);
    const layer = useMemo(() => parentLayer.createLayer(), []);

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
