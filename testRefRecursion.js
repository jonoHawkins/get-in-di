const Container = require('./src/Container');
const Ref = require('./src/Reference');
const container = new Container();

container.add('a', new Ref('b'));
container.add('b', new Ref('c'));
container.add('c', new Ref('a'));

console.log(container.get('a'));

