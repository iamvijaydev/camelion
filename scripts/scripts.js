
// Fire in the Hole!
(function() {
	var dirHash = {
	    'UP'    : 'UP',
	    'RIGHT' : 'RIGHT',
	    'DOWN'  : 'DOWN',
	    'LEFT'  : 'LEFT'
	};

	document.addEventListener('DOMContentLoaded', function() {
		var init = new Controller( dirHash );
	}, false);
})();
