const {
    Container,
    Def,
} = require('../..');

describe(`container Definition behaviour`, () => {
    test(`container.add returns the value that was added`, () => {
        const container = new Container();
        const aDef = new Def('a');

        expect(container.add('a', aDef)).toBe(aDef);
    });

    test(`container.get resolves a definition to it's value`, () => {
        const container = new Container();
        const object = {};

        container.add('string', new Def('foo'));
        container.add('number', new Def(1234567890));
        container.add('object', new Def(object));

        expect(container.get('string')).toBe('foo');
        expect(container.get('number')).toBe(1234567890);
        expect(container.get('object')).toBe(object);
    });

});
