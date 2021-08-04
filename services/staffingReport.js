let config = {};

class StaffingReport {
    static get config() {
        return config;
    }

    static set config(data) {
        config = data;
    }

    static getDom() {
        // language=HTML
        return `
            <div class="staffing-report sidebar-container">
                <div class='toggler' title='Report to Staffing Team'>🗪</div>
                <div class='body sidebar'>
                    <button class="close"><span class="fa fa-close"></span></button>
                    <form class="boards applicant-summary__info-container">
                        <div class="preview applicant-summary__info-container-block">
                            <div><span style="background-color:#9ed267;">Для информации:</span></div>
                            <div class="rows">
                                <p>&nbsp;</p>
                            </div>
                        </div>
                        <div class="editor applicant-summary__info-container-block">
                            <textarea></textarea>
                        </div>
                        <div class="applicant-summary__last-updated-info button">
                            <button class="btn">Refresh</button>
                        </div>
                        <span class="copy" title="Copy to Clipboard">⎘</span>
                    </form>
                </div>
            </div>
        `;
    }

    static initEvents() {
        $('.staffing-report .toggler, .staffing-report .close').on('click', () => { $('.staffing-report').toggleClass('open');});

        $('.staffing-report textarea').on('change', function () {
            const data = $(this).val().replace(/http.*?(?=[,\s])/gi, '<a href="$&" target="_blank">$&</a>').split('\n');
            const div = $('.staffing-report .preview .rows');
            div.empty();
            data.forEach(row => div.append(`<p>${row}</p>`));
        });

        $('.staffing-report button').on('click', (e) => {
            e.preventDefault();
            StaffingReport.fill(StaffingReport.config.applicants);
        });

        $('.staffing-report .copy').on('click', (e) => {
            window.getSelection().selectAllChildren($('.staffing-report .preview').get(0));
            document.execCommand('copy');
        });

        $(window).scroll(function () {
            const offset = 60 - $(window).scrollTop();
            if (offset <= 0) $('.staffing-report .body').css('height', '100%');
            else if (offset < 60) $('.staffing-report .body').css('height', `calc(100% - ${offset}px)`);
            else $('.staffing-report .body').css('height', '');
        });
    }

    static init() {
        const configurator = $(StaffingReport.getDom());
        $('body').append(configurator);
        StaffingReport.initEvents();
    }

    static fill(applicants = []) {
        let value = applicants.map(applicant => `${applicant.fullName} https://staffing.epam.com/applicants/${applicant.id}/taProcess, ${applicant.level}, ${applicant.location}, ${applicant.english}, ${applicant.skill}`).join('\n');
        if (value) $('.staffing-report textarea').val(value).change();
    }
}