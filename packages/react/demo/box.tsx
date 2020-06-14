import React, { useMemo } from 'react';

export interface BoxProps {
    className?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
    shadow?: boolean;
}
export const Box = ({ children, className, style, shadow }: BoxProps) => {
    const background = useMemo(
        () => `hsl(${[Math.round(Math.random() * 360), '40%', '80%'].join(',')})`,
        []
    );
    const boxShadow = shadow ? `Box--shadow` : ``;
    return (
        <div
            className={[`Box__root`, boxShadow, className].join(` `)}
            style={{ background, ...style }}
        >
            {children}
        </div>
    );
};
