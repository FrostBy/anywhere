class DomContainers extends DomShared {
    static setClasses() {
        $('.profile-table tbody').each(function () {
            $(this).addClass('requisition');
            $(this).data('properties', new Set());

            const status = $(this).find('.workflow-entities').length;

            if (status) $(this).addClass('assigned').data('properties').add('assigned');
            else $(this).addClass('empty').data('properties').add('empty');
        });

        const countryIndex = $('.dashboard-table thead th:has(div[title="Location"])').index();
        const dateIndex = $('.dashboard-table thead th:has(div[title="Created On"])').index();
        const countryGroups = {};

        $('.dashboard-table tbody').each(function () {
            const country = $(this).find('td').eq(countryIndex).text();
            if (!countryGroups[country]) countryGroups[country] = [];
            $(this).addClass('container outdated').data('properties', new Set(['outdated']));
            countryGroups[country].push($(this));
        });

        Object.values(countryGroups).forEach(data => {
            data.sort((a, b) => new Date(b.find('td').eq(dateIndex).text()) - new Date(a.find('td').eq(dateIndex).text()));
            data[0].addClass('new').removeClass('outdated').data('properties', new Set(['new']));
        });
    }
}
