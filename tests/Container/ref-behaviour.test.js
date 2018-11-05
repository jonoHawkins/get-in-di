const {
    Container,
    Ref,
    ReferenceRecursionError,
} = require('../..');

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