import { Layer, LayerProps } from './layer';
import { popover, OverlayPosition } from '@zeejs/browser';
import React, { ReactNode, useRef, useEffect, useMemo } from 'react';

export interface PopoverProps {
    children: ReactNode;
    show?: boolean;
    positionX?: OverlayPosition;
    positionY?: OverlayPosition;
    avoidAnchor?: boolean;
    matchWidth?: boolean;
    matchHeight?: boolean;
    backdrop?: LayerProps['backdrop'];
    onDisplayChange?: (isPositioned: boolean) => void;
}

export const Popover = ({
    children,
    show = true,
    positionX = 'center',
    positionY = 'after',
    avoidAnchor = false,
    matchWidth = false,
    matchHeight = false,
    backdrop = `none`,
    onDisplayChange = noop,
}: PopoverProps) => {
    const placeholderRef = useRef<HTMLSpanElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const { open, close, isOpen, updateOptions } = useMemo(() => popover(), []);
    // close on unmount
    useEffect(
        () => () => {
            if (isOpen()) {
                close();
                onDisplayChange(false);
            }
        },
        []
    );
    // open/close or update options
    useEffect(() => {
        const anchor = placeholderRef.current?.parentElement;
        const overlay = overlayRef.current;
        const opened = isOpen();
        if (opened && !show) {
            close();
            onDisplayChange(false);
        }
        if (show && anchor && overlay) {
            const options = {
                positionX,
                positionY,
                avoidAnchor,
                matchWidth,
                matchHeight,
            };
            if (opened) {
                updateOptions(options);
            } else {
                open(
                    {
                        anchor,
                        overlay,
                    },
                    options
                );
                onDisplayChange(true);
            }
        }
    }, [show, positionX, positionY, avoidAnchor, matchWidth, matchHeight]);
    // ToDo: pass ref to layer - remove extra span
    return (
        <span ref={placeholderRef}>
            {show ? (
                <Layer overlap="window" backdrop={backdrop}>
                    <div ref={overlayRef}>{children}</div>
                </Layer>
            ) : null}
        </span>
    );
};

const noop = () => {
    /**/
};
