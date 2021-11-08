class StaffingReport {
    static get dom() {
        // language=HTML
        return `
            <div class="staffing-report sidebar-container">
                <div class='body sidebar'>
                    <button class="close" type="button"><span class="fa fa-close"></span></button>
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
                            <button class="btn refresh" type="button">Refresh</button>
                        </div>
                        <span class="copy" title="Copy to Clipboard">⎘</span>
                    </form>
                </div>
            </div>
        `;
    }

    constructor() {
        this.config = {};
        this.applicants = [];
        this.locations = {};
        this.interviews = {};
        this.api = new services.API();
    }

    init() {
        $('body').append($(StaffingReport.dom));
        services.Dom.Shared.appendButtons($('<div class="staffing-report-toggler" title="Report to Staffing Team">🗪</div>'), 1);
        this.initEvents();
    }

    terminate() {
        $(window).off('scroll.staffingReport');
        $('.staffing-report-toggler').remove();
        $('.staffing-report').remove();
        this.api.terminate();
    }

    initEvents() {
        $('.staffing-report-toggler, .staffing-report .close').on('click', () => { $('.staffing-report').toggleClass('open');});

        $('.staffing-report textarea').on('change', function () {
            const data = $(this).val().replace(/http.*?(?=[,\s])/gi, '<a href="$&" target="_blank">$&</a>').split('\n');
            const div = $('.staffing-report .preview .rows');
            div.empty();
            data.forEach(row => div.append(`<p>${row}</p>`));
        });

        $('.staffing-report .refresh').on('click', () => {
            this.fill(this.config.applicants);
        });

        $('.staffing-report .copy').on('click', () => {
            window.getSelection().selectAllChildren($('.staffing-report .preview').get(0));
            document.execCommand('copy');
        });

        $(window).on('scroll.staffingReport', () => {
            const offset = 60 - $(window).scrollTop();
            if (offset <= 0) $('.staffing-report .body').css('height', '100%');
            else if (offset < 60) $('.staffing-report .body').css('height', `calc(100% - ${offset}px)`);
            else $('.staffing-report .body').css('height', '');
        });
    }

    fill(applicants = []) {
        let value = applicants.map(applicant => `${applicant.fullName} https://staffing.epam.com/applicants/${applicant.id}/taProcess, ${applicant.level}, ${applicant.location}, ${applicant.english}, ${applicant.skill}`).join('\n');
        if (value) $('.staffing-report textarea').val(value).change();
    }


    async get(reportRows, locationIds = [], applicantIds = []) {
        if (!this.applicants.length && locationIds.length && applicantIds.length) {
            this.locations = await this.api.getLocations(locationIds);
            this.interviews = await this.api.getInterviews(applicantIds);
            this.applicants = reportRows.map(row => {
                const location = this.locations[row.locationId];

                if (location) row.location = `${location.name} (${location.isoCode})`;

                const interview = this.interviews[row.id]?.find(interview => interview.name === 'Technical' && interview.status === 'Completed');

                if (interview) {
                    const feedback = interview.interviewFeedback[0];
                    row.english = feedback?.englishLevel?.name || row.english;
                    row.skill = feedback?.primarySkill?.name || row.skill;
                    row.level = feedback?.jobFunction?.name || row.level;
                }

                return row;
            });
        }

        return this.applicants;
    }
}