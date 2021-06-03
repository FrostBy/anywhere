class FilterContainers {
    static get initialState() {
        return {
            empty: false,
            assigned: true,
            new: false,
            outdated: true,
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

    static unlock() {
        $('.reset').on('click', () => this.reset());

        $('.filter').on('click', function () {
            FilterContainers.state[$(this).data('status')] = !$(this).hasClass('disabled');
            FilterContainers.refresh();
        });
    }

    static refresh() {
        $('.filter').each(function () {
            $(this).toggleClass('disabled', state[$(this).data('status')]);
        });
        $('.profile-table tbody.requisition, .dashboard-table tbody.container').each(function () {
            $(this).toggleClass('hidden', state[$(this).data('status')]);
        });
    }

    static reset() {
        this.state = this.initialState;
        this.refresh();
    }

    static calculate() {
        $('.filter.empty').html($('tbody.empty').not('.hidden-recruiter, .hidden-discipline').length);
        $('.filter.assigned').html($('tbody.assigned').not('.hidden-recruiter, .hidden-discipline').length);
        $('.filter.new').html($('tbody.new').length);
        $('.filter.outdated').html($('tbody.outdated').length);
    }

    static enableRefresh() {
        if (!$('.filters-container .refresh').length) {
            $('.filters-container').append(`<div class='refresh' title="Reload Page">⟳</div>`);
            $('.filters-container .refresh').on('click', () => window.location.reload());
        }
    }
}

let state = JSON.parse(JSON.stringify(FilterContainers.initialState));
