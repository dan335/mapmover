Mapmover = function(beginDragCallback, callback, endDragCallback) {
    var self = this

    self.scale = 1
    self.moveX = 0
    self.moveY = 0

    // uses _.throttle
    // how many ms to throttle callback
    self.throttle = 100

    self.isDraggingOrScaling = false;
    self.isDraggingOrScalingReactive = new ReactiveVar(false);

    // 0.5 = scale half as much, 2 = scale twice as much
    self.touchScaleSensitivity = 0.5
    self.mouseScaleSensitivity = 0.1

    self.minScale = 0.2
    self.maxScale = 2

    self.elm = null

    self.callback = callback
    self.beginDragCallback = beginDragCallback
    self.endDragCallback = endDragCallback

    self._changed = _.throttle(function() {
        self.callback(self.moveX, self.moveY, self.scale)
    }, self.throttle)
}


Mapmover.prototype.isTouchEvent = function(event) {
    return _.contains(['touchstart', 'touchend', 'touchcancel', 'touchmove'], event.type)
}


Mapmover.prototype.moreThanOneTouch = function(event) {
    return event.originalEvent.touches.length > 1
}


Mapmover.prototype.getDistanceBetweenTouches = function(event) {
    var self = this

    if (self.moreThanOneTouch(event)) {

        var x1 = event.originalEvent.touches[0].pageX
        var y1 = event.originalEvent.touches[0].pageY
        var x2 = event.originalEvent.touches[1].pageX
        var y2 = event.originalEvent.touches[1].pageY

        var xs = x2-x1
        var ys = y2-y1

        xs = xs * xs
        ys = ys * ys

        return Math.sqrt(xs+ys)
    }

    return false
}


Mapmover.prototype.stopAllEvents = function() {
    var self = this
    self.elm.off('mousemove touchmove mouseup mouseleave touchend touchcancel')
    // delay 100ms to prevent click at end of dragging
    Meteor.setTimeout(function() {
        self.isDraggingOrScaling = false
        self.isDraggingOrScalingReactive.set(false)
    }, 10)
}


Mapmover.prototype.getCursorPosition = function(event) {
    if (this.isTouchEvent(event)) {
        // is touch event
        var x = event.originalEvent.touches[0].pageX
        var y = event.originalEvent.touches[0].pageY
    } else {
        // is mouse event
        var x = event.clientX || event.pageX
        var y = event.clientY || event.pageY
    }

    return {x:x, y:y}
}


Mapmover.prototype.stop = function() {
    this.elm.off('mousedown touchstart mousewheel DOMMouseScroll mousemove touchmove mouseup mouseleave touchend touchcancel')
    this.isDraggingOrScaling = false
    this.isDraggingOrScalingReactive.set(false)
}


Mapmover.prototype.start = function(jquerySelector) {
    var self = this

    if (!jquerySelector || jquerySelector.length == 0) {
        throw new Meteor.Error('The start function requires a jquery selector. Mapmover.start($(window))')
    }

    self.elm = jquerySelector

    // mousewheel
    self.elm.on('mousewheel DOMMouseScroll', function(event) {
        if (event.shiftKey) {
            var normalized;
            if (event.originalEvent.wheelDelta) {
                normalized = (event.originalEvent.wheelDelta % 120 - 0) == -0 ? event.originalEvent.wheelDelta / 120 : event.wheelDelta.originalEvent / 12;
            } else {
                var rawAmmount = event.originalEvent.deltaY ? event.originalEvent.deltaY : event.originalEvent.detail;
                normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
            }

            var scaled = normalized * self.mouseScaleSensitivity
            self.setScale(self.scale + scaled)
        }
    })


    // mouse and touch
    self.elm.on('mousedown touchstart', function(event) {
        event.preventDefault()

        // cancel if right click
        if (event.type == 'mousedown' && event.which != 1) {
            return false
        }

        self.elm.on('mouseup mousemove touchend touchmove touchcancel', function handler(event) {

            if (event.type == 'mouseup' || event.type == 'touchend') {
                // click
                self.elm.off('mouseup mousemove touchend touchmove touchcancel', handler)

            } else if (event.type == 'touchcancel') {
                // cancel?
                $(canvas).off('mouseup mousemove touchend touchmove touchcancel', handler)

            } else {
                // drag or scale
                self.elm.off('mouseup mousemove touchend touchmove touchcancel', handler)

                // are we dragging or scaling
                if (self.isTouchEvent(event) && self.moreThanOneTouch(event)) {
                    // scaling

                    var lastTouchDistance = self.getDistanceBetweenTouches(event)
                    if (lastTouchDistance) {
                        self.isDraggingOrScaling = true
                        self.isDraggingOrScalingReactive.set(true)

                        self.elm.on('touchmove', function moveHandler(event) {
                            var distance = self.getDistanceBetweenTouches(event)
                            var dif = distance / lastTouchDistance
                            dif = (dif - 1) * self.touchScaleSensitivity + 1
                            self.setScale(self.scale * dif)
                            lastTouchDistance = distance
                        })

                        self.elm.on('mouseup mouseleave touchend touchcancel', function stopDragHandler(event) {
                            self.stopAllEvents()
                        })

                    } else {
                        self.stopAllEvents()
                    }

                } else {
                    // dragging

                    var lastCursorPos = self.getCursorPosition(event)
                    self.isDraggingOrScaling = true
                    self.isDraggingOrScalingReactive.set(true)
                    self.beginDragCallback(self.moveX, self.moveY, self.scale)

                    self.elm.on('mousemove touchmove', function moveHandler(event) {
                        var curPos = self.getCursorPosition(event)
                        var deltaX = curPos.x - lastCursorPos.x
                        var deltaY = curPos.y - lastCursorPos.y
                        self.moveX = self.moveX + deltaX
                        self.moveY = self.moveY + deltaY
                        self.changed()
                        lastCursorPos = curPos
                    })

                    self.elm.on('mouseup mouseleave touchend touchcancel', function stopDragHandler(event) {
                        self.stopAllEvents()
                        self.endDragCallback(self.moveX, self.moveY, self.scale)
                    })
                }
            }
        })
    })
}


Mapmover.prototype.setScale = function(scale) {
    if (scale < this.minScale) {
        scale = this.minScale
    }

    if (scale > this.maxScale) {
        scale = this.maxScale
    }

    this.scale = scale
    this.changed()
}


Mapmover.prototype.changed = function() {
    this._changed()
}
