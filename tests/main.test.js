const {
    Container,
    Def,
    Ref,
    ReferenceRecursionError,
    Reference,
    Definition,
} = require('../');

describe('module exports', () => {
    expect(Ref).toBe(Reference);
    expect(Def).toBe(Definition);
})

describe('container add and get', () => {
    describe(`container.add validation`, () => {
        test(`throws on no address`, () => {
            const container = new Container();
            expect(container.add).toThrow();
        });

        test(`throws if no definition`, () => {
            const container = new Container();
            expect(() => container.add('foo')).toThrow();
        });

        test(`throws on address duplication`, () => {
            const container = new Container();
            container.add('my-value', 'foo');
            expect(() => container.add('my-value', 'bar')).toThrow();
        });
    });


    describe(`container.get`, () => {
        test(`throws if no address is supplied`, () => {
            const container = new Container();
            expect(() => container.get()).toThrow();
        });

        test(`throws if cannot find a value`, () => {
            const container = new Container();
            expect(() => container.get('foo')).toThrow();
        });

        test(`can add and get values`, () => {
            const container = new Container();
            const object = {};

            container.add('string', 'foo');
            container.add('number', 1234567890);
            container.add('object', object);

            expect(container.get('string')).toBe('foo');
            expect(container.get('number')).toBe(1234567890);
            expect(container.get('object')).toBe(object);
        });
    });
});

describe(`container Reference behaviour`, () => {
    test(`throws ReferenceRecursionError if references are circular`, () => {
        const container = new Container();

        container.add('a', new Ref('b'));
        container.add('b', new Ref('c'));
        container.add('c', new Ref('a'));

        expect(() => container.get('a')).toThrowError(ReferenceRecursionError);
    });

    test(`Resolves references`, () => {
        const container = new Container();
        const a = {};
        const b = {};

        container.add('a', a);
        container.add('a-ref', new Ref('a'));

        container.add('b', b);
        container.add('b-ref', new Ref('b'));
        container.add('b-ref-ref', new Ref('b-ref'));

        expect(container.get('a-ref')).toBe(a);
        expect(container.get('b-ref-ref')).toBe(b);
    });
});

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

describe(`Definition usage`, () => {
    describe('definition.call', () => {
        test(`using Definition to create a singleton`, () => {
            const container = new Container();

            container.add('rand', new Def(Math.random))
                .call();

            expect(container.get('rand')).toBe(container.get('rand'));
        });

        test(`using Definition to create a factory`, () => {
            const fn = jest.fn();
            fn.mockReturnValueOnce(123);
            fn.mockReturnValueOnce('abc');

            const container = new Container();

            container.add('randFactory', new Def(fn, { isShared: false }))
                .call();

            expect(container.get('randFactory')).toBe(123);
            expect(container.get('randFactory')).toBe('abc');
        });

        test(`using call args`, () => {
            const container = new Container();
            const square = n => n * n;

            container.add('squareArgs', new Def([2]));
            container.add('square', new Def(square))
                .call(new Ref('squareArgs'));

            expect(container.get('square')).toBe(4);

            container.add('4', new Def(4));
            container.add('4square', new Def(square))
                .call([new Ref('4')])

            expect(container.get('4square')).toBe(16);
        });

        test(`the call context is used`, () => {
            const container = new Container();

            function fn(n) {
                return n + this;
            };

            container.add('fn', new Def(fn))
                .call([1], 2);

            expect(container.get('fn')).toBe(3);
        });

        test(`throws if called after value has been resolved`, () => {
            const container = new Container();
            const fn = () => { };
            const fnDef = new Def(fn);

            container.add('fn', fnDef);
            container.get('fn');

            expect(() => fnDef.call()).toThrow();
        });
    });

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

    test('chaining action calls', () => {
        const container = new Container();


        class TestClass {
            constructor(value = 0) {
                this.value = value;
                this.incrementor = 1;
            }

            increment() {
                this.value += this.incrementor;
            }
        }

        TestClass.staticValue = 'foo';
        TestClass.callFirst = () => expect(TestClass.staticValue).toBe('foo');
        TestClass.callSecond = () => expect(TestClass.staticValue).toBe('bar');

        const giveTest = () => TestClass;

        container.add('test', new Def(giveTest))
            .call()
            .callMethod('callFirst')
            .setProp('staticValue', 'bar')
            .callMethod('callSecond')
            .construct([11])
            .callMethod('increment')
            .decorate((testClass) => {
                expect(testClass.value).toBe(12);
            })
            .setProp('incrementor', 100)
            .callMethod('increment');

        const value = container.get('test');

        expect(value.value).toBe(112);
    });
});