Mapmover
---

Handle dragging and scaling of an element.  Works with mouse and touch events.  Shift+mousewheel scales.

    Meteor add danimal:mapmover

Exposes Mapmover( jqueryElement, callback(x,y,scale) ) to the client.

    var mapmover = new Mapmover($(canvas), function(x,y,scale) {
        canvas.setAttribute('transform', 'scale('+scale+') translate('+x+','+y+')')
    })
    
    // these are optional
    // the values here are the defaults
    mapmover.throttle = 100     // uses _.throttle(), how many ms to throttle callback
    mapmover.touchScaleSensitivity = 0.5    // 0.5 = scale half as much, 2 = scale twice as much
    mapmover.mouseScaleSensitivity = 0.1
    mapmover.minScale = 0.2     // clamp scale
    mapmover.maxScale = 2
    
    // starts the event handlers
    // required
    mapmover.start()
    
    // stops the event handlers
    mapmover.stop()
    
    // is the user currently dragging or scaling
    // useful for canceling conflicting events
    mapmover.isDraggingOrScaling

Used in http://dominusgame.net

