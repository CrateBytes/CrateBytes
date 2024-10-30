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

console.log("Build script completed successfully.");
