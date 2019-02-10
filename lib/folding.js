/**	Editor & Buffer
	================================================ */
	var editor=atom.workspace.getActiveTextEditor();
	var buffer=editor.buffer;

/**	Find Markers
	================================================ */
	function getMarkers(buffer,pattern) {
		var lines=[];
		buffer.scan(pattern,function(line) {
			lines.push(line.range.start.row);
		});
		lines.push(buffer.getLastRow());
		return lines;
	}

/**	Section
	================================================ */
	var marker=/\/\*\*\t/g;
	var markers=getMarkers(buffer,marker);

/**	Section
	================================================ */
	for(let i=0;i<markers.length-1;i++) {
		//editor.setCursorBufferPosition([lines[i],0]);
		//atom.commands.dispatch(document.querySelector('atom-text-editor'), 'bookmarks:toggle-bookmark');
		editor.setSelectedBufferRange([[lines[i]+1,0],[lines[i+1],0]]);
		editor.foldSelectedLines();
		//	console.log(lines[i]+1);
	}

/**	Editor & Buffer
	================================================ */

	function replace(pattern,fn) {
		var editor=atom.workspace.getActiveTextEditor();
		var selection=editor.getSelectedText();
		var buffer=editor.buffer;
		if(selection) editor.insertText(selection.replace(pattern,fn));
		else if(buffer) buffer.replace(pattern,fn);
	}

	function uc() {
		var pattern=/\b(all|as|case|create|delete|desc|distinct|dml|else|end|from|group by|having|in|insert|into|is|join|left|mssql|not|null|offset|on|order by|outer|right|right|select|set|then|union|unique|update|values|view|when|where|with|drop|if exists|go|returns|return|declare|function|while|begin|if|cast|execute|use|procedure|table|partition by|index|alter|add|default|check|over)\b/g;
		function doit(value) {
			return value.toUpperCase();
		}
		replace(pattern,doit);
	}

var editor=atom.workspace.getActiveTextEditor();
	var buffer=editor.buffer;
function getMarkers(buffer,pattern) {
		var lines=[];
		buffer.scan(pattern,function(line) {



			lines.push(line.range.start.row);
		});
		lines.push(buffer.getLastRow());
		return lines;
	}

	var marker=/\/\*\*\t/g;
	var markers=getMarkers(buffer,marker);

	JSON.stringify(markers);

	editor.getPath()

	markers.forEach(item=>editor.markBufferPosition[item,0]);
	editor.setCursorBufferPosition([9,0]);
	editor.scrollToCursorPosition();

var div=document.createElement('div');
var panel=atom.workspace.addRightPanel({item: div});
panel.destroy();

editor.getPath();
function test(event) {

}
var pane=atom.workspace.getActivePane();
pane.onDidActivate(test);
pane.activateItem(panes[1]);
var paneItems=atom.workspace.getPaneItems();
