class FilterStartup extends FilterShared {
    static get initialState() {
        return {
            new: false,
            'offer-preparation': true,
            'offer-acceptance': true,
            'on-hold': true,
            done: true,
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
        `;
    }

    calculate() {
        $('.filter.done').html($('tbody.background-check').length);
        $('.filter.on-hold').html($('tbody.on-hold').length);
        $('.filter.offer-acceptance').html($('tbody.offer-acceptance').length);
        $('.filter.offer-preparation').html($('tbody.offer-preparation').length);
        $('.filter.new').html($('tbody.new').length);
    }
}