class ConfiguratorShared {
    static get(key, defaultValue = undefined) {
        try {
            return JSON.parse(GM_getValue('config.' + key, defaultValue));
        } catch (e) {
            return defaultValue;
        }
    }

    static set(key, value) {
        GM_setValue('config.' + key, JSON.stringify(value));
        return value;
    }

    static getDom() {
        // language=HTML
        return `
            <div class="configurator-container sidebar-container">
                <div class='toggler'>⚙</div>
                <div class='body sidebar'>
                    <button class="close"><span class="fa fa-close"></span></button>
                    <form id="boards" class="boards applicant-summary__info-container">
                    </form>
                </div>
            </div>
        `;
    }

    static initEvents() {
        $('.configurator-container .toggler, .configurator-container .close').on('click', () => { $('.configurator-container').toggleClass('open');});
        $(window).scroll(function () {
            const offset = 60 - $(window).scrollTop();
            if (offset <= 0) $('.configurator-container .body').css('height', '100%');
            else if (offset < 60) $('.configurator-container .body').css('height', `calc(100% - ${offset}px)`);
            else $('.configurator-container .body').css('height', '');

        });
    }
}