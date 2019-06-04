const { Container, Reference } = require('../..');

describe(`container inheritance behaviour`, () => {
    let rootContainer;
    let childContainer;
    const a = { name: 'a' };
    const b = { name: 'b' };

    beforeEach(() => {
        rootContainer = new Container();
        childContainer = new Container();
    })

    test(`container.inheritsFrom throws if you don't pass in a Container`, () => {
        expect(rootContainer.inheritsFrom).toThrow();
        expect(() => rootContainer.inheritsFrom({})).toThrow();
        expect(() => rootContainer.inheritsFrom(new Container)).not.toThrow();
    });

    test(`container.inheritsFrom should return the inheriting container`, () => {
        expect(rootContainer.inheritsFrom(childContainer)).toBe(rootContainer);
    });

    test(`it throws the address is in neither the root or sub containers`, () => {
        rootContainer.inheritsFrom(childContainer);
        expect(() => rootContainer.get('a')).toThrow();
    });

    test(`when using container.get it will load data from its inheritance`, () => {
        childContainer.add('a', a);
        rootContainer.inheritsFrom(childContainer);
        expect(rootContainer.get('a')).toBe(a);
    });

    test(`when that dependencies added directly to the container are returned over inheritance`, () => {
        childContainer.add('test', a);
        rootContainer.add('test', b);
        rootContainer.inheritsFrom(childContainer);
        expect(rootContainer.get('test')).toBe(b);
    });

    test(`when more than one inheritance the container will load the most recently added first`, () => {
        const childContainer2 = new Container();
        childContainer.add('test', a);
        childContainer2.add('test', b);
        rootContainer.inheritsFrom(childContainer);
        rootContainer.inheritsFrom(childContainer2);
        expect(rootContainer.get('test')).toBe(b);
    });
});