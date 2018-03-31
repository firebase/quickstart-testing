
/*	HTML Routines

 	These routines are called by the calling functions above.
 	This allows easier maintenance and modification.

*/

	function hex2dec(hex) {
		hex=hex.toLowerCase().split('');
		var digits='0123456789abcdef';
		var result=0;
		for(var i=0;i<hex.length;i++) result=result*16+digits.search(hex[i]);
		return result;
	}
	function hexColour(hex) {
		hex=hex.match(/^#?(([a-fA-F0-9]{3})([a-fA-F0-9]{3})?)$/);
		if(!hex) return null;
		hex=hex[1];
		if(hex.length==3) {
			hex=hex.split('');
			hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
		}
		return hex;
	}
	function hex2rgb(hex) {
		var i;
		hex=hexColour(hex);
		if(!hex) return null;
		hex=hex.match(/../g);
		var rgb=[];
		for(i=0;i<hex.length;i++) rgb.push(hex2dec(hex[i]));
		rgb=rgb.join(',');
		return 'rgb('+rgb+')';

	}

	//	Border Radius

	function borderRadius(radius,vertical) {
		var i;
		//	border-radius: [length|percentage]{1,4}[/[length|percentage]{1,4}]?
		//	top-left, top-right, bottom-right, bottom-left ⎡⎤⎦⎣ \ / *

		var prefix=['-moz-','-webkit-','-khtml-',''];

		//	Multiple Corners
			radius=radius.toString().split(/\s+/);
			for(i=0;i<radius.length;i++) radius[i]=radius[i]+'px';
			radius=radius.join(' ');

			if(vertical) {
				vertical=vertical.toString().split(/\s+/);
				for(i=0;i<vertical.length;i++) vertical[i]=vertical[i]+'px';
				radius+=' / '+vertical.join(' ');
			}

		//	Build prefixed versions
			var result=[];
			for(i=0;i<prefix.length;i++) {
				result.push(prefix[i]+'border-radius: '+radius+';');
			}
		return result.join('\n');
	}

	function n2px(n) {
		return parseInt(n)+'px';
	}

	//	Box Shadow
	function boxShadow(dx,dy,colour,blur,spread,inset) {
		/*	dx dy [blur [spread]] [colour] */
		if(!dy) return null;
		var properties=[];
		var prefix=['-moz-','-webkit-',''];

		if(inset) properties.push('inset');
		properties.push(n2px(dx));
		properties.push(n2px(dy));
		if(blur) properties.push(n2px(blur));
		if(spread) properties.push(n2px(spread));
		if(colour) properties.push(colour);

		properties=properties.join(' ');

		//	Build prefixed versions
			var result=[];
			for(i=0;i<prefix.length;i++) {
				result.push(prefix[i]+'box-shadow: '+properties+';');
			}

		return result.join('\n');
	}
