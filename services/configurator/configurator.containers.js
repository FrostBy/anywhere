let locationBase = window.location.href;
let watcher;

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

    static init() {
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

        $('body').append(configuratorDOM);

        $('.configurator-container .toggler, .configurator-container .close').on('click', () => { $('.configurator-container').toggleClass('open');});

        $(window).scroll(function () {
            if ($(window).scrollTop() <= 60) $('.configurator-container .body').css('top', 60 - $(window).scrollTop());
            else $('.configurator-container .body').css('top', 0);
        });
    }

    static watch() {
        if (watcher) clearInterval(watcher);
        watcher = setInterval(() => {
            const location = window.location.href;

            if (location === locationBase) return;
            locationBase = location;

            if (location.match(/hiringContainers\/\d+/)) {
                $('.configurator-container:hidden').show();
                ConfiguratorContainers.refreshForm();
            } else $('.configurator-container:visible').hide();
        }, 500);
    }

    static refreshForm() {
        const recruiters = {};
        const disciplines = {};

        const disciplineIndex = $('.profile-table thead th:has(div[title="Primary Skill"])').index();
        const recruiterIndex = $('.profile-table thead th:has(div[title="Primary Recruiter"])').index();

        $('.profile-table tbody.requisition').each(function () {
            const discipline = $(this).find('td').eq(disciplineIndex).text();
            const recruiter = $(this).find('td').eq(recruiterIndex).text();

            if (!disciplines[discipline]) disciplines[discipline] = [];
            if (!recruiters[recruiter]) recruiters[recruiter] = [];

            disciplines[discipline].push($(this));
            recruiters[recruiter].push($(this));
        });

        const recruitersArray = Object.keys(recruiters);
        const disciplinesArray = Object.keys(disciplines);

        const activeRecruiters = new Set(this.get('recruiters', recruitersArray));
        const activeDisciplines = new Set(this.get('disciplines', disciplinesArray));

        const hiddenRecruiters = new Set(recruitersArray.filter(recruiter => !activeRecruiters.has(recruiter)));
        const hiddenDisciplines = new Set(disciplinesArray.filter(discipline => !activeDisciplines.has(discipline)));

        $('.profile-table tbody.requisition').each(function () {
            $(this).toggleClass('hidden-recruiter', hiddenRecruiters.has($(this).find('td').eq(recruiterIndex).text()));
            $(this).toggleClass('hidden-discipline', hiddenDisciplines.has($(this).find('td').eq(disciplineIndex).text()));
        });

        const recruitersDom = recruitersArray.sort().map(recruiter => {
            const id = recruiter.replace(' ', '_').toLowerCase();
            // language=HTML
            return $(`
                <div class="input-wrapper recruiter">
                    <input type="checkbox" value="${recruiter}" id="recruiter_${id}" class="recruiter"
                           ${activeRecruiters.has(recruiter) ? 'checked="true"' : null}">
                    <label for="recruiter_${id}">${recruiter}</label>
                </div>`);
        });

        const disciplinesDom = disciplinesArray.sort().map(discipline => {
            const id = discipline.replace(' ', '_').toLowerCase();
            // language=HTML
            return $(`
                <div class="input-wrapper">
                    <input type="checkbox" value="${discipline}" id="discipline_${id}" class="discipline"
                           ${activeDisciplines.has(discipline) ? 'checked="true"' : null}">
                    <label for="discipline_${id}">${discipline}</label>
                </div>`);
        });

        $('.configurator-container form').empty()
            .append($('<div class="applicant-summary__info-container-block"></div>').append(recruitersDom))
            .append($('<div class="applicant-summary__info-container-block"></div>').append(disciplinesDom))
            .find('input')
            .on('change', function () {
                const checked = $(this).prop('checked');
                const value = $(this).val();
                const requisitions = recruiters[value] || disciplines[value];
                if ($(this).is('.recruiter')) {
                    if (checked) activeRecruiters.add($(this).val());
                    else activeRecruiters.delete($(this).val());

                    requisitions.forEach(requisition => requisition.toggleClass('hidden-recruiter', !checked));
                    ConfiguratorContainers.set('recruiters', [...activeRecruiters]);
                } else {
                    if (checked) activeDisciplines.add($(this).val());
                    else activeDisciplines.delete($(this).val());

                    requisitions.forEach(requisition => requisition.toggleClass('hidden-discipline', !checked));
                    ConfiguratorContainers.set('disciplines', [...activeDisciplines]);
                }
                services.Filter.calculate();
            });
    }
}