const Reference = require('./Reference');

class ReferenceObject extends Reference {
    constructor(addressMap) {
        super(addressMap);
    }

    resolve(container, referenceStack) {
        const resolvedValue = { ...this.address };

        for (let [key, value] of Object.entries(resolvedValue)) {
            resolvedValue[key] = container._resolveReference(value, referenceStack);
        }

        return resolvedValue;
    }
}

module.exports = ReferenceObject;