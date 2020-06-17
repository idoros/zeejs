<p align="center">

![zeejs](https://raw.githubusercontent.com/idoros/zeejs/master/packages/site/media/logo.svg)

![test status](https://github.com/idoros/zeejs/workflows/test/badge.svg)

**zeejs** provides a simple API to create multi layered UI

</p>

## what's in the box

-   **layers** - automatic ordering of nested layers
-   **backdrop** - hide / block background **or** keep a layer as part of the flow
-   **focus**
    -   <kbd>Tab</kbd> between layers
    -   trap focus above backdrop
    -   re-focus when blocking layer close
-   **click outside** - notification for click outside of logical layer
-   **server rendering** - single pass nested rendering of layers in the server
-   **typed** - built with [TypeScript](https://www.typescriptlang.org/)
-   **tested** - tested in a browser
-   **components** - published for multiple libraries / frameworks ([React](https://github.com/idoros/zeejs/tree/master/packages/react), [Svelte](https://github.com/idoros/zeejs/tree/master/packages/svelte) & [more to come...](https://github.com/idoros/zeejs/issues/13))

## how to start

-   [read the docs](./docs/documentation.md)
-   pick your renderer:

| Package                     | Published                                                                                                                 | Size                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| [React](./packages/react)   | [![npm version](https://badgen.net/npm/v/@zeejs/react?label=@zeejs/react)](https://www.npmjs.com/package/@zeejs/react)    | [![npm bundle size](https://badgen.net/bundlephobia/minzip/@zeejs/react?label=minzip)](https://bundlephobia.com/result?p=@zeejs/react)   |
| [Svelte](./packages/svelte) | [![npm version](https://badgen.net/npm/v/@zeejs/svelte?label=@zeejs/svelte)](https://www.npmjs.com/package/@zeejs/svelte) | [![npm bundle size](https://badgen.net/bundlephobia/minzip/@zeejs/svelte?label=minzip)](https://bundlephobia.com/result?p=@zeejs/svelte) |

## caveats

The main issue with displacing DOM is that there is no way to tell the browser that the content inside a layer is meant to be nested inside the origin of the layer.

This is notable in 2 areas:

-   **Events** propagation between layers (unless specifically handled by the renderer (e.g. [React native event propagation within Portal](https://reactjs.org/docs/portals.html#event-bubbling-through-portals)).
-   **styling** with CSS selectors across layers.

## future road map

-   **high level primitives** - Modal / Dialog / Alert / Tooltip / (Panel?)
-   **ARIA support** - build in accessibility support
-   **ordering logic** - application level re-ordering of layers
