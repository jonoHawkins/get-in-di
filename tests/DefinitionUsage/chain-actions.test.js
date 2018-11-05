const {
    Container,
    Def,
} = require('../..');

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