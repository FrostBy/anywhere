class FilterContainers {
    static get initialState() {
        return {
            new: false,
            empty: false,
            assigned: true,
            outdated: true,
        };
    }

    get state() {
        return this._state;
    }

    set state(data) {
        this._state = JSON.parse(JSON.stringify(data));
    }

    constructor() {
        this._state = JSON.parse(JSON.stringify(FilterContainers.initialState));
        this._init();
    }

    _init() {
        const filters = $(`<div class="filters-container containers open"></div>`);
        filters
            .append(`<div class='filter requisitions empty' data-status="empty" title="Empty">0</div>`)
            .append(`<div class='filter requisitions assigned' data-status="assigned" title="Assigned">0</div>`)
            .append(`<div class='filter containers new' data-status="new" title="New">0</div>`)
            .append(`<div class='filter containers outdated' data-status="outdated" title="Outdated">0</div>`)
            .append(`<div class='reset'>Reset</div>`)
            .append(`<div class='toggler open'></div>`);

        filters.find('.filter').hide();

        $('body').append(filters);

        $('.filters-container .toggler').on('click', () => $('.filters-container').toggleClass('open'));

        setInterval(() => {
            const location = window.location.href;
            if (location.match(/hiringContainers\/\d+/)) {
                $('.filter.containers:visible').hide();
                $('.filter.requisitions:hidden').show();
            } else {
                $('.filter.containers:hidden').show();
                $('.filter.requisitions:visible').hide();
            }
        }, 500);
    }

    terminate() {
        $('.filters-container').remove();
    }

    unlock() {
        const that = this;

        $('.reset').on('click', () => this.reset());

        $('.filter').on('click', function () {
            that.state[$(this).data('status')] = !$(this).hasClass('disabled');
            that.refresh();
        });
    }

    refresh() {
        const that = this;

        $('.filter').each(function () {
            $(this).toggleClass('disabled', that.state[$(this).data('status')]);
        });
        $('.profile-table tbody.requisition, .dashboard-table tbody.container').each(function () {
            $(this).toggleClass('hidden', that.state[$(this).data('status')]);
        });
    }

    reset() {
        this.state = FilterContainers.initialState;
        this.refresh();
    }

    calculate() {
        $('.filter.empty').html($('tbody.empty').not('.hidden-recruiter, .hidden-discipline').length);
        $('.filter.assigned').html($('tbody.assigned').not('.hidden-recruiter, .hidden-discipline').length);
        $('.filter.new').html($('tbody.new').length);
        $('.filter.outdated').html($('tbody.outdated').length);
    }

    enableRefresh() {
        if (!$('.filters-container .refresh').length) {
            $('.filters-container').append(`<div class='refresh' title="Reload Page">⟳</div>`);
            $('.filters-container .refresh').on('click', () => window.location.reload());
        }
    }
}