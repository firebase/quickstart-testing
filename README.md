# Web Tools

This Atom Package simplifies some of the processing of hand-coding HTML.

The various tools either replace selected text with HTML code which would be more tedious to type or, in some cases, inserts snippets of HTML.

There are also some additional tools to help with setting up pages and some common preferences.

## Convert …

This is also available from the `right-click` menu.

These tools will convert and replace selected text:

| Convert …               | Action                                |
|-------------------------|---------------------------------------|
| Paragraphs              | Convert text to paragraphs            |
| Headings and Paragraphs | Convert text to Headings & Paragraphs |
| HTML Structure          | Generate HTML from selected text      |
| Lists                   | Create Lists                          |
| Tables                  | Convert to HTML Table;<br>Can also be used for Markdown,<br>AsciiDoc and Text tables                       |
| Anchors                 | Convert to HTML Anchors (links)       |

## Insert …

Insert HTML links to various files in your web folder.

| Insert …        | Link                                                     |
|-----------------|----------------------------------------------------------|
| Image           | `<img src="…" alt=="…" title="…" width="…" height=="…">` |
| JavaScript      | `<script type="text/javascript" src="…"></script>`       |
| CSS Style Sheet | `<link rel="stylesheet" type="text/css" href="…">`       |
| Anchor          | `<a href="…">…</a>`                                      |

When selected:

1. Choose the type of link
2. A File Open dialog will appear; choose a file
3. Fill in any other options

If you cancel the File Open dialog, the corresponding `src` or `href` will be empty. This is especially useful if you need to link to a full URL.

## Miscellaneous

Miscellaenous document-related tools.

| Tool           | Action                                                                                       |
|----------------|----------------------------------------------------------------------------------------------|
| Spaces to Tabs | This simply converts multiple spaces to tabs, using the tool from the __Whitespace__ package |
| Smart Quotes   | Converts the "straight quotes" in the selected text to “Smart Quotes”                        |
| Entify         | Converts `<`, `>`, `&` and possibly `'` & `"` to HTML Entities |

See [HOWTO](HOWTO.md) for details on how to use the tools
