<span style="color:red;font-size: 30px">*** THIS IS STILL WORK IN PROGRESS! ***</span>

# The multi-layer component problem

When building interactive UI we often find "UI extensions". What I mean is the use-case for secondary parts of a component that might look like they are connected visually, but are located in separated layers overlaying other parts of the DOM.

HTML offers some native elements with such behavior that just works (in most cases), like the `<select>` or the `<date>` form elements. However they are not styleable [yet](https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Styling_HTML_forms)*, and even if they were, they will probably never catch up to the needs of more complex custom UI.

So we create our own components, our custom widgets that we can pour any shape of data into, structure it and style as we like. Unfortunately it doesn't matter the library we pick to form them with, in the end our bundle of Javascript is translated into native HTML and there we find ourself with a problem.

## The problems with absolute/fixed

CSS gives us the [`position`](https://developer.mozilla.org/en-US/docs/Web/CSS/position) property, and for a moment it seems like it would solve all of our problems. Setting `absolute/fixed` position in CSS will cause an element to pop out of the document flow and take no space while making its position relative to an upper containing block (may it be the viewport or transformed parent element for `fixed` position or the first none `static` position parent for the `absolute` position).

While this can help us to position our parts in a way that seems to work for simple use cases, it is highly fragile and have some unexpected behaviors.

The most problematic is the overflow trap.

## What we have

### The `<dialog>` element

While everything that I could find online about the "new" dialog element talks about how to use it and style it, the big thing in my opinion is the fact that this element has a special layout behavior - it "pops out" into its own top layer and escapes the parent layer overflow! see it in action in Chrome/Opera [here](.add-a-link-to-example). 

We can then move it into place with Javascript. Libraries like [POPPER.JS](https://popper.js.org/) can help us with that. And with new APIs like the [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) and [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) this will even get more performant over time.

Unfortunately it is not well supported in other browsers. And while polyfilling most of the behavior is [possible](https://github.com/GoogleChrome/dialog-polyfill), faking the overflow issue is not 😢

It is currently under a flag in **Firefox**, but currently it doesn't escape the overflow *(ToDo: open a proper bug)*, [no real movement](https://bugs.webkit.org/show_bug.cgi?id=84635) in **Webkit**, [under consideration](https://developer.microsoft.com/en-us/microsoft-edge/platform/status/dialogelementformodals/?q=dialog) in **Edge** (at list this will be over soon) and will almost definitely never be supported in **Internet Explorer**. 

### Custom layers

We can create custom layers through Javascript! May it be React [portal](https://reactjs.org/docs/portals.html), an equivalent idea in [Vue](https://linusborg.github.io/portal-vue/#/), [Angular](https://material.angular.io/cdk/portal/overview) or a custom implementation. 

The general idea is to generate an html element that overlays the application root, populate it with our extension markup and modify it with Javascript to be in the desired position and size. That works and seems to be the defacto solution for such cases today.

So what is the problem? We took our UI extension out of context! and this has unfortunate consequences to the features and behaviors that we expect from HTML.

Since our extension is no longer a decedent of our component our DOM is out of order and that causes the following issues:

- **Accessability** - The browser is no longer in control of our keyboard navigation. It simply cannot tell when one part of the DOM stops and another begins. We need Javascript to manage everything, and most implementations will probably miss many aspects of accessibility in ways that I'm pretty sure are not acceptable and will exclude many people.
- **Event propagation** - Events no longer propagate. We can make an ugly workaround and set listeners for EVERY type of event on our portal top wrapper element and then re-dispatch our event at the portal origin, but even then we will loose custom events unless our application specifically registers them.
- **Styling** - CSS selectors are basically broken across the portal boundary. Basic CSS that generates unique classes, like `.comp__root` for the root of our component and `.comp__item` for items within the portal will still work, but their relationship is severed. CSS states are no longer connected between the parts of our component. States that should be pure CSS are forced to move into Javascript in order to affect the DOM. This is especially bad for theming, because now we are unable to write selectors that connect component state to its parts (unless the component specifically tailored some state onto the part)

The bottom line is that these compromises are making our components less generic because they are forced to "know" what is going to pass through the portal boundary 😢 

## What I would like to see

Layering in HTML (what happens inside Shadow-Dom?)
