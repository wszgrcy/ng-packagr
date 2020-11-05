import * as nodePath from 'path';
/** 替换为unix格式路径 */
export const ensureUnixPath = (path?: string): string | null => {
  if (!path) {
    return null;
  }

  // we use a regex instead of the character literal due to a bug in some versions of node.js
  // the path separator needs to be preceded by an escape character
  const regex = new RegExp('\\' + nodePath.win32.sep, 'g');
  return path.replace(regex, nodePath.posix.sep);
};
