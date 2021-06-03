class FilterStartup {
    static get initialState() {
        return {
            done: true,
            'offer-preparation': true,
            new: false,
            'offer-acceptance': false,
            'on-hold': false
        };
    }

    static get state() {
        return state;
    }

    static set state(data) {
        state = JSON.parse(JSON.stringify(data));
    }

    static init() {
        const filters = $(`<div class="filters-container open"></div>`);
        filters
            .append(`<div class='filter new' data-status="new" title="New">0</div>`)
            .append(`<div class='filter offer-preparation' data-status="offer-preparation" title="Offer Preparation">0</div>`)
            .append(`<div class='filter offer-acceptance' data-status="offer-acceptance" title="Offer Acceptance">0</div>`)
            .append(`<div class='filter on-hold' data-status="on-hold" title="On Hold">0</div>`)
            .append(`<div class='filter done' data-status="done" title="Background Check">0</div>`)
            .append(`<div class='reset'>Reset</div>`)
            .append(`<div class='toggler open'></div>`);

        $('body').append(filters);

        $('.filters-container .toggler').on('click', () => $('.filters-container').toggleClass('open'));
    }

    static unlock() {
        $('.reset').on('click', () => this.reset());

        $('.filter').on('click', function () {
            FilterStartup.state[$(this).data('status')] = !$(this).hasClass('disabled');
            FilterStartup.refresh();
        });
    }

    static refresh() {
        $('.filter').each(function () {
            $(this).toggleClass('disabled', state[$(this).data('status')]);
        });
        $('.profile-table tbody.proposal').each(function () {
            $(this).toggleClass('hidden', state[$(this).data('status')]);
        });
    }

    static reset() {
        this.state = this.initialState;
        this.refresh();
    }

    static calculate() {
        $('.filter.done').html($('tbody.background-check').length);
        $('.filter.on-hold').html($('tbody.on-hold').length);
        $('.filter.offer-acceptance').html($('tbody.offer-acceptance').length);
        $('.filter.offer-preparation').html($('tbody.offer-preparation').length);
        $('.filter.new').html($('tbody.new').length);
    }

    static enableRefresh() {
        if (!$('.filters-container .refresh').length) {
            $('.filters-container').append(`<div class='refresh' title="Reload Page">⟳</div>`);
            $('.filters-container .refresh').on('click', () => window.location.reload());
        }
    }
}

let state = JSON.parse(JSON.stringify(FilterStartup.initialState));
