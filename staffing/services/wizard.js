class Wizard {
    constructor(fields = {}, steps = [], data = {}) {
        this.fields = fields;
        this.steps = steps;
        this.nextStep = 0;
        this.data = data;
    }

    static get prefix() { return 'wizard'; }

    static key(key) { return this.prefix + '.' + key; }

    init() {
        // language=HTML
        $('body').append(`
            <div class="wizard">
                <div class="buttons">
                    <button class="action-button fill-form" type="button">Fill the Form (Step By Step)</button>
                    <button class="action-button retry" title="Retry" type="button">⟳</button>
                </div>
            </div>
        `);

        $('.fill-form').on('click', () => {
            this.processField(this.nextStep);
            this.nextStep++;
        }).one('click', () => $('.retry').show());

        $('.retry').hide().on('click', () => {
            this.processField(this.nextStep - 1);
        });
    }

    terminate() {
        $('.wizard').remove();
        $('.current').removeClass('current');
    }

    processField(stepNumber) {
        if (!this.steps[stepNumber]) return;

        $('.current').removeClass('current');
        const step = this.steps[stepNumber];
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
                                selector: '.ng-dropdown-panel em', parent: form[0], recursive: true, disconnect: true,
                                done: () => setTimeout(() => {
                                    const options = form.find('.ng-dropdown-panel .ng-option');
                                    const option = value && options.filter((index, option) => option.innerText.trim() === value.trim())[0] || options.eq(0);
                                    $(option).triggerRawMouse('click');
                                    DomProfile.toggleSpinner(false);
                                }, 750)
                            });
                            form.find('#search').val(value).triggerRawEvent('input');
                        }, 250);
                    }
                });
                setTimeout(() => {
                    if (!form.find('#search').length) {
                        searchWatcher.disconnect();
                        form.find('.ng-input input').triggerRawMouse('mousedown');
                        const options = form.find('.ng-dropdown-panel .ng-option');
                        const option = value && options.filter((index, option) => option.innerText.trim() === value.trim())[0] || options.eq(0);
                        $(option).triggerRawMouse('click');
                        DomProfile.toggleSpinner(false);
                    }
                }, 250);
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
                        const options = form.find('.ng-dropdown-panel .ng-option');
                        const option = value && options.filter((index, option) => option.innerText.trim() === value.trim())[0] || options.eq(0);
                        $(option).triggerRawMouse('click');
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