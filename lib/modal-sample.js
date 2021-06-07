	//	Variables
		var modalPanel,form,ok,cancel;

	//	Get Local Storate
		var storage=localStorage.getItem('installed-packages:…')||'{}';
		storage=JSON.parse(storage);


	//	Create Basic Form
		form=document.createElement('form');
		form.innerHTML='…';	//	content of form

	//	Add OK & Cancel Buttons
		ok=document.createElementHTML('<button name="ok">OK</button>');
		form.appendChild(ok);
		cancel=document.createElementHTML('<button name="cancel">Cancel</button>');
		form.appendChild(cancel);

		//	use storage to repopulate form

	//	Cancel
		form.cancel.onclick=function() {
			//	get form data into storage
			//	localStorage.setItem('installed-packages:…',JSON.stringify(storage));
			modalPanel.hide();
		};

	//	OK: This is where it all happens
		form.ok.onclick=function(event) {
			modalPanel.hide();
			//	the code to do what comes next
		};

	//	Add the form & show it
		modalPanel=this.modalPanel = atom.workspace.addModalPanel({
			item: form,
			visible: false
		});
		modalPanel.show();
