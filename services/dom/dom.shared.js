let handleEventBase = () => {};

class DomShared {
    static terminate() {
        DomShared.unWatch();
        this.modal(false);
    }

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

    static initRawTriggers() {
        $.fn.triggerRawMouse = function (event = 'click') {
            const clickEvent = new MouseEvent(event, {
                view: unsafeWindow,
                bubbles: true,
                cancelable: true
            });

            return this.each(function () { this.dispatchEvent(clickEvent); });
        };

        $.fn.triggerRawEvent = function (event = 'input') {
            const rawEvent = new Event(event, {
                bubbles: true,
                cancelable: true,
            });

            return this.each(function () { this.dispatchEvent(rawEvent); });
        };
    }

    static initPlugins() {
        this.initRawTriggers();
    }

    /**
     *
     * @param params.selector string
     * @param params.parent HTMLElement
     * @param params.recursive Boolean
     * @param params.done Function
     * @param params.disconnect Boolean
     */
    static waitForAddedNode(params) {
        const observer = new MutationObserver(function (mutations) {
            const element = $(params.selector);
            if (element.length) {
                if (!!params.disconnect) this.disconnect();
                if (typeof params.done === 'function') params.done(element.get(0), params);
            }
        });

        observer.observe(params.parent || document, {
            subtree: !!params.recursive || !params.parent,
            childList: true,
        });

        return observer;
    }

    static toggleSpinner(state) {
        let indicator = $('.spinner-container');

        if (!indicator.length) {
            // language=HTML
            const spinner = `
                <div class="spinner-container loading">
                    <div class="spinner">
                        <svg width="40" height="40" version="1.1" xmlns="http://www.w3.org/2000/svg"
                             class="circle-loader">
                            <circle cx="20" cy="20" r="15"></circle>
                        </svg>
                    </div>
                </div>`;
            $('body').append(spinner);
            indicator = $('.spinner-container');
        }
        indicator.toggleClass('fade-in', state);
    }

    static modal(show = true, title, body, footer) {
        $('ngb-modal-backdrop').remove();
        $('ngb-modal-window').remove();

        if (!show) return;

        // language=HTML
        const backdrop = `
            <ngb-modal-backdrop style="z-index: 1050;" aria-hidden="true" class="fade modal-backdrop modal-bs4 show" />
        `;
        // language=HTML
        const modal = `
            <ngb-modal-window role="dialog" tabindex="-1" aria-modal="true" class="d-block fade modal modal-bs4 show custom">
                <div role="document" class="modal-dialog">
                    <div class="modal-content">
                        <sd-action-modal>
                            <button class="close modal-close"><span class="fa fa-close"></span></button>
                            <div class="modal-header"><h4 class="modal-title">${title}</h4></div>
                            <div class="modal-body">
                                ${body}
                            </div>
                            <div class="modal-footer">
                                ${footer}
                            </div>
                        </sd-action-modal>
                    </div>
                </div>
            </ngb-modal-window>`;

        $('body').append(backdrop).append(modal);
        $('ngb-modal-backdrop, .close.modal-close').on('click', () => this.modal(false));
    }
}
