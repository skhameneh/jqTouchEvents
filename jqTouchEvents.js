/*
jqTouchEvents v0.1
Shawn Khameneh
MIT License
*/
 
(function($) {
    var activeTouches = {};
    
    var triggerEvent = function($el, name, id, param) {
        $el.trigger(name, param);
        $el.trigger(name+'_'+id, param);
    };
    
    $(document).ready(function() {
        var $body = $(document.body);
        document.body.addEventListener('touchstart', function(event){
            for (var i = 0; i < event.changedTouches.length; i++) {
                activeTouches[event.changedTouches[i].identifier] = event.changedTouches[i];
                triggerEvent($body, 'jqTouchStart', event.changedTouches[i].identifier, event.changedTouches[i]);
            }
        });
        
        document.body.addEventListener('touchmove', function(event){
            for (var i = 0; i < event.changedTouches.length; i++) {
                activeTouches[event.changedTouches[i].identifier] = event.changedTouches[i];
                triggerEvent($body, 'jqTouchMove', event.changedTouches[i].identifier, event.changedTouches[i]);
            }
        });
        
        document.body.addEventListener('touchend', function(event){
            for (var i = 0; i < event.changedTouches.length; i++) {
                triggerEvent($body, 'jqTouchEnd', event.changedTouches[i].identifier, event.changedTouches[i]);
                delete activeTouches[event.changedTouches[i].identifier];
            }
        });
    });
    
    var initExclusiveBinds = function(config) {
        var $this = $(this);
        var isActive = true;
        this.addEventListener('touchstart', function(event) {
            var curId = $this.data('touchId');
            if(curId && typeof(activeTouches[curId]) == 'undefined') {
                $this.removeData('touchId');
            } else if(curId || event.changedTouches.length < 1) {
                return;
            }
            $this.data('touchId', event.changedTouches[0].identifier);
            if(config.start) {
                isActive = (config.start.call($this, event.changedTouches[0])==false)?false:true;
            }
        });
        
        if(config.move) {
            this.addEventListener('touchmove', function(event) {
                if(!isActive)
                    return;
                var touchId = $this.data('touchId');
                for (var i = 0; i < event.changedTouches.length; i++) {
                    if(event.changedTouches[i].identifier == touchId)
                        config.move.call($this, event.changedTouches[0]);
                }
            });
        }
        
        this.addEventListener('touchend', function(event) {
            if(!isActive)
                return;
            var touchId = $this.data('touchId') || false;
            if(!touchId || event.changedTouches.length < 1) return;
            
            for (var i = 0; i < event.changedTouches.length; i++) {
                if(event.changedTouches[i].identifier == touchId) {
                    if(config.end)
                        config.end.call($this, event.changedTouches[0]);
                    $this.removeData('touchId');
                }
            }
        });
    };
 
    $.fn.exclusiveTouch = function(config) {
        this.each(function(){
            initExclusiveBinds.call(this, config);
        });
    }
 
})(jQuery);