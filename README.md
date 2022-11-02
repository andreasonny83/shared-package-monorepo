# Shared Package Monorepo

## The problem

When working on a monorepo, you might want to share an internal package across
different projects. This project should eventually be bundled inside the
different projects instead of having the need to release it independently to npm.

To achieve this functionality, TypeScript support defining references for such
packages by using the path alias feature inside the `tsconfig.json` file.
This enables you to easily import this shared code inside your project in the
same way you're normally consuming npm modules.

```
# tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@shared/utils": ["packages/shared/src"]
    }
  }
}
```

```
# somewhere else inside your project...
import { magicNumber } from '@shared/utils';
```

You can easily bundle that logic using a bundler like Webpack, Rollup, ESBuild
or similar. However, when distributing a TypeScript project you might also need
to release the type definition files for that package.

The TypScript Compiler (TSC) does not support a feature to bundle type definitions
files from packages sitting outside of your package root folder.
This will cause your `tsc` generated files to still have

The solution is your generated files to still reference to the `@shared/utils` package.
This will cause an error when installing this package on a different project
because `@shared/utils` is not a real node modules installable with npm.

```
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
var utils_1 = require("@shared/utils");  <<<--- This is the problem!
var react_1 = __importDefault(require("react"));
var number = utils_1.magicNumber;
var Button = function () { return (react_1.default.createElement("button", { type: "button", onClick: function () { return alert("the meaning if life is ".concat(number)); } }, "Click me")); };
exports.Button = Button;
//# sourceMappingURL=button.js.map
```

## The solution

To fix this problem and let the distribution code to correctly find the shared
package, we need 2 adjustments.
1. The distribution version of the package will need to also include the entire
distribution version of the shared package.
2. All the `@shared/utils` references need to be replaced with the location of
the folder containing the distribution version of the shared package.

To achieve that, we need to set the `baseUrl` to point outside of the 2 project
folders. This will allow TypeScript to generate a distribution version of both
packages inside the target package dist folder.

The `@shared/utils` import replacement will be achieved by running `tsc-alias`
against the generated distribution folder to replace `@shared/utils` with the
relative path of the folder.

Now the result is the following

```
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
var utils_1 = require("../../shared/src"); <<<--- This will now find the shared package!
var react_1 = __importDefault(require("react"));
var number = utils_1.magicNumber;
var Button = function () { return (react_1.default.createElement("button", { type: "button", onClick: function () { return alert("the meaning if life is ".concat(number)); } }, "Click me")); };
exports.Button = Button;
//# sourceMappingURL=button.js.map
```

## Development

Install the node module dependencies with pnpm

```sh
$ pnpm i
```

Build the distribution version of the components package

```sh
$ pnpm build
```