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

    static get options() {
        return {
            positionClass: 'toast-bottom-right',
            timeOut: 0,
            //hideEasing: 'linear',
            hideEasing: 'swing',
        };
    }

    constructor(page, validators = {}) {
        this.page = page;
        this.validators = validators;
        this.api = new services.API();
    }

    key(key) { return Validator.prefix + '.' + this.page + '.' + key; }

    init() {
        // language=HTML
        $('body').append(`
            <div class="validator">
                <div class="buttons">
                    <button class="action-button validate">Validate</button>
                    <button class="check ellipsis on-load ${services.Config.get(this.key('onLoad')) ? 'selected' : ''}">
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
            const onLoad = !services.Config.get(this.key('onLoad'));
            $(e.target).toggleClass('selected', onLoad);
            services.Config.set(this.key('onLoad'), onLoad);
        });

        this.initFixed();
        if (services.Config.get(this.key('onLoad'))) this.validate();
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
            const offset = 181 - $(window).scrollTop();
            if (offset <= 0) $('.validator.fixed').css('top', '0');
            else if (offset < 181) $('.validator.fixed').css('top', `${offset}px`);
            else $('.validator.fixed').css('top', '181px');
        });
        $(window).trigger('scroll.validator');
    }

    async validate() {
        $('.validate').toggleClass('in-progress');
        await Promise.all(Object.values(this.validators).map(async validator => {
            const result = await validator.function(this);
            if (validator.showMessage !== false && (!result || typeof result === 'object')) this.message(result?.status, validator?.error.message);
            if (validator.callback) validator.callback(result, this);
        }));
        $('.validate').toggleClass('in-progress');
    }

    message(status = Validator.statuses.ERROR, message = 'Error', title = 'Validation', options = {}) {
        toastr.options = Object.assign(Validator.options, options);

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
                break;
            }
        }
    }
}