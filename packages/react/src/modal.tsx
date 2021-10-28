import { Layer, LayerProps } from './layer';
import { modalAbsolutePosition } from '@zeejs/browser';
import type { ModalPosition } from '@zeejs/browser';
import React, { ReactNode } from 'react';

export { ModalPosition };

export interface ModalProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    backdrop?: LayerProps['backdrop'];
    position?: ModalPosition;
    show?: boolean;
    onClickOutside?: LayerProps['onClickOutside'];
    onFocusChange?: LayerProps['onFocusChange'];
    onMouseIntersection?: LayerProps['onMouseIntersection'];
    onEscape?: LayerProps['onEscape'];
}

export const Modal = ({
    children,
    className,
    style,
    backdrop = `block`,
    position = `center`,
    show = true,
    onClickOutside,
    onFocusChange,
    onMouseIntersection,
    onEscape,
}: ModalProps) => {
    const alignStyle = modalAbsolutePosition(position);
    const wrapperStyle = style ? { ...style, ...alignStyle } : alignStyle;
    return show ? (
        <Layer
            overlap="window"
            backdrop={backdrop}
            onClickOutside={onClickOutside}
            onFocusChange={onFocusChange}
            onMouseIntersection={onMouseIntersection}
            onEscape={onEscape}
        >
            <div className={className} style={wrapperStyle}>
                {children}
            </div>
        </Layer>
    ) : null;
};
