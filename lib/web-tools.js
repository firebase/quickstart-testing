'use babel';

//	import WebToolsView from './web-tools-view';
console.log(0);

var WebTools=require('./web-tools-library');
//import * from './web-tools-library' as 'WebTools';
console.log(1)
import { CompositeDisposable } from 'atom';
console.log(2)
/*	Helper Functions
	================================================

	================================================ */

	if(!String.prototype.repeat)
	String.prototype.repeat=function(count) {
		return Array(count+1).join(this);
	}

	if(!String.prototype.sprintf)
	String.prototype.sprintf=function() {
		var i=0, args=arguments;
		return this.replace(/%s/g,function() { return args[i++] });
	};


export default {

	webToolsView: null,
	modalPanel: null,
	subscriptions: null,

	activate(state) {
		this.subscriptions = new CompositeDisposable();

	//	Register commands
		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'web-tools:about': () =>						this.about(),
			'web-tools:html:lists:ul': () =>				this.lists('ul'),
			'web-tools:html:lists:ol': () =>				this.lists('ol'),
			'web-tools:html:lists:dl': () =>				this.lists('dl'),
			'web-tools:html:structure': () =>				this.structure(),
			'web-tools:html:tables': () =>					this.tables('html'),

			'web-tools:html:insert-img': () =>				this.insert('img'),
			'web-tools:html:insert-js': () =>				this.insert('js'),
			'web-tools:html:insert-css': () =>				this.insert('css'),
			'web-tools:html:insert-a': () =>				this.insert('a'),

			'web-tools:html:paragraphs': () =>				this.paragraphs(),
			'web-tools:html:paragraphs-headings': () =>	this.paragraphsHeadings(),

			'web-tools:html:anchors': () =>				this.anchors(),

			'web-tools:misc:spaces-tabs': () =>			this.spacesTabs(),
			'web-tools:misc:smart-quotes': () =>			this.smartQuotes(),
		}));
	},

	deactivate() {
		this.subscriptions.dispose();
	},

/*
	if(selection) return selection;
	else {
		selection=whole document
		flag whole document
	}
*/
	init(message) {
		console.log(message);
		const editor = atom.workspace.getActiveTextEditor() || undefined;
		const selection = editor.getSelectedText() /* || editor.getText() */ || undefined;
		return [editor,selection];
	},

	about() {
		console.log('About …');
		var html='<h2>About HTML Tools</h2><p>Mark Simon<br>See <a href="http://internotes.site">http://internotes.site</a> for more information …</p>';
		var element=document.createElement('div');
		element.innerHTML=html;
		var modalPanel=this.modalPanel = atom.workspace.addModalPanel({
    		item: element,
			visible: false
    	});
		modalPanel.show();
		element.onclick=function() {modalPanel.hide()};
	},
	lists(type) {
		var [editor,selection]=this.init(`Lists: ${type}`);
		if(!editor) return;
		editor.insertText(WebTools.makeList(selection,{"type": type}));
	},
	structure() {
		var [editor,selection]=this.init(`HTML Structure`);
		if(!editor) return;
		editor.insertText(WebTools.makeHTMLStructure(selection));
	},
	tables(type) {
		var [editor,selection]=this.init(`Tables: ${type}`);
		if(!editor) return;
		var data;
		switch(type) {
			case 'html':
			default:
				data=WebTools.htmlTable(selection);
		}
		editor.insertText(data);
	},
	paragraphs() {
		var [editor,selection]=this.init(`Paragraphs`);
		if(!editor) return;
		var text=WebTools.makeParagraphs(selection);
		editor.insertText(text);
	},
	paragraphsHeadings() {
		var [editor,selection]=this.init(`Paragraphs & Headings`);
		if(!editor) return;
		var text=WebTools.makeHeadingsParagraphs(selection);
		editor.insertText(text);
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
		var text=WebTools.makeAnchors(selection,{reverse: true });
		editor.insertText(text);
	},
	smartQuotes() {
		var [editor,selection]=this.init(`Smart Quotes`);
		if(!editor) return;
		var text=WebTools.smartQuotes(selection);
		editor.insertText(text);
	},

	insert(type) {
		var [editor,selection]=this.init(`Insert: ${type}`);
		if(!editor) return;
		var remote = require('electron').remote;
    	var files = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {properties: ['openFile']});
    	if(files && files.length) console.log(files[0]);
		else return;

		var path=atom.workspace.getActiveTextEditor().getPath();
//		var [,path]=atom.project.relativizePath(atom.workspace.getActiveTextEditor().getPath());
//		var [,src]=atom.project.relativizePath(files[0]);
		var src=WebTools.relativePath(files[0],path,true);


		switch(type) {
			case 'img':
				var parms={
					type: type,
					src: src,
					alt: '',
					title: '',
					width: '',
					height: ''
				};
				break;
			case 'js':
				var parms={
					type: type,
					href: src,
				};
				break;
			case 'css':
				var parms={
					type: type,
					href: src,
				};
				break;
			case 'a':
				var parms={
					type: type,
					href: src,
				};
				break;
			default:
				return;
		}
		var text=WebTools.addLink(parms);
		editor.insertText(text);

		return;
	},
};
