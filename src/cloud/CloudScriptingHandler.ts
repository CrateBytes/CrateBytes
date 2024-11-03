import ivm from "isolated-vm";
import * as ts from "typescript";

export default class CloudScriptingHandler {
    async runScript(cloudScript: string, inputs: any) {
        const transpiledCode = ts.transpile(cloudScript);
        const isolate = new ivm.Isolate({ memoryLimit: 8 });
        const context = isolate.createContextSync();

        const jail = context.global;
        await jail.set("global", jail.derefInto());

        const script = await isolate.compileScript(transpiledCode);
        await script.run(context);

        await context.evalClosure(
            `(async () => {
                const inputs = ${JSON.stringify(inputs)};
                const result = await code(inputs);
                global.result = result;
            })()`
        );

        const result = await context.global.get("result");
        return result;
    }
}

const cloudScript = `
async function code(inputs) {
return "Hello, " + inputs.name;
}
`;

const handler = new CloudScriptingHandler();

handler
    .runScript(cloudScript, { name: "Alice" })
    .then((result) => console.log(result))
    .catch((error) => console.error("Error:", error));
