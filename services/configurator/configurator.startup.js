class ConfiguratorStartup extends ConfiguratorShared {
    static get prefix() { return 'startup'; }

    static get boards() {
        return {
            173744973: 'Management (DM, PM, SM)',
            179936142: 'Product Manager',
            179834493: 'Data related (Data Analytics, Big Data, BI, Data Science, ...)',
            173746334: 'C/C++',
            151344207: 'Python',
            170899694: 'UX',
            158060865: 'Functional testing',
            151344300: 'Automated Testing (AQA/SET/Performance/Security testing)',
            155128324: 'Mobile (iOS, Obj-C, Android, Xamarin, Flutter, ...)',
            154149104: 'Business Analyst (BA, PO)',
            153695794: 'FED&JS (JS, Node.js, React, ReactNative, Angular)',
            151345255: 'DevOps (DevOps, Cloud, Support, ...)',
            149309627: 'JAVA (JAVA, SAP hybris, ...)',
            149309623: 'Microsoft .Net',
            194540321: 'Microsoft Dynamics (365 ERP/AX; 365 CRM; Nav)',
            194325869: 'RoR',
            151344586: 'Other Skills (SAP, PERL, GoLAng, ... )',
        };
    }

    static splitArr(arr2) {
        const arr1 = arr2.splice(0, Math.ceil(arr2.length / 2));
        return [arr1, arr2];
    }

    static init() {
        let boards = services.Config.get(this.key('boards'));
        if (typeof boards !== 'object' || !Object.keys(boards).length) boards = services.Config.set(this.key('boards'), this.boards);

        let allBoards = this.boards;
        const boardsCustom = services.Config.get(this.key('boardsCustom'), {});
        if (typeof boardsCustom === 'object') allBoards = Object.assign(allBoards, boardsCustom);

        const activeBoardsIds = Object.keys(boards);
        const boardsFields = Object.keys(allBoards).map(id => {
            return $(`<div class="input-wrapper"><input type="checkbox" value="${id}" id="board_${id}" ${activeBoardsIds.includes(id) ? 'checked="true"' : null}"><label for="board_${id}">${allBoards[id]}</label></div>`);
        });

        const configurator = $(services.Configurator.Shared.getDom());

        const [fields1, fields2] = this.splitArr(boardsFields);
        configurator.find('form').empty()
            .append($('<div class="applicant-summary__info-container-block"></div>').append(fields1))
            .append($('<div class="applicant-summary__info-container-block"></div>').append(fields2));

        configurator.find('form input').on('change', function () {
            if ($(this).prop('checked')) boards[$(this).val()] = allBoards[$(this).val()];
            else delete boards[$(this).val()];
            services.Config.set(ConfiguratorStartup.key('boards'), boards);
        });

        $('body').append(configurator);
        services.Configurator.Shared.initEvents();
    }

    static processBoard() {
        let ids = Object.keys(services.Config.get(this.key('boards'))).concat(Object.keys(services.Config.get('boardsCustom', {})));
        if (ids.some(board => window.location.href.indexOf(board))) return true;
    }
}