let handleEventBase = () => {};

class DomContainers {
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
        $('.profile-table tbody:has(.workflow-entities)')
            .addClass('requisition assigned')
            .data('status', 'assigned');
        $('.profile-table tbody:not(:has(.workflow-entities))')
            .addClass('requisition empty')
            .data('status', 'empty');

        const countryIndex = $('.dashboard-table thead th:has(div[title="Location"])').index();
        const dateIndex = $('.dashboard-table thead th:has(div[title="Created On"])').index();
        const countryGroups = {};

        $('.dashboard-table tbody').each(function () {
            const country = $(this).find('td').eq(countryIndex).text();
            if (!countryGroups[country]) countryGroups[country] = [];
            $(this).addClass('container outdated').data('status', 'outdated');
            countryGroups[country].push($(this));
        });
        Object.values(countryGroups).forEach(data => {
            data.sort((a, b) => new Date(b.find('td').eq(dateIndex).text()) - new Date(a.find('td').eq(dateIndex).text()));
            data[0].addClass('new').removeClass('outdated').data('status', 'new');
        });
    }
}
