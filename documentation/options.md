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

## HTML Structure

```
Options
	[]html0=1			Include HTML Outline
	placeholderElement	Element to wrap around Place Holder text
```

## Tables

Converts Data into a table.

Data is written as follows:

- Each line represents a row
- The first line is (optionally) a header
- Cells are delimited (separated) by tabs, commas or spaces

For example:

```
Starting with A	Starting with B	Starting with C
apple	banana	cherry donut
aardvark	bandicoot
accordion	banjo	clarinet	dobro
artichoke	brussel sprouts	cauliflower
```

results in

```
<table>
	<thead>
		<tr><th>Starting with A</th><th>Starting with B</th><th>Starting with C</th></tr>
	</thead>
	<tbody>
		<tr><td>apple</td><td>banana</td><td>cherry donut</td></tr>
		<tr><td>aardvark</td><td>bandicoot</td></tr>
		<tr><td>accordion</td><td>banjo</td><td>clarinet</td><td>dobro</td></tr>
		<tr><td>artichoke</td><td>brussel sprouts</td><td>cauliflower</td></tr>
		<tr><td></td></tr>
	</tbody>
</table>```

You can also generate markup for MarkDown and AsciiDoc, as well as tables using ascii characters.

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

| Option             | Values                                                                     |
|--------------------|----------------------------------------------------------------------------|
| Type               | HTML<br>MarkDown<br>AsciiDoc<br>ASCII Characters<br>Graphic Box Characters |
| Double             | Use double lines in Ascii or Box tables                                    |
| Interlines         | Show lines between table rows                                              |

| HTML Table Options | Values                                                                     |
|--------------------|----------------------------------------------------------------------------|
| Sections           | Include `<thead>` and `<tbody>` sections                                   |
| Header             | First row is a Header                                                      |

| Other Options      | Values                                                                     |
|--------------------|----------------------------------------------------------------------------|
| Delimiter          | Tab<br>Comma                                                               |
| Multiple           | Combine Multiple delimiters as one<br>Cannot have empty columns            |

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
