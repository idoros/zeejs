import { Layer, LayerProps } from '@zeejs/react';
import React from 'react';
import { layoutOverlay, overlayPosition, keepInView } from '@zeejs/browser';

export interface DialogProps {
    className?: string;
    children: React.ReactNode;
    relativeTo: HTMLElement | string;
    backdrop?: LayerProps['backdrop'];
    onClickOutside?: LayerProps['onClickOutside'];
    onPositioned?: () => void;
}
export const Dialog = ({
    className,
    children,
    relativeTo,
    backdrop,
    onClickOutside,
    onPositioned,
}: DialogProps) => {
    const popupRef = React.useRef<HTMLDivElement>(null);
    const [isPositioned, setIsPositioned] = React.useState(false);
    React.useEffect(() => {
        const reference =
            typeof relativeTo === `string` ? document.querySelector(`#` + relativeTo) : relativeTo;
        if (!reference) {
            throw new Error(`missing reference for popup: "${String(relativeTo)}"`);
        }
        const popup = popupRef.current!;
        const overlayBind = layoutOverlay(reference, popup, {
            x: overlayPosition.center,
            y: overlayPosition.center,
            height: false,
            width: false,
            onOverflow: keepInView,
        });
        setIsPositioned(true);
        popup.classList.add(`Dialog--positioned`);
        onPositioned && onPositioned();
        return () => {
            overlayBind.stop();
        };
    }, []);
    return (
        <Layer backdrop={backdrop} onClickOutside={onClickOutside}>
            <div
                ref={popupRef}
                className={[
                    `Dialog__root`,
                    isPositioned ? `Dialog--positioned` : ``,
                    className,
                ].join(` `)}
            >
                {children}
            </div>
        </Layer>
    );
};
