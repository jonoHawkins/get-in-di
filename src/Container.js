const Definition = require('./Definition');
const Reference = require('./Reference');
const ReferenceRecursionError = require('./ReferenceRecursionError');

class Container {
    constructor() {
        this.definitions = new Map();
        this.resolveReference = this.resolveReference.bind(this);
        this.get = this.get.bind(this);
        this.add = this.add.bind(this);
    }

    add(address, definition) {
        if (!address) {
            throw new Error(`address must be defined`);
        }

        if (!definition) {
            throw new Error(`definition must be defined.`);
        }

        if (this.definitions.has(address)) {
            throw new Error(`A definition for "${address}" has already been created.`);
        }

        this.definitions.set(address, definition);
        return definition;
    }

    resolveReference(reference) {
        return this._resolveReference(reference);
    }

    _resolveReference(reference, referenceStack = []) {
        if (reference instanceof Reference) {
            if (referenceStack.includes(reference.address)) {
                throw new ReferenceRecursionError(
                    `Recursion detected while resolving reference address: "${reference.address}"`,
                    referenceStack
                );
            }

            return this.get(reference.address, [
                ...referenceStack,
                reference.address
            ]);
        }

        return reference;
    }

    get(address, referenceStack = [address]) {
        if (!address) {
            throw new Error(`address must be defined.`);
        }

        if (!this.definitions.has(address)) {
            throw new Error(`A definition for "${address}" does not exist.`);
        }

        let value = this.definitions.get(address);

        if (value instanceof Reference) {
            value = this._resolveReference(value, referenceStack);
        }

        if (value instanceof Definition) {
            return value.getValue(this);
        }

        return value;
    }
}

module.exports = Container;