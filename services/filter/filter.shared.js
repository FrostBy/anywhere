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
        return ``;
    }

    _init() {
        const filters = $(`<div class="filters-container open"></div>`);
        filters.append(this.constructor.dom);
        // language=HTML
        filters.append(`
            <div class='reset'>Reset</div>
            <div class='toggler open'></div>
        `);

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
    }

    refresh() {
        const that = this;

        $('.filter').each(function () {
            $(this).toggleClass('disabled', that.state[$(this).data('status')]);
        });
        $(`${this.constructor.tableClass} tbody`).each(function () {
            $(this).toggleClass('hidden', that.state[$(this).data('status')]);
        });
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