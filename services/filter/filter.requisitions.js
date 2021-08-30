class FilterRequisitions extends FilterShared {
    static get initialState() {
        return {
            empty: false,
            assigned: true,
        };
    }

    static get dom() {
        // language=HTML
        return `
            <div class='filter requisitions empty' data-status="empty" title="Empty">0</div>
            <div class='filter requisitions assigned' data-status="assigned" title="Assigned">0</div>
        `;
    }

    calculate() {
        $('.filter.empty').html($('tbody.empty').not('.hidden-recruiter, .hidden-discipline').length);
        $('.filter.assigned').html($('tbody.assigned').not('.hidden-recruiter, .hidden-discipline').length);
    }
}