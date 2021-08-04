class DomProfile {
    static initCopyButtons() {
        $('span.copy').remove();

        const button = `<span class="copy" title="Copy to Clipboard">⎘</span>`;

        $('.entity-name span').addClass('copy-text');
        $('.entity-name').prepend(button);

        $('.profile-content td:contains("Applicant Owner")').next('td').find('a').addClass('copy-text');
        $('.profile-content td:contains("Applicant Owner")').next('td').prepend(button);

        $('.copy').on('click', (e) => {
            const text = $.trim($(e.target).parent().find('.copy-text').get(0).textContent);
            const input = $('<input />', { id: 'copySelected' });
            $('body').append(input);
            input.val(text);
            input[0].select();
            document.execCommand('copy');
            input.remove();
        });
    }
}