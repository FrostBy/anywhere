(function (events, handler) {
    'use strict';

    let positionsArray = [];

    const positionsInterval = setInterval(() => {
        const positions = $('.profile-table tbody.ng-star-inserted');

        if (!positions.length) return;
        if ($('.grid-cell-rect').length > 0) initFilters();

        clearInterval(positionsInterval);
    }, 1000);

    let idleTime = 0;
    //Increment the idle time counter every minute.
    const idleInterval = setInterval(() => {
        idleTime++;
        if (idleTime >= 30) window.location.reload(); //30 minutes
    }, 60000); // 1 minute

    //Zero the idle timer on mouse movement.
    $(document).on('mousemove keypress', () => { idleTime = 0; });

    function initFilters() {
        const filters = $('<div class="filters-container open">');
        filters
            .append(`<div class='filter new' data-status="new">0</div>`)
            .append(`<div class='filter offer-preparation' data-status="offer-preparation">0</div>`)
            .append(`<div class='filter offer-acceptance' data-status="offer-acceptance">0</div>`)
            .append(`<div class='filter on-hold' data-status="on-hold">0</div>`)
            .append(`<div class='filter done' data-status="done">0</div>`)
            .append(`<div class='reset'>Reset</div>`)
            .append(`<div class='toggler open'></div>`);

        $('body').append(filters);

        function setClasses() {
            $('.profile-table tbody:has(span[title="Backup Consideration"])')
                .addClass('proposal backup-consideration new')
                .data('status', 'new');
            $('.profile-table tbody:has(span[title="Select Action"])')
                .addClass('proposal select-action new')
                .data('status', 'new');
            $('.profile-table tbody:has(span[title="On Hold"])')
                .addClass('proposal on-hold')
                .data('status', 'on-hold');
            $('.profile-table tbody:has(span[title="Offer Preparation"])')
                .addClass('proposal offer-preparation')
                .data('status', 'offer-preparation');
            $('.profile-table tbody:has(span[title="Offer Acceptance"])')
                .addClass('proposal offer-acceptance')
                .data('status', 'offer-acceptance');
            $('.profile-table tbody:has(span[title="Background Check"])')
                .addClass('proposal background-check done')
                .data('status', 'done');
        }

        function calculateStages() {
            $('.filter.done')
                .html($('tbody.background-check').length)
                .prop('title', 'Background Check');
            $('.filter.on-hold')
                .html($('tbody.on-hold').length)
                .prop('title', 'On Hold');
            $('.filter.offer-acceptance')
                .html($('tbody.offer-acceptance').length)
                .prop('title', 'Offer Acceptance');
            $('.filter.offer-preparation')
                .html($('tbody.offer-preparation').length)
                .prop('title', 'Offer Preparation');
            $('.filter.new')
                .html($('tbody.new').length)
                .prop('title', 'New')
        }

        function resetFilters() {
            $('.filter.done, .filter.offer-preparation').not('.disabled').trigger('click');
            $('.filter.new.disabled, .filter.offer-acceptance.disabled, .filter.on-hold.disabled').trigger('click');
        }


        $('.reset').on('click', () => {
            resetFilters();
        })

        $('.toggler').on('click', () => {
            $('.filters-container').toggleClass('open');
        })

        $('.filter').on('click', function () {
            $(this).toggleClass('disabled');

            const status = $(this).data('status');
            $('.profile-table tbody').each(function () {
                if ($(this).data('status') === status) $(this).toggle();
            })
        });

        setClasses();
        calculateStages();
        resetFilters();
    }
})();