import { Layer } from './layer';
import { tooltip, isContainedBy, OverlayPosition } from '@zeejs/browser';
import React, { ReactNode, useMemo, useEffect, useState, useRef } from 'react';

export interface TooltipProps {
    children: ReactNode;
    mouseDelay?: number;
    positionX?: OverlayPosition;
    positionY?: OverlayPosition;
}

export const Tooltip = ({ children, mouseDelay, positionX, positionY }: TooltipProps) => {
    const [isOpen, onToggle] = useState(false);
    const tooltipLogic = useMemo(
        () =>
            tooltip({
                onToggle,
                mouseDelay,
                isInOverlay: isContainedBy,
                positionX,
                positionY,
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

    useEffect(() => {
        tooltipLogic.updatePosition({
            x: positionX,
            y: positionY,
        });
    }, [positionX, positionY]);

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
