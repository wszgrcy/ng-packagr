import * as ts from 'typescript';
import * as ng from '@angular/compiler-cli';
import * as path from 'path';
import { ensureUnixPath } from '../util/path';
import { StylesheetProcessor } from '../ng-v5/entry-point/resources/stylesheet-processor';
import { EntryPointNode, fileUrl } from '../ng-v5/nodes';
import { Node } from '../brocc/node';
import { BuildGraph } from '../brocc/build-graph';
import { FileCache } from '../file/file-cache';
import { SourceFilePath } from '../ng-package-format/shared';
/** 优先查 sourcesFileCache  */
export function cacheCompilerHost(
  graph: BuildGraph,
  entryPoint: EntryPointNode,
  compilerOptions: ng.CompilerOptions,
  moduleResolutionCache: ts.ModuleResolutionCache,
  stylesheetProcessor?: StylesheetProcessor,
  sourcesFileCache: FileCache = entryPoint.cache.sourcesFileCache,
  extraData: { exist?: (fileName: string) => boolean } = {},
): ng.CompilerHost {
  const compilerHost = ng.createCompilerHost({ options: compilerOptions });

  const getNode = (fileName: string) => {
    const nodeUri = fileUrl(ensureUnixPath(fileName));
    let node = graph.get(nodeUri);

    if (!node) {
      node = new Node(nodeUri);
      graph.put(node);
    }

    return node;
  };

  const addDependee = (fileName: string) => {
    const node = getNode(fileName);
    entryPoint.dependsOn(node);
  };

  return {
    ...compilerHost,

    // ts specific
    fileExists: (fileName: string) => {
      const cache = sourcesFileCache.getOrCreate(fileName);
      if (cache.exists === undefined) {
        cache.exists = compilerHost.fileExists.call(this, fileName);
      }
      return cache.exists;
    },

    getSourceFile: (fileName: string, languageVersion: ts.ScriptTarget) => {
      addDependee(fileName);

      const cache = sourcesFileCache.getOrCreate(fileName);
      if (!cache.sourceFile) {
        cache.sourceFile = compilerHost.getSourceFile.call(this, fileName, languageVersion);
      }
      if (cache.sourceFile && !/.ngfactory/.test(fileName)) {
      }
      return cache.sourceFile;
    },

    writeFile: (
      fileName: string,
      data: string,
      writeByteOrderMark: boolean,
      onError?: (message: string) => void,
      sourceFiles?: ReadonlyArray<ts.SourceFile>,
    ) => {
      if (fileName.endsWith('.d.ts')) {
        sourceFiles.forEach(source => {
          const cache = sourcesFileCache.getOrCreate(source.fileName);
          if (!cache.declarationFileName) {
            cache.declarationFileName = ensureUnixPath(fileName);
          }
        });
      }

      compilerHost.writeFile.call(this, fileName, data, writeByteOrderMark, onError, sourceFiles);
    },

    readFile: (fileName: string) => {
      addDependee(fileName);

      const cache = sourcesFileCache.getOrCreate(fileName);
      if (cache.content === undefined) {
        cache.content = compilerHost.readFile.call(this, fileName);
      }
      return cache.content;
    },

    // ng specific
    moduleNameToFileName: (moduleName: string, containingFile: string) => {
      const { resolvedModule } = ts.resolveModuleName(
        moduleName,
        ensureUnixPath(containingFile),
        compilerOptions,
        compilerHost,
        moduleResolutionCache,
      );

      return resolvedModule && resolvedModule.resolvedFileName;
    },

    resourceNameToFileName: (resourceName: string, containingFilePath: string) => {
      const resourcePath = path.resolve(path.dirname(containingFilePath), resourceName);
      const containingNode = getNode(containingFilePath);
      const resourceNode = getNode(resourcePath);
      containingNode.dependsOn(resourceNode);

      return resourcePath;
    },

    readResource: (fileName: string) => {
      addDependee(fileName);

      const cache = sourcesFileCache.getOrCreate(fileName);
      if (cache.content === undefined) {
        cache.content = compilerHost.readFile.call(this, fileName);
        if (!/(html|htm|svg)$/.test(path.extname(fileName))) {
          cache.content = stylesheetProcessor.process(fileName, cache.content);
        }
        cache.exists = true;
      }

      return cache.content;
    },
  };
}
function getNgfactoryNodes(sf: ts.SourceFile, existCallback: (file) => boolean): ts.ExportDeclaration[] {
  let exportList: string[] = [];
  let list: ts.Node[] = [sf];
  while (list.length) {
    let node = list.pop();
    if (ts.isExportDeclaration(node) && existCallback(node.moduleSpecifier.getText())) {
      exportList.push(node.moduleSpecifier.getText());
    } else {
      ts.forEachChild(node, node => {
        list.push(node);
      });
    }
  }
  return exportList.map(item =>
    ts.createExportDeclaration(undefined, undefined, undefined, ts.createStringLiteral(item)),
  );
}
function appendExportDeclarations(sf: ts.SourceFile) {
  // ts.updateSourceFile()
}
