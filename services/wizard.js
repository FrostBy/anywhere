class Wizard {
    static getSteps(formID) {
        return services.Config.get(this.key(formID), []);
    }

    static get prefix() { return 'wizard'; }

    static key(key) {
        return this.prefix + '.' + key;
    }
}