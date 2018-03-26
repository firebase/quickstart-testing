##	Convert Text

These tools replace existing text with HTML Elements.

To use these tools:

1. Enter the text in the appropriate format
2. Select the text
3. Select the tool

In some cases, an optional comment line may be included in the beginning to pass options to the tool.

### Convert Paragraphs

Converts lines to Paragraphs.

If the lines are indented with one or more tabs, this indentation will be retained

### Convert Headings & Paragraphs

Convert lines to Headings & Paragraphs.

- unindented lines will be converted to `<h2>` elements
- indented lines will be converted to `<p>` elements

### HTML Structure

This will convert an indented structure to corresponding HTML code.

For example:

	div#wrapper
	header
	nav
		main
			article
			aside
	footer

 will be converted to:

	<header>
	</header>
	<nav>
		<main>
			<article>
			</article>
			<aside>
			</aside>
		</main>
	</nav>
	<footer>
	</footer>

#### Elements

Elements may be written in the following form:

	element#id.class:place holder text

| Coding        | Meaning                                           |
|---------------|---------------------------------------------------|
| element       | HTML tag</html:li>                                |
| #id           | optional id</html:li>                             |
| .class        | optional class name</html:li>                     |
| :place holder | optional text which may be used as a place holder;<br>can include spaces |

Obviously, only the element itself is required.

### Lists
