var MobileSafeArea = pc.createScript('mobileSafeArea');
MobileSafeArea.attributes.add('debugConfig', {
    type: 'json',
    name: 'Debug Config',
    description: 'Force safe areas to be applied to the UI. Useful testing layouts without a device.',
    schema: [{
        name: 'enabled',
        type: 'boolean',
        default: false
    }, {
        name: 'top',
        type: 'number',
        default: 0
    }, {
        name: 'bottom',
        type: 'number',
        default: 0
    }, {
        name: 'left',
        type: 'number',
        default: 0
    }, {
        name: 'right',
        type: 'number',
        default: 0
    }]
});


// Add the CSS needed to get the safe area values
// https://benfrain.com/how-to-get-the-value-of-phone-notches-environment-variables-env-in-javascript-from-css/
(function() {
    if (window.document) {
        document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
        document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)');
        document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)');
    }
})();

// initialize code called once per entity
MobileSafeArea.prototype.initialize = function() {
    this.app.graphicsDevice.on('resizecanvas', this._onCanvasResize, this);    
    
    this.on('attr:debugConfig', function (value, prev) {
        this._safeAreaUpdate();
    }, this);
    
    this.on('destroy', function() {
        this.app.graphicsDevice.off('resizecanvas', this._onCanvasResize, this);    
    }, this);
    
    this._onCanvasResize();
};


MobileSafeArea.prototype._onCanvasResize = function() {
    // Reset the margins to get the element size
    this.entity.element.margin = pc.Vec4.ZERO;
    this._initialHeight = this.entity.element.height;
    this._initialWidth = this.entity.element.width;
        
    this._safeAreaUpdate();
};


MobileSafeArea.prototype._safeAreaUpdate = function() {
    var topPixels = 0;
    var bottomPixels = 0;
    var leftPixels = 0;
    var rightPixels = 0;
    
    if (this.debugConfig.enabled) {
        topPixels = this.debugConfig.top;
        bottomPixels = this.debugConfig.bottom;
        leftPixels = this.debugConfig.left;
        rightPixels = this.debugConfig.right;        
    } else {
        // Getting the safe areas from CSS
        // https://benfrain.com/how-to-get-the-value-of-phone-notches-environment-variables-env-in-javascript-from-css/
        topPixels = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sat"));
        bottomPixels = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sab"));
        leftPixels = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sal"));
        rightPixels = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sar"));
    }
    
    var screenResHeight = window.innerHeight;
    var screenResWidth = window.innerWidth;
    
    // Get the % height/width to the screen height/width
    var topPercentage = topPixels / screenResHeight;
    var bottomPercentage = bottomPixels / screenResHeight;
    var leftPercentage = leftPixels / screenResWidth;
    var rightPercentage = rightPixels / screenResWidth;
        
    var topMargin = this._initialHeight * topPercentage;
    var bottomMargin = this._initialHeight * bottomPercentage;
    var leftMargin = this._initialWidth * leftPercentage;
    var rightMargin = this._initialWidth * rightPercentage;
    
    var margin = this.entity.element.margin;
    margin.x = leftMargin;
    margin.y = bottomMargin;
    margin.z = rightMargin;
    margin.w = topMargin;
    
    this.entity.element.margin = margin;
};
