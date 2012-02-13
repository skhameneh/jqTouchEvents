/*
jqTouchEvents v0.2
Shawn Khameneh
MIT License
*/
 
(function($) {
	var activeTouches = {};
	var $body;
	
	function triggerEvent($el, name, id, param) {
		$el.trigger(name, param);
		$el.trigger(name+'_'+id, param);
	};
	
	$(document).ready(function() {
		$body = $(document.body);
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
	
	function initExclusiveBinds(config) {
		var $this = $(this);
		var isActive = true;
		var thisTouchId = false;
		
		config.anyEl = config.anyEl || false;
		
		this.addEventListener('touchstart', function(event) {
			if(thisTouchId && typeof(activeTouches[thisTouchId]) == 'undefined') {
				thisTouchId = false;
			} else if(thisTouchId || event.changedTouches.length < 1) {
				return;
			}
			
			var curId = event.changedTouches[0].identifier;
			
			if(config.start) {
				isActive = (config.start.call($this, event.changedTouches[0])===false)?false:true;
			}
			
			if(isActive)
				thisTouchId = curId;
			
			if(config.anyEl && isActive) {
				if(config.move) {
					$body.bind('jqTouchMove_'+curId, function(e, param){
						config.move.call($this, param);
					});
				}
				$body.bind('jqTouchEnd_'+curId, function(e, param){
					if(config.move) {
						$body.unbind('jqTouchMove_'+curId);
					}
					$body.unbind('jqTouchEnd_'+curId);
					if(config.end) {
						config.end.call($this, param);
						thisTouchId = false;
					}
				});
			}
		});
		
		if(config.move && !config.anyEl) {
			this.addEventListener('touchmove', function(event) {
				if(!isActive)
					return;
				for (var i = 0; i < event.changedTouches.length; i++) {
					if(event.changedTouches[i].identifier == thisTouchId)
						config.move.call($this, event.changedTouches[0]);
				}
			});
		}
		
		if(!config.anyEl) {
			this.addEventListener('touchend', function(event) {
				if(!isActive)
					return;
				if(!thisTouchId || event.changedTouches.length < 1) return;
				
				for (var i = 0; i < event.changedTouches.length; i++) {
					if(event.changedTouches[i].identifier == thisTouchId) {
						if(config.end)
							config.end.call($this, event.changedTouches[0]);
						thisTouchId = false;
					}
				}
			});
		}
	};
 
	$.fn.exclusiveTouch = function(config) {
		this.each(function(){
			initExclusiveBinds.call(this, config);
		});
	}
 
})(jQuery);