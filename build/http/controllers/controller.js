export class Controller {
    request;
    response;
    static prefix = '/';
    useRequest(request) {
        this.request = request;
        return this;
    }
    useResponse(response) {
        this.response = response;
        return this;
    }
}
