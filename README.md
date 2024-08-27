# OEIS

Allows basic searching of [OEIS](oeis.org) from VSCode

## Features

Allows searching for sequences in OEIS by running the `oeis.search` command:

![command](images/command.png)

View results of your search:

![results](images/results.png)

Filter results of your search:

![filtered](images/filtered_results.png)

Show sequence information in a new tab:

![display](images/display.png)

Highlight and right-click allows a quick search for a sequence from your editor.

![right_click](images/right_click.png)

![right_click](images/right_click.gif)

Links to [OEIS](oeis.org) will also appear in the description to allow you to quickly navigate to the website.

## Usage

Hit Ctrl+Shift+P to open command palette and search for "OEIS".

After selecting the "OEIS: Sequence Search" command, just type any sequence like you would on the oeis website.

If any sequences are found, they will be displayed in a drop down with basic information. When you select one of those items, its description will open in a new window.

I recommend creating a key binding for the command. I'm currently using Ctrl+Alt+S.
