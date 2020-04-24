declare namespace Chai {
    export interface Assertion {
        domElement(): DOMElementAssertion;
    }
    export interface DOMElementAssertion {
        contains(relative: Element): void;
        following(relative: Element): void;
        preceding(relative: Element): void;
    }
}
