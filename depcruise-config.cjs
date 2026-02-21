/** @type {import('dependency-cruiser').IConfiguration} */

const fsdTheme = {
  modules: [
    {
      criteria: { collapsed: true },
      attributes: { shape: "folder" }, // changed to 'folder' to visually imply it contains internals
    },
    {
      criteria: { source: "^src/app/[^/]+" },
      attributes: { fillcolor: "#ffbdbd" },
    },
    {
      criteria: { source: "^src/layouts/[^/]+" },
      attributes: { fillcolor: "#ffbdbd" },
    },
    {
      criteria: { source: "^src/processes/[^/]+" },
      attributes: { fillcolor: "#da96ff" },
    },
    {
      criteria: { source: "^src/pages/[^/]+" },
      attributes: { fillcolor: "#ffd9a3" },
    },
    {
      criteria: { source: "^src/widgets/[^/]+" },
      attributes: { fillcolor: "#94fffa" },
    },
    {
      criteria: { source: "^src/features/[^/]+" },
      attributes: { fillcolor: "#aedaff" },
    },
    {
      criteria: { source: "^src/entities/[^/]+" },
      attributes: { fillcolor: "#d3ffc6" },
    },
    {
      criteria: { source: "^src/shared/[^/]+" },
      attributes: { fillcolor: "#efefef" },
    },
  ],
  dependencies: [
    {
      criteria: { valid: false }, // highlights rule-violating FSD edges
      attributes: { color: "#ff0000", penwidth: "2.0" },
    },
    {
      criteria: { valid: true }, // dims valid FSD edges to let the architecture structure stand out
      attributes: { color: "#00000044", penwidth: "1.0" },
    }
  ],
  graph: {
    splines: "ortho",
    rankdir: "TB",    // forces layout top-to-bottom matching the FSD hierarchy
    ranksep: "1.2",   // slightly more vertical separation between layers
    nodesep: "0.5",   // separation between slices in the same layer
    fontname: "Helvetica",
  },
  node: {
    fontname: "Helvetica",
    fontsize: "10",
    style: "rounded, filled",
  },
  edge: {
    fontname: "Helvetica",
    fontsize: "9",
  },
};

module.exports = {
  // FSD specific rules: adding these rules will highlight invalid architectural dependencies
  // in red in your generated graph, providing crucial "meta information" about your codebase health.
  forbidden: [
    {
      name: "fsd-no-circular",
      severity: "error",
      comment: "Circular dependencies are not allowed in FSD.",
      from: {},
      to: { circular: true },
    },
    {
      name: "fsd-layer-processes-upward",
      severity: "error",
      comment: "Processes can only import from lower layers.",
      from: { path: "^src/processes" },
      to: { path: "^src/(app)" },
    },
    {
      name: "fsd-layer-pages-upward",
      severity: "error",
      comment: "Pages can only import from lower layers.",
      from: { path: "^src/pages" },
      to: { path: "^src/(app|processes)" },
    },
    {
      name: "fsd-layer-layouts-upward",
      severity: "error",
      comment: "Layouts can only import from lower layers.",
      from: { path: "^src/layouts" },
      to: { path: "^src/(app|processes|pages)" },
    },
    {
      name: "fsd-layer-widgets-upward",
      severity: "error",
      comment: "Widgets can only import from lower layers.",
      from: { path: "^src/widgets" },
      to: { path: "^src/(app|processes|pages|layouts)" },
    },
    {
      name: "fsd-layer-features-upward",
      severity: "error",
      comment: "Features can only import from lower layers.",
      from: { path: "^src/features" },
      to: { path: "^src/(app|processes|pages|layouts|widgets)" },
    },
    {
      name: "fsd-layer-entities-upward",
      severity: "error",
      comment: "Entities can only import from lower layers.",
      from: { path: "^src/entities" },
      to: { path: "^src/(app|processes|pages|layouts|widgets|features)" },
    },
    {
      name: "fsd-layer-shared-upward",
      severity: "error",
      comment: "Shared layer cannot import from any higher layers.",
      from: { path: "^src/shared" },
      to: { path: "^src/(app|processes|pages|layouts|widgets|features|entities)" },
    },
    {
      name: "fsd-cross-slice",
      severity: "error",
      comment: "Slices within the same layer cannot import each other.",
      from: { path: "^src/(processes|pages|layouts|widgets|features|entities)/([^/]+)" },
      to: {
        path: "^src/$1/([^/]+)",
        pathNot: "^src/$1/$2",
      },
    },
    {
      name: "fsd-public-api",
      severity: "error",
      comment: "Slices should only be imported via their public API (index).",
      from: { path: "^src/([^/]+)/([^/]+)" },
      to: {
        // any deep import into a slice
        path: "^src/(processes|pages|layouts|widgets|features|entities)/([^/]+)/.+",
        pathNot: [
          "^src/$1/$2/.+", // allow internal deep imports within the same slice
          "^src/[^/]+/[^/]+/index\\.(ts|tsx|js|jsx)$" // allow importing from the slice's index (public API)
        ]
      },
    }
  ],

  options: {
    doNotFollow: {
      dependencyTypes: [
        "npm",
        "npm-dev",
        "npm-optional",
        "npm-peer",
        "npm-bundled",
        "npm-no-pkg",
      ],
    },

    includeOnly: "^src",

    tsPreCompilationDeps: false,

    tsConfig: {
      fileName: process.env.TSCONFIG_PATH,
    },

    progress: { type: "performance-log" },

    reporterOptions: {
      archi: {
        // Collapses internal folders of a slice, so you only see relations between slices/segments
        // Added `layouts` to the collapse pattern as it is a common FSD layer
        collapsePattern:
          "^src/app/[^/]+|^src/processes/[^/]+|^src/layouts/[^/]+|^src/pages/[^/]+|^src/widgets/[^/]+|^src/features/[^/]+|^src/entities/[^/]+|^src/shared/[^/]+",
        theme: fsdTheme,
      },
      dot: {
        // No collapse pattern, so it will show all files grouped in their respective folders
        theme: fsdTheme,
      },
    },
  },
};
