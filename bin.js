#!/usr/bin/env node

const { exec } = require("child_process");
const path = require("path");

// Assuming the first argument is the source directory path
const srcPath = process.argv[2] || "src";
const tsConfigPath = process.argv[3] || "tsconfig.json";

// Calculate the path to tsconfig.json based on the provided srcPath
const cruiseConfigPath = path.join(__dirname, "depcruise-config.cjs");

// Set the TSCONFIG_PATH environment variable for this script's process
process.env.TSCONFIG_PATH = tsConfigPath;

const command = `depcruise --version && depcruise --config ${cruiseConfigPath} --output-type archi ${srcPath} | dot -T svg | depcruise-wrap-stream-in-html > fsd-high-level-dependencies.html`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
});
