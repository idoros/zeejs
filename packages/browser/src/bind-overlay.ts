import { createPopper, Modifier } from '@popperjs/core';

const translateOverlay: Modifier<'translateToOverlay', Record<string, unknown>> = {
    name: 'translateToOverlay',
    enabled: true,
    phase: 'afterRead',
    fn({ state: { modifiersData, rects, orderedModifiers } }) {
        // must exist - popperOffset is in read phase
        const flipIndex = orderedModifiers.findIndex((mod) => mod.name === 'flip');
        if (flipIndex !== -1) {
            orderedModifiers.splice(flipIndex, 1);
            // modifier.enabled = false; // not helping...
        }
        const overflowIndex = orderedModifiers.findIndex((mod) => mod.name === 'preventOverflow');
        if (overflowIndex !== -1) {
            orderedModifiers.splice(overflowIndex, 1);
        }
        modifiersData.popperOffsets!.x += rects.reference.width;
    },
};
const matchSize: Modifier<'matchSize', Record<string, unknown>> = {
    name: 'matchSize',
    enabled: true,
    phase: 'beforeWrite',
    fn({ state: { styles, rects } }) {
        styles.popper.width = rects.reference.width + `px`;
        styles.popper.height = rects.reference.height + `px`;
    },
};

export const bindOverlay = (reference: Element, overlay: HTMLElement) => {
    const p = createPopper(reference, overlay, {
        placement: `left-start`,
        modifiers: [translateOverlay, matchSize],
    });
    p.forceUpdate();
    return {
        forceUpdate: () => p.forceUpdate(),
        stop: () => p.destroy(),
    };
};
