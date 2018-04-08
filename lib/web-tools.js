'use babel';

//	import WebToolsView from './web-tools-view';
var WebTools=require('./web-tools-library');
//import * from './web-tools-library' as 'WebTools';
import { CompositeDisposable } from 'atom';

/*	Helper Functions
	================================================

	================================================ */

	if(!String.prototype.repeat)
	String.prototype.repeat=function(count) {
		return Array(count+1).join(this);
	};

	if(!String.prototype.sprintf)
	String.prototype.sprintf=function() {
		var i=0, args=arguments;
		return this.replace(/%s/g,function() { return args[i++]; });
	};
//	if(!Document.prototype.createElementHTML)
	Document.prototype.createElementHTML=function(html) {
		var template=document.createElement('template');
		template.innerHTML=html.trim();
		return template.content.firstChild;
	};
//	if(!Document.prototype.createElementsHTML)
	Document.prototype.createElementsHTML=function(html) {
		var template=document.createElement('template');
		template.innerHTML=html.trim();
		return template.content.childNodes;
	};

	if(!HTMLFormElement.prototype.results)
	HTMLFormElement.prototype.results=function(submitter) {
		if(typeof submitter=='string') submitter=this.querySelector('[name="'+submitter+'"]');

		//	Build Array of Data
			var result={},value,details={};
			var elements=this.elements;
			for(var i=0;i<elements.length;i++) {
				var e=elements[i];		//	convenience
				if(!e.name || e.disabled) continue;
				switch(e.type) {
					case 'checkbox':
					case 'radio':
						if(e.checked) {
							result[e.name]=e.value;
							details[e.name]={value: e.value, type: e.type};
						}
						break;
					case 'select-one':
						if(e.selectedIndex>-1) {
							result[e.name]=e.value;
							details[e.name]={value: e.value, type: e.type};
						}
						break;
//					case 'select-multiple':
//						if(e.selectedIndex>-1) {
//							for(var j=0;j<e.options.length;j++)
//								if(e.options[j].selected)
//									result.push({name: e.name,value: e.options[j].value});
//						}
//						break;
					case 'reset':
					case 'button':
						break;
					case 'submit':
						if(e===submitter) {
							result[e.name]=e.value;
							details[e.name]={value: e.value, type: e.type};
						}
						break;
					case 'email':
					case 'text':
					default:
						result[e.name]=e.value;
						details[e.name]={value: e.value, type: e.type};
				}
				if(e.getAttribute('inputmode')=='numeric') result[e.name]=parseInt(result[e.name])||0;
			}
		return {results: result,details: details};
	};
	if(!HTMLFormElement.prototype.populate)
	HTMLFormElement.prototype.populate=function(data) {
		for(let i of Object.keys(data)) {
			switch(data[i].type) {
				case 'radio':
				case 'checkbox':
					this.querySelectorAll(`[name="${i}"]`).forEach(function(element) {
						element.checked=element.value==data[i].value;
					});
					break;
				case 'text':
				case 'email':
					if(this[i]) this[i].value=data[i].value;
					break;
				default:
			}
		}
	};
	if(!String.prototype.jschars)
	String.prototype.jschars=function() {
		return this.trim().replace(/\r?\n|\t/g,function(value) {
			switch(value) {
				case '\r\n':
				case '\n':
					return '\\n';
				case '\t':
					return '\\t';
			}
		});
	};

export default {

	webToolsView: null,
	modalPanel: null,
	subscriptions: null,

	activate(state) {
		this.subscriptions = new CompositeDisposable();

	//	Register commands
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'web-tools:about': () =>					this.about(),

			'web-tools:html:lists': () =>				this.lists(),
			'web-tools:html:structure': () =>			this.structure(),
			'web-tools:tables': () =>					this.tables(),

			'web-tools:html:insert': () =>				this.insert(),

			'web-tools:html:paragraphs': () =>			this.paragraphs(),
			'web-tools:html:paragraphs-headings': () =>	this.paragraphsHeadings(),

			'web-tools:html:anchors': () =>				this.anchors(),

			'web-tools:css:colors': () =>				this.cssColors(),

			'web-tools:misc:spaces-tabs': () =>			this.spacesTabs(),
			'web-tools:misc:smart-quotes': () =>		this.smartQuotes(),
			'web-tools:misc:entify': () =>				this.entify(),
			'web-tools:misc:js-chars': () =>			this.jsChars(),
			'web-tools:misc:collapse-lines': () =>		this.collapseLines(),
			'web-tools:misc:sample': () =>				this.sample(),

		}));
	},

	deactivate() {
		this.subscriptions.dispose();
	},

	init(message,options) {
		console.log(message);
		var form;
		const editor = atom.workspace.getActiveTextEditor() || undefined;
		const selection = editor.getSelectedText() /* || editor.getText() */ || undefined;
		return [editor,selection];
	},

	doit(tool,formText,fn) {
		//	Get Storage
			var storage=localStorage.getItem('installed-packages:web-tools')||'{}';
			storage=JSON.parse(storage);

		var modalPanel;
		var form=document.createElement('form');
		form.innerHTML=WebTools.makeForm(formText,{fieldset:true, paragraphs: true, br: true});
		form.id='web-tools';
//		form.className='web-tools';
		var ok=document.createElementHTML('<button name="ok">OK</button>');
		var cancel=document.createElementHTML('<button name="cancel">Cancel</button>');
		var div=document.createElement('div');
		div.appendChild(ok);
		div.appendChild(cancel);
		form.appendChild(div);
		if(storage[tool]) form.populate(storage[tool]);
		form.cancel.onclick=function() {
			var directory=`${__dirname}/../documentation`;
			var toolFile=`${directory}/${tool}.html`;
			var formFile=`${directory}/form.html`;

			var fs=require('fs');
//			fs.appendFile(formFile,`<form id="web-tools">\n${this.form.innerHTML}\n</form>\n\n`,function(data) { });
//			fs.writeFile(toolFile,`<form id="web-tools>\n${this.form.innerHTML}\n</form>\n\n`,function(data) { });

			modalPanel.hide();
		};
		form.ok.onclick=function(event) {
			var {results:options,details}=form.results();
			storage[tool]=details;
			localStorage.setItem('installed-packages:web-tools',JSON.stringify(storage));
			modalPanel.hide();
			fn(options);
		};

		modalPanel=this.modalPanel = atom.workspace.addModalPanel({
    		item: form,
			visible: false
    	});

		modalPanel.show();

	},

	about() {

		var modalPanel;
		console.log('About …');
		var html='<h2>About HTML Tools 26</h2><p>Mark Simon<br>See <a href="http://internotes.site">http://internotes.site</a> for more information …</p>';
		var element=document.createElement('div');
		element.innerHTML=html;
		modalPanel=this.modalPanel = atom.workspace.addModalPanel({
    		item: element,
			visible: false
    	});
		modalPanel.show();
		element.onclick=function() {modalPanel.hide();};
	},
	lists() {
		var [editor,selection]=this.init(`Lists`);
		if(!editor) return;
		var form=`
Type
	()type+=ul\tUnordered List
	()type=ol\tOrdered List
	()type=dl\tDescription List

	[]nested=true\tNested
Options
	()delimiter+=tab\tTab
	()delimiter=comma\tComma

	[]multiple=true\tMultiple Delimiters
`;
		this.doit('lists',form,function(options) {
			editor.insertText(WebTools.makeList(selection,options));
		});
	},
	structure() {
		var [editor,selection]=this.init(`HTML Structure`);
		if(!editor) return;

		var form=`Options\n\t[]html0=1\t\tInclude HTML Outline\n\tplaceholderElement\t\t\tElement to wrap around Place Holder text`;
		this.doit('structure',form,function(options) {
			editor.insertText(WebTools.makeHTMLStructure(selection,options));
		});
	},
	tables() {
		var [editor,selection]=this.init(`Tables`);
		if(!editor) return;
		var form=`
Type
	()type+=html\tHTML
	()type=md\tMarkDown
	()type=adoc\tAsciiDoc
	()type=ascii\tASCII Characters
	()type=box\tGraphic Box Characters

	[]double=true\tUse Double Lines (Box)
	[]interlines=true\tLines Between Rows (ASCII or Box)
HTML Table Options
	[]sections+=true\tHTML Sections
	[]header+=true\tHeader Row
Other Options
	()delimiter+=tab\tTab
	()delimiter=comma\tComma

	[]multiple=true\tMultiple Delimiters
`;
		this.doit('tables',form,function(options) {
			editor.insertText(WebTools.makeTable(selection,options));
		});
	},
	paragraphs() {
		var [editor,selection]=this.init(`Paragraphs`);
		if(!editor) return;

		var form=`Options\n\t[]double0=1\t\tParagraph Text is Double-Spaced\n\t[]br0=1\t\t\tPut &lt;br&gt; between lines`;

		this.doit('paragraphs',form,function(options) {
			editor.insertText(WebTools.makeParagraphs(selection,options));
		});
	},
	paragraphsHeadings() {
		var [editor,selection]=this.init(`Paragraphs & Headings`);
		if(!editor) return;

		var form=`Options\n\t[]div0=1\tWrap Inside a &lt;div&gt; Element`;
		this.doit('headings-paragraphs',form,function(options) {
			editor.insertText(WebTools.makeHeadingsParagraphs(selection,options));
		});
	},
	spacesTabs() {
		//	https://github.com/atom/whitespace/blob/master/menus/whitespace.cson
		//	https://discuss.atom.io/t/call-atom-command-from-package/7465/3
		console.log(`Spaces to Tabs`);
		atom.commands.dispatch(atom.views.getView(atom.workspace), "whitespace:convert-spaces-to-tabs");
	},
	anchors() {
		var [editor,selection]=this.init(`Make Anchors`);
		if(!editor) return;

		var form=`
Type
	()reverse0+=0	href text
	()reverse0=1	text-href
Options
	[]br0=1			Use &lt;br&gt;
	()comma+0=0		White Space
	()comma0=1		Comma
`;
		this.doit('anchors',form,function(options) {
//console.log(JSON.stringify(options))
			editor.insertText(WebTools.makeAnchors(selection,options));
		});
	},
	smartQuotes() {
		var [editor,selection]=this.init(`Smart Quotes`);
		if(!editor) return;
		var text=WebTools.smartQuotes(selection);
		editor.insertText(text);
	},
	entify() {
		var [editor,selection]=this.init(`Smart Quotes`);
		if(!editor) return;

		var form=`Options\n\t[]div0=1\tAlso Entify Quotes`;
		this.doit('entify',form,function(options) {
			editor.insertText(WebTools.entify(selection,options));
		});
	},
	cssColors() {
		var [editor,selection]=this.init(`CSS Colors`);
		if(!editor) return;
		var form=`Options\n\t[]upperCase\t\tHex is in Upper Case`;
		this.doit('css-colors',form,function(options) {
			var text;
			var hexPattern=/^#([0-9a-fA-F]{6})$/;
			var rgbPattern=/^(rgb|RGB)\((\d{1,3},\d{1,3},\d{1,3})\)$/;
			var pcPattern=/^(rgb|RGB)\((\d{1,3}%,\d{1,3}%,\d{1,3}%)\)$/;

			if(text=selection.match(hexPattern)) {
				editor.insertText(WebTools.hex2rgb(text[1]));
			}
			else if(text=selection.match(rgbPattern)) {
				editor.insertText(WebTools.rgb2hex(text[2].split(','),options.upperCase));
			}
			else if(text=selection.match(pcPattern)) {
				text=text[2].replace(/(\d{1,3})%/g,function(value) {
					value=parseInt(value)||0;
					return Math.round(256*value/100);
				});
				editor.insertText(WebTools.rgb2hex(text.split(','),options.upperCase));
			}
		});
	},
	jsChars() {
		var [editor,selection]=this.init(`js Characters`);
		if(!editor) return;
		var text=WebTools.jsChars(selection);
		editor.insertText(text);
	},
	collapseLines() {
		var [editor,selection]=this.init(`Collapse Lines`);
		if(!editor) return;

		var form=`Options\n\t[]space=1\tSeparate Lines with a Space`;
		this.doit('collapse-lines',form,function(options) {
			editor.insertText(WebTools.collapseLines(selection,options.space));
		});



		var text=WebTools.collapseLines(selection);
		editor.insertText(text);
	},
	sample() {
		var fs=require('fs');
		//	can I get root of package?
		fs.readFile(`${__dirname}/../sample.txt`,'utf8',(error,data) => {
			atom.workspace.open().then (function(editor) {
				editor.insertText(data);
			});
		});
	},
	insert() {
		var [editor,selection]=this.init(`Insert …`);
		if(!editor) return;
		var form,parms;

		form='File Type\n\t()type+=img\tImage\n\t()type=js\t\tJavaScript\n\t()type=css\t\tCSS Style Sheet\n\t()type=a\t\tAnchor (Link)';
		var This=this;
		this.doit('insert',form,function(options) {
			var filter;
			switch(options.type) {
				case 'img':
					filter={name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg']};
					break;
				case 'js':
					filter={name: 'JavaScript', extensions: ['js']};
					break;
				case 'css':
					filter={name: 'CSS Style Sheet', extensions: ['css','less']};
					break;
				case 'video':
					filter={name: 'Movies', extensions: ['mkv', 'avi', 'mp4']};
					break;
				case 'a':
				default:
					filter={name: 'All Files', extensions: ['*']};
					break;

			}
			var remote = require('electron').remote;
			remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
				properties: ['openFile'],
				filters: [filter]
			},function(files) {
				var path,src;
				if(files) {
					path=atom.workspace.getActiveTextEditor().getPath();
					src=WebTools.relativePath(files[0],path,true);
				}
				else src='';
				switch(options.type) {
					case 'img':
						form='Image Options\n\talt\talt\n\ttitle\ttitle\n\twidth\twidth\n\theight\theight';
						break;
					case 'js':
						form='JavaScript Options\n\t[]crossorigin=true\tCross Origin';
						break;
					case 'css':
						form='CSS Stylesheet Options\n\trel=stylesheet\tType of Style Sheet\n\ttitle\ttitle\n\tmedia\tmedia';
						break;
					case 'a':
						form='Anchor Options\n\ttext\tText in Link';
						break;
					default:
						return;
				}
				form+=`\n\n\t{type}=${options.type}\n\t{src}=${src}\n\t{href}=${src}`;
				This.doit(`insert-${options.type}`,form,function(options) {
					editor.insertText(WebTools.addLink(options));
				});
			});
		});
		return;
	},
};
