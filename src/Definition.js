const UNRESOLVED = Symbol('UNRESOLVED');
const RESOLVED_UNSHARED = Symbol('RESOLVED_UNSHARED');
const DECORATE = Symbol('DECORATE');
const SET_PROP = Symbol('SET_PROP');
const CALL_METHOD = Symbol('CALL_METHOD');
const CALL = Symbol('CALL');
const CONSTRUCT = Symbol('CONSTRUCT');

class Definition {
    constructor(value, { isShared = true } = {}) {
        this.isShared = isShared;
        this.actions = [];
        this.value = value;
        this.resolvedValue = Definition.UNRESOLVED;
    }

    getValue(container) {
        if (this.isShared && this.hasResolved()) {
            return this.resolvedValue;
        }

        let value = this._prepareValue(
            this._initializeValue(container),
            container,
        );

        if (this.isShared) {
            this.resolvedValue = value;
        } else {
            this.resolvedValue = Definition.RESOLVED_UNSHARED;
        }

        return value;
    }

    hasResolved() {
        return this.resolvedValue !== Definition.UNRESOLVED;
    }

    _initializeValue(container) {
        return container.resolveReference(this.value)
    }

    _prepareValue(value, container) {
        for (let action of this.actions) {
            switch (action.type) {
                case Definition.SET_PROP: {
                    const prop = container.resolveReference(action.prop);
                    const propValue = container.resolveReference(action.value);
                    value[prop] = propValue;
                    break;
                }
                case Definition.CALL_METHOD: {
                    const method = container.resolveReference(action.method);
                    const args = container.resolveReference(action.args)
                        .map(container.resolveReference);

                    if (typeof value[method] !== 'function') {
                        throw new Error(`cannot call ${method}" on "${this.value}"`);
                    }

                    value[method](...args);
                    break;
                }
                case Definition.CONSTRUCT: {
                    const args = container.resolveReference(action.args)
                        .map(container.resolveReference);

                    value = new value(...args);
                    break;
                }
                case Definition.CALL: {
                    const context = container.resolveReference(action.context);
                    const args = container.resolveReference(action.args)
                        .map(container.resolveReference);

                    value = value.apply(context, args);
                    break;
                }
                case Definition.DECORATE: {
                    const fn = container.resolveReference(action.fn);
                    const context = container.resolveReference(action.context);
                    const args = container.resolveReference(action.args)
                        .map(container.resolveReference);

                    let nextValue = fn.apply(
                        context,
                        [value, ...args, container]
                    );

                    if (nextValue !== undefined) {
                        value = nextValue;
                    }
                    break;
                }
            }
        }

        return value;
    }

    decorate(fn, args = [], context = this) {
        this._checkCanAddAction('decorate');

        this.actions.push({
            type: Definition.DECORATE,
            fn,
            args,
            context,
        });

        return this;
    }

    _checkCanAddAction(action) {
        if (this.hasResolved()) {
            let error = Error(`Cannot call "${action}" after definition has been resolved.`)
            let [first, nope, ...rest] = error.stack.split('\n');
            error.stack = [first, ...rest].join('\n');
            throw error;
        }
    }

    setProp(prop, value) {
        this._checkCanAddAction('setProp');

        this.actions.push({
            type: Definition.SET_PROP,
            prop,
            value,
        });

        return this;
    }

    callMethod(method, args = []) {
        this._checkCanAddAction('callMethod');

        this.actions.push({
            type: Definition.CALL_METHOD,
            method,
            args,
        });

        return this;
    }

    construct(args = []) {
        this._checkCanAddAction('construct');

        this.actions.push({
            type: Definition.CONSTRUCT,
            args,
        });

        return this;
    }

    call(args = [], context) {
        this._checkCanAddAction('call');

        this.actions.push({
            type: Definition.CALL,
            args,
            context,
        });

        return this;
    }
}

Definition.DECORATE = DECORATE;
Definition.UNRESOLVED = UNRESOLVED;
Definition.RESOLVED_UNSHARED = RESOLVED_UNSHARED;
Definition.SET_PROP = SET_PROP;
Definition.CALL_METHOD = CALL_METHOD;
Definition.CONSTRUCT = CONSTRUCT;
Definition.CONSTRUCT = CALL;

module.exports = Definition;