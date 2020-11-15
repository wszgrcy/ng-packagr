import * as ng from '@angular/compiler-cli';
import * as ts from 'typescript';
import * as log from '../util/log';
import { redirectWriteFileCompilerHost } from '../ts/redirect-write-file-compiler-host';
import { cacheCompilerHost } from '../ts/cache-compiler-host';
import { StylesheetProcessor } from '../ng-v5/entry-point/resources/stylesheet-processor';
import { BuildGraph } from '../brocc/build-graph';
import { EntryPointNode, isEntryPointInProgress } from '../ng-v5/nodes';
import { NgccProcessor } from './ngcc-processor';
import { ngccTransformCompilerHost } from '../ts/ngcc-transform-compiler-host';
import { createEmitCallback } from './create-emit-callback';
import { downlevelConstructorParameters } from '../ts/ctor-parameters';
import * as path from 'path';
import { EmitFlags } from '@angular/compiler-cli';
import { GeneratedFile } from '@angular/compiler';

export async function compileSourceFiles(
  graph: BuildGraph,
  tsConfig: ng.ParsedConfiguration,
  moduleResolutionCache: ts.ModuleResolutionCache,
  stylesheetProcessor: StylesheetProcessor,
  extraOptions?: Partial<ng.CompilerOptions>,
  declarationDir?: string,
  ngccProcessor?: NgccProcessor,
) {
  log.debug(`ngc (v${ng.VERSION.full})`);

  const tsConfigOptions: ng.CompilerOptions = { ...tsConfig.options, ...extraOptions };
  const entryPoint = graph.find(isEntryPointInProgress()) as EntryPointNode;
  let extraData: any = {};
  let tsCompilerHost = cacheCompilerHost(
    graph,
    entryPoint,
    tsConfigOptions,
    moduleResolutionCache,
    stylesheetProcessor,
    undefined,
    // extraData,
  );
  if (declarationDir) {
    tsCompilerHost = redirectWriteFileCompilerHost(tsCompilerHost, tsConfigOptions.basePath, declarationDir);
  }

  if (tsConfigOptions.enableIvy && ngccProcessor) {
    tsCompilerHost = ngccTransformCompilerHost(tsCompilerHost, tsConfigOptions, ngccProcessor, moduleResolutionCache);
  }

  // ng.CompilerHost
  const ngCompilerHost = ng.createCompilerHost({
    options: tsConfigOptions,
    tsHost: tsCompilerHost,
  });

  const scriptTarget = tsConfigOptions.target;
  const cache = entryPoint.cache;
  const oldProgram = cache.oldPrograms && (cache.oldPrograms[scriptTarget] as ng.Program | undefined);

  const ngProgram = ng.createProgram({
    rootNames: tsConfig.rootNames,
    options: tsConfigOptions,
    host: ngCompilerHost,
    oldProgram,
  });
  let oldCalculateTransforms: Function = (ngProgram as any).calculateTransforms;
  (ngProgram as any).calculateTransforms = function(...args) {
    let result: ts.CustomTransformers = oldCalculateTransforms.apply(this, args);

    let list = [
      ctx => {
        ctx;
        return (sf: ts.SourceFile) => {
          let JS_EXT = /(\.js|)$/;
          let entry = path.join(
            tsConfig.options.rootDir,
            tsConfig.options.flatModuleOutFile.replace(JS_EXT, '.ts'),
          );
          if (path.resolve(sf.fileName) === path.resolve(entry)) {
            return sf;
          }
          let exportList = getNgfactoryNodes(sf, extraData.exist);
          return appendExportDeclarations(sf, exportList);
        };
      },
    ];
    result.afterDeclarations = result.afterDeclarations ? [...result.afterDeclarations, ...list] : list;
    return result;
  };
  extraData.exist = (file: string) => {
    file = path.resolve(tsConfig.options.rootDir, file);
    // if (/\.ts/.test(file)) {
    //   return (ngProgram as any).hostAdapter.fileExists(file);
    // }
    // return (ngProgram as any).hostAdapter.fileExists(file + '.ts');

    let { genFiles } = (ngProgram as any).generateFilesForEmit(EmitFlags.Default) as { genFiles: GeneratedFile[] };
    let list = genFiles
      .filter(gf => {
        return gf.stmts;
      })
      .map(file => file.genFileUrl);
    return list.some(item => path.resolve(item).includes(file));
  };
  await ngProgram.loadNgStructureAsync();

  log.debug(
    `ngc program structure is reused: ${
      oldProgram ? (oldProgram.getTsProgram() as any).structureIsReused : 'No old program'
    }`,
  );

  cache.oldPrograms = { ...cache.oldPrograms, [scriptTarget]: ngProgram };

  const allDiagnostics = [
    ...ngProgram.getTsOptionDiagnostics(),
    ...ngProgram.getNgOptionDiagnostics(),
    ...ngProgram.getTsSyntacticDiagnostics(),
    ...ngProgram.getTsSemanticDiagnostics(),
    ...ngProgram.getNgSemanticDiagnostics(),
    ...ngProgram.getNgStructuralDiagnostics(),
  ];

  // if we have an error we don't want to transpile.
  const hasError = ng.exitCodeFromResult(allDiagnostics) > 0;
  if (!hasError) {
    const emitFlags = tsConfigOptions.declaration ? tsConfig.emitFlags : ng.EmitFlags.JS;
    // certain errors are only emitted by a compilation hence append to previous diagnostics
    const { diagnostics } = ngProgram.emit({
      emitFlags,
      // For Ivy we don't need a custom emitCallback to have tsickle transforms
      emitCallback: tsConfigOptions.enableIvy ? undefined : createEmitCallback(tsConfigOptions),
      customTransformers: {
        beforeTs: [
          downlevelConstructorParameters(() => ngProgram.getTsProgram().getTypeChecker()),
          //todo 这里只能转换.ts,需要在其他地方实现.d.ts
          ctx => {
            ctx;
            return sf => {
              let JS_EXT = /(\.js|)$/;
              let entry = path.join(
                tsConfig.options.rootDir,
                tsConfig.options.flatModuleOutFile.replace(JS_EXT, '.ts'),
              );
              if (path.resolve(sf.fileName) === path.resolve(entry)) {
                return sf;
              }
              let exportList = getNgfactoryNodes(sf, extraData.exist);
              return appendExportDeclarations(sf, exportList);
            };
          },
        ],
      },
    });

    allDiagnostics.push(...diagnostics);
  }

  if (allDiagnostics.length === 0) {
    return;
  }

  const exitCode = ng.exitCodeFromResult(allDiagnostics);
  const formattedDiagnostics = ng.formatDiagnostics(allDiagnostics);
  if (exitCode !== 0) {
    throw new Error(formattedDiagnostics);
  } else {
    log.msg(formattedDiagnostics);
  }
}

function getNgfactoryNodes(sf: ts.SourceFile, existCallback: (file) => boolean): ts.ExportDeclaration[] {
  let exportList: string[] = [];
  // let list: ts.Node[] = [sf];
  ts.forEachChild(sf, node => {
    let exportFileName =
      node &&
      (node as ts.ExportDeclaration).moduleSpecifier &&
      ts.isExportDeclaration(node) &&
      (node.moduleSpecifier as ts.StringLiteral).text;

    if (exportFileName && !/.ngfactory/.test(exportFileName) && existCallback(exportFileName)) {
      //todo 测试
      exportList.push(exportFileName + '.ngfactory');
    }
  });
  // while (list.length) {
  //   let node = list.pop();
  //   else {
  //     ts.forEachChild(node, node => {
  //       list.push(node);
  //     });
  //   }
  // }
  return exportList.map(item =>
    ts.createExportDeclaration(undefined, undefined, undefined, ts.createStringLiteral(item)),
  );
}
function appendExportDeclarations(sf: ts.SourceFile, nodes: ts.ExportDeclaration[]): ts.SourceFile {
  if (!nodes.length) {
    return sf;
  }
  let printer = ts.createPrinter();
  let nodesStr = '';
  nodes.forEach(node => {
    let str = printer.printNode(ts.EmitHint.Unspecified, node, sf);
    nodesStr = `${nodesStr}${str}`;
  });
  let oldFileStr = printer.printNode(ts.EmitHint.SourceFile, sf, sf);
  let fileStr = `${oldFileStr}${nodesStr}`;
  (sf as any).hasBeenIncrementallyParsed = false;
  sf.end = sf.text.length;
  sf.endOfFileToken.end = sf.end;
  return sf.update(fileStr, { span: { start: 0, length: sf.text.length }, newLength: fileStr.length });
}
