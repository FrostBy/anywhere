let handleEventBase = () => {};

class DomShared {
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
}
