var replacements = {
	find: [
		{
			name: 'SQL Keywords',
			regex: /\b(all|as|case|create|delete|desc|distinct|dml|else|end|from|group by|having|in|insert|into|is|join|left|mssql|not|null|offset|on|order by|outer|right|right|select|set|then|union|unique|update|values|view|when|where|with|drop|if exists|go|returns|return|declare|function|while|begin|if|cast|execute|use|procedure|table|partition by|index|alter|add|default|check|over)\b/g
		}
	],
	replace: [
		{
			name: 'UPPER CASE',
			fn(value) { return value.toUpperCase(); }
		},
		{
			name: 'lower case',
			fn(value) { return value.toLowerCase(); }
		}
	]
}

	function replace(pattern,fn) {
		var editor=atom.workspace.getActiveTextEditor();
		var selection=editor.getSelectedText();
		var buffer=editor.buffer;
		if(selection) editor.insertText(selection.replace(pattern,fn));
		else if(buffer) buffer.replace(pattern,fn);
	}

	function uc() {
		var pattern=/\b(all|as|case|create|delete|desc|distinct|dml|else|end|from|group by|having|in|insert|into|is|join|left|mssql|not|null|offset|on|order by|outer|right|right|select|set|then|union|unique|update|values|view|when|where|with|drop|if exists|go|returns|return|declare|function|while|begin|if|cast|execute|use|procedure|table|partition by|index|alter|add|default|check|over|intersect)\b/g;
		function doit(value) {
			return value.toUpperCase();
		}
		replace(pattern,doit);
	}
