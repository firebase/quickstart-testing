/*	HTML Tools
	================================================ */
	/*jshint -W030: true*/
	/*jshint expr:true*/
	/*jshint esversion:6*/

'use babel';

var exports=module.exports={
	/*	Support Functions
		================================================ */

		getData(text,options) {
			options=options||{};
			text=text.split(/\r\n|\n|\r/);

			if(text[0].charAt(0)=='#') {	//	Options
				text.shift().substring(1).trim().split(/\s*,\s*/).forEach(function(element,i) {
					options[element]=true;
				});
			}
			return [text,options];
		},
		attribute: function(name,value,required) {
			var empty = required ? ' %s=""'.sprintf(name) : '';
			return value ? ' %s="%s"'.sprintf(name,value) : empty;
		},
		relativePath(to,from,file=false) {
			from=from.replace(/\\/g,'/').replace(/\\/g,'/');
			if(file) from=from.replace(/[^\/]+$/,'');
			from=from.replace(/\/$/,'').split('/');
			to=to.replace(/\\/g,'/').split('/');
			for(i=0,l=Math.min(from.length,to.length); i<l; i++) {
				if(from[0]==to[0]) {
					from.shift();
					to.shift();
				}
				else break;
			}
			if(from.length) for(i=0,l=from.length; i<l; i++) from[i]='..';
			return from.concat(to).join('/');
		},

	/*	asciidoc Table
		================================================ */

		makeTable(text,options) {
			switch(options.type) {
				case 'adoc':
					return this.adocTable(text,options);
				case 'md':
					return this.gfmTable(text,options);
				case 'ascii':
					return this.asciiTable(text,options);
				case 'box':
					return this.boxTable(text,options);
				case 'html':
				default:
					return this.htmlTable(text,options);
			}
		},

		adocTable(text,options) {
			//	#header,tab|comma,multiple
			var columns,widths;

			[data,options]=this.getData(text,options);

			var delimiter=options.comma?',':'\t';
			var multiple=!!options.multiple;

			[data,columns,widths]=this.text2table(data,delimiter,multiple);

			var table=[];
			let row='|====';
			if(options.header) table.push('[options="header"]');
			table.push(row);

			for(let i=0; i<data.length; i++) {
				let row=[];
				for(let j=0;j<widths.length;j++) {
					let item=data[i][j]||'';
					row[j]=item+' '.repeat(widths[j]-item.length);
				}
				table.push('| '+row.join(' | '));
			}
			table.push(row);
			return(table.join('\n'));
		},

	/*	ASCII Table
		================================================ */

		asciiTable(text,options) {
			//	#header,interlines,tab|comma,multiple
			var columns,widths;

			[data,options]=this.getData(text,options);

			var delimiter=options.comma?',':'\t';
			var multiple=!!options.multiple;

			[data,columns,widths]=this.text2table(data,delimiter,multiple);

			var table=[];
			let row=[],Row=[],top,middle,Middle,bottom;
			for(let j=0;j<widths.length;j++)  {
				row[j]='-'.repeat(widths[j]+2);
				Row[j]='='.repeat(widths[j]+2);
			}
			middle='+'+row.join('+')+'+';
			Middle='+'+Row.join('+')+'+';

			table.push(middle);
			for(let i=0; i<data.length; i++) {
				let row=[];
				for(let j=0;j<widths.length;j++) {
					let item=data[i][j]||'';
					row[j]=item+' '.repeat(widths[j]-item.length);
				}
				data[i]=table.push('| '+row.join(' | ')+' |');
				if(options.interlines) table.push(middle);
			}
			if(!options.interlines) table.push(middle);

			if(options.header) {
				if(options.interlines) table[2]=Middle;
				else table.splice(2,0,Middle);
			}
			return table.join('\n');
		},

	/*	Box Character Table
		================================================
		╔═╦═╗	┏━┳━┓	┌─┬─┐
		║ ║ ║	┃ ┃ ┃	│ │ │
		╠═╬═╣	┣━╋━┫	╞═╪═╡
		║ ║ ║	┃ ┃ ┃	│ │ │
		╠═╬═╣	┣━╋━┫	├─┼─┤
		║ ║ ║	┃ ┃ ┃	│ │ │
		╚═╩═╝	┗━┻━┛	└─┴─┘
		================================================ */

		boxTable(text,options) {
			//	#double,interlines,header,tab|comma,multiple
			var columns,widths;

			[data,options]=this.getData(text,options);

			var delimiter=options.comma?',':'\t';
			var multiple=!!options.multiple;

			[data,columns,widths]=this.text2table(data,delimiter,multiple);

			var table=[];
			let row=[],Row=[],top,middle,Middle,bottom;

			if(options.double) {
				for(let j=0;j<widths.length;j++)  {
					row[j]=Row[j]='═'.repeat(widths[j]+2);
				}
				top='╔'+Row.join('╦')+'╗';
				middle=Middle='╠'+Row.join('╬')+'╣';
				bottom='╚'+Row.join('╩')+'╝';
			}
			else {
				for(let j=0;j<widths.length;j++)  {
					row[j]='─'.repeat(widths[j]+2);
					Row[j]='═'.repeat(widths[j]+2);
				}
				top='┌'+row.join('┬')+'┐';
				middle='├'+row.join('┼')+'┤';
				Middle='╞'+Row.join('╪')+'╡';
				bottom='└'+row.join('┴')+'┘';
			}

			table.push(top);

			for(let i=0; i<data.length; i++) {
				let row=[];
				for(let j=0;j<widths.length;j++) {
					let item=data[i][j]||'';
					row[j]=item+' '.repeat(widths[j]-item.length);
				}
				if(options.double) table.push('║ '+row.join(' ║ ')+' ║');
				else table.push('│ '+row.join(' │ ')+' │');
				if(options.interlines) table.push(middle);
			}
			if(!options.interlines) table.push(middle);

			if(options.header) table[2]=Middle;
			table[table.length-1]=bottom;

			return table.join('\n');
		},

	/*	Github Flavoured Markdown Table
		================================================ */

		gfmTable(text,options) {
			//	#tab|comma,multiple
			var columns,widths;

			[data,options]=this.getData(text,options);

			var delimiter=options.comma?',':'\t';
			var multiple=!!options.multiple;

			[data,columns,widths]=this.text2table(data,delimiter,multiple);

			var table=[];

			for(let i=0; i<data.length; i++) {
				let row=[];
				for(let j=0;j<widths.length;j++) {
					let item=data[i][j]||'';
					row[j]=item+' '.repeat(widths[j]-item.length);
				}
				table.push('| '+row.join(' | ')+' |');
			}
			let row=[];
			for(let j=0;j<widths.length;j++)  row[j]='-'.repeat(widths[j]+2);
			table.splice(1,0,'|'+row.join('|')+'|');
			return(table.join('\n'));
		},

	/*	HTML Table
		================================================ */

		htmlTable(text,options) {
			//	#sections,header,tab|comma,multiple
			var data,columns,widths;

			[data,options]=this.getData(text,options);

			var delimiter=options.comma?',':'\t';
			var multiple=!!options.multiple;

			[data,columns,widths]=this.text2table(data,delimiter,multiple);
			var start=0,tabs='\t';

			var table=['<table>'];

			if(options.sections) tabs='\t\t';

			if(options.header) {
				if(options.sections) table.push('\t<thead>');
				table.push('%s<tr><th>%s</th></tr>'.sprintf(tabs,data[0].join('</th><th>')));
				if(options.sections) table.push('\t</thead>');
				start=1;
			}

			if(options.sections) table.push('\t<tbody>');
			for(let i=start; i<data.length;i++) {
				table.push('%s<tr><td>%s</td></tr>'.sprintf(tabs,data[i].join('</td><td>')));
			}
			if(options.sections) table.push('\t</tbody>');
			table.push('</table>');
			return(table.join('\n'));
		},

	/*	Read Raw Data into an Array
		================================================ */

		text2table(data,delimiter,multiple) {
			if(multiple) delimiter=new RegExp(delimiter+'+');

			//	Calculate widths of columns
				var columns=0;
				var widths=[];
				for(let i=0; i<data.length; i++) {
					data[i]=data[i].split(delimiter);
					columns=Math.max(columns,data[i].length);
					for(let j=0;j<data[i].length;j++)
						widths[j]=Math.max(widths[j]||0,data[i][j].length);
				}

			return [data,columns,widths];
		},

	/*	HTML Structure
		================================================ */

		makeHTMLStructure(text,parms,eol) {
			//	element#id.class:place holder text|
			//	{placeholderElement: null, html: false}
			//	element/ void, element- single line
			parms=parms||{};
			var structure=[], elements=[];

			var element,line;
			var options={};
			var placeholderElement = parms.placeholderElement || null;
			var subplaceholder = parms.subplaceholder || false;
			var html = parms.html || false;
			var empty = parms.empty || false;

			if(html) structure.push('<!DOCTYPE html>\n<html lang="en">\n\t<head>\n\t\t<title>Title</title>\n\t\t<meta charset="UTF-8">\n\t</head>\n\t<body>\n');

			eol = eol || '\n';

			text=text.split(/\r\n|\n|\r/m);
			var i,l,n,item;
			var items=[];

			for(i=0;i<text.length;i++)
				if((line=text[i].match(/^\t*\S+/)) && line[0])
					items.push(parse(text[i]));
			for(i=0;i<items.length;i++) {
				if(!items[i]) continue;
				var data=items[i];
				l=data.level;							//	Current Level
				n=i<items.length-1?items[i+1].level:-1;	//	Next Level, if any

				if(l<n) {	//	Next Line is Indented, so Has Content
					structure.push(openElement(data.element,l+1,options));
					elements.push(data.element);
				}
				else { //	l>n => finished contents
					if(data.inline!==undefined) {
						structure.push(
							openElement(data.element,l+1,options)+
							data.inline+
							closeElement(data.element,l+1).trim());
					}
					else {
						if(data.element) structure.push(openElement(data.element,l+1,options));
						if(data.content) {
							if(placeholderElement) structure.push('%s<%s>%s</%s>'.sprintf('\t'.repeat(l+1),placeholderElement,data.content,placeholderElement));
							else structure.push('%s%s'.sprintf('\t'.repeat(l),data.content));
						}
						if(data.element) if(!data.void) structure.push(closeElement(data.element,l+1));
					}
					while(elements.length>n && n>-1) {
						structure.push(closeElement(elements.pop(),elements.length+1));
					}
				}
			}

			while(elements.length) {
				structure.push(closeElement(elements.pop(),elements.length));
			}

			if(html) structure.push('\t</body>\n</html>');
			return structure.join('\n');

			function openElement(element,level,options) {
				options=options||{};
				var placeholderElement=options.placeholderElement||'';
				var content=options.content||'';
				var id = data.id ? ' id="%s"'.sprintf(data.id) : '';
				var className = data.class?' class="%s"'.sprintf(data.class) : '';
				level=level||0;
				if(html) level++;
				var tabs='\t'.repeat(level);
				return '%s<%s%s%s>'.sprintf(tabs,element,id,className);
			}

			function closeElement(element,level) {
				level=level||0;
				if(html) level++;
				var tabs=new Array(level+1).join('\t') || '';
				return '%s</%s>'.sprintf(tabs,element);
			}
			function parse(string) {
				var pattern=/^(\t*)(.*?)(\/?)(#(.*?))?(\.(.*?))?([: ](.*?))?$/;
				var result=string.match(pattern);
				var data={
					level: result[1]?result[1].length:0,
					string: result[0],
					element: result[2],
					"void": result[3]=='/',
					inline: result[2]&&result[9]!==undefined?result[9]:undefined,
					id: result[5],
					"class": result[7],
					content: result[9],
				};
				return data;
			}
		},

	/*	Forms
		================================================
		name			Label							<input type="text" name="name">
		@name			Label							<input type="email" name="name">
		name=value		Label							<input type="text" name="name" value="value">
		[name]			Label							<textarea name="name"></textarea>
		[name]=value	Label							<textarea name="name">value</textarea>
		()name=apple	Label							<input type="radio" name="name" value="value">
		[]name=apple	Label							<input type="checkbox" name="name" value="value">
		name:			Label	option;option=value	<select name="name">
															<option value="">
															<option value="value">
														</select>
		(send)			Label							<button name="send">Label</button>
		{name}=value									<input type="hidden" name="name" value="value">

		Options:	placeholder
					addForm
					action=
					method=
					id=
					className=

		You can append the name with one or more of the following:

			*	required
			+	checked
			0	inputmode=numeric
		================================================ */

		makeForm(text,options,eol) {
			eol=eol||'\n';
			var form=text.trim().split(/\r\n|\r|\n/);
			var data=[],line;
			var items,label,item,value,required,element,type,name,placeholder,checked,matches,pattern;

			var addPlaceholder=!!options.placeholder;
			var addForm=!!options.addForm;
			var action=options.action||'';
			var method=options.method||'get';
			var id=options.id||'';
			var className=options.className||'';

			var labelFor=!!options.labelFor;

			//	read data
				for(let i=0;i<form.length;i++) {
					if(!form[i].trim()) {
						if(options.paragraphs) data.push({type: 'paragraph'});
						continue;
					}
					if(options.fieldset) {
						matches=form[i].match(/^\s+(.*)$/);
						if(matches)	data.push({type: 'input', value: matches[1]});
						else			data.push({type: 'fieldset', value: form[i]});
						continue;
					}
					line=form[i].trim();
					if(line) data.push({type: 'input', value: line});
				}

			//	process inputs
				for(let i=0;i<data.length;i++) {
					if(data[i].type!='input') continue;
					items=data[i].value.split(/\t+/);

					if(items.length<2) label='';
					else label=items[1];
					if(items.length>2) options=items[2];

					item=items[0].split(/\s*=\s*/);
					if(item.length>1) value=item[1];
					else value='';
					item=item[0];

					required=checked=numeric=false;
					pattern=/(.*?)([*+0]*)$/;
					matches=item.match(pattern);
					if(matches[2]) {
						item=matches[1];
						checked=/\+/.test(matches[2]);	//	only works for checkboxes & radio buttons
						required=/\*/.test(matches[2]);	//	doesn’t work for text areas
						numeric=/0/.test(matches[2]);
					}

					switch(item.charAt(0)) {
						case '@':						//	email
							type='email';
							name=item.slice(1);
							break;
						case '{':
							type='hidden';
							name=item.slice(1,-1);
							break;
						case '[':						//	checkbox or textarea
							if(item.charAt(1)==']') {	//	checkbox
								type='checkbox';
								name=item.slice(2);
							}
							else {						//	textarea
								type='textarea';
								name=item.slice(1,-1);
							}
							break;
						case '(':						//	radio or button
							if(item.charAt(1)==')') {	//	radio
								type='radio';
								name=item.slice(2);
							}
							else {						//	button
								type='button';
								name=item.slice(1,-1);
							}
							break;
						default:						//	text or Select
							if(item.slice(-1)==':') {	//	select
								type='select';
								name=item.slice(0,-1);
								options=options.split(';');
								for(var o=0;o<options.length;o++) {
									item=options[o].split('=');
									options[o]={
										"text": item[0],
										"value": item[1]||''
									};
								}
							}
							else {
								type='text';
								name=item;
							}
					}

					data[i].value={
						"name": name,
						"type": type,
						"label": label,
						"value": value,
						"required": required,
						"checked": checked,
						"numeric": numeric,
//						"options": options
					};
				}

			//	Generate Elements
				var fieldset=false, paragraph=false, br=false;
				var elements=[];
				for(var i=0;i<data.length;i++) {
					switch(data[i].type) {
						case 'fieldset':
							if(fieldset) {
								if(paragraph) {
									elements.push('</p>');
									paragraph=false;
								}
								elements.push('</fieldset>');
								i--;
								br=fieldset=false;
							}
							else {
								elements.push('<fieldset><legend>%s</legend>'.sprintf(data[i].value));
								fieldset=true;
								elements.push('<p>');
								br=false;
								paragraph=true;
							}
							continue;
						case 'paragraph':
							if(paragraph) {
								elements.push('</p>');
								i--;
								br=paragraph=false;
							}
							else {
								elements.push('<p>');
								paragraph=true;
								br=false;
							}
							continue;
					}

					data[i]=data[i].value;

					value = data[i].value ? ' value="%s"'.sprintf(data[i].value) : '';
					required = data[i].required ? ' required' : '';
					checked = data[i].checked ? ' checked' : '';
					numeric = data[i].numeric ? ' inputmode="numeric"' : '';
					placeholder = addPlaceholder&&data[i].label ? ' placeholder="%s"'.sprintf(data[i].label) : '';
					var forID='%s-%s'.sprintf(id,data[i].name.replace(/\[\]$/,''));

					switch(data[i].type) {
						case 'hidden':
							element='<input name="%s" type="%s"%s%s>'.sprintf(data[i].name,data[i].type,value,numeric);
							break;
						case 'text':
						case 'email':
							if(labelFor) {
								element='<input id="%s" name="%s" type="%s"%s%s%s%s>'.sprintf(forID,data[i].name,data[i].type,required,value,placeholder,numeric);
								element='<label for="%s">%s%s</label>%s'.sprintf(forID,data[i].label,options.br?'<br>':'',element);
							}
							else {
								element='<input name="%s" type="%s"%s%s%s%s>'.sprintf(data[i].name,data[i].type,required,value,placeholder,numeric);
								element='<label>%s%s%s</label>'.sprintf(data[i].label,options.br?'<br>':'',element);
							}
							break;
						case 'radio':
						case 'checkbox':
							if(labelFor) {
								element='<input id="%s-%s" name="%s" type="%s"%s%s%s%s>'
									.sprintf(forID,data[i].value,data[i].name,data[i].type,required,checked,value,numeric);
								element='%s&nbsp;<label for="%s-%s">%s</label>'
									.sprintf(element,forID,data[i].value,data[i].label);
							}
							else {
								element='<input name="%s" type="%s"%s%s%s%s>'
									.sprintf(data[i].name,data[i].type,required,checked,value,numeric);
								element='<label>%s&nbsp;%s</label>'
									.sprintf(element,data[i].label);
							}
							break;
						case 'textarea':
							if(labelFor) {
								element='<textarea id="%s" name="%s"%s%s>%s</textarea>'.sprintf(forID,data[i].name,required,placeholder,data[i].value);
								element='<label for="%s">%s%s</label>%s'.sprintf(forID,data[i].label,options.br?'<br>':'',element);
							}
							else {
								element='<textarea name="%s"%s%s>%s</textarea>'.sprintf(id,data[i].name,data[i].name,required,placeholder,data[i].value);
								element='<label>%s%s%s</label>'.sprintf(data[i].label,options.br?'<br>':'',element);
							}
							break;
						case 'button':
							element='<p><button name="%s">%s</button></p>'.sprintf(data[i].name,data[i].label?data[i].label:data[i].name);
							break;
						case 'select':
							var options=[];
							for(var o=0;o<data[i].options.length;o++) options.push('\t\t<option value="%s">%s</option>'.sprintf(data[i].options[o].value,data[i].options[o].text));
							options=options.join('\n');
							if(labelFor) {
								element='<select id="%s" name="%s"%s>%s</select>\n'.sprintf(forID,data[i].name,options,numeric);
//								element='<p><label for="%s">%s%s</label>\t%s</p>'.sprintf(forID,data[i].label,br,element);
							}
							else {
								element='<select name="%s"%s>%s</select>\n'.sprintf(options.id,data[i].name,data[i].name,options,numeric);
//								element='<p><label>%s%s%s\t</label></p>'.sprintf(data[i].label,br,element);
							}
							break;
						default:
							element='';
					}
					if(br) elements.push('<br>');
					elements.push(element);
					br=options.br;
				}
				if(fieldset) elements.push('</fieldset>');

			//	Return with possible form
				if(!addForm) return elements.join(eol);
				else {
					for(let i=0;i<elements.length;i++) elements[i]='\t'+data[i];
					if(id) id=' id="%s"'.sprintf(id);
					if(className) id=' class="%s"'.sprintf(className);
					return '<form%s%s method="%s" action="%s">%s%s%s</form>'.sprintf(id,className,method,action,eol,elements.join(eol),eol);
				}
		},

	/*	Make Lists
		================================================
		================================================ */

		makeList(text,parms,eol) {
			//	#type=,nested,span
			parms=parms || {};

			eol=eol || '\n';

			switch(parms.type) {
				case 'ul':
				case 'ol':
					if(parms.nested) return makeNestedList(text,parms,eol);
					else return makeSimpleList(text,parms,eol);
					break;
				case 'dl':
					if(parms.nested) return makeIndentedDescriptionList(text,parms,eol);
					else return makeDescriptionList(text,parms,eol);
			}

			//	Simple List

				function makeSimpleList(text,parms,eol) { // type,id,className,span,indents) {
					var id = parms.id ? ' id="%s"'.sprintf(parms.id) : '';
					var className = parms.className ? ' class="%s"'.sprintf(parms.className) : '';
					var type =	parms.type || 'ul'; if(type!='ol') type='ul';
					var span =	!!parms.span;
					var li = span ? '%s\t<li><span>%s</span></li>' : '%s\t<li>%s</li>';

					eol = eol || '\n';
					var pattern=/^(\s*)(.*?)\s*$/;

					var indent,data;

					var t=[];
					text=text.split(/\r\n|\n|\r/);
					for(var i=0;i<text.length;i++) {
						[,indent,data]=text[i].match(pattern);
						if(data) t.push(li.sprintf(indent,data));
					}
					return '%s<%s%s%s>\n%s\n%s</%s>\n'.sprintf(indent,type,id,className,t.join('\n'),indent,type).replace('\n',eol);
				}

			//	Nested List

				function makeNestedList(text,parms,eol) { // type,id,className,span) {
					var id = parms.id ? ' id="%s"'.sprintf(parms.id) : '';
					var className = parms.className ? ' class="%s"'.sprintf(parms.className) : '';
					var type =	parms.type || 'ul'; if(type!='ol') type='ul';

					eol = eol || '\n';

					function level(text) { return text ? text.match(/^(\t)*/g).toString().length : 0; }

					var test=text.split(/\r\n|\n|\r/m);
					var i,j,l,t,n,item;
					var items=[];
					var list=[];

					for(i=0;i<test.length;i++)
						if(test[i].match(/^\t*\S*/)) items.push(test[i]);	//	only keep non-empty lines

					//	New Version
					for(i=0;i<items.length;i++) {
						l=level(items[i]);
						t=new Array((l+1)*2).join('\t');

						n=level(items[i+1]);
						item=items[i].replace(/^\t*/,'');
						if(n>l) {							//	has contents
							list.push(t+'<li>'+item);
							list.push(t+'\t<'+type+'>');
						}
						else if(l==level(items[i+1])) {	//	same level
							list.push(t+'<li>'+item+'</li>');
						}

						else if(n<l)	{	//	finished contents
							list.push(t+'<li>'+item+'</li>');
							for(j=0;j<l-n;j++) {
								list.push(new Array((l-j)*2+1).join('\t')+'</'+type+'>');
								list.push(new Array((l-j)*2).join('\t')+'</li>');
							}
						}
					}
					return '<%s%s%s>\n%s\n</%s>\n'.sprintf(type,id,className,list.join('\n'),type).replace('\n',eol);
				}


			//	Simple Description List

				function makeDescriptionList(text,parms,eol) { // id,className,eol) {
					var id = parms.id ? ' id="%s"'.sprintf(parms.id) : '';
					var className = parms.className ? ' class="%s"'.sprintf(parms.className) : '';
					eol = eol || '\n';

					var dl=[];
					var i,l;
					text=text.split(/\r\n|\n|\r/);
					for(i=0,l=text.length;i<l;i++) {
						text[i]=text[i].replace(/\r\n|\n|\r/gm,'');
						if(text[i]) {
							if(i%2) dl.push('\t\t<dd>'+text[i]+'</dd>');
							else    dl.push('\t<dt>'+text[i]+'</dt>');
						}
					}
					return '<dl%s%s>\n%s\n</dl>\n'.sprintf(id,className,dl.join('\n')).replace('\n',eol);
				}

			//	Nested

				function makeIndentedDescriptionList(text,parms,eol) {
					var id = parms.id ? ' id="%s"'.sprintf(parms.id) : '';
					var className = parms.className ? ' class="%s"'.sprintf(parms.className) : '';
					eol = eol || '\n';

					var dl=[];
					var i,l;
					text=text.split(/\r\n|\n|\r/);
					for(i=0,l=text.length;i<l;i++) {
						text[i]=text[i].replace(/(\r\n|\n|\r)/gm,'');
						if(text[i]) {
							if(text[i].charAt(0)=='\t') dl.push('\t\t<dd>'+text[i].substr(1)+'</dd>');
							else    dl.push('\t<dt>'+text[i]+'</dt>');
						}
					}
					return '<dl%s%s>\n%s\n</dl>'.sprintf(id,className,dl.join('\n')).replace('\n',eol);
				}
			},

		/*	Headings & Paragraphs
			================================================
			================================================ */

			makeHeadingsParagraphs: function(text,parms,eol) {
				//	{div: false}
				parms=parms||{};
				var indent=parms.div?'\t':'';
				eol = eol || '\n';

				var data=[];
				var i,l;
				text=text.split(/\r\n|\n|\r/);
				for(i=0,l=text.length;i<l;i++) {
					text[i]=text[i].replace(/(\r\n|\n|\r)/gm,'');
					if(text[i]) {
						if(text[i].charAt(0)=='\t') data.push('%s\t<p>%s</p>'.sprintf(indent,text[i].substr(1)));
						else    data.push('%s<h2>%s</h2>'.sprintf(indent,text[i]));
					}
				}
				return parms.div ? '<div>\n%s\n</div>\n'.sprintf(data.join('\n')).replace('\n',eol) : '%s\n'.sprintf(data.join('\n')).replace('\n',eol);
			},

		/*	Headings & Paragraphs
			================================================
			================================================ */

			makeParagraphs: function(text,parms,eol) {
				//	{br: false, double: false}
				parms=parms||{};
				eol = eol || '\n';

				var br=parms.br?'<br>':'';
				var pattern=/^(\s*)(.*?)\s*$/;
				var data,p=[],i,q;

				if(parms.double) {	//	requires double spacing
					text=text.split(/\r\n\r\n|\n\n|\r\r/);
					for(i=0;i<text.length;i++) {
						q=[];
						if(text[i]) {
							text[i]=text[i].split(/\r\n|\n|\r/);
							for(var j=0;j<text[i].length;j++) {
								data=text[i][j].match(pattern);
								if(data[2]) q.push(data[2]);
							}
							if(q.length) p.push('<p>%s</p>'.sprintf(q.join(br+eol)));
						}
					}
				}
				else {
					text=text.split(/\r\n|\n|\r/);
					for(i=0;i<text.length;i++) {
						if(text[i]) {
							data=text[i].match(pattern);
							if(data[2]) p.push('%s<p>%s</p>'.sprintf(data[1],data[2]));
						}
					}
				}
				return p.join(eol)+eol;
			},

		/*	Links
			================================================
<link rel="stylesheet" type="text/css" href="../styles/web-tools.css" media="all">
			================================================ */

			addLink: function(parms) {
				parms=parms||{};
				var link,title,href,textsrc,alt,width,height;
				switch(parms.type) {
					case 'css':
						link='<link rel="%s"%s type="text/css" href="%s" media="%s">';
						title = parms.title ? ' title="%s"'.sprintf(parms.title) : '';
						return link.sprintf(parms.rel||'stylesheet',title,parms.href||'',parms.media||'all');
					case 'js':
						link='<script type="text/javascript" src="%s"%s></script>';
						return link.sprintf(parms.href,parms.crossorigin?' crossorigin':'');
					case 'a':
						href = parms.href ? ' href="'+parms.href+'"' : ' href=""';
						text = parms.text ? parms.text : '';
						return '<a%s>%s</a>'.sprintf(href,text);
					case 'img':
						src=this.attribute('src',parms.src,true);
						alt=this.attribute('alt',parms.alt,true);
						title=this.attribute('title',parms.title,true);
						width=this.attribute('width',parms.width,true);
						height=this.attribute('height',parms.height,true);
						return '<img%s%s%s%s%s>'.sprintf(src,alt,title,width,height);
					default:
						return '';
				}
			},

		/*	Make Anchors
			================================================
			================================================ */

			makeAnchors: function(text,parms,eol) {
				//	#reverse,delimiter,br
				//	href	text
				//	html|md
				parms=parms||{};
				var reverse=!!parms.reverse;
				var br=parms.br?'<br>':'';
				eol = eol || '\n';
				var t=[];
				var i=0;
				var indent,href,data,content;

				text=text.split(/\r\n|\n|\r/);

				var pattern;
				if(parms.comma)	pattern = !parms.reverse ? /(\s*)(.*?),(\S*)$/ : /^(\s*)(\S*),(.*)$/;
				else 			pattern = !parms.reverse ? /(\s*)(.*?)\s*(\S*)$/ : /^(\s*)(\S*)\s*(.*)$/;
				indent = 1;
				href=parms.reverse?3:2;
				content=5-href;

				for(i=0;i<text.length;i++) {
					if(text[i]) {
						data=text[i].match(pattern);
						switch(parms.type) {
							case 'md':
								t.push('%s[%s](%s)'.sprintf(data[indent],data[content],data[href]));
								break;
							case 'html':
							default:
								t.push('%s<a href="%s">%s</a>'.sprintf(data[indent],data[href],data[content]));
						}
					}
				}
				return t.join(br+eol)+eol;
			},

		/*	Smart Quotes
			================================================
			================================================ */

			smartQuotes: function(text) {
				//	See also http://www.poppyware.com/dunham/smartQuotes.html
				text=text
					.replace(/(^|\B)(')\b/g,'‘')
					.replace(/(^|\B)(")\b/g,'“')
					.replace(/'/g,'’')
					.replace(/"/g,'”');
				return text;
			},

		/*	Convert Tabs & Lines
			================================================
			================================================ */

			jsChars: function(text) {
				if(!text) return text;
				return text.trim().replace(/\r?\n|\t/g,function(value) {
					switch(value) {
						case '\r\n':
						case '\n':
							return '\\n';
						case '\t':
							return '\\t';
					}
				});
			},

		/*	Collapse Lines
			================================================
			================================================ */

			collapseLines: function(text,space) {
				space=space?' ':'';
				var pattern=/((^|\r?\n)\s*|\s*(\r?\n|$))/g;
				return text.replace(pattern,space);
			},

		/*	HTML Entities
			================================================
			================================================ */
			entify: function(text,options) {
				var quotes=options.quotes;
				return text.replace(/[<>&'"]/g,function(c) {
					switch(c) {
						case '<':	return '&lt;';
						case '>':	return '&gt;';
						case '&':	return '&amp;';
						case '"':	return quotes ? '&quot;' : c;
						case '\'':	return quotes ? '&apos;' : c;
					}
					return c;
				});

			},

		/*	Convert between rgb & hex
			================================================
			================================================ */
			hex2rgb: function(hex) {
				var i;
				switch(hex.length) {
					case 3:
						hex=hex.split('');
						hex.forEach(function(value,index,array) {
							hex[index]=parseInt(value+value,16);
						});
						break;
					case 6:
						var pattern=/(..)(..)(..)/;
						hex=pattern.exec(hex).slice(1);
						hex.forEach(function(value,index,array) {
							hex[index]=parseInt(value,16);
						});
						break;
					default: return [0,0,0];
				}
				return `rgb(${hex.join(',')})`;
			},

			rgb2hex: function(rgb,upperCase) {
				var hex;
				if(!Array.isArray(rgb)) {
					rgb=Array.prototype.slice.call(arguments,0,3);
					upperCase=arguments[3];
				}
				rgb.forEach(function(value,index,array) {
					rgb[index]=(parseInt(value,10).toString(16)).substr(-2);
				});
				hex=`#${rgb.join('')}`;
				if(upperCase) hex=hex.toUpperCase();
				return hex;
			},

			cssColorValue: function(text,options) {
				switch(options.type) {
					case 'hex2rgb':
						return this.hex2rgb(text);
					case 'rgb2hex':
						return this.rgb2hex(options.upperCase);
					default:
						return text;
				}
			},

			makeHTML5: function(text,options,eol) {
				eol = eol || '\n';

				//	HTML5 Tags
					if(options.doctype)		text=text.replace(/<!DOCTYPE html.*?>/igm,'<!DOCTYPE html>');
					if(options.lang)		text=text.replace(/<html.*?>/gm,'<html lang="en">');
				//	HTML5 Idioms
					if(options.charset)		text=text.replace(/<meta\s+http-equiv="content-type"\s+content="text\/html;charset=utf-8"\s*\/?>/gmi,'<meta charset="utf-8">');
					if(options['void'])		text=text.replace(/\s*\/>/gm,'>');
					if(options.minimised)	text=text.replace(/(\S+)="\1"/gm,'$1');

				//	Replace id or class with corresponding HTML element
				//	Still a bit dodgy
					if(options.id || options['class']) {
						var elements=['header','footer','nav','article','aside','section','main'];
						var i,div,element,parent,selector=[];
						var parser = new DOMParser();
						var html = parser.parseFromString(text, "text/html");

						for(i=0;i<elements.length;i++) {
							element=elements[i];
							if(options.id) selector.push('#'+element);
							if(options['class']) selector.push('.'+element);
							div=html.querySelector(selector.join(','));

							if(div) {
								parent=div.parentNode;
								element=html.createElement(element);
								element.innerHTML=div.innerHTML;
								parent.replaceChild(element,div);
							}
						}
						text='<!DOCTYPE html>'+eol+html.documentElement.outerHTML;
					}

				return text;
			},
			replace: function() {

			}

	};
