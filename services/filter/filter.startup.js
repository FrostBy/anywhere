class FilterStartup extends FilterShared {
    static get initialState() {
        return {
            new: false,
            'offer-preparation': true,
            'offer-acceptance': true,
            'on-hold': true,
            done: true,

            employee_done: false,
            applicant_done: false
        };
    }

    static get dom() {
        // language=HTML
        return `
            <div class='filter new' data-status="new" title="New">0</div>
            <div class='filter offer-preparation' data-status="offer-preparation" title="Offer Preparation">0</div>
            <div class='filter offer-acceptance' data-status="offer-acceptance" title="Offer Acceptance">0</div>
            <div class='filter on-hold' data-status="on-hold" title="On Hold">0</div>
            <div class='filter done' data-status="done" title="Background Check">0</div>
            ${super.dom}
        `;
    }

    static get subFiltersDom() {
        // language=HTML
        return `
            <form>
                <div class="input-wrapper">
                    <input type="checkbox" value="applicant" data-status="applicant_done" data-for='done' checked>
                    <label>Applicants</label>
                </div>
                <div class="input-wrapper">
                    <input type="checkbox" value="employee" data-status="employee_done" data-for='done' checked>
                    <label>Employees</label>
                </div>
            </form>`;
    }

    _init() {
        super._init();
        const subFilters = $(`.filters-container .sub-filters`);
        subFilters.append(this.constructor.subFiltersDom);
    }

    calculate() {
        $('.filter.done').html($('tbody.background-check').length);
        $('.filter.on-hold').html($('tbody.on-hold').length);
        $('.filter.offer-acceptance').html($('tbody.offer-acceptance').length);
        $('.filter.offer-preparation').html($('tbody.offer-preparation').length);
        $('.filter.new').html($('tbody.new').length);
    }

    setEmployees(proposals) {
        const employeeIds = [];
        Object.values(proposals).forEach(proposal => {
            if (!proposal.hired) return;

            employeeIds.push(proposal.id);
            if (proposal.employeeId) employeeIds.push(proposal.employeeId);
        });
        $('.profile-table tbody:has(span[title="Background Check"])').each(function () {
            const id = $(this).find('.applicant-link a, .candidate__info-link a').attr('href').split('/').pop();
            if (employeeIds.includes(id)) $(this).data('properties').add('employee_done');
            else $(this).data('properties').add('applicant_done');
        });
    }
}