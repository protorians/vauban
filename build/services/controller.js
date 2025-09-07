import { Logger } from "../supports/index.js";
export class ServiceController {
    static async run(uri, { response }) {
        try {
            response.status(200)
                .type('application/json')
                .send({ status: true, message: 'OK', uri });
        }
        catch (e) {
            Logger.error('error', e);
            response.status(500)
                .send({ status: false, cause: e.message || e.stack || e });
        }
    }
}
