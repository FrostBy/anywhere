class DomStartup extends DomShared {
    static setClasses() {
        $('.profile-table tbody').each(function () {
            $(this).addClass('proposal');
            $(this).data('properties', new Set());

            const status = $(this).find('.staffing-status span').attr('title');

            switch (status) {
                case 'Backup Consideration':
                    $(this).addClass('backup-consideration new').data('properties').add('new');
                    break;
                case 'RM Candidate Consideration':
                    $(this).addClass('rm-candidate-consideration new').data('properties').add('new');
                    break;
                case 'Select Action':
                    $(this).addClass('select-action new').data('properties').add('new');
                    break;
                case 'On Hold':
                    $(this).addClass('on-hold').data('properties').add('on-hold');
                    break;
                case 'Technical Interview':
                    $(this).addClass('technical-interview on-hold').data('properties').add('on-hold');
                    break;
                case 'General Feedback':
                    $(this).addClass('general-feedback on-hold').data('properties').add('on-hold');
                    break;
                case 'Offer Preparation':
                    $(this).addClass('offer-preparation').data('properties').add('offer-preparation');
                    break;
                case 'Offer Acceptance':
                    $(this).addClass('offer-acceptance').data('properties').add('offer-acceptance');
                    break;
                case 'Background Check':
                    $(this).addClass('background-check done').data('properties').add('done');
                    break;
                default:
                    $(this).addClass('unknown new').data('properties').add('new');
                    break;
            }
        });
    }

    static setOfferStatus(offers) {
        $('.profile-table tbody.proposal').each(function () {
            $(this).find('.offers').remove();
            const id = $(this).find('.applicant-link a, .candidate__info-link a').attr('href').split('/').pop();

            if (offers[id]) {
                const container = $('<div></div>').addClass('offers');
                offers[id].declined.forEach(offer => {
                    container.append($(`<span class="offer declined" title="${offer.status} | ${offer.jobFunction}">`));
                });
                offers[id].accepted.forEach(requisition => {
                    container.append($(`<span class="offer accepted" title="${requisition.status} | ${requisition.jobFunction}">`));
                });
                $(this).find('.candidate__applicant-icons').append(container);
            }
        });
    }

    static markProposals(diff) {
        const newProposals = Object.keys(diff.new);
        const changedProposals = Object.keys(diff.changed);
        const outdatedProposals = Object.keys(diff.outdated);

        $('.profile-table tbody.proposal').each(function () {
            $(this).removeClass('mark mark-changed mark-new mark-outdated');
            const id = $(this).find('.applicant-link a, .candidate__info-link a').attr('href').split('/').pop();
            if (newProposals.includes(id)) $(this).addClass('mark mark-new');
            else if (changedProposals.includes(id)) $(this).addClass('mark mark-changed');
            else if (outdatedProposals.includes(id)) $(this).addClass('mark mark-outdated');
        });
    }

    static setJobFunction(proposals) {
        $('.profile-table tbody.proposal').each(function () {
            $(this).find('.job-function').remove();
            const id = $(this).find('.applicant-link a, .candidate__info-link a').attr('href').split('/').pop();
            if (proposals[id]?.jobFunction) {
                const jobFunction = proposals[id].jobFunction;
                $(this).find('.candidate__applicant-icons').append($(`<span title="${jobFunction.name}">${jobFunction.seniorityTrack}${jobFunction.level}</span>`).addClass('job-function'));
            }
        });
    }

    static initGetDataButton(onClick = () => {}) {
        this.appendButtons($('<div class="force-update-data" title="Request data">⇄</div>'), 2);
        $('.force-update-data').off('click').on('click', async () => {
            this.toggleSpinner(true);
            onClick();
            this.toggleSpinner(false);
        });
    }

    static terminate() {
        super.terminate();
        $('.force-update-offers').remove();
    }
}
