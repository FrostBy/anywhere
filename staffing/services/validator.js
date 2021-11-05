class Validator {
    static get prefix() { return 'validator'; }

    static get statuses() {
        return {
            ERROR: 0,
            SUCCESS: 1,
            INFO: 3,
            WARNING: 4
        };
    }

    get statuses() {
        return Validator.statuses;
    }

    static get optionsToastr() {
        return {
            positionClass: 'toast-bottom-right',
            timeOut: 0,
            //hideEasing: 'linear',
            hideEasing: 'swing',
            allowHtml: true,
            closeOnHover: false,
        };
    }

    constructor(page, validators = {}, options = {}) {
        this.page = page;
        this.validators = validators;
        this.options = options;
        this.api = new services.API();
        this.hasErrors = false;
    }

    key(key) { return Validator.prefix + '.' + this.page + '.' + key; }

    init() {
        // language=HTML
        $('body').append(`
            <div class="validator">
                <div class="buttons">
                    <button class="action-button validate">Validate</button>
                    <button class="check ellipsis on-load ${services.Config.get(this.key('onLoad'), true) ? 'selected' : ''}">
                        On Load
                    </button>
                </div>
            </div>
        `);

        $('.validate').on('click', async e => {
            if ($(e.target).is('.in-progress')) return;
            this.validate();
        });

        $('.validator .on-load').on('click', e => {
            const onLoad = !services.Config.get(this.key('onLoad'), true);
            $(e.target).toggleClass('selected', onLoad);
            services.Config.set(this.key('onLoad'), onLoad);
        });

        this.initFixed();
        if (services.Config.get(this.key('onLoad'), true)) this.validate();
    }

    terminate() {
        this.api.terminate();
        $('.validator').remove();
        $(window).off('scroll.validator');
        $('.validator.fixed').removeClass('fixed').css('top', '');
    }

    initFixed() {
        $('.validator').addClass('fixed');

        $(window).off('scroll.validator').on('scroll.validator', () => {
            const defaultOffset = this.options.offset || 181;
            const top = this.options.top || 0;

            const offset = defaultOffset - $(window).scrollTop();

            if (offset <= top) $('.validator.fixed').css('top', top);
            else if (offset < defaultOffset) $('.validator.fixed').css('top', `${offset}px`);
            else $('.validator.fixed').css('top', `${defaultOffset}px`);
        });
        $(window).trigger('scroll.validator');
    }

    async validate() {
        this.hasErrors = false;
        toastr.remove();

        $('.validate').toggleClass('in-progress');

        await Promise.all(Object.values(this.validators).map(async validator => {
            const result = await validator.function(this);
            if (validator.showMessage !== false && (!result || typeof result === 'object')) this.message(result?.status, validator?.error.message);
            if (validator.callback) validator.callback(result, this);
        }));

        if (!this.hasErrors) this.message(Validator.statuses.SUCCESS, 'No Errors');

        $('.validate').toggleClass('in-progress');
    }

    message(status = Validator.statuses.ERROR, message = 'Error', title = 'Validation', options = {}) {
        toastr.options = Object.assign(Validator.optionsToastr, options);

        switch (status) {
            case Validator.statuses.SUCCESS: {
                toastr['success'](message, title);
                break;
            }
            case Validator.statuses.INFO: {
                toastr['info'](message, title);
                break;
            }
            case Validator.statuses.WARNING: {
                toastr['warning'](message, title);
                break;
            }
            case Validator.statuses.ERROR:
            default: {
                toastr['error'](message, title);
                this.hasErrors = true;
                break;
            }
        }
    }
}