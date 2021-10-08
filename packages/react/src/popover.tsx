import { Layer } from './layer';
import { popover, OverlayPosition } from '@zeejs/browser';
import React, { ReactNode, useRef, useEffect, useMemo } from 'react';

export interface PopoverProps {
    children: ReactNode;
    positionX?: OverlayPosition;
    positionY?: OverlayPosition;
    show?: boolean;
    avoidAnchor?: boolean;
}

export const Popover = ({
    children,
    positionX = 'center',
    positionY = 'after',
    show = true,
    avoidAnchor = false,
}: PopoverProps) => {
    const placeholderRef = useRef<HTMLSpanElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const { open, close, isOpen, updateOptions } = useMemo(() => popover(), []);
    // close on unmount
    useEffect(() => () => close(), []);
    // open/close or update options
    useEffect(() => {
        const anchor = placeholderRef.current?.parentElement;
        const overlay = overlayRef.current;
        const opened = isOpen();
        if (opened && !show) {
            close();
        }
        if (show && anchor && overlay) {
            const options = {
                positionX,
                positionY,
                avoidAnchor,
            };
            opened
                ? updateOptions(options)
                : open(
                      {
                          anchor,
                          overlay,
                      },
                      options
                  );
        }
    }, [show, positionX, positionY, avoidAnchor]);
    // ToDo: pass ref to layer - remove extra span
    return (
        <span ref={placeholderRef}>
            {show ? (
                <Layer overlap="window">
                    <div ref={overlayRef}>{children}</div>
                </Layer>
            ) : null}
        </span>
    );
};
