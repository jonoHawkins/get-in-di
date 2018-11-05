const {
    Container,
    Def,
    Ref,
    Definition,
} = require('../..');

describe(`definition.construct`, () => {
    let TestClass, container, definition;

    beforeEach(() => {
        TestClass = jest.fn();
        container = new Container();
        definition = new Definition(TestClass);
    });

    test(`constructs the value`, () => {
        container.add('test', definition)
            .construct();
        container.get('test');
        expect(TestClass.mock.instances).toHaveLength(1);
    });

    test(`respects isShared=true`, () => {
        container.add('test', definition)
            .construct();
        container.get('test');
        container.get('test');
        expect(TestClass.mock.instances).toHaveLength(1);
    });

    test(`respects isShared=false`, () => {
        container.add('test', new Def(TestClass, { isShared: false }))
            .construct();
        container.get('test');
        container.get('test');
        expect(TestClass.mock.instances).toHaveLength(2);
    });

    test(`passes the args to the constructor`, () => {
        const a = {};
        const b = {};
        const c = {};
        container.add('test', definition)
            .construct([a, b, c]);
        container.get('test');
        expect(TestClass.mock.calls[0][0]).toBe(a);
        expect(TestClass.mock.calls[0][1]).toBe(b);
        expect(TestClass.mock.calls[0][2]).toBe(c);
    });

    test(`the args can be References`, () => {
        const a = {};
        const b = {};
        const c = {};
        container.add('a', a);
        container.add('b', b);
        container.add('c', c);
        container.add('test', new Def(TestClass))
            .construct([
                new Ref('a'),
                new Ref('b'),
                new Ref('c'),
            ]);
        container.add('args', new Def([
            1,
            2,
            3,
        ]));
        container.add('test2', new Def(TestClass))
            .construct(new Ref('args'));
        container.get('test');
        container.get('test2');
        expect(TestClass.mock.calls[0][0]).toBe(a);
        expect(TestClass.mock.calls[0][1]).toBe(b);
        expect(TestClass.mock.calls[0][2]).toBe(c);
        expect(TestClass.mock.calls[1][0]).toBe(1);
        expect(TestClass.mock.calls[1][1]).toBe(2);
        expect(TestClass.mock.calls[1][2]).toBe(3);
    });

    test(`throws if called after value has been resolved`, () => {
        container.add('test', definition);
        container.get('test');
        expect(definition.construct).toThrow();
    });
});