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

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 [srcPath] [tsconfigPath] [options]")
  .command("$0 [srcPath] [tsconfigPath]", "Run fsd-cruise", (yargs) => {
    yargs
      .positional("srcPath", {
        describe: "Path to the source directory",
        type: "string",
        default: "src",
      })
      .positional("tsconfigPath", {
        describe: "Path to the tsconfig file",
        type: "string",
        default: "tsconfig.json",
      });
  })
  .option("detailed", {
    describe: "Generate an additional detailed graph",
    type: "boolean",
    default: false,
  })
  .option("depth", {
    alias: "d",
    describe:
      "Folder depth level to collapse the detailed graph. E.g. 4 will collapse files inside segments.",
    type: "number",
    default: 4,
  })
  .help("h")
  .alias("h", "help").argv;

const srcPath = argv.srcPath;
const tsConfigPath = argv.tsconfigPath;
const depthLevel = argv.depth;
const generateDetailed = argv.detailed;
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
    const resolvedBin = path.join(
      depcruiseDir,
      "node_modules",
      ".bin",
      binaryName
    );
    if (fs.existsSync(resolvedBin)) {
      return resolvedBin;
    }
  } catch (e) {
    // Continue to fallback
  }

  // Fourth try: parent node_modules/.bin (handles npx hoisting where
  // dependency-cruiser binaries are siblings rather than nested)
  const parentBinPath = path.join(
    __dirname,
    "..",
    ".bin",
    binaryName
  );
  if (fs.existsSync(parentBinPath)) {
    return parentBinPath;
  }

  // Fallback: use npx (will use local node_modules if available)
  return `npx ${binaryName}`;
}

const depcruiseBin = findBinary("depcruise");
const wrapStreamBin = findBinary("depcruise-wrap-stream-in-html");

// Set the TSCONFIG_PATH environment variable for this script's process
process.env.TSCONFIG_PATH = tsConfigPath;

// Ensure dependency-cruiser can discover transpilers (e.g. typescript)
// installed in the target project, not just those co-located with fsd-cruise.
const projectNodeModules = path.resolve(process.cwd(), "node_modules");
const existingNodePath = process.env.NODE_PATH || "";
const nodePath = existingNodePath
  ? `${projectNodeModules}${path.delimiter}${existingNodePath}`
  : projectNodeModules;

// Function to execute a shell command and return a promise
function execShellCommand(cmd, highlightedMsg) {
  return new Promise((resolve, reject) => {
    exec(cmd, { env: { ...process.env, NODE_PATH: nodePath } }, (error, stdout, stderr) => {
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
              "Graphviz installed successfully!"
            )
              .then(() => runDependencyCruiser())
              .catch((error) =>
                console.error(`Error installing graphviz: ${error}`)
              )
              .finally(() => rl.close()); // Make sure readline is closed
          } else {
            runDependencyCruiser();
            rl.close(); // Close readline here as well
          }
        }
      );
    });
}

function runDependencyCruiser() {
  const archiCommand = `${depcruiseBin} --config ${cruiseConfigPath} --output-type archi --collapse 3 ${srcPath} | dot -T svg | ${wrapStreamBin} > fsd-high-level-dependencies.html`;
  const detailedCommand = `${depcruiseBin} --config ${cruiseConfigPath} --output-type dot --collapse ${depthLevel} ${srcPath} | dot -T svg | ${wrapStreamBin} > fsd-detailed-dependencies.html`;

  console.log(chalk.blue("Generating high-level architecture graph..."));
  execShellCommand(archiCommand, "fsd-high-level-dependencies.html generated.")
    .then(() => {
      if (!generateDetailed) {
        return Promise.resolve();
      }
      console.log(
        chalk.blue(
          `Generating detailed dependencies graph (collapsed at depth ${depthLevel})...`
        )
      );
      return execShellCommand(
        detailedCommand,
        "fsd-detailed-dependencies.html generated."
      );
    })
    .then(() => {
      console.log(chalk.green.bold("fsd-cruise finished running."));
      process.exit(0); // Exit script successfully after running
    })
    .catch((error) => {
      console.error(
        chalk.red.bold(`Error running dependency cruiser: ${error}`)
      );
      process.exit(1); // Exit with error code if there was an issue
    });
}

// Start the script by checking Graphviz installation (dependency-cruiser is bundled)
checkGraphvizInstallation();
