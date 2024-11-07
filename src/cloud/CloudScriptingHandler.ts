import ivm from "isolated-vm";
import * as ts from "typescript";

async function prepareCode(cloudScript: string, inputs: any): Promise<string> {
    cloudScript += `
        const inputs = ${JSON.stringify(inputs)};
        let result = code(inputs);
        let ret;
        ret = result;
    `;
    return cloudScript;
}

export async function runScript(cloudScript: string, inputs: any) {
    try {
        const code = await prepareCode(cloudScript, inputs);
        const isolate = new ivm.Isolate({ memoryLimit: 8 });
        const context = isolate.createContextSync();

        const jail = context.global;
        await jail.set("global", jail.derefInto());

        const script = await isolate.compileScript(code);
        const result = await script.run(context, {
            promise: true,
            timeout: 6 * 1000,
        });

        return result;
    } catch (error: any) {
        throw new Error(`Error running script: ${error}`);
    }
}
