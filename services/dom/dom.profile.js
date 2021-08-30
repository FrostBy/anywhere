class DomProfile extends DomShared {
    static terminate() {
        super.terminate();
        $(document).off('click.action');
    }

    static initRequisitionButton() {
        $('button.requisitions').remove();

        const button = `<button class="requisitions btn profile-action" title="Show Empty Requisitions">Requisitions</button>`;

        $('.entity-page-controls').after(button);

        $('.requisitions').on('click', async (e) => {
            DomProfile.toggleSpinner(true);
            const locations = $('.profile-content td:contains("Location")').next('td').get(0)?.innerText.split(', ');
            const data = await services.Requisition.getRequisitions(locations);
            if(data.container) {
                const requisitions = data.requisitions.splice(0, 20).map(requisition => {
                    // language=HTML
                    return `<a href="https://staffing.epam.com/requisitions/${requisition.id}/candidates"
                               target="_blank">
                        ${requisition.title} | ${requisition.headline} | ${requisition.primarySkill} |
                            (${requisition.id})
                    </a>`;
                });
                this.modal(true, 'Requisitions',
                    // language=HTML
                    `
                        <div class="scroll">${requisitions.join('')}</div>
                    `,
                    // language=HTML
                    `
                        <a href="https://staffing.epam.com/hiringContainers/${data.container.id}/requisitions"
                           target="_blank" class="btn col-xs-12">Open Container ${data.container.code}</a>
                    `);
            }
            DomProfile.toggleSpinner(false);
        });
    }

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

    static watchNextStep(proposal) {
        $(document).on('click.action', '.staffing-status-dropdown a', function () {
            const lastAction = $(this).attr('title');

            if (lastAction === 'Offer Acceptance') {
                services.Dom.Profile.waitForAddedNode({
                    selector: '.modal.modal-bs4.show',
                    parent: document.body,
                    recursive: false,
                    disconnect: true,
                    done: async (element, params) => {
                        const id = window.location.href.match(/(\d+)/)[0];
                        const interviews = await proposal.getInterviews([id]);
                        const interview = interviews[id]?.find(interview => interview.name === 'Offer');

                        if (interview) {
                            const offer = interview.interviewFeedback[0];

                            if (offer && offer.feedback) {
                                const feedback = offer.feedback.replace(/<[^>]*>/g, '').trim();
                                const lines = feedback.split(/\n\n/);

                                const hiringProgramString = lines.find(element => element.startsWith('Hiring program'));
                                const hiringProgram = hiringProgramString?.split(': ')[1] || 'Flex';

                                const npString = lines.find(element => element.startsWith('Notice period'));
                                const np = npString?.split(': ')[1] || 'N/A';

                                $(element).find('.visible-text-area').val(`${hiringProgram}, NP: ${np}`).triggerRawEvent('input');

                                const responseDateString = lines.find(element => element.startsWith('Candidate Response date'));
                                const responseDate = responseDateString?.split(/\n/)[1];

                                if (responseDate) {
                                    const now = moment(moment().format('yyyy-MM-DD'));
                                    const dueDate = moment(`${responseDate} ${now.year()}`, 'MMMM DD YYYY');

                                    if (now > dueDate) dueDate.add(1, 'y');

                                    $(element).find('sd-datepicker-popup[label="Due Date"] input').val(dueDate.format('DD-MMM-yyyy')).triggerRawEvent('input');
                                }
                            }
                        }

                    }
                });
            } else if (lastAction === 'Offer Preparation') {
                services.Dom.Profile.waitForAddedNode({
                    selector: '.modal.modal-bs4.show',
                    parent: document.body,
                    recursive: false,
                    disconnect: true,
                    done: async (element, params) => {
                        const id = window.location.href.match(/(\d+)/)[0];
                        const profile = await proposal.getApplicant(id);
                        const hiringProgram = profile?.hiringProgram.name;
                        $(element).find('.visible-text-area').val(`${hiringProgram}, `).triggerRawEvent('input');
                    }
                });
            }
            const clearPersonsActions = ['Offer Acceptance', 'Offer Preparation', 'Background Check'];
            if (clearPersonsActions.includes(lastAction)) {
                services.Dom.Profile.waitForAddedNode({
                    selector: '.modal .ng-clear-wrapper',
                    parent: document.body,
                    recursive: false,
                    disconnect: true,
                    done: async (element, params) => {
                        $('.ng-clear-wrapper').triggerRawMouse('mousedown');
                    }
                });
            }
        });
    }
}