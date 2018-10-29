class ReferenceRecursionError extends Error {
    constructor(message, referenceStack) {
        super(message);
        this.referenceStack = referenceStack;
        this.name = 'ReferenceRecursionError';
    }
}

module.exports = ReferenceRecursionError;