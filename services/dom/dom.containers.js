class DomContainers extends DomShared {
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
