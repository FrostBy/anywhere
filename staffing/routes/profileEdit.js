let profileEditRoute;

class ProfileEditRoute {
    static get bodyClass() { return 'profile-edit'; }

    static get route() {
        return 'https://staffing.epam.com/applicant/edit.*';
    }

    static init() {
        if (profileEditRoute) profileEditRoute.terminate();

        profileEditRoute = new this();
        profileEditRoute.init();

        return profileEditRoute;
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

        return {
            salary: {
                function: () => {
                    return $('input[formcontrolname="expectedAmount"]').val() || 0;
                },
                error: { message: 'Empty Salary Expectations' }
            },
            applicantOwner: {
                function: () => {
                    return $('sd-owner-field[formcontrolname="owner"] .selected-option').get(0)?.innerText.trim();
                },
                error: { message: 'Empty Applicant Owner' }
            },
            location: {
                function: () => {
                    return $('sd-location-field[formcontrolname="location"] .selected-option').get(0)?.innerText.trim();
                },
                error: { message: 'Empty location' }
            },
            jobFunction: {
                function: () => {
                    const jobFunction = $('sd-job-function-field[formcontrolname="jobFunction"] .selected-option .ellipsis').get(0)?.innerText.trim();
                    const level = $('sd-job-function-field[formcontrolname="jobFunction"] input[type="radio"]:checked').length;
                    return { jobFunction, level };
                },
                callback: (result, validator) => {
                    if (!result.jobFunction) validator.message(validator.statuses.ERROR, 'Empty Job Function');
                    if (!result.level) validator.message(validator.statuses.ERROR, 'Empty Job Function Level');
                },
                showMessage: false,
            },
            jobFunctionAfterInterview: {
                function: () => {
                    const jobFunction = $('sd-job-function-field[formcontrolname="jobFunctionAfterInterview"] .selected-option .ellipsis').get(0)?.innerText.trim();
                    const level = $('sd-job-function-field[formcontrolname="jobFunctionAfterInterview"] input[type="radio"]:checked').length;
                    return { jobFunction, level };
                },
                callback: (result, validator) => {
                    if (!result.jobFunction) validator.message(validator.statuses.ERROR, 'Empty Job Function (after interview)');
                    if (!result.level) validator.message(validator.statuses.ERROR, 'Empty Job Function Level (after interview)');
                },
                showMessage: false,
            },
            hiringProgram: {
                function: () => {
                    const hiringProgram = $('sd-static-select[formcontrolname="hiringProgram"] .selected-option').get(0)?.innerText.trim();
                    return hiringPrograms.includes(hiringProgram);
                },
                error: { message: `Invalid Hiring Program, allowed values: <br> <ul><li>${hiringPrograms.join('</li><li>')}</li></ul>` }
            },
            placeOfWork: {
                function: () => {
                    const button = $('sd-multi-check-square[formcontrolname="preferredPlaceOfWork"] button.selected').get(0);
                    return button ? placesOfWork.includes(button.innerText) : true;
                },
                error: { message: `Invalid Preferred Place Of Work, allowed values: <br> <ul><li>${placesOfWork.join('</li><li>')}</li></ul>` }
            }
        };
    }

    init() {
        $('body').addClass(this.constructor.bodyClass);

        this.validator = new services.Validator('profileEdit', this.validators, { offset: 119, top: 59 });

        services.Dom.Profile.initButtonsContainer();
        services.Dom.Profile.initFixedHeader();

        this.firstLoad = false;
        services.Dom.Profile.watchRequests(() => this.initTimeout());
    }

    terminate() {
        this.validator.terminate();

        if (this.timeout) clearTimeout(this.timeout);

        services.Dom.Profile.terminate();

        $('body').removeClass(this.constructor.bodyClass);
    }

    initTimeout() {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            services.Salary.initOfferTool();
            services.Salary.initCalculator();
            if (!this.firstLoad) {
                this.firstLoad = true;
                this.validator.init();
            }
        }, 1000);
    }
}