const {
    Container,
    Def,
    Ref,
    Definition,
} = require('../..');

describe('definition.resolveProps', () => {
    test(`resolves props that are references`, () => {
        const container = new Container();
        const foo = {};
        const bar = () => { };
        container.add('foo', new Def(foo));
        container.add('bar', new Def(bar));
        container.add('object', new Def({
            myProp: 'foo',
            foo: new Ref('foo'),
            bar: new Ref('bar'),
        }))
            .resolveProps();

        const object = container.get('object');
        expect(object.myProp).toBe('foo');
        expect(object.foo).toBe(foo);
        expect(object.bar).toBe(bar);
    });

    test(`throws if called after value has been resolved`, () => {
        const container = new Container();
        const testDef = new Def({});

        container.add('test', testDef);
        container.get('test');

        expect(() => fnDef.resolveProps()).toThrow();
    });
});
