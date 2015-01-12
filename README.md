Mapmover
---

Meteor package to handle dragging and scaling of an element.  Works with mouse and touch events.  Shift+ctrl+mousewheel scales.

    Meteor add danimal:mapmover

Exposes Mapmover( beginDragCallback(x,y,scale), callback(x,y,scale), endDragCallback(x,y,scale) ) to the client.

    var mapmover = new Mapmover(
        function(x,y,scale) {
            // called once when dragging starts

        }, function(x,y,scale) {
            // called as the user drags or scales
            canvas.setAttribute('transform', 'scale('+scale+') translate('+x+','+y+')')

        }, function(x,y,scale) {
            // called when dragging stops
        }
    )

    // these are optional
    // the values here are the defaults
    mapmover.throttle = 100     // uses _.throttle(), how many ms to throttle callback
    mapmover.touchScaleSensitivity = 0.5    // 0.5 = scale half as much, 2 = scale twice as much
    mapmover.mouseScaleSensitivity = 0.1
    mapmover.minScale = 0.2     // clamp scale
    mapmover.maxScale = 2

    // starts the event handlers
    // required
    mapmover.start( jquerySelector )
    mapmover.start( $(svg) )

    // stops the event handlers
    mapmover.stop()

    // is the user currently dragging or scaling
    // useful for canceling conflicting events
    mapmover.isDraggingOrScaling

    // this is the same as above but uses ReactiveVar
    mapmover.isDraggingOrScalingReactive.get()



Used in http://dominusgame.net
