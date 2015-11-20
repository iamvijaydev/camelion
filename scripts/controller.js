
/*
Builds the contoller for camelion. 
handles the displacement due to momentum
@constructor
 */
var Controller = function ( dirHash ) {

    var utils     = new Utils();
    var log       = utils.log;
    var callRaf   = utils.callRaf;
    var cancelRaf = utils.cancelRaf;
    var ease      = utils.easeOutQuint;  // avaliable: easeOutQuint, easeOutExpo, easeOutSine. Best: easeOutQuint
    var transform = utils.hasTransform;

    var self = this;
    var view = new View();
    var list = new Touch(view.list, dirHash);

    self.currentPos = 0;
    self.deltaX = 0;
    self.animating = false;
    self.loop = null;


    // handle automated animation
    var doAnimation = function (element, from, to, duration) {
        var duration = duration || 200;
        var instaX = 0;
        var deltaX = to - from;
        var currentTime = 0;

        var animate = function () {
            instaX = ease(currentTime, from, deltaX, duration);
            if(transform) {
                element.style[transform] = 'translate3d(' + instaX + 'px, 0, 0)';
            } else {
                element.style.left = instaX + 'px';
            }
            self.currentPos = instaX;

            if(duration > currentTime) {
                self.loop = callRaf(animate);
                self.animating = true;
            } else {
                cancelRaf(self.loop);
                self.animating = false;
            }

            currentTime += 20;
        };

        animate();
    };


    // calculate residual kinetics, limit it within allowed parameters and apply
    var applyKinetics = function (element, from, direction, swipeLength, swipeDuration) {
        var viewportWidth = view.viewportDimension.width;
        var deceleration = 0.0006;

        var swipeDuration = Math.max(swipeDuration, 200);
        var speed = swipeLength / swipeDuration;

        var resultingDisplacement = (speed * speed) / (2 * deceleration);
        var duration = speed / deceleration;

        var to = 0;
        var toPageNo = 0;

        // direction is left or up
        if(direction === dirHash['LEFT'] || direction === dirHash['UP']) {
            to = from - resultingDisplacement;
        // direction is right or down
        } else {
            to = from + resultingDisplacement;
        }

        // correct "to" so that the animation ends in correct page no.
        // and within bound.
        toPageNo = Math.round(to / viewportWidth);
        toPageNo = toPageNo > 0 ? 0 :
                   toPageNo <= -view.pages ? -view.pages+1 :
                   toPageNo;

        to = viewportWidth * toPageNo;
        // if user is swiping @ ends
        var uprLmt = viewportWidth * (view.pages - 1);
        if (Math.abs(to) < viewportWidth || Math.abs(to) >= Math.abs(uprLmt)) {
            duration = 300;
        };
        console.log(to +' - '+ uprLmt)

        doAnimation(element, from, to, duration);
    };


    // on swiping
    window.addEventListener('swiping', function (event) {
        var _element  = event.data.element;
        var _startX   = event.data.startX;
        var _currentX = event.data.currentX;

        // if animating due to momentum from previous swiping
        if(self.animating) {
            cancelRaf(self.loop);
        }

        self.deltaX = _currentX - _startX;
        self.deltaX = self.currentPos != 0 ? self.deltaX + self.currentPos : self.deltaX;

        if(transform) {
            _element.style[transform] = 'translate3d(' + self.deltaX + 'px, 0, 0)';
        } else {
            _element.style.left = self.deltaX + 'px';
        }
        
    }, false);


    // on swipeEnd
    window.addEventListener('swipeEnd', function(event) {
        var _element       = event.data.element;
        var _direction     = event.data.direction;
        var _swipeLength   = event.data.length;
        var _swipeDuration = event.data.duration;

        // next swipe should start from this currentPos
        self.currentPos = self.deltaX;

        applyKinetics(_element, self.currentPos, _direction, _swipeLength, _swipeDuration);
    }, false);


    // on swipeCanceled
    window.addEventListener('swipeCanceled', function (event) {
        var _element = event.data.element;
        var viewportWidth = view.viewportDimension.width;
        var to = 0;
        var toPageNo = 0;

        // next swipe should start from this currentPos
        self.currentPos = self.deltaX;
        
        // snap to a correct page.
        toPageNo = Math.round(self.currentPos / viewportWidth);
        toPageNo = toPageNo > 0 ? 0 :
                   toPageNo <= -view.pages ? -view.pages+1 :
                   toPageNo;

        to = viewportWidth * toPageNo;

        doAnimation(_element, self.currentPos, to);
    });

    return self;
};