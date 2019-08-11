const path = require('path');
const test = require('ava');
const rewire = require('rewire');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const date = rewire('../../date');

date.__set__({
  Date: class MockDate extends Date {
    constructor() {
      super(0);
    }
  }
});

const mockFs = {
  _currentPath: '/path/to/',
  mkdirSync(dir) {
    const diff = path.relative(this._currentPath, dir);
    if (diff.includes('/')) {
      throw new Error('File not found');
    }
    this._currentPath = dir;
  },
  existsSync(path) {
    return this._currentPath.startsWith(path);
  },
  lstatSync() {
    return {
      isDirectory() {
        return true;
      }
    };
  }
};

const utils = proxyquire('../../utils', {fs: mockFs, './date': date});

test('utils.THROW', t => {
  try {
    utils.THROW(new Error('abc'));
  } catch (err) {
    t.truthy(err);
    t.is(err.message, 'abc');
  }
});

test('utils.tryCatch', t => {
  let result = utils.tryCatch(
    () => {
      return 1;
    },
    () => {
      return 0;
    }
  );
  t.is(result, 1);
  result = utils.tryCatch(
    () => {
      return JSON.parse('{{');
    },
    () => {
      return 0;
    }
  );
  t.is(result, 0);
  t.throws(() => {
    utils.tryCatch(
      () => {
        return JSON.parse('{{');
      },
      () => {
        return JSON.parse('}}');
      }
    );
  });
  result = utils.tryCatch(
    () => {
      return JSON.parse('{{');
    },
    () => {
      return JSON.parse('}}');
    },
    () => {
      return 0;
    }
  );
  t.is(result, 0);
});

test('utils.createUrl', t => {
  let url = utils.createUrl('http://abc.com');
  t.is(url.href, 'http://abc.com/');
  url = utils.createUrl('http://abc.com', 'http://def.com');
  t.is(url.href, 'http://abc.com/');
  url = utils.createUrl('/abc', 'http://def.com');
  t.is(url.href, 'http://def.com/abc');
});

test('utils.getPathFromUrl', t => {
  t.is(utils.getPathFromUrl('http://foo.bar/dir/file'), '/dir/file');
  t.is(utils.getPathFromUrl('/dir/file'), '/dir/file');
});

test('utils.getUrlType', t => {
  t.is(utils.getUrlType('http://foo.bar/dir/file'), 'absolute');
  t.is(utils.getUrlType('file:///path/to/file'), 'absolute');
  t.is(utils.getUrlType('//foo.bar/dir/file'), 'scheme-relative');
  t.is(utils.getUrlType('/dir/file'), 'path-absolute');
  t.is(utils.getUrlType('dir/file'), 'path-relative');
  t.is(utils.getUrlType('file'), 'path-relative');
});

test('utils.getDateTimeString', t => {
  t.is(utils.getDateTimeString(), '1970-01-01 00:00:00');
});

test('utils.mkdirP', t => {
  const spy = sinon.spy(mockFs, 'mkdirSync');
  utils.mkdirP('/path/to/dir/not/yet/existing/');
  t.is(spy.callCount, 7);
  t.is(path.resolve(spy.getCall(0).args[0]), '/path/to/dir/not/yet/existing');
  t.is(path.resolve(spy.getCall(1).args[0]), '/path/to/dir/not/yet');
  t.is(path.resolve(spy.getCall(2).args[0]), '/path/to/dir/not');
  t.is(path.resolve(spy.getCall(3).args[0]), '/path/to/dir');
  t.is(path.resolve(spy.getCall(4).args[0]), '/path/to/dir/not');
  t.is(path.resolve(spy.getCall(5).args[0]), '/path/to/dir/not/yet');
  t.is(path.resolve(spy.getCall(6).args[0]), '/path/to/dir/not/yet/existing');
  t.truthy(spy.exceptions[0]);
  t.truthy(spy.exceptions[1]);
  t.truthy(spy.exceptions[2]);
  t.falsy(spy.exceptions[3]);
  t.falsy(spy.exceptions[4]);
  t.falsy(spy.exceptions[5]);
  t.falsy(spy.exceptions[6]);
});

test('utils.buildUrlObj', t => {
  let obj;
  obj = utils.buildUrlObj('http://example.com/path/to/file?foo=bar#hash');
  t.is(obj.pathname, '/example.com/path/to/file');
  obj = utils.buildUrlObj('file:///path/to/inputDir/subdir/file');
  t.is(obj.pathname, '/path/to/inputDir/subdir/file');
  obj = utils.buildUrlObj('../../path2/to/file?foo=bar#hash', 'http://example.com/path/to/file');
  t.is(obj.pathname, '/example.com/path2/to/file');
  obj = utils.buildUrlObj('/path/to/inputDir/subdir/file');
  t.is(obj, null);
});

test('utils.buildLocalPath', t => {
  let localPath;
  localPath = utils.buildLocalPath('/path/to/file', '', '/path/to/inputDir', '/path/to/outputDir');
  t.is(localPath, '/path/to/outputDir/path/to/file');
  localPath = utils.buildLocalPath('http://example.com/path/to/file?foo=bar#hash', '', '/path/to/inputDir', '/path/to/outputDir');
  t.is(localPath, '/path/to/outputDir/example.com/path/to/file');
  localPath = utils.buildLocalPath('file:///path/to/inputDir/subdir/file', '', '/path/to/inputDir', '/path/to/outputDir');
  t.is(localPath, '/path/to/outputDir/subdir/file');
  localPath = utils.buildLocalPath('http://example2.com/path/to/file?foo=bar#hash', 'http://example.com/path/to/file', '/path/to/inputDir', '/path/to/outputDir');
  t.is(localPath, '/path/to/outputDir/example2.com/path/to/file');
  localPath = utils.buildLocalPath('file:///path/to/inputDir/subdir2/file', 'file:///path/to/inputDir/subdir/file', '/path/to/inputDir', '/path/to/outputDir');
  t.is(localPath, '/path/to/outputDir/subdir2/file');
  localPath = utils.buildLocalPath('../../path2/to/file?foo=bar#hash', 'http://example.com/path/to/file', '/path/to/inputDir', '/path/to/outputDir');
  t.is(localPath, '/path/to/outputDir/example.com/path2/to/file');
  localPath = utils.buildLocalPath('../subdir2/file', 'file:///path/to/inputDir/subdir/file', '/path/to/inputDir', '/path/to/outputDir');
  t.is(localPath, '/path/to/outputDir/subdir2/file');
  localPath = utils.buildLocalPath('../subdir2/file', '/path/to/inputDir/subdir/file', '/path/to/inputDir', '/path/to/outputDir');
  t.is(localPath, '/path/to/outputDir/subdir2/file');
});
