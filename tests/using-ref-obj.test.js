const {
    Container,
    Def,
    Ref,
    RefObj,
} = require('../');

describe('Using ReferenceObject', () => {
    const number = Math.random();
    const string = 'aqwsddfghj';
    const object = {};
    let container;
    let refObj;

    beforeEach(() => {
        refObj = new RefObj({
            number: new Ref('number'),
            string: new Ref('string'),
            object: new Ref('object'),
        });

        container = new Container();
        container.add('number', number);
        container.add('string', string);
        container.add('object', object);
    });

    const assertResult = (resolved) => {
        expect(resolved.number).toBe(number);
        expect(resolved.string).toBe(string);
        expect(resolved.object).toBe(object);
    };

    test(`defining a value`, () => {
        container.add('test', refObj);
        assertResult(container.get('test'));
    });

    test(`calling a factory`, () => {
        container.add('test', new Def(o => o))
            .call([refObj]);

        assertResult(container.get('test'));
    });

    test(`constructing a class`, () => {
        class Test {
            constructor(config) {
                this.config = config;
            }
        }

        container.add('test', new Def(Test))
            .construct([refObj]);

        const instance = container.get('test');
        assertResult(instance.config);
    });

    test(`decorating`, () => {
        container.add('test', new Def())
            .decorate((_, object) => {
                assertResult(object);
            }, [refObj]);
        container.get('test');
    });

    test(`setting props`, () => {
        container.add('test', new Def({}))
            .setProp('test', refObj);

        assertResult(container.get('test').test);
    });

    test(`resolving props`, () => {
        container.add('test', new Def(refObj))
            .resolveProps();

        assertResult(container.get('test'))
    });

    test(`can be nested`, () => {
        container.add('innerObject', refObj);
        container.add('test', new Def(o => o))
            .call([
                new RefObj({
                    inner: new Ref('innerObject'),
                })
            ]);

        assertResult(container.get('test').inner);
    });

    test(`will resolve arrays of References`, () => {
        const foo = {};
        container.add('foo', foo);
        container.add('test', new Def(o => o))
            .call([
                new RefObj({
                    array: [new Ref('foo')]
                })
            ]);

        expect(container.get('test').array[0]).toBe(foo);
    });
});