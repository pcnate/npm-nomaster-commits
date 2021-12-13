# npm-nomaster-commits

## Description:

NPM package that adds a pre-commit hook that blocks commits to the master/main/truck branches of a git repository. May be optionally installed globally to provide commands to install the pre-commit hook into the local git repository.

> Security notice: this will create a shell script that gets executed by git on every commit. Be sure to verify the code does what I say it does if you have any concerns about security.

## Installation

Install as a dependency of an NPM package with the following command. This will install the package and activate the pre-commit hook.

`npm install --save-dev npm-nomaster-commits`

Install globally as a system command with the following command. This will allow `nomaster` and `nomain` to be executable commands that allow you to install or uninstall the pre-commit hook once in the current working directory if it contains a .git folder.

`npm install --global npm-nomaster-commits`

Then from a valid git repository run the following:

`nomaster --install`

`nomain --install`

## Usage:

 * nomaster [options]
 * nomain [options]

Examples:
 * nomaster --install --directory /home/yourUser/github/yourRepository
 * nomaster --install --directory c:\github\yourRepository
 * nomaster --status

## Options:
| option | description |
|--|--|
| help | Shows this help file. This is the default if no other option is provided. |
| install | Install the pre-commit hook into the current .git folder of the current repository |
| uninstall | Remove the matching pre-commit hook from the current .git folder of the current repository |
| status | Shows the current installation status of the current working  directory. It also will show if the current working directory is a valid git repository. |
| verbose | Increase the verbosity of logging for debug purposes |
