const os = require( 'os' );
const packageJson = require('../package.json');
const y = ( new Date() ).getFullYear();

module.exports = () => `
Name:
\t${ packageJson?.name } v${ packageJson?.version }

Description:
\tNPM package that adds a pre-commit hook that blocks commits to the
\tmaster/main/truck branches of a git repository. May be optionally inst-
\talled globally to provide commands to install the pre-commit hook into
\tthe local git repository.
    
Usage:
\tnomaster [options]
\tnomain [options]

Examples:
\tnomaster --install --directory /home/yourUser/github/yourRepository
\tnomaster --install --directory c:\\github\\yourRepository
\tnomaster --status

Options:
\t--help      Shows this help file. This is the default if no other
\t            option is provided.

\t--install   Install the pre-commit hook into the .git folder of the
\t            specified directory

\t--uninstall Remove the matching pre-commit hook from the .git folder
\t            of the specified directory

\t--directory Specify the location of the git repository. Defaults to
\t            the current working directory.

\t--status    Shows the current installation status of the specified
\t            directory. It also will show if the current specified
\t            directory is a valid git repository.

\t--verbose   Increase the verbosity of logging for debug purposes

Copyright:
\tCopyright © ${y} Nathan Baker. This is free software: you are free to
\tchange and redistribute it. There is NO WARRANTY, to the extent perm-
\titted by law. Distributed under the MIT License available on GitHub
\t<https://github.com/pcnate/npm-nomaster-commits/blob/master/LICENSE>

Authors:
\t${ packageJson?.author }
`.replace( /(\r|\r\n)/gmi, os.EOL );
