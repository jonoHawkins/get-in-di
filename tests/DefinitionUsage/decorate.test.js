const {
    Container,
    Def,
    Ref,
    Definition,
} = require('../..');

describe('definition.decorate', () => {
    test('decorates return value overwrites the stored value', () => {
        const container = new Container();
        container.add('foo', new Def('foo'))
            .decorate(() => 'bar');
        expect(container.get('foo')).toBe('bar');
    });

    test(`if return value === undefined, stored value is maintained`, () => {
        const container = new Container();
        container.add('foo', new Def('foo'))
            .decorate(() => undefined);
        expect(container.get('foo')).toBe('foo');
    });

    test(`the decorator receives the value arg[0]`, () => {
        const container = new Container();
        const value = {};
        container.add('value', new Def(value))
            .decorate((value1) => {
                expect(value1).toBe(value);
            });
        container.get('value');
    });

    test(`the decorator receives the container as the last arg`, () => {
        const container = new Container();
        container.add('value', new Def({}))
            .decorate((v, container1) => {
                expect(container1).toBe(container);
            })
            .decorate((v, a1, container2) => {
                expect(container2).toBe(container);
            }, ['foo']);

        container.get('value');
    });

    test(`the decorator receives supplied args from arg[1]`, () => {
        const container = new Container();
        const a = {};
        const b = {};
        const c = {};

        container.add('a', new Def(a));
        container.add('b', new Def(b));
        container.add('c', new Def(c));

        const test = (value, a2, b2, c2) => {
            expect(a2).toBe(a);
            expect(b2).toBe(b);
            expect(c2).toBe(c);
        };

        container.add('test', new Def({}))
            .decorate(test, [a, b, c])
            .decorate(test, [
                new Ref('a'),
                new Ref('b'),
                new Ref('c'),
            ])

        container.get('test');
    });

    test(`the decorator context can be set`, () => {
        const container = new Container();
        const context = {};

        function fn() {
            expect(this).toBe(context);
        }

        container.add('test', new Def({}))
            .decorate(fn, [], context);

        container.get('test');
    });

    test(`throws if called after value has been resolved`, () => {
        const container = new Container();
        const def = new Def('test');
        container.add('test', def);
        container.get('test');
        expect(def.call).toThrow();
    });
});
