const Container = require('./src/Container');
const Ref = Reference = require('./src/Reference');
let Def = Definition = require('./src/Definition');
const container = new Container();

class Counter {
    constructor(count = 1) {
        this.count = count;
        this.incrementAmount = 1;
    }
    increment() {
        console.log('increment')
        this.count += this.incrementAmount;
    }
}
container.add('counter', new Definition(Counter))
    .construct([new Reference('initialCount')])
    .callMethod('increment')
    .setProp('incrementAmount', 10)
    .callMethod('increment')

container.add('initialCount', 100);

console.log(container.get('counter'));
console.log(container.get('counter'));

// container.add('fn', new Def((a) => {
//     console.log(a)
//     return a;
// }))

// const fn1 = new Def(new Ref('fn'));

// container.add('fn1', fn1)
//     .call([{ value: 'fn 1!' }])
//     .setProp('foo', 'bar');
// console.log(container.get('fn1'));



// container.add('startCount', 2);
// container.add('defaultIncrement', 4);

// container.add('test', new Def({}))
//     .setProp('foo', 'foo')
//     .decorate((foo, startCount, defaultIncrement) => {
//         foo.count = startCount;
//         foo.bar = (n = defaultIncrement) => {
//             foo.count += n;
//         };
//     }, [new Ref('startCount'), new Ref('defaultIncrement')])
//     .callMethod('bar')
//     .callMethod('bar', 5)

// // console.log(container.get('test'));

// class Foo {
//     constructor() {
//         this.value = Math.random();
//     }
// }

// container.add('foo_shared', new Def(Foo))
//     .construct();

// container.add('foo_not_shared', new Def(Foo, { isShared: false }))
//     .construct();


// container.add('append', (a, b) => a + b);

// container.add('suffix', '_bar');
// container.add('foo', new Def('foo'))
//     .decorate(new Ref('append'), [new Ref('suffix')])

// console.log(container.get('foo'));




// const Definition = require('./src/Definition');
// const FunctionDefinition = require('./src/FunctionDefinition');
// const ClassDefinition = require('./src/ClassDefinition');
// const Container = require('./src/Container');
// const Reference = require('./src/Reference');

// const container = new Container();

container.add('foo', 'Foo');
container.add('bar', 'Bar!');
container.add('baz', 'Baz!');
container.add('boop', 'BOOP!!');

// container.add('log foo', new FunctionDefinition(console.log))
//     .setContext(console)
//     .useArgs(new Reference('foo'));

// container.add('console', console);

// container.add('log bar', new FunctionDefinition(console.log, {
//     isShared: true,
//     context: new Reference('console'),
//     args: [
//         new Reference('bar')
//     ],
// }));

// class Test {
//     constructor(value) {
//         this.value = value;
//     }

//     setValue(value) {
//         this.value = value;
//     }
// }


// container.add('test', new Def(Test))
//     .construct([new Ref('foo')])
//     .setProp('value', new Ref('bar'))
//     .callMethod('setValue', new Ref('baz'))
//     .decorate((test, container) => {
//         test.value = container.get('boop');
//     });

// // // console.log(container.get('log bar'));
// console.log(container.get('test'));
