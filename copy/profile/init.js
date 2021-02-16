/*	Your init script
	================================================
	see also keymap.cson
	================================================ */

	atom.commands.add('atom-text-editor', {
		'web-tools:shift-enter-no-indent': () =>	{
			editor = atom.workspace.getActiveTextEditor();
			if(!editor) return;
			editor.insertNewline();
			editor.moveToBeginningOfLine();
		},
	});
