let requisitionEditRoute;

class RequisitionEditRoute {
    static get bodyClass() { return 'requisition-edit'; }

    static get route() {
        return 'https://staffing.epam.com/requisition/edit*';
    }

    static get stepsData() {
        return Object.fromEntries(new URLSearchParams(location.search));
    }

    static init() {
        if (requisitionEditRoute) requisitionEditRoute.terminate();

        requisitionEditRoute = new this();
        requisitionEditRoute.init();

        return requisitionEditRoute;
    }

    static get formDom() {
        let primarySkill = services.Config.get(services.Wizard.key('primarySkill'), '');
        let unit = services.Config.get(services.Wizard.key('unit'), '');

        $('[formcontrolname="primarySkill"] .form-entry').data('default-value', primarySkill);
        $('[formcontrolname="unit"] .form-entry').data('default-value', unit);

        // language=HTML
        return `
            <div class="predefined-fields">
                <h5 class="title">Default Values</h5>
                <form>
                    <div class="form-entry">
                        <label class="form-entry-label">Primary Skill</label>
                        <div class="form-entry-field">
                            <input class="form-entry-input" name="primarySkill" value="${primarySkill}" />
                        </div>
                    </div>
                    <div class="form-entry">
                        <label class="form-entry-label">Unit</label>
                        <div class="form-entry-field">
                            <input class="form-entry-input" name="unit" value="${unit}" />
                        </div>
                    </div>
                </form>
            </div>
        `;
    }

    init() {
        $('body').addClass(this.constructor.bodyClass);
        services.Dom.Shared.initFixedHeader();

        const steps = ['jobFunction', 'level', 'title', 'candidate', 'recruiter', 'primarySkill', 'unit'];

        const fields = {
            jobFunction: $('[formcontrolname="jobFunction"] .form-entry:eq(0)'),
            unit: $('[formcontrolname="unit"] .form-entry'),
            recruiter: $('[formcontrolname="primaryRecruiter"] .form-entry'),
            primarySkill: $('[formcontrolname="primarySkill"] .form-entry'),
            candidate: $('[formcontrolname="headline"] .form-entry'),
            level: (value) => {
                const form = $('[formcontrolname="jobFunction"] .ng-star-inserted .form-entry').addClass('current');
                const radioList = form.find('.form-entry-field label');
                radioList.each(function () {
                        if (this.innerText === 'L' + value) $(this).find('input').scrollTo(200).triggerRawMouse('click');
                    }
                );
            },
            title: $('[formcontrolname="title"] .form-entry')
        };
        this.wizard = new services.Wizard(fields, steps, this.constructor.stepsData);
        this.wizard.init();

        this.initWizardForm();
    }

    initWizardForm() {
        $('.wizard').append(this.constructor.formDom);
        $('.wizard .predefined-fields input').off('change input paste').on('change input paste', function () {
            services.Config.set(services.Wizard.key($(this).attr('name')), $(this).val());
            $(`[formcontrolname="${$(this).attr('name')}"] .form-entry`).data('default-value', $(this).val());
        });
    }

    terminate() {
        this.wizard.terminate();
    }
}