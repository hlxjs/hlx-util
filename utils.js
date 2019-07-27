const {URL} = require('url');
const path = require('path');

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
      return new URL(`file://${path.join(base, url)}`);
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

function getDateString(date) {
  return `${date.getUTCFullYear()}-${('00' + (date.getUTCMonth() + 1)).slice(-2)}-${('00' + date.getUTCDate()).slice(-2)}`;
}

function getTimeString(date) {
  return `${('00' + date.getUTCHours()).slice(-2)}:${('00' + date.getUTCMinutes()).slice(-2)}:${('00' + date.getUTCSeconds()).slice(-2)}`;
}

function getDateTimeString() {
  const date = new Date();
  return `${getDateString(date)} ${getTimeString(date)}`;
}

module.exports = {
  THROW: process.env.NODE_ENV === 'production' ? logError : THROW,
  tryCatch,
  createUrl,
  getPathFromUrl,
  getUrlType,
  getDateString,
  getDateTimeString
};
