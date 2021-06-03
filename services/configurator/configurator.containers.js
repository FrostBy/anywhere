class ConfiguratorContainers {
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

    static splitArr(arr2) {
        const arr1 = arr2.splice(0, Math.ceil(arr2.length / 2));
        return [arr1, arr2];
    }

    static init() {
        return;
        let containers = this.get('containers', {});
        if (typeof containers !== 'object') containers = this.set('containers', {});

        // language=HTML
        const configuratorDOM = `
            <div class="configurator-container">
                <div class='toggler'>⚙</div>
                <div class='body'>
                    <button class="close"><span class="fa fa-close"></span></button>
                    <form id="boards" class="containers applicant-summary__info-container">
                    </form>
                </div>
            </div>`;

        let allBoards = this.boards;
        const containersCustom = this.get('containersCustom', {});
        if (typeof containersCustom === 'object') allBoards = Object.assign(allBoards, containersCustom);

        const activecontainersIds = Object.keys(containers);
        const boardsFields = Object.keys(allBoards).map(id => {
            return $(`<div class="input-wrapper"><input type="checkbox" value="${id}" id="container_${id}" ${activecontainersIds.includes(id) ? 'checked="true"' : null}"><label for="board_${id}">${allBoards[id]}</label></div>`);
        });

        const configurator = $(configuratorDOM);

        const [fields1, fields2] = this.splitArr(boardsFields);
        configurator.find('form')
            .append($('<div class="applicant-summary__info-container-block"></div>').append(fields1))
            .append($('<div class="applicant-summary__info-container-block"></div>').append(fields2));

        configurator.find('form input').on('change', function () {
            if ($(this).prop('checked')) containers[$(this).val()] = allBoards[$(this).val()];
            else delete containers[$(this).val()];
            Configurator.set('boards', containers);
        });

        $('body').append(configurator);

        $('.configurator-container .toggler, .configurator-container .close').on('click', function () { $('.configurator-container').toggleClass('open');});
        $(window).scroll(function () {
            if ($(window).scrollTop() <= 60) $('.configurator-container .body').css('top', 60 - $(window).scrollTop());
            else $('.configurator-container .body').css('top', 0);
        });
    }
}