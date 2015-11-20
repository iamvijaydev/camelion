
/*
Basic utils
@constructor
@return constructor instance itself.
 */
var Utils = function () {
	this.log = function(m) {
	    console.log(m);
	};

	this.callRaf = (function () {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback) { return setTimeout(callback, 1); };
	})();

	this.cancelRaf = (function () {
		return window.cancelRequestAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.webkitCancelRequestAnimationFrame ||
			window.mozCancelRequestAnimationFrame ||
			window.oCancelRequestAnimationFrame ||
			window.msCancelRequestAnimationFrame ||
			clearTimeout;
	})();

	this.hasTransform = (function () {
	    var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
	    for(var i = 0; i < prefixes.length; i++) {
	        if(document.createElement('div').style[prefixes[i]] !== undefined) {
	            return prefixes[i];
	        }
	    }
	    return false;
	})();

	this.easeOutQuint = function (t, b, c, d) {
        return c * ( (t = t / d - 1) * t * t * t * t + 1 ) + b;
    };

    this.easeOutExpo = function (t, b, c, d) {
		return (t == d) ? b + c : c * ( -Math.pow(2, -10 * t / d) + 1 ) + b;
	};

    this.easeOutSine = function (t, b, c, d) {
		return c * Math.sin( t / d * (Math.PI / 2) ) + b;
	};

	return this;
};