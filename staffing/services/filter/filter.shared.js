class FilterShared {
    static get tableClass() {
        return '.data-table';
    }

    static get initialState() {
        return {};
    }

    get state() {
        return this._state;
    }

    set state(data) {
        this._state = JSON.parse(JSON.stringify(data));
    }

    constructor() {
        this._state = JSON.parse(JSON.stringify(this.constructor.initialState));
        this._init();
    }

    static get dom() {
        // language=HTML
        return `
            <div class='reset'>Reset</div>
            <div class='toggler open'></div>
            <div class="sub-filters"></div>`;
    }

    _init() {
        const filters = $(`<div class="filters-container open"></div>`);
        filters.append(this.constructor.dom);

        $('body').append(filters);

        $('.filters-container .toggler').off('click.toggle').on('click.toggle', () => $('.filters-container').toggleClass('open'));
    }

    terminate() {
        $('.filters-container').remove();
    }

    unlock() {
        const that = this;

        $('.reset').off('click.reset').on('click.reset', () => this.reset());

        $('.filter').off('click.filter').on('click.filter', function () {
            that.state[$(this).data('status')] = !$(this).hasClass('disabled');
            that.refresh();
        });

        $('.sub-filters input').off('change.filter').on('change.filter', function () {
            that.state[$(this).data('status')] = !$(this).prop('checked');
            that.refresh();
        });
    }

    refresh() {
        const that = this;

        $('.filter').each(function () {
            $(this).toggleClass('disabled', that.state[$(this).data('status')]);
        });

        $('.sub-filters input').each(function () {
            const parentEnabled = !that.state[$(this).data('for')];
            $(this).prop('checked', parentEnabled && !that.state[$(this).data('status')]);
            $(this).parent('.input-wrapper').toggleClass('hidden', !parentEnabled);
        });

        $(`${this.constructor.tableClass} tbody`).each(function () {
            const isHidden = Object.keys(that.state).some(status => that.state[status] && $(this).data('properties').has(status));
            $(this).toggleClass('hidden', isHidden);
        });

        $('.sub-filters').toggleClass('hidden', !$('.sub-filters .input-wrapper:not(.hidden)').length);
    }

    reset() {
        this.state = this.constructor.initialState;
        this.refresh();
    }

    calculate() {}

    enableRefresh() {
        if (!$('.filters-container .refresh').length) {
            $('.filters-container').append(`<div class='refresh' title="Reload Page">⟳</div>`);
        }
        $('.filters-container .refresh').off('click.refresh').on('click.refresh', () => window.location.reload());
    }
}