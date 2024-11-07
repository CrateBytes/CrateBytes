import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const buildDir = path.resolve(rootDir, "build");

console.log("Running npm vitebuild...");
execSync("npm run vitebuild", { stdio: "inherit" });

const indexFile = path.resolve(buildDir, "index.js");

console.log(`Reading index file from ${indexFile}...`);
const indexContent = fs.readFileSync(indexFile, "utf8");

console.log("Replacing content in index file...");
fs.writeFileSync(
    indexFile,
    indexContent.replace("{ path, host, port }", "port")
);

// read the shims.js
const shimsFile = path.resolve(buildDir, "shims.js");
let shimsContent = fs.readFileSync(shimsFile, "utf8");

shimsContent = `import { fileURLToPath } from "url";\n` + shimsContent;
// replace "const globals = {" with  "const globals = {\n__filename: fileURLToPath(import.meta.url),"
shimsContent = shimsContent.replace(
    "const globals = {",
    "const globals = {\n__filename: fileURLToPath(import.meta.url),"
);

console.log("Writing shims file...");

fs.writeFileSync(shimsFile, shimsContent);

console.log("Build script completed successfully.");
