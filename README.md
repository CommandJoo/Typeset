# Typeset
[Typeset](https://github.com/CommandJoo/Typeset) is a Plugin for [Obsidian](https://obsidian.md) that adds a split-view editor for [LaTeX](https://www.latex-project.org/) and [Typst](https://typst.app/), with a live PDF-rendered preview.

## Installation
Go into your Obsidian Vault
```sh
cd .obsidian/plugins
git clone https://github.com/CommandJoo/Typeset.git
```
Go into your Obsidian Settings / Community Plugins and enable it.

## Usage
Create a `.tex` or `.typ` file in your Vault directory.
Then just open the file like any other file in Obsidian.

### List of Settings
| Setting  | Value      | Description                                                                                          |
|----------|------------|------------------------------------------------------------------------------------------------------|
| 	Live Preview     | \<boolean>  | Updates and generates the PDF File üreview live while typing              |
| Line Wrapping    | \<boolean>  | Whether or not lines should wrap so they dont get too long to read             |
| LaTeX Compiler Binary | \<string>| File path to the binary executable that compiles **LaTeX**|
| Typst Compiler Binary| \<string>| File path to the binary executable that compiles **Typst**|
| Debounce Time| \<number>| Time in milliseconds to wait for the user to stop tying before rerendering the PDF preview|
## Credits
- [codemirror-lang-latex](https://github.com/texlyre/codemirror-lang-latex), used for syntax highlighting and autocompleting **LaTeX**
- [codemirror-lang-typst](https://github.com/kxxt/codemirror-lang-typst), used for syntax highlighting and autocompleting **Typst**

## If this plugin has helped you consider giving it a ⭐
