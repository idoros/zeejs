declare namespace Chai {
    export interface Assertion {
        domElement(): DOMElementAssertion;
    }
    export interface DOMElementAssertion {
        equal(relative: Element): void;
        contains(relative: Element): void;
        following(relative: Element): void;
        preceding(relative: Element): void;
    }
}
