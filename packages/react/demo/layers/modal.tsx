import { Layer, LayerProps } from '../../src';
import { Position, getAbsolutePosition } from '../position-input/position-input';
import React from 'react';
export interface ModalProps {
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
    backdrop?: LayerProps['backdrop'];
    position?: Position;
}
export const Modal = ({
    className,
    style,
    children,
    position = Position.center,
    backdrop = `hide`,
}: ModalProps) => {
    const alignStyle = getAbsolutePosition(position);

    return (
        <Layer overlap="window" backdrop={backdrop}>
            <div
                className={[`Modal__root`, className].join(` `)}
                style={{ ...style, ...alignStyle }}
            >
                {children}
            </div>
        </Layer>
    );
};
