class Reference {
    constructor(address) {
        this.address = address;
    }

    resolve(container, referenceStack) {
        return container.get(this.address, referenceStack);
    }
}

module.exports = Reference;