# OEIS

Allows basic searching of OEIS from VSCode

## Features

Allows searching for sequences in OEIS by running the `oeis.search` command. A quick pick menu will show potential matches and clicking one of them will open that sequence in OEIS in your browser.

## Installation instructions

1. Install vsce
```
❯ npm install -g vsce
```

2. Create package with vsce (type y to continue through warnings)
```
❯ vsce package
 WARNING  A 'repository' field is missing from the 'package.json' manifest file.
Do you want to continue? [y/N] y
 WARNING  LICENSE.md, LICENSE.txt or LICENSE not found
Do you want to continue? [y/N] y
 DONE  Packaged: /home/sam/repos/oeis/oeis-0.0.1.vsix (150 files, 357.77KB)
```

3. Install the package
```
❯ code --install-extension oeis-0.0.1.vsix --force
Installing extensions...
Extension 'oeis-0.0.1.vsix' was successfully installed.
```