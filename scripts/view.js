
/*
Builds the view for the camelion and retuns the required informations to the controller
@constructor
@return constructor instance itself.
 */
var View = function() {

    var self = this;
    var i = 0;
    var j = 0;
    var left = 0;

    var build = function() {
        
        self.viewport = document.getElementById('viewport');
        self.list = document.getElementById('list');
        var listPage = self.list.getElementsByTagName('li');

        self.viewportDimension = {
            'width': window.innerWidth,
            'height': window.innerHeight
        }

        var viewportStyle = 'width: ' + self.viewportDimension.width + 'px; ' +
                            'height: ' + self.viewportDimension.height + 'px;';

        self.viewport.setAttribute( 'style', viewportStyle );

        var listStyle = 'width: ' + self.viewportDimension.width * listPage.length + 'px; ' +
                        'height: ' + self.viewportDimension.height + 'px;';

        self.list.setAttribute( 'style', listStyle );

        var listPageStyle = 'width: ' + self.viewportDimension.width + 'px; ' +
                            'height: ' + self.viewportDimension.height + 'px;';

        for( j = listPage.length; i < j; i++ ) {
            listPage[i].setAttribute( 'style', listPageStyle );
            listPage[i].style.left = left + 'px';
            left += self.viewportDimension.width;
        }

        self.totalWidth = left;
        self.pages = listPage.length;

        // clean up
        i = j = left = 0;
    };

    build();

    window.addEventListener('resize', function() {
        build();
    }, false);

    return self;
};
