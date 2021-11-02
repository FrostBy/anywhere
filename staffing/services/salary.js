class Salary {
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
        const containers = $('.profile-content').find('td:contains("Current Salary (Gross)"), td:contains("Expected Salary (Gross)")').next('td').filter((i, e) => e.innerText.trim());

        if (!containers.length) return;

        $('span.exchange').remove();

        const button = `<span class="exchange" title="Get Exchange Rate">💱</span>`;

        if (!containers.find('.money').length) containers.contents().wrap('<span class="money" />');

        containers.append(button);

        this.generateTooltip(containers.find('.money'), false);

        $('.exchange').on('click', (e) => this.generateTooltip($(e.target).parent().find('.money')));
    }

    static async generateTooltip(containers, show = true) {
        for (const container of containers) {
            const text = $.trim(container.textContent);
            const [from, money, period] = text.split(' ');

            if (!money || !from) continue;

            const rate = await this.get(from);

            const containerObject = $(container);

            if (containerObject.data('tooltipsterNs')) containerObject.tooltipster('destroy');

            containerObject.tooltipster({
                content: `~ ${rate.to} ${Math.floor(money.replace(/[^0-9]/g, '') * rate.value)}`,
                theme: 'tooltipster-light'
            });

            if (show) containerObject.tooltipster('show');
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
        const from = $('sd-static-select[formcontrolname="expectedCurrency"] .selected-option .ellipsis').get(0)?.innerText || 'USD';
        const money = $('input[formcontrolname="expectedAmount"]').val() || 0;

        // language=HTML
        const calculator = `
            <div class="calculator form-wrapper">
                <form>
                    <input name="value" type="number" value="${money}" placeholder="Salary" class="form-entry-input">
                    <input name="from" readonly value="${from}" class="form-entry-input">
                    <button class="btn profile-action">🖩</button>
                </form>
                <div class="result">~ USD 0</div>
            </div>
        `;

        container.append(calculator);

        $('.calculate').on('click', () => $('.calculator').toggle());

        $('.calculator form').on('submit', function (e) {
            e.preventDefault();
            const data = {};
            $(this).serializeArray().forEach(obj => { data[obj.name] = obj.value; });
            if (data.value) {
                Salary.get(data.from).then(rate => {
                    $('.calculator .result').text(`~ ${rate.to} ${Math.floor(data.value * rate.value)}`);
                });
            }
            return false;
        }).submit();
    }

    static initOfferTool() {
        const container = $('.salary-expectations .title:contains("Comment")').eq(0);
        if (!container.length || $('.prefill').length) return;

        container.append('<span class="prefill" title="Prefill Offer">🗲</span>');

        const currency = $('sd-static-select[formcontrolname="expectedCurrency"] .selected-option .ellipsis').get(0)?.innerText || 'USD';
        const salary = $('input[formcontrolname="expectedAmount"]').val() || 0;

        const base = 0;
        const signOn = 0;
        const psp = 0;

        const types = {
            // language=HTML
            'default': `
                <option value="IC">IC</option>
                <option value="Fix">Fix</option>
                <option value="Flex">Flex</option>
                <option value="Flex (off-hour)" selected>Flex (off-hour)</option>
                <option value="Ultra-Flex">Ultra-Flex</option>
            `,
            'RUB': `
                <option value="Flex">Flex</option>
                <option value="Flex (off-hour)" selected>Flex (off-hour)</option>
                <option value="Ultra-Flex">Ultra-Flex</option>
            `,
            'INR': `
                <option value="Flex" selected>Flex</option>
            `,
            'COP': `
                <option value="FIX" selected>FIX</option>
            `,
        };

        // language=HTML
        const tool = `
            <div class="offer-tool form-wrapper">
                <form>
                    <div class="form-entry">
                        <label class="form-entry-label" title="">Currency</label>
                        <div class="form-entry-field">
                            <input name="currency" readonly value="${currency}" class="form-entry-input">
                        </div>
                    </div>
                    <div class="form-entry">
                        <label class="form-entry-label" title="">Cap</label>
                        <div class="form-entry-field">
                            <input name="cap" value="${salary}" placeholder="Cap" type="number"
                                   class="form-entry-input">
                        </div>
                    </div>
                    <div class="form-entry">
                        <label class="form-entry-label" title="">Salary</label>
                        <div class="form-entry-field">
                            <input name="salary" value="${salary}" type="number" placeholder="Salary"
                                   class="form-entry-input">
                        </div>
                    </div>
                    <div class="form-entry">
                        <label class="form-entry-label" title="">Base</label>
                        <div class="form-entry-field">
                            <input name="base" value="${base}" type="number" placeholder="Base"
                                   class="form-entry-input">
                        </div>
                    </div>
                    <div class="form-entry">
                        <label class="form-entry-label" title="">PSP Cap</label>
                        <div class="form-entry-field">
                            <input name="psp" value="${psp}" type="number" placeholder="PSP" class="form-entry-input">
                        </div>
                    </div>
                    <div class="form-entry">
                        <label class="form-entry-label" title="">Sign On</label>
                        <div class="form-entry-field">
                            <input name="signOn" value="${signOn}" type="number" placeholder="Sign On"
                                   class="form-entry-input">
                        </div>
                    </div>
                    <div class="form-entry">
                        <label class="form-entry-label" title="">Sign On Condition</label>
                        <div class="form-entry-field">
                            <select name="condition" class="form-entry-input">
                                <option value="GENERAL" selected>After assignment to a project</option>
                                <option value="EVENT">Hiring week</option>
                                <option value="LAPTOP (After assignment to a project)">India: Laptop (After assignment
                                    to a project)
                                </option>
                                <option value="LAPTOP (ASAP)">India: Laptop (ASAP)</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-entry">
                        <label class="form-entry-label" title="">Offer Type</label>
                        <div class="form-entry-field">
                            <select name="type" class="form-entry-input">
                                ${types[currency] || types.default}
                            </select>
                        </div>
                    </div>
                    <div class="form-entry button-wrapper">
                        <button class="btn profile-action">🖩</button>
                    </div>
                </form>
                <div class="result">Offer:</div>
            </div>
        `;

        container.append(tool);

        $('.prefill').on('click', () => $('.offer-tool').toggle());

        $('.offer-tool form').on('submit', function (e) {
            e.preventDefault();
            const data = {};
            $(this).serializeArray().forEach(obj => { data[obj.name] = !isNaN(+obj.value) ? +obj.value : obj.value; });
            Salary.calculateOffer(data);
            return false;
        });
    }

    static getCalcFunction(currency) {
        const functions = {
            'RUB': function (data) {
                let { cap, salary, base, signOn, psp } = data;

                if (salary <= cap) return { base, signOn, premium: salary - base };

                const diff = salary - cap;

                if (diff <= psp) return { base, signOn, premium: cap - base, psp: diff };

                return 0;
            },
        };
        return functions[currency] || functions['RUB'];
    }

    static async getOffer(offer, data) {
        let result = `${data.type}, `;
        const salary = (offer.base || 0) + offer.premium;

        if (data.type === 'IC') result += `${Math.round(salary / 168).toLocaleString()}/h ${data.currency} = ~`;

        if (offer.base) {
            result += `${offer.base.toLocaleString()} + ${offer.premium.toLocaleString()} = ${salary.toLocaleString()} ${data.currency}`;
        } else result += `${salary.toLocaleString()} ${data.currency}`;

        const rate = await this.get(data.currency);

        if (data.currency === 'COP') result += ` (~${Math.floor(salary * rate.value)} ${rate.to})`;

        if (offer.psp) result += ` + ${offer.psp.toLocaleString()} ${data.currency} PSP = ${(salary + offer.psp).toLocaleString()} ${data.currency}`;
        if (offer.signOn) result += ` + ${offer.signOn.toLocaleString()} ${data.currency} Sign On (${data.condition})`;
        return result;
    }

    static async calculateOffer(data = {}) {
        let result = 'SE are out of range';
        const offer = this.getCalcFunction(data.currency)(data);

        if (offer) result = await this.getOffer(offer, data);

        $('.offer-tool .result').text(`Offer: ${result}`);

        /*
        const container = $('.salary-expectations .title:contains("Comment")').eq(0);
        const textarea = container.next().find('textarea.visible-text-area');
        textarea.val(function (i, text) {
            let string = text.trim() ? '\n' : '';
            string += 'Offer:';
            return text + string;
        });
        textarea.trigger('input');*/
    }
}