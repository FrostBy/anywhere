class FilterContainers extends FilterShared {
    static get initialState() {
        return {
            new: false,
            outdated: true,
        };
    }

    static get dom() {
        // language=HTML
        return `
            <div class='filter containers new' data-status="new" title="New">0</div>
            <div class='filter containers outdated' data-status="outdated" title="Outdated">0</div>
            ${super.dom}
        `;
    }

    calculate() {
        $('.filter.new').html($('tbody.new').length);
        $('.filter.outdated').html($('tbody.outdated').length);
    }
}