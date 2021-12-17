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
        Wizard._processField(this.fields[step], value);
    }

    static _processField(fieldGetter, value) {
        $('.current').removeClass('current');
        const field = fieldGetter(value);
        if (!(field instanceof $)) return field; //is a function
        if (field.parents('sd-static-select').length) return this.getProcessors(field, 'select')(value);
        if (field.parents('sd-search-select').length) return this.getProcessors(field, 'search')(value);
        if (field.parents('sd-input-field').length) return this.getProcessors(field, 'input')(value);
        return false;
    }

    static getProcessors(field, type) {
        const processors = {
            select: function (value = field.data('default-value')) {
                DomProfile.toggleSpinner(true);
                field.addClass('current').scrollTo(200);
                const searchWatcher = services.Dom.Shared.waitForAddedNode({
                    selector: '#search', parent: field[0], recursive: true, disconnect: true,
                    done: () => {
                        setTimeout(() => {
                            services.Dom.Shared.waitForAddedNode({
                                selector: '.ng-dropdown-panel em', parent: field[0], recursive: true, disconnect: true,
                                done: () => setTimeout(() => {
                                    const options = field.find('.ng-dropdown-panel .ng-option');
                                    const option = value && options.filter((index, option) => option.innerText.trim() === value?.trim())?.[0] || options.eq(0);
                                    $(option).triggerRawMouse('click');
                                    DomProfile.toggleSpinner(false);
                                }, 750)
                            });
                            field.find('#search').val(value).triggerRawEvent('input');
                        }, 250);
                    }
                });
                setTimeout(() => {
                    if (!field.find('#search').length) {
                        searchWatcher.disconnect();
                        field.find('.ng-input input').triggerRawMouse('mousedown');
                        const options = field.find('.ng-dropdown-panel .ng-option');
                        const option = value && options.filter((index, option) => option.innerText.trim() === value?.trim())?.[0] || options.eq(0);
                        $(option).triggerRawMouse('click');
                        DomProfile.toggleSpinner(false);
                    }
                }, 250);
                field.find('.ellipsis').scrollTo(200).triggerRawMouse('mousedown');
            },
            search: function (value = field.data('default-value')) {
                DomProfile.toggleSpinner(true);
                field.addClass('current').scrollTo(200);
                field.find('.ng-input').triggerRawMouse('mousedown');
                field.find('.ng-input input').val(value).triggerRawEvent('input');
                services.Dom.Shared.waitForAddedNode({
                    selector: '.ng-dropdown-panel', parent: field[0], recursive: true, disconnect: true,
                    done: () => {
                        const options = field.find('.ng-dropdown-panel .ng-option');
                        const option = value && options.filter((index, option) => option.innerText.trim() === value?.trim())?.[0] || options.eq(0);
                        $(option).triggerRawMouse('click');
                        DomProfile.toggleSpinner(false);
                    }
                });
            },
            input: function (value = field.data('default-value')) {
                field.addClass('current').scrollTo(200);
                field.find('textarea').val(`For ${value}`).triggerRawEvent('input');
            }
        };
        return processors[type] ? processors[type] : () => {};
    }
}