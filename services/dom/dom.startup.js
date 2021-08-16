class DomStartup extends DomShared {
    static setClasses() {
        $('.profile-table tbody:has(span[title="Backup Consideration"])')
            .addClass('proposal backup-consideration new')
            .data('status', 'new');
        $('.profile-table tbody:has(span[title="RM Candidate Consideration"])')
            .addClass('proposal rm-candidate-consideration new')
            .data('status', 'new');
        $('.profile-table tbody:has(span[title="Select Action"])')
            .addClass('proposal select-action new')
            .data('status', 'new');
        $('.profile-table tbody:has(span[title="On Hold"])')
            .addClass('proposal on-hold')
            .data('status', 'on-hold');
        $('.profile-table tbody:has(span[title="Technical Interview"])')
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

    static setRequisitionStatus(requisitions) {
        $('.profile-table tbody.proposal').each(function () {
            $(this).find('.requisitions').remove();
            const id = $(this).find('.applicant-link a, .candidate__info-link a').attr('href').split('/').pop();
            if (requisitions[id]) {
                const container = $('<div></div>').addClass('requisitions');
                requisitions[id].declined.forEach(requisition => {
                    container.append($(`<span class="requisition declined" title="${requisition.status} | ${requisition.jobFunction}">`));
                });
                requisitions[id].accepted.forEach(requisition => {
                    container.append($(`<span class="requisition accepted" title="${requisition.status} | ${requisition.jobFunction}">`));
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
}
