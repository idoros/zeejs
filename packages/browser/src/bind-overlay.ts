import { popperGenerator } from '@popperjs/core/lib/popper-lite';
import popperOffsetsModifier from '@popperjs/core/lib/modifiers/popperOffsets';
import popperComputeStyles from '@popperjs/core/lib/modifiers/computeStyles';
import popperEventListeners from '@popperjs/core/lib/modifiers/eventListeners';
import popperApplyStyles from '@popperjs/core/lib/modifiers/applyStyles';

const createPopper = popperGenerator({
    defaultOptions: { placement: `left-start` },
    defaultModifiers: [
        popperOffsetsModifier,
        {
            name: 'translateToOverlay',
            enabled: true,
            phase: 'afterRead',
            fn({ state: { modifiersData, rects } }) {
                // must exist - popperOffset is in read phase
                modifiersData.popperOffsets!.x += rects.reference.width;
            },
        },
        popperComputeStyles,
        {
            name: 'matchSize',
            enabled: true,
            phase: 'beforeWrite',
            fn({ state: { styles, rects } }) {
                styles.popper.width = rects.reference.width + `px`;
                styles.popper.height = rects.reference.height + `px`;
            },
        },
        popperEventListeners,
        popperApplyStyles,
    ],
});

export const bindOverlay = (reference: Element, overlay: HTMLElement) => {
    const p = createPopper(reference, overlay);
    p.forceUpdate();
    return {
        forceUpdate: () => p.forceUpdate(),
        stop: () => p.destroy(),
    };
};
