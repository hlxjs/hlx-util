const {URL} = require('url');
const path = require('path');
const fs = require('fs');

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

function buildLocalPathFromUrl(url, inputDir, outputDir) {
  const obj = tryCatch(
    () => new URL(url),
    () => null
  );

  if (!obj) {
    return '';
  }

  obj.search = '';
  obj.hash = '';

  if (obj.protocol === 'file:') {
    return path.join(outputDir, path.relative(inputDir, obj.pathname));
  }
  return path.join(outputDir, obj.hostname, obj.pathname);
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
  buildLocalPathFromUrl
};
