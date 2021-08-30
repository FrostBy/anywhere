class FilterStartup {
    static get initialState() {
        return {
            new: false,
            'offer-preparation': true,
            'offer-acceptance': true,
            'on-hold': true,
            done: true,
        };
    }

    get state() {
        return this._state;
    }

    set state(data) {
        this._state = JSON.parse(JSON.stringify(data));
    }

    constructor() {
        this._state = JSON.parse(JSON.stringify(FilterStartup.initialState));
        this._init();
    }

    _init() {
        const filters = $(`<div class="filters-container startup open"></div>`);
        filters
            .append(`<div class='filter new' data-status="new" title="New">0</div>`)
            .append(`<div class='filter offer-preparation' data-status="offer-preparation" title="Offer Preparation">0</div>`)
            .append(`<div class='filter offer-acceptance' data-status="offer-acceptance" title="Offer Acceptance">0</div>`)
            .append(`<div class='filter on-hold' data-status="on-hold" title="On Hold">0</div>`)
            .append(`<div class='filter done' data-status="done" title="Background Check">0</div>`)
            .append(`<div class='reset'>Reset</div>`)
            .append(`<div class='toggler open'></div>`);

        $('body').append(filters);

        $('.filters-container .toggler').off('click').on('click', () => $('.filters-container').toggleClass('open'));
    }

    terminate() {
        $('.filters-container').remove();
    }

    unlock() {
        const that = this;

        $('.reset').off('click').on('click', () => this.reset());

        $('.filter').off('click').on('click', function () {
            that.state[$(this).data('status')] = !$(this).hasClass('disabled');
            that.refresh();
        });
    }

    refresh() {
        const that = this;

        $('.filter').each(function () {
            $(this).toggleClass('disabled', that.state[$(this).data('status')]);
        });
        $('.profile-table tbody.proposal').each(function () {
            $(this).toggleClass('hidden', that.state[$(this).data('status')]);
        });
    }

    reset() {
        this.state = FilterStartup.initialState;
        this.refresh();
    }

    calculate() {
        $('.filter.done').html($('tbody.background-check').length);
        $('.filter.on-hold').html($('tbody.on-hold').length);
        $('.filter.offer-acceptance').html($('tbody.offer-acceptance').length);
        $('.filter.offer-preparation').html($('tbody.offer-preparation').length);
        $('.filter.new').html($('tbody.new').length);
    }

    enableRefresh() {
        if (!$('.filters-container .refresh').length) {
            $('.filters-container').append(`<div class='refresh' title="Reload Page">⟳</div>`);
            $('.filters-container .refresh').on('click', () => window.location.reload());
        }
    }
}