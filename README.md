# Get In DI

A DI container for node (>= 10).

There are three concepts: definitions, references, and containers.

*Definitions* wrap values and provides methods for initialising classes, and creating factories, and singletons, *References* allow definitions to be shared, and a *container* holds it together.

## Install

```
$ npm i get-in-di
```

Or

```
$ yarn add get-in-di
```

## A contrived example

```js
// Create a container
const container = new Container();

// We want to store some config in our container.
container.add('db_user', process.env.DB_USER);
container.add('db_pass', process.env.DB_PASS);

// set up a db connection
container.add('connection', new Definition(require('db-lib')))
    // construct our connection
    .construct([
        new ReferenceObject({
            url: 'url_to_db_1',
            // use References to configure the constructor args
            user: new Reference('db_user'),
            password: new Reference('db_pass'),
        })
    ])
    // our db lib doesn't use promises so lets sort that out.
    .decorate((connection) => {
        const { promisify } = require('util');
        connection.query = promisify(connection.query);
    });

// set up an app with the connection
container.add('app', new Def(App))
    .construct([new Reference('connection')]);

// Get the app... this will create our connection before
// injecting it into our app.
container.get('app');
```

## Recipes

### add and get a value
```js
container.add('foo', new Definition('bar'));
container.get('foo') // => 'bar'
```

### Constructing a class

Here's the class were going to use:

```js
class Counter {
    constructor(count = 0) {
        this.count = count;
        this.incrementAmount = 1;
    }
    increment() {
        this.count += this.incrementAmount;
    }
}
```

It's easy to add a definition for the class...

```js
container.add('counter', new Definition(Counter));
container.get('counter') // => [Function: Counter]
```
...but if we call `get` now the container will just return our class. We need tell the definition to create a new instance.

`container.add` returns the value that was added. So here we can user the `Definition` method `construct` to make the definition resolve its value to an instance of `Counter`:

```js
container.add('counter', new Definition(Counter))
    .construct();

container.get('counter') // => Counter { count: 0, incrementAmount: 1 }
```

This is great! But what if we want to pass some values to the constructor? We can do this by passing a array of arguments to `definition.construct`. This can be a value, or a `Reference`. (In fact the argument array can be replaced by a `Reference`).

```js
container.add('counter', new Definition(Counter))
    .construct([new Reference('initialCount')]);

container.add('initialCount', 100);

container.get('counter') // => Counter { count: 100, incrementAmount: 1 }
```

Note: We can define `initialCount` after `counter` because the counter isn't initialised until `container.get('counter')` is called.

We can also call methods and set properties on a Definition value:

```js
container.add('counter', new Definition(Counter))
    .construct([new Reference('initialCount')])
    .callMethod('increment')
    .setProp('incrementAmount', 10)
    .callMethod('increment')

container.add('initialCount', 100);

container.get('counter') // => Counter { count: 111, incrementAmount: 10 }
```

`construct`, `callMethod`, `setProp`, and `decorate` (which we haven't covered here) are called in order and can be called on any definition value; so dont call `construct` on a number definition!


### Singleton vs Factory

We can set `isShared` to control how the behaviour of definitions.

In this example `Math.random` will be called once the first time `shared_random` is accessed. The the random value is then stored for each subsequent get:

```js
container.add('shared_random', new Definition(Math.random))
    .call(); // we need this to tell the Definition to run Math.random instead of return it

container.get('shared_random') // => 0.6240852289721388;
container.get('shared_random') // => 0.6240852289721388;
```
By setting `isShared` to `false` we're telling the definition to call `Math.random` each time `random_factory` is accessed.
```js
container.add('random_factory', new Definition(Math.random, { isShared: false }))
    .call();

container.get('random_factory'); // => 0.5616454027240336
container.get('random_factory'); // => 0.48624780071259344
```

### Using Objects

Calling functions with argument lists is all well and good, but a lot of the time functions and classes require and object for one or more parameters. To inject values into these we need to use a `ReferenceObject`.

A `ReferenceObject` takes an object where some of it's value are instance of `Reference`. When it is resolved it returns a new object with the references resolved and the remaining properties shallowly copied across.

```js
// add some values to our container
container.add('user', 'root');
container.add('password', 'lolcatz');
container.add('logFile', new Definition(LogFile))
    .construct('./log.log');


container.add('db', new Definition(DB))
    .construct([
        new ReferenceObject({
            user: new Reference('user'),
            password: new Reference('password'),
            // References in arrays will also be resolved
            logFiles: [
                new Reference('logFile'),
            ]
        })
    ]);

container.get('db') // => DB { user: 'root', password: 'lolcatz', logFiles: [LogFile] }
```

You can also use `Definition.resolveProps` to resolve all properties any value. This is more useful if you're not dealing with an object for some reason...

```js
container.add('string', 'hello');
container.add('number', 123);

container.add('thing', new Definition({
    foo: new Reference('string'),
    bar: new Reference('number'),
}))
    .resolveProps();

container.get('thing') // => { foo: "hello", bar: 123 }
```

`Definition.resolveProps` can be chained like any other definition action.

### Shorthand class names

We export short hand class names for less typing:

| Class | Shorthand |
|-------|-----------|
| Definition | Def |
| Reference | Ref |
| ReferenceObject | RefObj |