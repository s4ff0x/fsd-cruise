/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
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

    /* How to resolve external modules - use "yarn-pnp" if you're using yarn's Plug'n'Play.
       otherwise leave it out (or set to the default, which is 'node_modules')
       externalModuleResolutionStrategy: "yarn-pnp",
    */

    progress: { type: "performance-log" },

    reporterOptions: {
      archi: {
        collapsePattern:
          "^src/app/[^/]+|^src/processes/[^/]+|^src/pages/[^/]+|^src/widgets/[^/]+|^src/features/[^/]+|^src/entities/[^/]+|^src/shared/[^/]+",

        theme: {
          modules: [
            {
              criteria: { collapsed: true },
              attributes: { shape: "tab" },
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
          graph: {
            splines: "ortho",
            rankdir: "TB",
            ranksep: "1",
          },
        },
      },
    },
  },
};
