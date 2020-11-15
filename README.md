# ng-packagr

> Transpile your libraries to Angular Package Format


[![npm](https://img.shields.io/npm/v/ng-packagr.svg?style=flat-square)](https://www.npmjs.com/package/ng-packagr)
[![npm License](https://img.shields.io/npm/l/ng-packagr.svg?style=flat-square)](https://github.com/ng-packagr/ng-packagr/blob/master/LICENSE)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)
[![CircleCI](https://img.shields.io/circleci/project/github/ng-packagr/ng-packagr/master.svg?label=Circle%20CI&style=flat-square)](https://circleci.com/gh/ng-packagr/ng-packagr)

[![GitHub contributors](https://img.shields.io/github/contributors/ng-packagr/ng-packagr.svg?style=flat-square)](https://github.com/ng-packagr/ng-packagr)
[![GitHub stars](https://img.shields.io/github/stars/ng-packagr/ng-packagr.svg?label=GitHub%20Stars&style=flat-square)](https://github.com/ng-packagr/ng-packagr)
[![npm Downloads](https://img.shields.io/npm/dw/ng-packagr.svg?style=flat-square)](https://www.npmjs.com/package/ng-packagr)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg?style=flat-square)](https://renovateapp.com/)

## Credits

### Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].

<a href="https://github.com/ng-packagr/ng-packagr/graphs/contributors"><img src="https://opencollective.com/ng-packagr/contributors.svg?width=890&button=false" /></a>

## Installation

```bash
npm install -D ng-packagr
```

## Usage Example

Let's walk through a _getting started_ that'll build an Angular library from TypeScript sources and create a distribution-ready npm package:
create a `package.json` file, add the custom `ngPackage` property, and eventually run `ng-packagr -p package.json`
– Here we go:

```json
{
  "$schema": "./node_modules/ng-packagr/package.schema.json",
  "name": "@my/foo",
  "version": "1.0.0",
  "ngPackage": {
    "lib": {
      "entryFile": "public_api.ts"
    }
  }
}
```

Note 1: Paths in the `ngPackage` section are resolved relative to the location of the `package.json` file.
In the above example, `public_api.ts` is the entry file to the library's sources and must be placed next to `package.json` (a sibling in the same folder).

Note 2: referencing the `$schema` enables JSON editing support (auto-completion for configuration) in IDEs like [VSCode](https://github.com/Microsoft/vscode).

You can easily run _ng-packagr_ through a npm/yarn script:

```json
{
  "scripts": {
    "build": "ng-packagr -p package.json"
  }
}
```

Now, execute the build with the following command:

```bash
$ yarn build
```

The build output is written to the `dist` folder, containing all those _binaries_ to meet the Angular Package Format specification.
You'll now be able to go ahead and `npm publish dist` your Angular library to the npm registry.

Do you like to publish more libraries?
Is your code living in a monorepo?
Create one `package.json` per npm package, run _ng-packagr_ for each!

## Features

* :gift: Implements [Angular Package Format](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview)
  * :checkered_flag: Bundles your library in FESM2015, FESM5, and UMD formats
  * :school_satchel: npm package can be consumed by [Angular CLI](https://github.com/angular/angular-cli), [Webpack](https://github.com/webpack/webpack), or [SystemJS](https://github.com/systemjs/systemjs)
  * :dancer: Creates type definitions (`.d.ts`)
  * :runner: Generates [Ahead-of-Time](https://angular.io/guide/aot-compiler#why-do-aot-compilation) metadata (`.metadata.json`)
  * :trophy: Auto-discovers and bundles secondary entry points such as `@my/foo`, `@my/foo/testing`, `@my/foo/bar`
* :mag_right: Creates [scoped and non-scoped packages](https://docs.npmjs.com/misc/scope) for publishing to npm registry
* :surfer: Inlines Templates and Stylesheets
* :sparkles: CSS Features
  * :camel: Runs [SCSS](http://sass-lang.com/guide) preprocessor, supporting the [relative `~` import syntax](https://github.com/webpack-contrib/sass-loader#imports) and custom include paths
  * :elephant: Runs [less](http://lesscss.org/#getting-started) preprocessor, supports the relative `~` import syntax
  * :snake: Runs [Stylus](http://stylus-lang.com) preprocessor, resolves relative paths relative to ng-package.json
  * :monkey: Adds vendor-specific prefixes w/ [autoprefixer](https://github.com/postcss/autoprefixer#autoprefixer-) and [browserslist](https://github.com/ai/browserslist#queries) &mdash; just tell your desired `.browserslistrc`
  * :tiger: Embed assets data w/ [postcss-url](https://github.com/postcss/postcss-url#inline)


## How to…
- [Embed Assets in CSS](docs/embed-assets-css.md)
- [Managing Dependencies](docs/dependencies.md)
- [Change the Entry File of a Library](docs/entry-file.md)
- [Change Configuration Locations](docs/configuration-locations.md)
- [Override tsconfig](docs/override-tsconfig.md)
- [Add Style Include Paths](docs/style-include-paths.md)
- [Change ECMAScript Language Level](docs/language-level.md)
- [Package Secondary Entrypoints (sub packages)](docs/secondary-entrypoints.md)
- [Enable JSX Templates, Bridging the Gap Between Angular and React](docs/jsx.md)

## Advanced Use Cases

#### Examples and Tutorials

A great step-by-step [example of making an Angular CLI project with a library distributed separate from the app](https://github.com/jasonaden/angular-cli-lib-example), by Jason Aden

Nikolas LeBlanc wrote a tutorial on [building an Angular 4 Component Library with the Angular CLI and ng-packagr](https://medium.com/@ngl817/building-an-angular-4-component-library-with-the-angular-cli-and-ng-packagr-53b2ade0701e)

Here is a [demo repository showing ng-packagr and Angular CLI](https://github.com/ng-packagr/ng-packaged) in action.

What about [ng-packagr alongside Nx Workspace](https://github.com/ng-packagr/nx-packaged)? Well, they work well together!

#### Further user questions and issue-driven documentation

We keep track of user questions in GitHub's issue tracker and try to build a documentation from it.
[Explore issues w/ label documentation](https://github.com/ng-packagr/ng-packagr/issues?q=label%3Adocumentation%20).

#### Contributing to ng-packagr

[General contribution guidelines](./CONTRIBUTING.md)

If you like to submit a pull request, you'll find it helpful to take a look at the [initial design document where it all started](./docs/DESIGN.md).

To orchestrate the different tools, ng-packagr features a [custom transformation pipeline](docs/transformation-pipeline.md#a-transformation-pipeline). The transformation pipeline is built on top of RxJS and Angular Dependency Injection concepts.

## Knowledge

[Angular Package Format v6.0](https://docs.google.com/document/d/1CZC2rcpxffTDfRDs6p1cfbmKNLA6x5O-NtkJglDaBVs/preview), design document at Google Docs

Packaging Angular Libraries - Jason Aden at Angular Mountain View Meetup ([Jan 2018, 45min talk](https://www.youtube.com/watch?v=QfvwQEJVOig&t=3612s))

Create and publish Angular libs like a Pro - Juri Strumpflohner at NG-BE ([Dec 2017, 30min talk](https://youtu.be/K4YMmwxGKjY))

[![Juri Strumpflohner - Create and publish Angular libs like a Pro](https://img.youtube.com/vi/K4YMmwxGKjY/0.jpg)](https://youtu.be/K4YMmwxGKjY)

Packaging Angular - Jason Aden at ng-conf 2017 ([28min talk](https://youtu.be/unICbsPGFIA))

[![Packaging Angular - Jason Aden](https://img.youtube.com/vi/unICbsPGFIA/0.jpg)](https://youtu.be/unICbsPGFIA)


Create and publish Angular libs like a Pro - Juri Strumpflohner at ngVikings, this time demoing building Angular libraries with ng-packagr, with NX as well as Bazel ([March 2018, 30min talk](https://youtu.be/Tw8TCgeqotg))

[![Juri Strumpflohner - Create & Publish Angular Libs like a PRO at ngVikings](https://img.youtube.com/vi/Tw8TCgeqotg/0.jpg)](https://youtu.be/Tw8TCgeqotg)

# 改版说明
- 仅仅是为了支持aot模式的library打包,启动ivy会直接构建可以用的模块,所以此项目的研究,应该有点`过时`了
- 原意是将library打包输出为构建好的ngfactory模块
- 目前绝大部分已经成功,唯一bug(已知)应该是ngstyle也就是style不能使用,无法输出ngstyle
- 可以实现的就是远程路由技术,远程模块技术
- 未实现模块的远程引入(cdn式的),大概原因就是构建时,仍然会重新构建一遍ngfactory,如果要修改,估计要直接修改angular部分包进行支持
# 使用说明
- tsconfig.json
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "../../out-tsc/lib",
    "target": "es2015",
    "declaration": true,
    "inlineSources": true,
    "types": [],
    "lib": [
      "dom",
      "es2018"
    ]
  },
  // 这里参考设置
  "angularCompilerOptions": {
    // 必须
    "annotateForClosureCompiler": false,
    // 必须
    "skipTemplateCodegen": false,
    "strictMetadataEmit": true,
    "fullTemplateTypeCheck": true,
    "strictInjectionParameters": true,
    "enableResourceInlining": true,
    // 必须
    "enableIvy":false
  },
  "exclude": [
    "src/test.ts",
    "**/*.spec.ts"
  ]
}

```
- 将此分支构建以后npm link替换掉原来的`ng-packagr`后,就可以使用了(正常构建流程)
# 实现原理
- 首先上面的tsconfig设置是要保证代码使用默认的emit方式,既默认输出方式
- 然后在代码中(本项目中)将es5的默认配置注释掉,使得和es2015输出一致(umd包是会根据es5打包的)
- 最后通过逻辑,将输出的ngfactory文件加入到导出中(如果不加入,那么umd构建仍然不包含)
# 调用构建包
- 直接通过js引入,然后类似动态生成模块那样就Ok了
```ts
/**LibAotModuleNgFactory 这个就是通过引入的umd包中的导出*/
    const ref = LibAotModuleNgFactory.create(this.inject);
    console.log(ref);
    const fac = ref.componentFactoryResolver.resolveComponentFactory(
      ref.instance.entry
    );
    console.log(fac);
    this.viewContainerRef.createComponent(fac);
```
- 通过路由引用`loadChildren`方式,直接引用`ngfactory`
> 未测试,但是ng源码的测试用例中可以使用

# 已知问题(由于占用时间过多,已经没精力解决了,愿意搞的大牛可以试试)
- 不能使用style,因为没有导出ngstyle文件
- 引用构建好的library后,仍然会在构建时生成ngfactory,不知道是ngfactory有特殊的引用方法,还是需要改ng源码,进行一些重定向或者移除替换操作(因为externals只会移除部分,html模板仍然会打进去)

