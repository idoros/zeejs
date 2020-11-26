import { Layer, LayerProps } from './layer';
import { overlayPosition, popover } from '@zeejs/browser';
import React, { ReactNode, useRef, useEffect, useMemo } from 'react';

export interface PopoverProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    positionX?: keyof typeof overlayPosition;
    positionY?: keyof typeof overlayPosition;
    matchWidth?: boolean;
    matchHeight?: boolean;
    backdrop?: LayerProps['backdrop'];
    show?: boolean;
    avoidAnchor?: boolean;
    onClickOutside?: LayerProps['onClickOutside'];
    onFocusChange?: LayerProps['onFocusChange'];
    onMouseIntersection?: LayerProps['onMouseIntersection'];
}

export const Popover = ({
    children,
    className,
    style,
    positionX = 'center',
    positionY = 'after',
    matchWidth = false,
    matchHeight = false,
    backdrop = `none`,
    show = true,
    avoidAnchor = false,
    onClickOutside,
    onFocusChange,
    onMouseIntersection,
}: PopoverProps) => {
    const placeholderRef = useRef<HTMLSpanElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const { open, close, updateOptions, isOpen, overlayCSSClass } = useMemo(() => popover(), []);
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
                matchWidth,
                matchHeight,
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
    }, [show, positionX, positionY, matchWidth, matchHeight, avoidAnchor]);
    // ToDo: pass ref to layer - remove extra span
    return (
        <span ref={placeholderRef}>
            {show ? (
                <Layer
                    overlap="window"
                    backdrop={backdrop}
                    onClickOutside={onClickOutside}
                    onFocusChange={onFocusChange}
                    onMouseIntersection={onMouseIntersection}
                >
                    <div ref={overlayRef} className={overlayCSSClass(className)} style={style}>
                        {children}
                    </div>
                </Layer>
            ) : null}
        </span>
    );
};
