const {
    Container,
} = require('../..');


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