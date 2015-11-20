/*
Sets up swiping, swipeEnd and swipeCanceled events for the passed element
@constructor
@param {HTMLElement} element - The element to add the swipe handlers to.
 */
var Touch = function(element, dirHash) {
    this.element = 'string' === typeof element ? document.getElementById(element) : 
                   element[0] ? element[0] : 
                   element;

    if ( 'string' === typeof element ) {
        this.element = document.getElementById(element);
    } else if ( !! element[0] ) {
        this.element = element[0];
    } else {
        this.element = element;
    };

    this.dirHash = dirHash;

    this.isTouching = false;
    this.didSwipe = false;

    this.startX = this.startY = this.curX = this.curY = null;
    this.MIN_SWIPE = 75;

    this.hasTouch  = 'ontouchstart' in window;
    this.START_EVT = this.hasTouch ? 'touchstart' : 'mousedown';
    this.MOVE_EVT  = this.hasTouch ? 'touchmove' : 'mousemove';
    this.END_EVT   = this.hasTouch ? 'touchend' : 'mouseup';
    
    this.element.addEventListener(this.START_EVT, this.onTouchStart.bind(this), true);
};


/*
Handles touchStart events on the represented element
@param {TouchEvent}
*/
Touch.prototype.onTouchStart = function(event) {
    this.isTouching     = true;
    this.touchStartTime = Date.parse(new Date());

    this.startX = this.getPoint(event).x;
    this.startY = this.getPoint(event).y;

    this.element.addEventListener( this.MOVE_EVT, this.onTouchMove.bind(this), true );
    this.element.addEventListener( this.END_EVT, this.onTouchEnd.bind(this), true );
};

/*
Handles touchMove events on the represented element
Dispatches 'swiping' event with data { direction, startX, startY, currentX, currentY, element }
@param {TouchEvent}
*/
Touch.prototype.onTouchMove = function(event) {
    if( ! this.isTouching ) {
        return;
    }

    event.preventDefault();

    this.curX     = this.getPoint(event).x;
    this.curY     = this.getPoint(event).y;
    this.didSwipe = true;

    var swipeAngle = this.getAngle();
    var direction  = this.getDirection( swipeAngle );

    var swipeEvent = document.createEvent('Event');
    swipeEvent.initEvent( 'swiping', true, true );
    swipeEvent.data = {
        'direction' : direction,
        'startX'    : this.startX,
        'startY'    : this.startY,
        'currentX'  : this.curX,
        'currentY'  : this.curY,
        'element'   : this.element
    };
    window.dispatchEvent( swipeEvent );
};

/*
Handles touchEnd events on the represented element
Dispatches 'swipeEnd' event with data { direction, angle, length, startX, startY, currentX, currentY, duration, element }
Dispatches 'swipeCancel' event with data { length, element }
@param {TouchEvent}
*/
Touch.prototype.onTouchEnd = function(event) {
    if( ! this.didSwipe ) {
        return;
    };

    event.preventDefault();

    var swipeAngle = this.getAngle();
    var direction = this.getDirection(swipeAngle);
    var swipeLength = this.getLength();

    var dispatchEndEvent = function() {
        var endEvent = document.createEvent( 'Event' );
        endEvent.initEvent( 'swipeEnd', true, true );
        endEvent.data = {
            'direction' : direction,
            'angle'     : swipeAngle,
            'length'    : swipeLength,
            'startX'    : this.startX,
            'startY'    : this.startY,
            'currentX'  : this.curX,
            'currentY'  : this.curY,
            'duration'  : Date.parse( new Date() ) - this.touchStartTime,
            'element'   : this.element
        };
        this.didSwipe = false;
        window.dispatchEvent( endEvent );
    };

    var dispatchCancelEvent = function() {
        var cancelEvent = document.createEvent( 'Event' );
        cancelEvent.initEvent( 'swipeCanceled', true, true );
        cancelEvent.data = {
            'length'  : swipeLength,
            'element' : this.element
        };
        this.didSwipe = false;
        window.dispatchEvent( cancelEvent );
    };

    if( this.didSwipe ) {
        if(swipeLength >= this.MIN_SWIPE) {
            dispatchEndEvent.call( this );
        } else {
            dispatchCancelEvent.call( this );
        }
    } else {
        dispatchCancelEvent.call( this );
    }

    /* clean up */
    this.isTouching = false;
    this.element.removeEventListener( this.MOVE_EVT );
    this.element.removeEventListener( this.END_EVT );
};

/*
Returns the proper touched points
@private utility
@param {TouchEvent}
@return {Number} the angle of the swipe
*/
Touch.prototype.getPoint = function(event) {
    var point;

    if( this.hasTouch && event.touches.length ) {
        point = { 
            'x' : event.touches[0].clientX, 
            'y' : event.touches[0].clientY 
        }
    } else {
        point = { 
            'x' : event.clientX, 
            'y' : event.clientY 
        }
    };

    return point;
};

/**
Determines the angle of the swipe
@private utility
@return {Number} the angle of the swipe
*/
Touch.prototype.getAngle = function() {
    var deltaX     = this.startX - this.curX;
    var deltaY     = this.curY - this.startY;
    var radius     = Math.atan2( deltaY, deltaX );
    var swipeAngle = Math.round( radius * 180 / Math.PI );

    if ( swipeAngle < 0 ) {
        swipeAngle = 360 - Math.abs(swipeAngle);
    };

    return swipeAngle;
},

/*
Calculates the swipe direction
@private utility
@param {Number} swipeAngle
@return {String} up/down/left/right
*/
Touch.prototype.getDirection = function(swipeAngle) {
    var directions = {
        'up'    : 1,
        'right' : 2,
        'down'  : 3,
        'left'  : 4
    };

    if(swipeAngle <= 45 && swipeAngle >= 0) {
        return this.dirHash['LEFT'];
    } else if (swipeAngle <= 360 && swipeAngle >= 315) {
        return this.dirHash['LEFT'];
    } else if (swipeAngle >= 135 && swipeAngle <= 225) {
        return this.dirHash['RIGHT'];
    } else if (swipeAngle > 45 && swipeAngle < 135) {
        return this.dirHash['DOWN'];
    } else {
        return this.dirHash['UP'];
    };

    return null;
}

/*
Calculates the swipe length
@private utility
@return {Number} the swipe length
*/
Touch.prototype.getLength = function() {
    var deltaX = this.curX - this.startX;
    var deltaY = this.curY - this.startY;

    return Math.round( Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) );
},

Touch.prototype.onDestroy = function() {
    this.element.removeEventListener( this.START_EVT );
};
