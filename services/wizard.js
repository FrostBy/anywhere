class Wizard {
    constructor(fields = {}, steps = [], data = {}) {
        this.fields = fields;
        this.steps = steps;
        this.data = data;
    }

    static get prefix() { return 'wizard'; }

    static key(key) { return this.prefix + '.' + key; }

    init() {
        const that = this;
        // language=HTML
        $('body').append(`
            <div class="wizard">
                <button class="action-button fill-form">Fill the Form (Step By Step)</button>
            </div>
        `);
        $('.fill-form').on('click', function (e) {
            e.preventDefault();
            if (!that.steps.length) return;
            that.processField();
        });
    }

    terminate() {
        $('.wizard').remove();
        $('.current').removeClass('current');
    }

    processField() {
        $('.current').removeClass('current');
        const step = this.steps.shift();
        const value = this.data[step];
        this.constructor._processField(this.fields[step])(value);
    }

    static _processField(form) {
        $('.current').removeClass('current');
        if (typeof form === 'function') return form;
        if (form.parents('sd-static-select').length) return this.getProcessors(form, 'select');
        if (form.parents('sd-search-select').length) return this.getProcessors(form, 'search');
        if (form.parents('sd-input-field').length) return this.getProcessors(form, 'input');
        return () => {};
    }

    static getProcessors(form, type) {
        const processors = {
            select: function (value = form.data('default-value')) {
                DomProfile.toggleSpinner(true);
                form.addClass('current').scrollTo(200);
                const searchWatcher = services.Dom.Shared.waitForAddedNode({
                    selector: '#search', parent: form[0], recursive: true, disconnect: true,
                    done: () => {
                        setTimeout(() => {
                            services.Dom.Shared.waitForAddedNode({
                                selector: '.ng-dropdown-panel', parent: form[0], recursive: true, disconnect: true,
                                done: () => setTimeout(() => {
                                    form.find('.ng-dropdown-panel .ng-option:eq(0)').triggerRawMouse('click');
                                    DomProfile.toggleSpinner(false);
                                }, 500)
                            });
                            form.find('#search').val(value).triggerRawEvent('input');
                        }, 100);
                    }
                });
                setTimeout(() => {
                    if (!form.find('#search').length) {
                        searchWatcher.disconnect();
                        form.find('.ng-input input').triggerRawMouse('mousedown');
                        form.find('.ng-dropdown-panel .ng-option:eq(0)').triggerRawMouse('click');
                        DomProfile.toggleSpinner(false);
                    }
                }, 500);
                form.find('.ellipsis').scrollTo(200).triggerRawMouse('mousedown');
            },
            search: function (value = form.data('default-value')) {
                DomProfile.toggleSpinner(true);
                form.addClass('current').scrollTo(200);
                form.find('.ng-input').triggerRawMouse('mousedown');
                form.find('.ng-input input').val(value).triggerRawEvent('input');
                services.Dom.Shared.waitForAddedNode({
                    selector: '.ng-dropdown-panel', parent: form[0], recursive: true, disconnect: true,
                    done: () => {
                        form.find('.ng-dropdown-panel .ng-option:eq(0)').triggerRawMouse('click');
                        DomProfile.toggleSpinner(false);
                    }
                });
            },
            input: function (value = form.data('default-value')) {
                form.addClass('current').scrollTo(200);
                form.find('textarea').val(`For ${value}`).triggerRawEvent('input');
            }
        };
        return processors[type] ? processors[type] : () => {};
    }
}