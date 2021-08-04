class SalaryConverter {
    static init() {
        const container = $('.profile-content td:contains("Expected Salary (Gross)")').next('td');
        if (!container.length) return;

        $('span.exchange').remove();

        const button = `<span class="exchange" title="Get Exchange Rate">💱</span>`;

        container.contents().wrap('<span class="money" />');
        container.append(button);

        SalaryConverter.generateTooltip([container.find('.money')]);

        $('.exchange').on('click', (e) => SalaryConverter.generateTooltip([$(e.target).parent().find('.money')]));
    }

    static async generateTooltip(containers) {
        for (const container of containers) {
            if (container.is('.tooltipstered')) container.tooltipster('destroy');

            const text = $.trim(container.get(0).textContent);
            const [from, money, period] = text.split(' ');
            const rate = await SalaryConverter.get(from);

            container.tooltipster({
                content: `~ ${rate.to} ${Math.floor(money.replace(/[^0-9]/g, '') * rate.value)}`,
                theme: 'tooltipster-light'
            });
            container.tooltipster('show');
        }
    }

    static async get(from = 'RUB', to = 'USD', key = '23a435284fd626d9f782') {
        const API_URL = `https://free.currconv.com/api/v7/convert?q=${from}_${to}&compact=y&apiKey=${key}`;
        return { from, to, value: (await $.get(API_URL))[`${from}_${to}`]?.val };
    }

    static initCalculator() {
        const container = $('.salary-expectations .title:contains("Comment")');
        container.append('<span class="calculate" title="Calculate Offer">🖩</span>');
        const fromCurrency = $('sd-static-select[formcontrolname="expectedCurrency"] .selected-option .ellipsis').get(0).innerText;
        // language=HTML
        const calculator = `
            <div class="calculator">
                <form>
                    <input name="value" value="${ $('input[formcontrolname="expectedAmount"]').val()}" placeholder="Salary" class="form-entry-input">
                    <input name="from" readonly value="${fromCurrency}" class="form-entry-input">
                    <button class="btn profile-action">🖩</button>
                </form>
                <div class="result">~ USD 0</div>
            </div>
        `;

        container.append(calculator);

        $('.calculate').on('click', () => {
            $('.calculator').toggle();
        });

        $('.calculator form').on('submit', async function (e) {
            e.preventDefault();
            const data = {};
            $(this).serializeArray().forEach(obj => { data[obj.name] = obj.value; });
            if (data.value) {
                const rate = await SalaryConverter.get(data.from);
                $('.calculator .result').text(`~ ${rate.to} ${Math.floor(data.value * rate.value)}`);
            }
        }).submit();
    }
}