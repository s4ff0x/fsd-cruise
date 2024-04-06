# [fsd-cruise](https://www.npmjs.com/package/fsd-cruise)

> `Currently in Beta`

[npm]: https://www.npmjs.com/package/fsd-cruise

[![npm](https://img.shields.io/npm/v/fsd-cruise?style=flat-square)][npm]

Simple dependency visualization for [Feature Sliced Design](https://feature-sliced.design/) based on [dependency-cruiser](https://www.npmjs.com/package/dependency-cruiser)

## Usage

### Install dependency-cruiser and run with npx

```shell
yarn add dependency-cruiser -D
npx fsd-cruise
```

> **requirements:** dependency-cruiser requires the `graphviz` library, which will be automatically installed using `brew`

> **limitations:** Currently, it only operates with the provided `tsconfig.json` and `src` folder paths, which are assumed by default to be in the root directory.
## Customization

1. You can provide custom paths to `src` folder and `tsconfig.json`
    ```shell
    npx fsd-cruise app/src app/tsconfig.json
    ```

## Output example
<img width="1078" alt="image" src="https://github.com/s4ff0x/fsd-cruise/assets/46251157/187837b4-5f79-425a-8e86-b34fa90e7a48">
