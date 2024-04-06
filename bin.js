#!/usr/bin/env node

const { exec } = require("child_process");
const readline = require("readline");
const path = require("path");

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
function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      resolve(stdout);
    });
  });
}

// New function to check Graphviz installation
function checkGraphvizInstallation() {
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
            // Install graphviz if user said yes
            execShellCommand("brew install graphviz")
              .then(() => runDependencyCruiser())
              .catch((error) =>
                console.error(`Error installing graphviz: ${error}`),
              )
              .finally(() => {
                rl.close(); // Make sure readline is closed
                process.exit(0); // Exit script successfully
              });
          } else {
            // Directly run the command if user said no or provided an invalid answer
            runDependencyCruiser();
            rl.close(); // Make sure readline is closed here as well
          }
        },
      );
    });
}

function runDependencyCruiser() {
  const command = `npx -p dependency-cruiser@16.2.4 -p typescript@5.2.2 depcruise --config ${cruiseConfigPath} --output-type archi ${srcPath} | dot -T svg | depcruise-wrap-stream-in-html > fsd-high-level-dependencies.html`;

  execShellCommand(command)
    .then(() => {
      console.log("Dependency cruiser finished running.");
      process.exit(0); // Exit script successfully after running
    })
    .catch((error) => {
      console.error(`Error running dependency cruiser: ${error}`);
      process.exit(1); // Exit with error code if there was an issue
    });
}

// Start the script by checking for Graphviz installation
checkGraphvizInstallation();
