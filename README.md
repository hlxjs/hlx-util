[![Build Status](https://travis-ci.org/hlxjs/hlx-util.svg?branch=master)](https://travis-ci.org/hlxjs/hlx-util)
[![Coverage Status](https://coveralls.io/repos/github/hlxjs/hlx-util/badge.svg?branch=master)](https://coveralls.io/github/hlxjs/hlx-util?branch=master)
[![Dependency Status](https://david-dm.org/hlxjs/hlx-util.svg)](https://david-dm.org/hlxjs/hlx-util)
[![Development Dependency Status](https://david-dm.org/hlxjs/hlx-util/dev-status.svg)](https://david-dm.org/hlxjs/hlx-util#info=devDependencies)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

# hlx-util
A library to preserve the functions commonly used in hlx objects

## Install
[![NPM](https://nodei.co/npm/hlx-util.png?mini=true)](https://nodei.co/npm/hlx-util/)

## API

### `createWriteStream(options)`
Creates a new `TransformStream` object.

#### params
| Name    | Type   | Required | Default | Description   |
| ------- | ------ | -------- | ------- | ------------- |
| options | object | Yes       | N/A      | See below     |

#### options
| Name        | Type   | Default | Description                       |
| ----------- | ------ | ------- | --------------------------------- |
| endpoint | string | N/A     | URL of the destination (webdav server endpoint) |
| rootPath | string | The path included in `url` | Will be used when the playlist contains relative urls |
| agent | http.Agent | undefined | Proxy agent |

#### return value
An instance of `TransformStream`.
