import { createLayer } from '../src';
import chai, { expect } from 'chai';
import { stub } from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

describe(`core`, () => {
    describe(`nest layers`, () => {
        it(`should create shallow nested layers`, () => {
            const rootChanges = stub();
            const root = createLayer({ onChange: rootChanges });

            const layerA = root.createLayer();
            const layerB = root.createLayer();

            expect(root.generateDisplayList(), `layers in display list`).to.eql([
                root,
                layerA,
                layerB,
            ]);
            expect(rootChanges, `notify on 2 layers added`).to.have.callCount(2);
        });

        it(`should create deep nested layers`, () => {
            const rootChanges = stub();
            const parentChanges = stub();
            const root = createLayer({ onChange: rootChanges });

            const parentLayer = root.createLayer({ onChange: parentChanges });
            const childLayer = parentLayer.createLayer();

            expect(root.generateDisplayList(), `parent in root`).to.eql([
                root,
                parentLayer,
                childLayer,
            ]);
            expect(parentLayer.generateDisplayList(), `child in parent`).to.eql([
                parentLayer,
                childLayer,
            ]);
            expect(rootChanges, `notify on 2 layers added under root`).to.have.callCount(2);
            expect(parentChanges, `notify on 1 layer added under parent`).to.have.callCount(1);
        });

        it(`should remove multi level nested layers`, () => {
            const rootChanges = stub();
            const parentChanges = stub();
            const root = createLayer({ onChange: rootChanges });
            const parentLayer = root.createLayer({ onChange: parentChanges });
            const childLayer = parentLayer.createLayer();
            rootChanges.reset();
            parentChanges.reset();

            parentLayer.removeLayer(childLayer);

            expect(root.generateDisplayList(), `parent in root`).to.eql([root, parentLayer]);
            expect(parentLayer.generateDisplayList(), `child in parent`).to.eql([parentLayer]);
            expect(rootChanges, `notify on deep layer removed under root`).to.have.callCount(1);
            expect(parentChanges, `notify on deep layer removed under parent`).to.have.callCount(1);
        });
    });

    describe(`extend layer`, () => {
        it(`should add to layer schema`, () => {
            const root = createLayer({
                extendLayer: {
                    extendData: `value`,
                },
            });
            const layer = root.createLayer();

            expect(root.extendData, 'root extended').to.equal(`value`);
            expect(layer.extendData, 'layer extended').to.equal(`value`);
        });

        it(`should define layer settings and handle them in init`, () => {
            const root = createLayer({
                extendLayer: {
                    settings: { optionA: ``, optionB: 0 },
                },
                defaultSettings: {
                    optionA: `default a`,
                    optionB: 5,
                },
                init(layer, settings) {
                    layer.settings = settings;
                },
            });

            const layer = root.createLayer({
                settings: {
                    optionA: `custom A`,
                    optionB: 999,
                },
            });

            expect(layer.settings).to.eql({
                optionA: `custom A`,
                optionB: 999,
            });
        });
    });
});
