# [fsd-cruise](https://www.npmjs.com/package/fsd-cruise)

> `Currently in Beta`

[npm]: https://www.npmjs.com/package/fsd-cruise

[![npm](https://img.shields.io/npm/v/fsd-cruise?style=flat-square)][npm]

Simple dependency visualization for [Feature Sliced Design](https://feature-sliced.design/) based on [dependency-cruiser](https://www.npmjs.com/package/dependency-cruiser)

## Usage

### Just invoke with npx

```shell
npx fsd-cruise
```
> **requirements:** dependency-cruiser requires the `graphviz` library, which will be automatically installed using `brew`

> **limitations:** Currently, it only operates with the provided `tsconfig.json` and `src` folder paths, which are assumed by default to be in the root directory.
## Customization

1. You can provide custom paths to `src` folder and `tsconfig.json`
    ```shell
    npx fsd-cruise app/src app/tsconfig.json
    ```
