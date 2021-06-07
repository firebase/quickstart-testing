/*	HTML Routines
	=========================================================

	These routines are called by the calling functions above.
	This allows easier maintenance and modification.

	========================================================= */

/* qjshint unused: false */
'use strict';
/*exported htmlTools, wrapTag,addComment,entify,smartQuotes,collapse,collapseText */


var htmlTools={
	/*	Utility Functions
		--------------------------------------------------------- */
		attribute: function(name,value,required) {
			var empty = required ? ' %s=""'.sprintf(name) : '';
			return value ? ' %s="%s"'.sprintf(name,value) : empty;
		},
		idClass: function(parms) {
			var id = parms.id ? ' id="%s"'.sprintf(parms.id) : '';
			var className = parms.className ? ' class="%s"'.sprintf(parms.className) : '';
			return [id,className];
		},



};

/*	Wrap Tag around Selection
	--------------------------------------------------------- */
/*
	function doWrapTag(text) {
		var attributes=ko.interpolate.interpolateString('%(ask:tag:div);%(ask:id);%(ask:class)');
		if(!attributes) return '';

		attributes=attributes.split(';');
		if(!(tag=attributes[0])) return '';

		id=attributes[1]||'';
		className=attributes[2]||'';
		return wrapTag(text,tag,id,className);
	}

	//	Wrap element
*/
	function wrapTag(text,parms) {
		var id = parms.id ? ' id="%s"'.sprintf(parms.id) : '';
		var className = parms.className ? ' class="%s"'.sprintf(parms.className) : '';
		var element =		parms.element || 'span';
		var	eol =			parms.eol || '\n';
		var newline =		parms.newline ? eol : '';
//		return '<%s%s%s>%s</%s>%s'.sprintf(element,id,className,text.trim(),element,newline);
		switch(element) {
			case 'a':
				return '<a href="%s"%s%s>%s%s%s</a>%s'.sprintf(text,id,className,newline,text,newline,newline);
			default:
				return '<%s%s%s>%s%s%s</%s>%s'.sprintf(element,id,className,newline,text,newline,element,newline);
		}
	}

/*	Remove HTML Tags
	--------------------------------------------------------- */

	function unTag(text) { //	text,parms) {
		var parser = new DOMParser();
		var html = parser.parseFromString('', "text/html");
		var div=html.createElement('div');
		div.innerHTML=text;
		return div.textContent;
	}

/*	Comments
	--------------------------------------------------------- */

	function addComment(text,style,block) {
		var start,end;
		block=!!block;
		switch(style) {
			case 'xml': start='<!--'; end='-->'; break;
			case 'c': start='/*'; end='*/'; break;
		}
		start = block ? eol+start+eol : start+' ' ;
		end = block ? eol+end+eol : ' '+end ;
		return start + text + end;
	}

	function removeHTMLComment(text) {

	}

/*	Entity Encoding
	--------------------------------------------------------- */

	function entify(text,numeric) {
		if(!numeric) numeric=false;
		numeric=!!numeric;
		var result=[];
		for(var i=0;i<text.length;i++) {
			var c=text[i];
			switch(c) {
				case '<':	c =	numeric?'&0x003C' :	'&lt;';		break;
				case '>':	c =	numeric?'&0x003E' :	'&gt;';		break;
				case '&':	c =	numeric?'&0x0026' :	'&amp;';	break;
				case '"':	c =	numeric?'&0x0022' :	'&quot;';	break;
				case '\'':	c =	numeric?'&0x0027' :	'&apos;';	break;
			}
			result.push(c);
		}
		return result.join('');
	}

/*	Collapse Text
	--------------------------------------------------------- */

	function collapseText(text) {
		return text.replace(/\r\n/g,'\\n').replace(/\t/g,'\\t');
	}

/*	Convert to HTML5
	--------------------------------------------------------- */

	function makeHTML5(parms,eol) {
		eol = eol || '\n';
		var cv = ko.views.manager.currentView;
		var editor = cv.scimoz;
		var editor = ko.views.manager.currentView.scimoz;

		if(parms.doctype)	editor.text=editor.text.replace(/<!DOCTYPE html.*?>/igm,'<!DOCTYPE html>');
		if(parms.lang)		editor.text=editor.text.replace(/<html.*?>/gm,'<html lang="en">');
		if(parms.charset)	editor.text=editor.text.replace(/<meta http-equiv="content-type" content="text\/html;charset=utf-8">/gmi,'<meta charset="utf-8">');
		if(parms['void'])	editor.text=editor.text.replace(/ *\/>/gm,'>');
		if(parms.minimised)	editor.text=editor.text.replace(/(\S+)="\1"/gm,'$1');

		if(parms.id || parms['class']) {
			var elements=['header','footer','nav','article','aside','section','main'];
			var i,div,element,parent,selector=[];
			var parser = new DOMParser();
			var html = parser.parseFromString(editor.text, "text/html");

			for(i=0;i<elements.length;i++) {
				element=elements[i];
				if(parms.id) selector.push('#'+element);
				if(parms['class']) selector.push('.'+element);
				div=html.querySelector(selector.join(','));

				if(div) {
					parent=div.parentNode;
					element=html.createElement(element);
					element.innerHTML=div.innerHTML;
					parent.replaceChild(element,div);
				}
			}
			editor.text='<!DOCTYPE html>'+eol+html.documentElement.outerHTML;
		}
	}
