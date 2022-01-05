import { Layer, LayerProps } from './layer';
import { popover, OverlayPosition } from '@zeejs/browser';
import React, { ReactNode, useRef, useEffect, useMemo, useCallback } from 'react';

export interface PopoverProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    show?: boolean;
    positionX?: OverlayPosition;
    positionY?: OverlayPosition;
    margin?: number;
    avoidAnchor?: boolean;
    matchWidth?: boolean;
    matchHeight?: boolean;
    backdrop?: LayerProps['backdrop'];
    onDisplayChange?: (isPositioned: boolean) => void;
    onClickOutside?: LayerProps['onClickOutside'];
    ignoreAnchorClick?: boolean;
    onFocusChange?: LayerProps['onFocusChange'];
    onMouseIntersection?: LayerProps['onMouseIntersection'];
    onEscape?: LayerProps['onEscape'];
}

export const Popover = ({
    children,
    className,
    style,
    show = true,
    positionX = 'center',
    positionY = 'after',
    margin = 0,
    avoidAnchor = false,
    matchWidth = false,
    matchHeight = false,
    backdrop = `none`,
    onDisplayChange = noop,
    onClickOutside,
    ignoreAnchorClick,
    onFocusChange,
    onMouseIntersection,
    onEscape,
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
                margin,
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
    }, [show, positionX, positionY, margin, avoidAnchor, matchWidth, matchHeight]);

    const onClickOutsideWrap = useCallback(
        (target: EventTarget) => {
            const anchor = placeholderRef.current?.parentElement;
            // ignore click-outside in case there is no handler or
            // in case `ignoreAnchorClick=true` and the target is within
            // the opening anchor
            if (
                !onClickOutside ||
                (ignoreAnchorClick &&
                    anchor &&
                    (target === anchor ||
                        (target instanceof Node &&
                            target.compareDocumentPosition(anchor) &
                                anchor.DOCUMENT_POSITION_CONTAINS)))
            ) {
                return;
            }
            onClickOutside(target);
        },
        [onClickOutside, ignoreAnchorClick]
    );
    // ToDo: pass ref to layer - remove extra span
    return (
        <span ref={placeholderRef}>
            {show ? (
                <Layer
                    overlap="window"
                    backdrop={backdrop}
                    onClickOutside={onClickOutsideWrap}
                    onFocusChange={onFocusChange}
                    onMouseIntersection={onMouseIntersection}
                    onEscape={onEscape}
                >
                    <div ref={overlayRef} className={className} style={style}>
                        {children}
                    </div>
                </Layer>
            ) : null}
        </span>
    );
};

const noop = () => {
    /**/
};
