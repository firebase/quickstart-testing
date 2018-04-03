# Using Web Tools
<style>
	td, th {
		text-align: left;
		vertical-align: top;
	}
</style>

This Atom Package simplifies some of the processing of hand-coding HTML.

The various tools either replace selected text with HTML code which would be more tedious to type or, in some cases, inserts snippets of HTML.

There are also some additional tools to help with setting up pages and some common preferences.

##	Convert Text

This is also available from the `right-click` menu.

These tools replace existing text with HTML Elements.

To use these tools:

1. Enter the text in the appropriate format
2. Select the text
3. Select the tool
4. Select any Options

In some cases, an optional comment line may be included in the beginning to pass options to the tool.

### Convert Paragraphs

Converts lines to Paragraphs.

If the lines are indented with one or more tabs, this indentation will be retained.

| Option               | Meaning                                                                |
|----------------------|------------------------------------------------------------------------|
| Double Spaces        | Paragraphs are separate by Blank Line<br>Single Spaced lines are left. |
| `<br>` Between Lines | Single Spaced lines get `<br>` between them.                           |

### Convert Headings & Paragraphs

Convert lines to Headings & Paragraphs.

- unindented lines will be converted to `<h2>` elements
- indented lines will be converted to `<p>` elements

| Option              | Meaning                               |
|---------------------|---------------------------------------|
| Wrap Inside `<div>` | Wrap results inside a `<div>` Element |

### HTML Structure

Create HTML code by creating a simple structure. The structure is of this form:

```
header
	h1-
nav
main
	article
		h2-
	aside
		h2-
footer
```

This will be transformed to the following:

```
<header>
	<h1></h1>
</header>
<nav>
</nav>
<main>
	<article>
		<h2></h2>
	</article>
	<aside>
		<h2></h2>
	</aside>
</main>
<footer>
</footer>
```

Indented elements will be nested.

The element descriptor takes the following form:

	element#id.class:place holder text

| Coding        | Meaning                                           |
|---------------|---------------------------------------------------|
| element       | HTML tag</html:li>                                |
| #id           | optional id</html:li>                             |
| .class        | optional class name</html:li>                     |
| :place holder | optional text which may be used as a place holder;<br>can include spaces |

Obviously, only the element itself is required.

In addition, the element may be written in the following form:

| Variation    | Meaning                                                  |
|--------------|----------------------------------------------------------|
| `element`    | simple element                                           |
| `element/`   | Element is void (non-container)<br>eg `img/` ➔ `<img>`   |
| `e.element-` | Element is written on one line<br>eg `h1-` ➔ `<h1></h1>` |


```
Options
	[]html0=1			Include HTML Outline
	placeholderElement	Element to wrap around Place Holder text
```

| Option              | Values                            |
|---------------------|-----------------------------------|
| HTML Outline        | Wraps Structure in `<html>` block |
| Placeholder Element | Wrap placeholders in this element |


### Lists

This will convert the selected text to a list.

| Option    | Values                                                          |
|-----------|-----------------------------------------------------------------|
| Type      | Unordered List<br>Ordered List<br>Description List              |
| Nested    | Data is Nested (see below)                                      |
| Delimiter | Tab<br>Comma                                                    |
| Multiple  | Combine Multiple delimiters as one<br>Cannot have empty columns |


### Nesting

Your text may use tabs to indent lines.

For `ul` and `ol` lists, `nested` allows nested lists — lists within lists.

For Definition (`dl`) lists, `nested` allows you to distinguish between `dt` elements (unindented) and `dd` elements (indented)
