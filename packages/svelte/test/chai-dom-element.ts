export const domElementMatchers: Chai.ChaiPlugin = (chai, util) => {
    chai.Assertion.addMethod('domElement', function () {
        const actual = util.flag(this, 'object');

        this.assert(
            actual instanceof Element,
            `Expected value to be an Element`,
            `Expected value to not be an Element`,
            ``
        );

        return domElementAssertions(actual as Element, this);
    });
};
const onlyOuterHTML = (element: Element): string => {
    const inner = element.innerHTML;
    const outer = element.outerHTML;
    return inner ? outer.replace(inner, ``) : outer;
};
const domElementAssertions = (element: Element, assertion: Chai.AssertionStatic) => ({
    equal(expected: Element) {
        if (expected instanceof Element === false) {
            throw new Error(`element equal can only be checked on a DOM element`);
        }
        const isEqual = element === expected;
        const actualStr = onlyOuterHTML(element);
        const expectedStr = onlyOuterHTML(expected);
        assertion.assert(
            isEqual,
            `Expected element
"${actualStr}"
to equal element
"${expectedStr}"`,
            `Expected actual element
"${actualStr}"
to not equal element
"${expectedStr}"`,
            ``
        );
    },
    contains(relative: Element) {
        if (element instanceof Element === false) {
            throw new Error(`contains can only be checked on a DOM element`);
        }
        const contains = !!(relative.compareDocumentPosition(element) & Position.contains);
        assertion.assert(contains, `Expected relative element to be contained in DOM`, ``, ``);
    },
    following(relative: Element) {
        if (element instanceof Element === false) {
            throw new Error(`following can only be checked on a DOM element`);
        }
        const relations = relative.compareDocumentPosition(element);
        const after = !!(relations & Position.following);
        assertion.assert(after, `Expected relative element to be before in DOM`, ``, ``);
    },
    preceding(relative: Element) {
        if (element instanceof Element === false) {
            throw new Error(`preceding can only be checked on a DOM element`);
        }
        const relations = relative.compareDocumentPosition(element);
        const before = !!(relations & Position.preceding);
        const contains = !!(relations & Position.contains);
        assertion.assert(
            before && !contains,
            `Expected relative element to be after in DOM`,
            ``,
            ``
        );
    },
});
enum Position {
    contains = document.DOCUMENT_POSITION_CONTAINS,
    following = document.DOCUMENT_POSITION_FOLLOWING,
    preceding = document.DOCUMENT_POSITION_PRECEDING,
}
