class Dom {
    static watch() {
        XMLHttpRequest.prototype.realSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function (value) {
            this.addEventListener('load', (event) => {
                const interval = setInterval(() => {
                    if (!$('.waiting-indicator').length) {
                        clearInterval(interval);
                        const newInterval = setInterval(() => {
                            Dom.setClasses();
                            if ($('.profile-table tbody.proposal').length) {
                                clearInterval(newInterval);
                                services.Filter.calculate();
                                services.Filter.refresh();
                            }
                        }, 100);
                    }
                }, 100);
            }, false);
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
}
