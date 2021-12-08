let profileRoute;

class ProfileRoute {
    static get bodyClass() { return 'profile'; }

    static get route() {
        return 'https://staffing.epam.com/applicants/.*';
    }

    static get id() { return window.location.href.match(/(\d+)/)[0]; }

    get id() { return this.constructor.id; }

    static init() {
        if (profileRoute) profileRoute.terminate();

        profileRoute = new this();
        profileRoute.init();

        return profileRoute;
    }

    get validators() {
        const hiringPrograms = [
            'Remote Individual Contractor',
            'Fixed Anywhere',
            'Flex',
            'Flex (off-hour)',
            'Ultra Flex',
        ];
        const placesOfWork = [
            'Remote is preferable',
            'Remote only',
        ];
        const defaultSKills = [
            'JavaScript',
            'Front-End Development',
            'DevOps',
            'Other',
        ];

        return {
            skills: {
                function: async () => {
                    /*const interviews = await this.api.getInterviews([ProfileRoute.id]);
                    const interview = interviews[ProfileRoute.id]?.find(interview => interview.name === 'Technical' && interview.status === 'Completed');

                    if (interview) {
                        const feedback = interview.interviewFeedback[0];
                        const primarySkill = feedback.primarySkill.name;
                        const primarySkillLevel = feedback.primarySkill.skillLevel;

                        const primarySkillContainer = $('.content-table td:textEquals("Primary Skill")').next('td');
                        const skillName = primarySkillContainer.find('.name').get(0)?.innerText;
                        const skillLevel = primarySkillContainer.find('.skill-level').get(0)?.innerText;

                        console.log(primarySkill, primarySkillLevel, skillName, skillLevel);
                    }*/
                    const primarySkill = $('.profile-content').find('td:textEquals("Primary Skill")').next('td').find('.name').get(0)?.innerText.trim();
                    return primarySkill ? !defaultSKills.includes(primarySkill) : false;
                },
                error: { message: `Invalid Primary Skill (default value used)` }
            },
            interviews: {
                function: async (validator) => {
                    const interviews = await this.api.getInterviews([ProfileRoute.id], ['Technical', 'General'], ['Completed']);
                    const technical = interviews[ProfileRoute.id]?.find(interview => interview.name === 'Technical' && moment().diff(interview.interviewDate, 'month') < 6);
                    const general = interviews[ProfileRoute.id]?.find(interview => interview.name === 'General' && moment().diff(interview.interviewDate, 'month') < 6);
                    return { technical: !!technical, general: !!general };
                },
                callback: (result, validator) => {
                    if (!result.technical) validator.message(validator.statuses.ERROR, 'No Up-to-Date Technical Interview');
                    if (!result.general) validator.message(validator.statuses.ERROR, 'No Up-to-Date General Interview');
                },
                showMessage: false,
            },
            cv: {
                function: () => {
                    const attachmentsContainer = $('.applicant-attachments');
                    return attachmentsContainer.find('sd-attachment-item .attachment-icon.cv, sd-attachment-item .attachment-icon.cv-epam').length;
                },
                error: { message: 'No CV' }
            },
            salary: {
                function: () => {
                    const containers = $('.profile-content, .entity-records-columns').find('div:textEquals("Expected Salary (Gross)"), td:textEquals("Expected Salary (Gross)")').next().filter((i, e) => e.innerText.trim());
                    return containers.length;
                },
                error: { message: 'Empty Salary Expectations' }
            },
            applicantOwner: {
                function: () => {
                    const containers = $('.profile-content').find('td:textEquals("Applicant Owner")').next('td').filter((i, e) => e.innerText.trim());
                    return containers.length;
                },
                error: { message: 'Empty Applicant Owner' }
            },
            location: {
                function: () => {
                    const locations = $('.profile-content td:textEquals("Location")').next('td').get(0)?.innerText.split(', ');

                    return locations && locations.length > 1;
                },
                error: { message: 'Invalid location' }
            },
            jobFunction: {
                function: () => {
                    const containers = $('.profile-content').find('td:textEquals("Job Function")').next('td').filter((i, e) => e.innerText.trim());
                    return containers.length;
                },
                error: { message: 'Empty Job Function' }
            },
            jobFunctionAfterInterview: {
                function: () => {
                    const containers = $('.profile-content').find('td:textEquals("Job Function (after interview)")').next('td').filter((i, e) => e.innerText.trim());
                    return containers.length;
                },
                error: { message: 'Empty Job Function (after interview)' }
            },
            hiringProgram: {
                function: () => {
                    const container = $('.profile-content').find('td:textEquals("Hiring Program")').next('td').get(0);
                    if (!container) return true;
                    const hiringProgram = container ? container.innerText.trim() : '';
                    return hiringProgram ? hiringPrograms.includes(hiringProgram) : false;
                },
                error: { message: `Invalid Hiring Program, allowed values: <br> <ul><li>${hiringPrograms.join('</li><li>')}</li></ul>` }
            },
            placeOfWork: {
                function: () => {
                    const placeOfWork = $('.profile-content').find('td:textEquals("Preferred Place Of Work")').next('td').get(0)?.innerText.trim();
                    return placeOfWork ? placesOfWork.includes(placeOfWork) : false;
                },
                error: { message: `Invalid Preferred Place Of Work, allowed values: <br> <ul><li>${placesOfWork.join('</li><li>')}</li></ul>` }
            }
        };
    }

    async init() {
        $('body').addClass(this.constructor.bodyClass);

        services.Dom.Profile.initButtonsContainer();

        this.proposal = new services.Proposal();
        this.report = new services.StaffingReport();
        this.validator = new services.Validator('profile', this.validators);
        this.api = new services.API();

        this.firstLoad = false;
        services.Dom.Profile.watchRequests(() => this.initTimeout());
        services.Dom.Profile.watchNextStep(this.proposal, this.report);

        services.Dom.Profile.markHiringWeek(await this.isHiringWeek());
    }

    terminate() {
        this.validator.terminate();
        this.proposal.terminate();

        if (this.timeout) clearTimeout(this.timeout);

        services.Dom.Profile.terminate();

        $('body').removeClass(this.constructor.bodyClass);
    }

    initTimeout() {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            services.Dom.Profile.initCopyButtons();
            services.Dom.Profile.initRequisitionButton();
            services.Dom.Profile.addInterviewerReportButtons();
            services.Salary.init();
            if (!this.firstLoad) {
                this.firstLoad = true;
                this.validator.init();
            }
        }, 1000);
    }

    async isHiringWeek() {
        const profile = await this.proposal.getApplicant(this.id);
        return !!profile.poolContainerDashboardView?.find(pool => pool.code === 'PC-XX-HREV');
    }
}
