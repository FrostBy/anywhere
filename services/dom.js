let handleEventBase = () => {};

class Dom {
    static watchRequests(handleEvent = () => {}) {
        this.unWatch();
        handleEventBase = handleEvent;
        XMLHttpRequest.prototype.send = function (value) {
            this.addEventListener('loadstart', handleEvent, false);
            this.addEventListener('load', handleEvent, false);
            this.addEventListener('loadend', handleEvent, false);
            this.addEventListener('progress', handleEvent, false);
            this.addEventListener('error', handleEvent, false);
            this.addEventListener('abort', handleEvent, false);
            this.realSend(value);
        };
    }

    static unWatch() {
        XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.realSend || XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function (value) {
            this.removeEventListener('loadstart', handleEventBase, false);
            this.removeEventListener('load', handleEventBase, false);
            this.removeEventListener('loadend', handleEventBase, false);
            this.removeEventListener('progress', handleEventBase, false);
            this.removeEventListener('error', handleEventBase, false);
            this.removeEventListener('abort', handleEventBase, false);
            this.realSend(value);
        };
    }

    static setClasses() {
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
            if (proposals[id] && proposals[id].jobFunction) {
                const jobFunction = proposals[id].jobFunction;
                $(this).find('.candidate__applicant-icons').append($(`<span title="${jobFunction.name}">${jobFunction.seniorityTrack}${jobFunction.level}</span>`).addClass('job-function'));
            }
        });
    }
}
