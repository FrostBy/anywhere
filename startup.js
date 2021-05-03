(function (events, handler) {
    'use strict';
    Notification.requestPermission()
        .then(permission => { if (!('permission' in Notification)) Notification.permission = permission; }, rejection => {});

    const proposalsWatcher = setInterval(() => {
        const positions = $('.profile-table tbody.ng-star-inserted');

        if (!positions.length) return;
        if ($('.grid-cell-rect').length > 0) initFilters();

        clearInterval(proposalsWatcher);
    }, 1000);

    let idleTime = 0;
    //Increment the idle time counter every minute.
    const idleInterval = setInterval(() => {
        idleTime++;
        if (idleTime >= 5) getProposals(); //5 minutes
        if (idleTime >= 30) window.location.reload(); //30 minutes
    }, 60000); // 1 minute

    //Zero the idle timer on mouse movement.
    $(document).on('mousemove keypress', () => { idleTime = 0; });

    function initFilters() {
        const filters = $(`<div class="filters-container open">`);
        filters
            .append(`<div class='filter new' data-status="new" title="New">0</div>`)
            .append(`<div class='filter offer-preparation' data-status="offer-preparation" title="Offer Preparation">0</div>`)
            .append(`<div class='filter offer-acceptance' data-status="offer-acceptance" title="Offer Acceptance">0</div>`)
            .append(`<div class='filter on-hold' data-status="on-hold" title="On Hold">0</div>`)
            .append(`<div class='filter done' data-status="done" title="Background Check">0</div>`)
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
            $('.filter.done').html($('tbody.background-check').length);
            $('.filter.on-hold').html($('tbody.on-hold').length);
            $('.filter.offer-acceptance').html($('tbody.offer-acceptance').length);
            $('.filter.offer-preparation').html($('tbody.offer-preparation').length);
            $('.filter.new').html($('tbody.new').length);
        }

        function resetFilters() {
            $('.filter.done, .filter.offer-preparation').not('.disabled').trigger('click');
            $('.filter.new.disabled, .filter.offer-acceptance.disabled, .filter.on-hold.disabled').trigger('click');
        }


        $('.reset').on('click', () => {
            resetFilters();
        });

        $('.toggler').on('click', () => {
            $('.filters-container').toggleClass('open');
        });

        $('.filter').on('click', function () {
            $(this).toggleClass('disabled');

            const status = $(this).data('status');
            $('.profile-table tbody.proposal').each(function () {
                if ($(this).data('status') === status) $(this).toggle();
            });
        });

        setClasses();
        calculateStages();
        resetFilters();
    }

    function getProposals() {
        const proposalsURL = 'https://staffing.epam.com/api/b1/positions/153695794/proposals?size=1000&q=staffingStatus=out=(Cancelled,Rejected)';
        const proposalsObjectOld = JSON.parse(GM_getValue('proposals', '{}'));
        const proposalsObject = {};
        const diff = { new: {}, outdated: {}, changed: {} };

        $.get(proposalsURL, function (data) {
            const proposals = data.content;
            let showNotification = false;
            proposals.forEach(proposal => {
                const applicant = proposal.applicant || proposal.employee.applicant;
                const id = applicant.id;
                const status = proposal.advancedStatusDetails.action.name;
                const fullName = applicant.fullName;
                const changed = applicant.lastProcessStatusUpdateDate;

                proposalsObject[id] = { id, status, fullName, changed };
                const proposalOld = proposalsObjectOld[id];
                if (!proposalOld) {
                    diff.new[id] = proposalsObject[id];
                    showNotification = true;
                } else if (new Date(proposalOld.changed) < new Date(changed)) {
                    diff.changed[id] = proposalsObject[id];
                    showNotification = true;
                }
            });

            for (const proposalOld of Object.values(proposalsObjectOld)) {
                if (!proposalsObject[proposalOld.id]) {
                    diff.outdated[proposalOld.id] = proposalOld;
                    showNotification = true;
                }
            }

            GM_setValue('proposals', JSON.stringify(proposalsObject));

            if (showNotification) {
                if (!$('.filters-container .refresh')) {
                    $('.filters-container').append(`<div class='refresh' title="Reload Page">⟳</div>`);
                    $('.filters-container .refresh').on('click', () => window.location.reload());
                }

                if (Notification.permission === 'granted') {
                    const notification = new Notification('Updates for you on the Startup page!', {
                        body: `New: ${ Object.keys(diff.new).length } | Changed: ${ Object.keys(diff.changed).length } | Outdated: ${ Object.keys(diff.outdated).length }`,
                        icon: 'https://www.epam.com/etc/designs/epam-core/favicon/apple-touch-icon.png',
                        vibrate: true,
                    });
                    notification.onclick = () => {
                        window.focus();
                        notification.close();
                    };
                }
            }
        });
    }

    getProposals();
})();