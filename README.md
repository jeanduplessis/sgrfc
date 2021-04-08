sgrfc
=====

CLI for interacting with Sourcegraph RFCs

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/sgrfc.svg)](https://npmjs.org/package/sgrfc)
[![Codecov](https://codecov.io/gh/jeanduplessis/sgrfc/branch/master/graph/badge.svg)](https://codecov.io/gh/jeanduplessis/sgrfc)
[![Downloads/week](https://img.shields.io/npm/dw/sgrfc.svg)](https://npmjs.org/package/sgrfc)
[![License](https://img.shields.io/npm/l/sgrfc.svg)](https://github.com/jeanduplessis/sgrfc/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g sgrfc
$ sgrfc COMMAND
running command...
$ sgrfc (-v|--version|version)
sgrfc/1.0.0 darwin-x64 node-v14.15.5
$ sgrfc --help [COMMAND]
USAGE
  $ sgrfc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`sgrfc hello [FILE]`](#sgrfc-hello-file)
* [`sgrfc help [COMMAND]`](#sgrfc-help-command)

## `sgrfc hello [FILE]`

describe the command here

```
USAGE
  $ sgrfc hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ sgrfc hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/jeanduplessis/sgrfc/blob/v1.0.0/src/commands/hello.ts)_

## `sgrfc help [COMMAND]`

display help for sgrfc

```
USAGE
  $ sgrfc help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_
<!-- commandsstop -->
