#!/usr/bin/env node

const { exec } = require("child_process");
const readline = require("readline");
const path = require("path");
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

function checkDependencyCruiserInstallation() {
  console.log(chalk.yellow.bold("Checking Dependency Cruiser installation..."));
  execShellCommand("depcruise --version", "Dependency Cruiser is installed.")
    .then(() => {
      // Dependency Cruiser is installed, continue with the script
      checkGraphvizInstallation();
    })
    .catch(() => {
      // Dependency Cruiser is not installed, prompt the user for installation
      console.log(
        chalk.red(
          "Dependency Cruiser is not installed. Suggestions: yarn add -D dependency-cruiser",
        ),
      );
      process.exit(1);
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
  const command = `depcruise --config ${cruiseConfigPath} --output-type archi ${srcPath} | dot -T svg | depcruise-wrap-stream-in-html > fsd-high-level-dependencies.html`;

  execShellCommand(command, "fsd-cruise finished running.")
    .then(() => {
      process.exit(0); // Exit script successfully after running
    })
    .catch((error) => {
      console.error(`Error running dependency cruiser: ${error}`);
      process.exit(1); // Exit with error code if there was an issue
    });
}

// Start the script by checking for Dependency Cruiser installation
checkDependencyCruiserInstallation();
