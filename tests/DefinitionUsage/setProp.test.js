const {
    Container,
    Def,
    Ref,
    Definition,
} = require('../..');

describe(`definition.setProp`, () => {

    test(`sets prop to last value`, () => {
        const container = new Container();
        container.add('test', new Def({}))
            .setProp('foo', 'bar')
            .setProp('foo', 'baz')
        expect(container.get('test').foo).toBe('baz');
    });

    test(`prop name can be a Reference`, () => {
        const container = new Container();
        container.add('test', new Def({}))
            .setProp('foo', new Ref('value'));
        container.add('value', new Def('bar'));
        expect(container.get('test').foo).toBe('bar');
    });

    test(`prop value can be a Reference`, () => {
        const container = new Container();
        container.add('test', new Def({}))
            .setProp(new Ref('prop'), 'bar');
        container.add('prop', new Def('foo'));
        expect(container.get('test').foo).toBe('bar');
    });

    test(`throws if called after value has been resolved`, () => {
        const container = new Container();
        const def = new Def({});
        container.add('test', def);
        container.get('test');
        expect(() => def.setProp('foo', 'bar')).toThrow();
    });
});