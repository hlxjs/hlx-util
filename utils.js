const {URL} = require('url');
const path = require('path');
const fs = require('fs');
const debug = require('debug');

const print = debug('hlx-util');
const {getDateString, getDateTimeString} = require('./date');

function THROW(err) {
  throw err;
}

function logError(err) {
  console.error(err.stack);
}

function tryCatch(...params) {
  const func = params.shift();
  try {
    return func();
  } catch (err) {
    if (params.length > 0) {
      return tryCatch(...params);
    }
    throw err;
  }
}

function createUrl(url, base = '') {
  return tryCatch(
    () => {
      return new URL(url);
    },
    () => {
      return new URL(url, base);
    },
    () => {
      return new URL(`file://${path.join(base ? path.dirname(base) : '', url)}`);
    }
  );
}

function getPathFromUrl(url) {
  return createUrl(url).pathname;
}

function getUrlType(url) {
  if (tryCatch(
      () => {
        url = new URL(url);
        return true;
      },
      () => {
        return false;
      }
    )) {
    return 'absolute';
  }

  if (url.startsWith('//')) {
    return 'scheme-relative';
  }

  if (url.startsWith('/')) {
    return 'path-absolute';
  }

  return 'path-relative';
}

function mkdirP(dir) {
  if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
    return;
  }
  tryCatch(
    () => {
      fs.mkdirSync(dir, {recursive: true});
    },
    () => {
      mkdirP(path.resolve(dir, '..'));
      fs.mkdirSync(dir);
    }
  );
}

function buildUrlObj(url, base) {
  const obj = tryCatch(
    () => new URL(url),
    () => new URL(url, base),
    () => null
  );

  if (obj) {
    obj.search = '';
    obj.hash = '';
    if (obj.hostname && base && !obj.pathname.startsWith(obj.hostname, 1)) {
      obj.pathname = path.join('/', obj.hostname, obj.pathname);
    }
  }
  return obj;
}

function buildAbsolutePath(relativePath, basePath, inputDir, outputDir) {
  print(`buildAbsolutePath: relativePath=${relativePath}, basePath=${basePath}, inputDir=${inputDir}, outputDir=${outputDir}`);
  const fullPath = path.join(path.dirname(basePath), relativePath);
  print(`\tfullPath=${fullPath}`);
  return path.join(outputDir, fullPath.startsWith(inputDir) ? path.relative(inputDir, fullPath) : fullPath);
}

function removeQueryString(absolutePath) {
  const obj = buildUrlObj(`file://${absolutePath}`);
  return obj.pathname;
}

function buildLocalPath(uri, parentUri, inputDir, outputDir) {
  print(`buildLocalPath: uri=${uri}, parentUri=${parentUri}, inputDir=${inputDir}, outputDir=${outputDir}`);
  let localPath;
  if (path.isAbsolute(uri)) {
    localPath = path.join(outputDir, uri);
    print(`\tFrom absolute path to localPath: ${localPath}`);
    return removeQueryString(localPath);
  }
  const obj = buildUrlObj(uri, parentUri);
  if (obj) {
    localPath = buildAbsolutePath(obj.pathname, '/', inputDir, outputDir);
    print(`\tFrom absolute url to localPath: ${localPath}`);
    return localPath;
  }
  localPath = buildAbsolutePath(uri, parentUri, inputDir, outputDir);
  print(`\tFrom relative path to localPath: ${localPath}`);
  return removeQueryString(localPath);
}

module.exports = {
  THROW: process.env.NODE_ENV === 'production' ? logError : THROW,
  tryCatch,
  createUrl,
  getPathFromUrl,
  getUrlType,
  getDateString,
  getDateTimeString,
  mkdirP,
  buildUrlObj,
  removeQueryString,
  buildLocalPath
};
