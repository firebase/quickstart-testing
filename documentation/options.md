## Lists

```
Type
	()type+=ul		Unordered List
	()type=ol		Ordered List
	()type=dl		Description List

	[]nested=true	Nested
Options
	()delimiter+=tab	Tab
	()delimiter=comma	Comma

	[]multiple=true	Multiple Delimiters
```

Type	<ul><br><ol><br>



### Nesting

Your text may use tabs to indent lines.

For `ul` and `ol` lists, `nested` allows nested lists — lists within lists.

For Definition (`dl`) lists, `nested` allows you to distinguish between `dt` elements (unindented) and `dd` elements (indented)



## HTML Structure

```
Options
	[]html0=1			Include HTML Outline
	placeholderElement	Element to wrap around Place Holder text
```

## Tables

```
Type
	()type+=html	HTML
	()type=md		MarkDown
	()type=adoc		AsciiDoc
	()type=ascii	ASCII Characters
	()type=box		Graphic Box Characters

	[]double=true	Use Double Lines (Box)
	[]interlines=true	Lines Between Rows (ASCII or Box)
HTML Table Options
	[]sections+=true	HTML Sections
	[]header+=true	Header Row
Other Options
	()delimiter+=tab	Tab
	()delimiter=comma	Comma

	[]multiple=true	Multiple Delimiters
```

## Paragraphs

```
Options
	[]double0=1		Paragraph Text is Double-Spaced
	[]br0=1			Put &lt;br&gt; between lines`;
```

## Headings & Paragraphs

```
Options
	[]div0=1	Wrap Inside a <div> Element
```

## Anchors

```
Type
	()reverse0+=0	href text
	()reverse0=1	text-href
Options
	[]br0=1			Use &lt;br&gt;
	()comma+0=0		White Space
	()comma0=1		Comma
```

## Insert

```
File Type
	()type+=img		Image
	()type=js		JavaScript
	()type=css		CSS Style Sheet
	()type=a		Anchor (Link)';

Image Options
	alt		alt
	title	title
	width	width
	height	height

JavaScript Options
	[]crossorigin=true	Cross Origin

CSS Stylesheet Options
	rel=stylesheet	Type of Style Sheet
	title	title
	media	media

Anchor Options
	text	Text in Link';
```
