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
}
