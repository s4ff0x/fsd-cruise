#!/usr/bin/env node

const { exec } = require("child_process");
const readline = require("readline");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Assuming the first argument is the source directory path
const srcPath = process.argv[2] || "src";
const tsConfigPath = process.argv[3] || "tsconfig.json";
const cruiseConfigPath = path.join(__dirname, "depcruise-config.cjs");

// Function to find the binary path, with fallbacks
function findBinary(binaryName) {
  // First try: node_modules/.bin in current package
  const binPath = path.join(__dirname, "node_modules", ".bin", binaryName);
  if (fs.existsSync(binPath)) {
    return binPath;
  }

  // Second try: find in dependency-cruiser package's node_modules/.bin
  const depcruiseBinPath = path.join(
    __dirname,
    "node_modules",
    "dependency-cruiser",
    "node_modules",
    ".bin",
    binaryName
  );
  if (fs.existsSync(depcruiseBinPath)) {
    return depcruiseBinPath;
  }

  // Third try: try to resolve using require.resolve
  try {
    const depcruisePath = require.resolve("dependency-cruiser/package.json");
    const depcruiseDir = path.dirname(depcruisePath);
    const resolvedBin = path.join(depcruiseDir, "node_modules", ".bin", binaryName);
    if (fs.existsSync(resolvedBin)) {
      return resolvedBin;
    }
  } catch (e) {
    // Continue to fallback
  }

  // Fallback: use npx (will use local node_modules if available)
  return `npx ${binaryName}`;
}

const depcruiseBin = findBinary("depcruise");
const wrapStreamBin = findBinary("depcruise-wrap-stream-in-html");

// Set the TSCONFIG_PATH environment variable for this script's process
process.env.TSCONFIG_PATH = tsConfigPath;

// Function to execute a shell command and return a promise
function execShellCommand(cmd, highlightedMsg) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log(chalk.red.bold(`exec error: ${error}`));
        reject(error);
        return;
      }
      if (stdout) console.log(`stdout: ${stdout}`);
      if (stderr) console.log(`stderr: ${stderr}`);
      if (highlightedMsg) console.log(chalk.green.bold(highlightedMsg));
      resolve(stdout);
    });
  });
}

// Function to check Graphviz installation
function checkGraphvizInstallation() {
  console.log(chalk.yellow.bold("Check Graphviz installation..."));
  execShellCommand("dot -V")
    .then(() => {
      // Graphviz is installed, run Dependency Cruiser directly
      runDependencyCruiser();
    })
    .catch(() => {
      // Graphviz is not installed, ask the user if they want to install it
      rl.question(
        "Graphviz is not installed. Do you want to install graphviz using brew? (yes/no): ",
        function (answer) {
          if (answer.toLowerCase() === "yes") {
            execShellCommand(
              "brew install graphviz",
              "Graphviz installed successfully!",
            )
              .then(() => runDependencyCruiser())
              .catch((error) =>
                console.error(`Error installing graphviz: ${error}`),
              )
              .finally(() => rl.close()); // Make sure readline is closed
          } else {
            runDependencyCruiser();
            rl.close(); // Close readline here as well
          }
        },
      );
    });
}

function runDependencyCruiser() {
  const command = `${depcruiseBin} --config ${cruiseConfigPath} --output-type archi ${srcPath} | dot -T svg | ${wrapStreamBin} > fsd-high-level-dependencies.html`;

  execShellCommand(command, "fsd-cruise finished running.")
    .then(() => {
      process.exit(0); // Exit script successfully after running
    })
    .catch((error) => {
      console.error(`Error running dependency cruiser: ${error}`);
      process.exit(1); // Exit with error code if there was an issue
    });
}

// Start the script by checking Graphviz installation (dependency-cruiser is bundled)
checkGraphvizInstallation();
