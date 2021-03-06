class ConfiguratorShared {
    static get prefix() { return 'shared'; }

    static key(key) { return this.prefix + '.' + key; }

    static get dom() {
        // language=HTML
        return `
            <div class="configurator-container sidebar-container">
                <div class='body sidebar'>
                    <button class="close"><span class="fa fa-close"></span></button>
                    <form id="boards" class="boards applicant-summary__info-container">
                    </form>
                </div>
            </div>
        `;
    }

    static get button() {
        // language=HTML
        return `
            <div class="configurator-container-toggler">⚙</div>
        `;
    }

    static initEvents() {
        $('.configurator-container-toggler, .configurator-container .close').off('click').on('click', () => { $('.configurator-container').toggleClass('open');});
        $(window).off('scroll.configurator').on('scroll.configurator', () => {
            const offset = 60 - $(window).scrollTop();
            if (offset <= 0) $('.configurator-container .body').css('height', '100%');
            else if (offset < 60) $('.configurator-container .body').css('height', `calc(100% - ${offset}px)`);
            else $('.configurator-container .body').css('height', '');
        });
    }

    static terminate() {
        $(window).off('scroll.configurator');
        $('.configurator-container-toggler').remove();
        $('.configurator-container').remove();
    }
}