const {
    Container,
    Def,
    Ref,
    Definition,
} = require('../..');


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