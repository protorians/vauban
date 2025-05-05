import {ArcaneProgress} from "@protorians/arcane-core";


export class ProgressSpinner {
    static async create(label: string) {
        const spinner = await ArcaneProgress.createSpinner(label);
        spinner.start()
        spinner.color = 'cyan';
        return spinner;
    }
}