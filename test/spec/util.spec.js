const test = require('ava');
const rewire = require('rewire');

const utils = rewire('../../utils');

utils.__set__({
  Date: class MockDate extends Date {
    constructor() {
      super(0);
    }
  }
});

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
