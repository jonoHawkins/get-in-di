const {
    Def,
    Definition,
    Ref,
    Reference,
    RefObj,
    ReferenceObject,
} = require('../');

test('module exports', () => {
    expect(Ref).toBe(Reference);
    expect(Def).toBe(Definition);
    expect(RefObj).toBe(ReferenceObject);
})