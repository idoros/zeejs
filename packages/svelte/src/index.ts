import { default as RootM } from './Root.svelte';
import { default as LayerM } from './Layer.svelte';
import { default as TooltipM } from './Tooltip.svelte';
export { overlayPosition } from '@zeejs/browser';
function getComp(module: any) {
    return module.default || module;
}
export const Root = getComp(RootM);
export const Layer = getComp(LayerM);
export const Tooltip = getComp(TooltipM);
