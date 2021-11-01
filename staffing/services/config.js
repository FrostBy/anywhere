class Config {
    static get(key, defaultValue = undefined) {
        try {
            return JSON.parse(GM_getValue('config.' + key, JSON.stringify(defaultValue)));
        } catch (e) {
            return defaultValue;
        }
    }

    static set(key, value) {
        GM_setValue('config.' + key, JSON.stringify(value));
        return value;
    }
}