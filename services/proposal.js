Notification.requestPermission()
    .then(permission => { if (!('permission' in Notification)) Notification.permission = permission; }, rejection => {});

class Proposal {
    static get url() {
        return 'https://staffing.epam.com/api/b1/positions/153695794/proposals?size=1000&q=staffingStatus=out=(Cancelled,Rejected)';
    }

    static markProposals(diff) {
        const newProposals = Object.keys(diff.new);
        const changedProposals = Object.keys(diff.changed);
        const outdatedProposals = Object.keys(diff.outdated);

        $('.profile-table tbody.proposal').each(function () {
            $(this).removeClass('mark mark-changed mark-new mark-outdated');
            const id = $(this).find('.applicant-link a').attr('href').split('/').pop();
            if (newProposals.includes(id)) $(this).addClass('mark mark-new');
            else if (changedProposals.includes(id)) $(this).addClass('mark mark-changed');
            else if (outdatedProposals.includes(id)) $(this).addClass('mark mark-outdated');
        });
    }

    static get() {
        const proposalsObjectOld = JSON.parse(GM_getValue('proposals', '{}'));
        const proposalsObject = {};
        const diff = { new: {}, outdated: {}, changed: {} };

        $.get(this.url, function (data) {
            const proposals = data.content;
            let showNotification = false;
            proposals.forEach(proposal => {
                const applicant = proposal.applicant || proposal.employee.applicant;
                const id = applicant.id;
                const status = proposal.advancedStatusDetails ? proposal.advancedStatusDetails.action.name : 'Preselected';
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
                services.Filter.enableRefresh();

                if (Notification.permission === 'granted') {
                    const notification = new Notification('Updates for you on the Startup page!', {
                        body: `New: ${Object.keys(diff.new).length} | Changed: ${Object.keys(diff.changed).length} | Outdated: ${Object.keys(diff.outdated).length}`,
                        icon: 'https://www.epam.com/etc/designs/epam-core/favicon/apple-touch-icon.png',
                        vibrate: true,
                    });
                    notification.onclick = () => {
                        Proposal.markProposals(diff);
                        window.focus();
                        notification.close();
                    };
                }
            }
        });
    }
}