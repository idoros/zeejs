import { Layer } from './layer';
import { tooltip, isContainedBy } from '@zeejs/browser';
import React, { ReactNode, useMemo, useEffect, useState, useRef } from 'react';

export interface TooltipProps {
    children: ReactNode;
    mouseDelay?: number;
}

export const Tooltip = ({ children, mouseDelay }: TooltipProps) => {
    const [isOpen, onToggle] = useState(false);
    const tooltipLogic = useMemo(
        () =>
            tooltip({
                onToggle,
                mouseDelay,
                isInOverlay: isContainedBy,
            }),
        []
    );
    const placeholderRef = useRef<HTMLSpanElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const anchor = placeholderRef.current?.parentElement;
        if (!anchor) {
            return;
        }
        tooltipLogic.setAnchor(anchor);
        return () => tooltipLogic.stop();
    }, []);

    useEffect(() => {
        tooltipLogic.setOverlay(overlayRef.current);
    }, [isOpen, overlayRef.current]);

    return (
        <span ref={placeholderRef}>
            {isOpen ? (
                <Layer
                    onFocusChange={tooltipLogic.flagOverlayFocus}
                    onMouseIntersection={tooltipLogic.flagMouseOverOverlay}
                    onClickOutside={() => tooltipLogic.flagOverlayFocus(false)}
                >
                    <div ref={overlayRef} className={tooltipLogic.initialOverlayCSSClass}>
                        {children}
                    </div>
                </Layer>
            ) : null}
        </span>
    );
};
