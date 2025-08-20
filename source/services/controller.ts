import {IServerPayload} from "../types/index.js";
import {Logger} from "../supports/index.js";


export class ServiceController {

    static async run(uri: string, {response}: IServerPayload) {
        try {
            response.status(200)
                .type('application/json')
                .send({status: true, message: 'OK', uri})

        } catch (e: any) {
            Logger.error('error', e)
            response.status(500)
                .send({status: false, cause: e.message || e.stack || e});
        }
    }

}