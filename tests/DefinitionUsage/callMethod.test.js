const {
    Container,
    Def,
    Ref,
    Definition,
} = require('../..');

describe(`definition.callMethod`, () => {
    let container, fn, value;

    beforeEach(() => {
        container = new Container();
        fn = jest.fn();
        value = { fn };
    });

    test(`calls the method on the value`, () => {
        container.add('test', new Def(value))
            .callMethod('fn');
        container.get('test');
        expect(fn).toHaveBeenCalled();
    });

    test(`passes the args`, () => {
        const a = {};
        const b = {};
        const c = {};
        container.add('test', new Def(value))
            .callMethod('fn', [a, b, c])
        container.get('test');
        expect(fn.mock.calls[0][0]).toBe(a);
        expect(fn.mock.calls[0][1]).toBe(b);
        expect(fn.mock.calls[0][2]).toBe(c);
    });

    test(`the args can be References`, () => {
        const a = {};
        const b = {};
        const c = {};
        container.add('a', a);
        container.add('b', b);
        container.add('c', c);
        container.add('args', new Def([
            new Ref('a'),
            new Ref('b'),
            new Ref('c'),
        ]));
        container.add('test', new Def(value))
            .callMethod('fn', [
                new Ref('a'),
                new Ref('b'),
                new Ref('c'),
            ])
        container.get('test');
        expect(fn.mock.calls[0][0]).toBe(a);
        expect(fn.mock.calls[0][1]).toBe(b);
        expect(fn.mock.calls[0][2]).toBe(c);

        container.add('test2', new Def(value))
            .callMethod('fn', new Ref('args'));
        container.get('test2');
        expect(fn.mock.calls[1][0]).toBe(a);
        expect(fn.mock.calls[1][1]).toBe(b);
        expect(fn.mock.calls[1][2]).toBe(c);
    });

    test(`the method can be a Reference`, () => {
        container.add('method', new Def('fn'));
        container.add('test', new Def(value))
            .callMethod(new Ref('method'));
        container.get('test');
        expect(fn).toHaveBeenCalled();
    });

    test(`throws if the method isn't a function`, () => {
        container.add('test', new Def({}))
            .callMethod('foo');
        expect(() => container.get('test')).toThrow();
    });

    test(`throws if called after value has been resolved`, () => {
        const def = new Def(value);
        container.add('test', def);
        container.get('test');
        expect(() => def.callMethod('fn')).toThrow();
    });
});