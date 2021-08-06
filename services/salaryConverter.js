class SalaryConverter {
    static async request(from = 'RUB', to = 'USD', auth = {}, source) {
        const sources = {
            exchangerate: async (from, to) => {
                const API_URL = `https://api.exchangerate.host/convert?from=${from}&to=${to}`;
                try {
                    return (await $.get(API_URL))?.result;
                } catch (e) {
                    console.log(e);
                    return 0;
                }
            },
            currconv: async (from, to, auth) => {
                const API_URL = `https://free.currconv.com/api/v7/convert?q=${from}_${to}&compact=y&apiKey=${auth.key || '23a435284fd626d9f782'}`;
                try {
                    return (await $.get(API_URL))[`${from}_${to}`]?.val;
                } catch (e) {
                    console.log(e);
                    return 0;
                }
            }
        };

        if (!source) {
            for (const func of Object.values(sources)) {
                const value = await func(from, to, auth);
                if (value) return value;
            }
        } else if (sources[source]) return await sources[source](from, to, auth);

        return 0;
    }

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
            if (container.data('tooltipsterNs')) container.tooltipster('destroy');

            const text = $.trim(container.get(0).textContent);
            const [from, money, period] = text.split(' ');

            if (!money || !from) return;

            const rate = await SalaryConverter.get(from);

            container.tooltipster({
                content: `~ ${rate.to} ${Math.floor(money.replace(/[^0-9]/g, '') * rate.value)}`,
                theme: 'tooltipster-light'
            });
            container.tooltipster('show');
        }
    }

    static async get(from = 'RUB', to = 'USD', auth = {}) {
        const ratesCache = services.Config.get('rates', {});

        let rate = ratesCache[`${from}_${to}`];

        const expireDate = new Date();
        expireDate.setTime(expireDate.getTime() - (6 * 60 * 60 * 1000));

        if (!rate || expireDate >= new Date(rate.date)) {
            console.log('Rates cache expired');
            ratesCache[`${from}_${to}`] = rate = {
                date: new Date(),
                from,
                to,
                value: await this.request(from, to, auth)
            };
            services.Config.set('rates', ratesCache);
        }

        console.log(rate);

        return rate;
    }

    static initCalculator() {
        const container = $('.salary-expectations .title:contains("Comment")').eq(0);
        if (!container.length || $('.calculate').length) return;

        container.append('<span class="calculate" title="Calculate Offer">🖩</span>');
        const from = $('sd-static-select[formcontrolname="expectedCurrency"] .selected-option .ellipsis').get(0).innerText;
        const money = $('input[formcontrolname="expectedAmount"]').val();

        if (!money || !from) return;

        // language=HTML
        const calculator = `
            <div class="calculator">
                <form>
                    <input name="value" value="${money}" placeholder="Salary" class="form-entry-input">
                    <input name="from" readonly value="${from}" class="form-entry-input">
                    <button class="btn profile-action">🖩</button>
                </form>
                <div class="result">~ USD 0</div>
            </div>
        `;

        container.append(calculator);

        $('.calculate').on('click', () => {
            $('.calculator').toggle();
        });

        $('.calculator form').on('submit', function (e) {
            e.preventDefault();
            const data = {};
            $(this).serializeArray().forEach(obj => { data[obj.name] = obj.value; });
            if (data.value) {
                SalaryConverter.get(data.from).then(rate => {
                    $('.calculator .result').text(`~ ${rate.to} ${Math.floor(data.value * rate.value)}`);
                });
            }
            return false;
        }).submit();
    }
}