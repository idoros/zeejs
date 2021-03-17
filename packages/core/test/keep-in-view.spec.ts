import { keepInView } from '@zeejs/core';
import { expect } from 'chai';

describe(`keep-in-view`, () => {
    function xToY({ viewport, anchorBounds, overlayBounds }: Parameters<typeof keepInView>[1]) {
        return {
            anchorBounds: {
                x: anchorBounds.y,
                y: anchorBounds.x,
                width: anchorBounds.height,
                height: anchorBounds.width,
            },
            overlayBounds: {
                x: overlayBounds.y,
                y: overlayBounds.x,
                width: overlayBounds.height,
                height: overlayBounds.width,
            },
            viewport: { width: viewport.height, height: viewport.width },
        };
    }
    it(`should return NaN for overlay within viewport`, () => {
        //      |   ooo       |
        const xData = {
            anchorBounds: { x: 50, y: 50, width: 50, height: 50 },
            overlayBounds: { x: 50, y: 50, width: 50, height: 50 },
            viewport: { width: 200, height: 200 },
        };
        expect(keepInView(`x`, xData), `x`).to.be.NaN;
        expect(keepInView(`y`, xToY(xData)), `y`).to.be.NaN;
    });
    describe(`with no overlap on other direction`, () => {
        describe(`overflow start`, () => {
            it(`should stick in view`, () => {
                //      o|oo      |  ->   |ooo     |
                //       |  aaa   |  ->   |  aaa   |
                const xData = {
                    anchorBounds: { x: 50, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: -50, y: 100, width: 100, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData), `x`).to.equal(0);
                expect(keepInView(`y`, xToY(xData)), `y`).to.equal(0);
            });
            it(`should stick in view + stick to anchor`, () => {
                //   ooo    |        |  ->         o|oo      |
                //      aaa |        |  ->      aaa |        |
                const xData = {
                    anchorBounds: { x: -60, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: -160, y: 100, width: 100, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData), `x`).to.equal(-10);
                expect(keepInView(`y`, xToY(xData)), `y`).to.equal(-10);
            });
        });
        describe(`overflow end`, () => {
            it(`should stick in view`, () => {
                //       |      oo|o  ->   |     ooo|
                //       |   aaa  |   ->   |   aaa  |
                const xData = {
                    anchorBounds: { x: 50, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: 150, y: 100, width: 150, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData), `x`).to.equal(50);
                expect(keepInView(`y`, xToY(xData)), `y`).to.equal(50);
            });
            it(`should stick in view + stick to anchor`, () => {
                //       |        |    ooo  ->   |      oo|o
                //       |        | aaa     ->   |        | aaa
                const xData = {
                    anchorBounds: { x: 210, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: 260, y: 100, width: 50, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData), `x`).to.equal(160);
                expect(keepInView(`y`, xToY(xData)), `y`).to.equal(160);
            });
        });
    });
    describe(`with overlap on other direction`, () => {
        describe(`overflow start`, () => {
            it(`should stick in view overlapping anchor`, () => {
                //       o|ooaaa     |   ->    |oo@aa     |
                const xData = {
                    anchorBounds: { x: 50, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: -10, y: 50, width: 60, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData), `x`).to.equal(0);
                expect(keepInView(`y`, xToY(xData)), `y`).to.equal(0);
            });
            it(`should stick in view until anchor drag it out`, () => {
                //    oooaaa |     |   ->    aaao|oo   |
                const xData = {
                    anchorBounds: { x: -60, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: -160, y: 50, width: 100, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData), `x`).to.equal(-10);
                expect(keepInView(`y`, xToY(xData)), `y`).to.equal(-10);
            });
        });
        describe(`overflow end`, () => {
            it(`should stick in view overlapping anchor`, () => {
                //        |    aaaoo|o   ->    |    aa@oo|
                const xData = {
                    anchorBounds: { x: 100, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: 150, y: 50, width: 60, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData), `x`).to.equal(140);
                expect(keepInView(`y`, xToY(xData)), `y`).to.equal(140);
            });
            it(`should stick in view until anchor drag it out`, () => {
                //    |         | aaaooo   ->    |       oo|oaaa
                const xData = {
                    anchorBounds: { x: 210, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: 320, y: 50, width: 60, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData), `x`).to.equal(150);
                expect(keepInView(`y`, xToY(xData)), `y`).to.equal(150);
            });
        });
    });
    describe(`with overlap on other direction using "avoidAnchor" flag`, () => {
        describe(`overflow start`, () => {
            it(`should flip to other side of anchor`, () => {
                //       o|ooaaa     |   ->    |  aaaooo  |
                const xData = {
                    anchorBounds: { x: 50, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: -50, y: 50, width: 100, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData, true), `x`).to.equal(100);
                expect(keepInView(`y`, xToY(xData), true), `y`).to.equal(100);
            });
            it(`should flip to other side of anchor + stick to anchor`, () => {
                //    oooaaa |     |   ->    aaao|oo   |
                const xData = {
                    anchorBounds: { x: -60, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: -160, y: 50, width: 100, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData, true), `x`).to.equal(-10);
                expect(keepInView(`y`, xToY(xData), true), `y`).to.equal(-10);
            });
            it(`should not flip when other side has less space`, () => {
                //       o|ooaaa |   ->   o|ooaaa |
                const xData = {
                    anchorBounds: { x: 50, y: 50, width: 120, height: 50 },
                    overlayBounds: { x: -50, y: 50, width: 100, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData, true), `x`).to.be.NaN;
                expect(keepInView(`y`, xToY(xData), true), `y`).to.be.NaN;
            });
            it(`should not flip to other side of anchor is outside of viewport`, () => {
                //    aaao|oo   |   ->    aaao|oo   |
                const xData = {
                    anchorBounds: { x: -60, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: -10, y: 50, width: 100, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData, true), `x`).to.be.NaN;
                expect(keepInView(`y`, xToY(xData), true), `y`).to.be.NaN;
            });
            it(`should stick in view on top of anchor when overlaps`, () => {
                //       o|o@aa     |   ->    |o@@a     |
                const xData = {
                    anchorBounds: { x: 10, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: -10, y: 50, width: 50, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData, true), `x`).to.equal(0);
                expect(keepInView(`y`, xToY(xData), true), `y`).to.equal(0);
            });
        });
        describe(`overflow end`, () => {
            it(`should flip to other side of anchor`, () => {
                //        |    aaaoo|o   ->    | oooaaa  |
                const xData = {
                    anchorBounds: { x: 100, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: 150, y: 50, width: 60, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData, true), `x`).to.equal(40);
                expect(keepInView(`y`, xToY(xData), true), `y`).to.equal(40);
            });
            it(`should flip to other side of anchor + stick to anchor`, () => {
                //    |         | aaaooo   ->    |       oo|oaaa
                const xData = {
                    anchorBounds: { x: 210, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: 320, y: 50, width: 60, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData, true), `x`).to.equal(150);
                expect(keepInView(`y`, xToY(xData), true), `y`).to.equal(150);
            });
            it(`should not flip when other side has less space`, () => {
                //       | aaaoo|o   ->   | aaaoo|o
                const xData = {
                    anchorBounds: { x: 30, y: 50, width: 120, height: 50 },
                    overlayBounds: { x: 150, y: 50, width: 100, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData, true), `x`).to.be.NaN;
                expect(keepInView(`y`, xToY(xData), true), `y`).to.be.NaN;
            });
            it(`should not flip to other side of anchor is outside of viewport`, () => {
                //    |       oo|oaaa   ->    |       oo|oaaa
                const xData = {
                    anchorBounds: { x: 210, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: 150, y: 50, width: 60, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData, true), `x`).to.be.NaN;
                expect(keepInView(`y`, xToY(xData), true), `y`).to.be.NaN;
            });
            it(`should stick in view on top of anchor when overlaps`, () => {
                //       |     aa@o|o   ->    |     a@@o|
                const xData = {
                    anchorBounds: { x: 140, y: 50, width: 50, height: 50 },
                    overlayBounds: { x: 180, y: 50, width: 50, height: 50 },
                    viewport: { width: 200, height: 200 },
                };
                expect(keepInView(`x`, xData, true), `x`).to.equal(150);
                expect(keepInView(`y`, xToY(xData), true), `y`).to.equal(150);
            });
        });
    });
});
