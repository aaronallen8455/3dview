window.onload = function() {
    //Define Shape class. Shapes are a group of vertices
    function Shape(name) {
        this.name;
        this.setName(name);
        this.vertices = [];
        this.pivot = {x:0,y:0,z:0}; //point around which rotations and scales occur.
        this.center = {x:0,y:0,z:0}; //the object center
        this.rotation = {x:0,y:0,z:0};
        this.scale = {x:1, y:1, z:1};
        this.history = new Stack(50);
        Shape.shapes.push(this);
        
        //create UI
        this.div = document.createElement('div');
        this.div.className = 'shapeUI';
        shapesDiv.appendChild(this.div); //add to Div that holds all shapes UI elements.
        //Selection handler
        this.div.addEventListener('click', function() {
            Shape.selected = _this;
            _this.div.className = 'selected';
            Shape.shapes.forEach(function(x) {
                if (x !== _this)
                    x.div.className = 'shapeUI';
            });
        });
        
        var nameInput = document.createElement('input'); //input for displaying and changing the name.
        nameInput.type = 'text';
        nameInput.value = this.name;
        var _this = this;
        nameInput.onchange = function() { //change name.
            _this.setName(this.value);
            this.value = _this.name;
        }
        this.div.appendChild(nameInput);
        
        //transform inputs
        var trans = document.createElement('span');
        trans.innerHTML = 'Translation: ';
        trans.className = 'transformSpan';
        this.div.appendChild(trans);
        
        var rot = document.createElement('span');
        rot.innerHTML = 'Rotation: ';
        rot.className = 'transformSpan';
        this.div.appendChild(rot);
        
        var scale = document.createElement('span');
        scale.innerHTML = 'Scale: ';
        scale.className = 'transformSpan';
        this.div.appendChild(scale);
        
        var pivot = document.createElement('span');
        pivot.innerHTML = 'Pivot: ';
        pivot.className = 'transformSpan';
        this.div.appendChild(pivot);
        
        function createInput(value, handler, parent) {
            var input = document.createElement('input');
            input.type = 'text';
            input.className = 'smallInput';
            input.value = value;
            input.onchange = handler;
            parent.appendChild(input);
            return input;
        }
        
        this.transformUI = {
            translate : {
                x: createInput(0, function() {
                    var dist = this.value - _this.pivot.x;
                    Shape.translate(_this, 'x', dist);
                    _this.pushState();
                    draw(camera, canvas);
                }, trans),
                y: createInput(0, function() {
                    var dist = this.value - _this.pivot.y;
                    Shape.translate(_this, 'y', dist);
                    _this.pushState();
                    draw(camera, canvas);
                }, trans),
                z: createInput(0, function() {
                    var dist = this.value - _this.pivot.z;
                    Shape.translate(_this, 'z', dist);
                    _this.pushState();
                    draw(camera, canvas);
                }, trans)
            },
            rotate : {
                x: createInput(0, function() {
                    var diff = this.value - _this.rotation.x;
                    Shape.rotate(_this, 'x', diff, [_this.pivot.x,_this.pivot.y,_this.pivot.z]);
                    _this.pushState();
                    draw(camera, canvas);
                }, rot),
                y: createInput(0, function() {
                    var diff = this.value - _this.rotation.y;
                    Shape.rotate(_this, 'y', diff, [_this.pivot.x,_this.pivot.y,_this.pivot.z]);
                    _this.pushState();
                    draw(camera, canvas);
                }, rot),
                z: createInput(0, function() {
                    var diff = this.value - _this.rotation.z;
                    Shape.rotate(_this, 'z', diff, [_this.pivot.x,_this.pivot.y,_this.pivot.z]);
                    _this.pushState();
                    draw(camera, canvas);
                }, rot)
            },
            scale : {
                x: createInput(1, function() {
                    var factor = parseFloat(this.value);
                    Shape.scale(_this, 'x', factor, [_this.pivot.x,_this.pivot.y,_this.pivot.z]);
                    _this.pushState();
                    draw(camera, canvas);
                }, scale),
                y: createInput(1, function() {
                    var factor = parseFloat(this.value);
                    Shape.scale(_this, 'y', factor, [_this.pivot.x,_this.pivot.y,_this.pivot.z]);
                    _this.pushState();
                    draw(camera, canvas);
                }, scale),
                z: createInput(1, function() {
                    var factor = parseFloat(this.value);
                    Shape.scale(_this, 'z', factor, [_this.pivot.x,_this.pivot.y,_this.pivot.z]);
                    _this.pushState();
                    draw(camera, canvas);
                }, scale)
            },
            pivot : {
                x: createInput(0, function() {
                    _this.pivot.x = this.value;
                    _this.freeze(true,true,false);
                    _this.updateUI();
                    _this.pushState();
                }, pivot),
                y: createInput(0, function() {
                    _this.pivot.y = this.value;
                    _this.freeze(true,true,false);
                    _this.updateUI();
                    _this.pushState();
                }, pivot),
                z: createInput(0, function() {
                    _this.pivot.z = this.value;
                    _this.freeze(true,true,false);
                    _this.updateUI();
                    _this.pushState();
                }, pivot)
            }
        };
        
        var undo = document.createElement('button'); //undo last action.
        undo.innerHTML = 'Undo';
        undo.onclick = function(){_this.travHist('undo');};
        this.div.appendChild(undo);
        
        var redo = document.createElement('button'); //redo change.
        redo.innerHTML = 'Redo';
        redo.onclick = function(){_this.travHist('redo');};
        this.div.appendChild(redo);
        
        var del = document.createElement('button'); //delete the shape
        del.innerHTML = 'Delete';
        del.onclick = function() {
            shapesDiv.removeChild(_this.div);
            Shape.shapes.splice(Shape.shapes.indexOf(_this),1);
            draw(camera,canvas);
        };
        this.div.appendChild(del);
    };
    Shape.prototype.updateUI = function() {
        //var center = this.getCenter();
        var ui = this.transformUI;
        ui.translate.x.value = this.center.x;
        ui.translate.y.value = this.center.y;
        ui.translate.z.value = this.center.z;
        ui.rotate.x.value = this.rotation.x;
        ui.rotate.y.value = this.rotation.y;
        ui.rotate.z.value = this.rotation.z;
        ui.scale.x.value = this.scale.x;
        ui.scale.y.value = this.scale.y;
        ui.scale.z.value = this.scale.z;
    };
    Shape.prototype.addVert = function(vert) {
        if (vert.shape) {
            this.vertices.push(vert);
            vert.shape = this;
        }
    };
    Shape.prototype.removeVert = function(vert) {
        var pos = this.vertices.indexOf(vert);
        if (pos !== -1) {
            this.vertices.splice(pos,1);
            vert.shape = undefined;
        }
    };
    Shape.prototype.setName = function(name) {
        //check for duplicate name and add/change numeric suffix. Shape names should always be unique.
        var dupe;
        if (dupe = Shape.shapes.filter(function(x){return x.name === name;})[0]) {
            var pos
            if ((pos = dupe.name.search(/\d+$/)) > 0) { //position of number suffix
                this.setName(name.slice(0,pos) + (parseInt(name.slice(pos))+1)); //add 1 to suffix and recurse
            }else{
                this.setName(name + '2'); //create number suffix if not already present, then recurse
            }
        }else
            this.name = name;
    };
    Shape.prototype.freeze = function(rotation, scale, translation) {
        if (rotation) {
            this.rotation.x = this.rotation.y = this.rotation.z = 0;
        }
        if (scale) {
            this.scale.x = this.scale.y = this.scale.z = 1;
        }
        if (translation) {
            this.center.x = this.center.y = this.center.z = 0;
        }
    }
    Shape.prototype.getCenter = function() {
        var x,y,z;
        x = this.vertices.reduce(function(a,b){return a+b.x;},0);
        y = this.vertices.reduce(function(a,b){return a+b.y;},0);
        z = this.vertices.reduce(function(a,b){return a+b.z;},0);
        x /= this.vertices.length;
        y /= this.vertices.length;
        z /= this.vertices.length;
        return [x,y,z];
    };
    Shape.prototype.getVertAtCoord = function(x,y,z) { //get the vertex at a given point
        var result = this.vertices.find(function(v){
            var coords = v.getCoords()
            if (coords[0].toFixed(5) == x.toFixed(5) && coords[1].toFixed(5) == y.toFixed(5) && coords[2].toFixed(5) == z.toFixed(5)) {
                return true;
            }
            return false;
        });
        if (result == undefined) console.log('error'+[x,y,z]);
        return result;
    };
    Shape.prototype.pushState = function() { //save state (rotation and position)
        var rotation = {
            x: this.rotation.x,
            y: this.rotation.y,
            z: this.rotation.z
        };
        var scale = {
            x: this.scale.x,
            y: this.scale.y,
            z: this.scale.z
        }
        var center = {
            x: this.center.x,
            y: this.center.y,
            z: this.center.z
        }
        var pivot = {
            x: this.pivot.x,
            y: this.pivot.y,
            z: this.pivot.z
        }
        this.history.push({center: center, pivot: pivot, rotation: rotation, scale: scale});
    };
    Shape.prototype.travHist = function(dir) { //traverse the shape history.
        if (dir === 'undo') {
            if (!this.history[this.history.cur -1]) return false; //no history
            this.history.cur--; //go back in the history.
        }else if (dir === 'redo') {
            if (!this.history[this.history.cur +1]) return false; //no history
            this.history.cur++; //go forward in the history.
        }

        var old = this.history[this.history.cur]; //prev or next history object
        var center = this.pivot;
        var xDiff = old.center.x - this.center.x;
        var yDiff = old.center.y - this.center.y;
        var zDiff = old.center.z - this.center.z;
        var xRot = old.rotation.x - this.rotation.x;
        var yRot = old.rotation.y - this.rotation.y;
        var zRot = old.rotation.z - this.rotation.z;
        var xScale = !(old.scale.x === this.scale.x);
        var yScale = !(old.scale.y === this.scale.y);
        var zScale = !(old.scale.z === this.scale.z);
        var xPiv = old.pivot.x - this.pivot.x;
        var yPiv = old.pivot.y - this.pivot.y;
        var zPiv = old.pivot.z - this.pivot.z;
        
        //perform transformations
        if (xDiff)
            Shape.translate(this, 'x', xDiff);
        if (yDiff)
            Shape.translate(this, 'y', yDiff);
        if (zDiff)
            Shape.translate(this, 'z', zDiff);
        if (xPiv)
            this.transformUI.pivot.x.value = this.pivot.x = old.pivot.x;
        if (yPiv)
            this.transformUI.pivot.y.value = this.pivot.y = old.pivot.y;
        if (zPiv)
            this.transformUI.pivot.z.value = this.pivot.z = old.pivot.z;
        if (xRot)
            Shape.rotate(this, 'x', xRot, [old.pivot.x, old.pivot.y, old.pivot.z]);
        if (yRot)
            Shape.rotate(this, 'y', yRot, [old.pivot.x, old.pivot.y, old.pivot.z]);
        if (zRot)
            Shape.rotate(this, 'z', zRot, [old.pivot.x, old.pivot.y, old.pivot.z]);
        if (xScale)
            Shape.scale(this, 'x', old.scale.x, [old.pivot.x, old.pivot.y, old.pivot.z]);
        if (yScale)
            Shape.scale(this, 'y', old.scale.y, [old.pivot.x, old.pivot.y, old.pivot.z]);
        if (zScale)
            Shape.scale(this, 'z', old.scale.z, [old.pivot.x, old.pivot.y, old.pivot.z]);
        
        
        this.updateUI() //update the UI values
        draw(camera,canvas); //draw new frame
    };
    Shape.translate = function(shape, axis, dist) {
        shape.vertices.forEach(function(x,i,a) {
            a[i][axis] += dist; //move in global space.
        });
        shape.pivot[axis] += dist;
        shape.transformUI.pivot[axis].value = shape.pivot[axis];
        shape.center[axis] += dist;
        return shape;
    };
    Shape.rotate = function(shape, axis, deg, center, global) {
        //var shape = shape;
        //var center = center;
        if (!Array.isArray(center)) {
            var center = [shape.center.x,shape.center.y,shape.center.z];
        }
        if (!center)
            var center = shape.getCenter();
        var rad = Math.PI/180;
        //use rotation order where x is parented to y is parented to z. (z is the master axis)
        if (!global) {
            switch(axis) {
                case 'x' : //must undo z then y rotations before applying z rotation. then reapply y then z.
                    var yRot = shape.rotation.y;
                    var zRot = shape.rotation.z;
                    if (zRot !== 0)
                        Shape.rotate(shape, 'z', -zRot, center, true);
                    if (yRot !== 0)
                        Shape.rotate(shape, 'y', -yRot, center, true);
                    
                    Shape.rotate(shape, 'x', deg, center, true);
                    
                    if (yRot !== 0)
                        Shape.rotate(shape, 'y', yRot, center, true);
                    if (zRot !== 0)
                        Shape.rotate(shape, 'z', zRot, center, true);
                    return shape;
                case 'y' :
                    var zRot = shape.rotation.z;
                    if (zRot !== 0)
                        Shape.rotate(shape, 'z', -zRot, center, true);
                    Shape.rotate(shape, 'y', deg, center, true);
                    if (zRot !== 0)
                        Shape.rotate(shape, 'z', zRot, center, true);
                    return shape;
            }
        }
        
        for (var i=0; i<shape.vertices.length; i++) {
            var point = shape.vertices[i].getCoords();
            var xDiff,yDiff,zDiff,xAngle,yAngle,zAngle;
            xDiff = point[0] - center[0];
            yDiff = point[1] - center[1];
            zDiff = point[2] - center[2];
            
            var x,y,z;
            x=y=z=0;
            //determine how much the coordinates are changed by the rotation
            
            switch(axis) {
                case 'x' :
                    xAngle = Math.atan(yDiff/zDiff) || 0; //if there is no zDiff, we assign 0. Otherwise, we would get NaN.
                    var xHyp = yDiff/Math.sin(xAngle);
                    if (xAngle != 0) {
                        y += Math.sin(deg*rad+xAngle)*xHyp - yDiff;
                        z += Math.cos(deg*rad+xAngle)*xHyp - zDiff;
                    }else{ // if the angle is 0, we would end up dividing by 0 getting NaN. need a special case.
                        if (zDiff != 0) { //use whichever hypotenuse length that is not 0.
                            y += Math.sin(deg*rad)* zDiff - yDiff;
                            z += Math.cos(deg*rad)* zDiff - zDiff;
                        }else{
                            y += Math.cos(deg*rad)* yDiff - yDiff;
                            z += Math.sin(deg*rad)* yDiff - zDiff;
                        }
                    }
                    break;
                case 'y' :
                    yAngle = Math.atan(zDiff/xDiff) || 0;
                    if (yAngle != 0) {
                        var yHyp = zDiff/Math.sin(yAngle);
                        x += Math.cos(deg*rad+yAngle)*yHyp - xDiff;
                        z += Math.sin(deg*rad+yAngle)*yHyp - zDiff;
                    }else{
                        if (zDiff != 0) { 
                            x += Math.sin(deg*rad) * zDiff - xDiff;
                            z += Math.cos(deg*rad) * zDiff - zDiff;
                        }else{
                            x += Math.cos(deg*rad) * xDiff - xDiff;
                            z += Math.sin(deg*rad) * xDiff - zDiff;
                        }
                    }
                    break;
                case 'z' :
                    zAngle = Math.atan(yDiff/xDiff) || 0;
                    var zHyp = yDiff/Math.sin(zAngle);
                    if (zAngle != 0) {
                        x += Math.sin((deg+90)*rad+zAngle)*zHyp - xDiff;
                        y -= Math.cos((deg+90)*rad+zAngle)*zHyp + yDiff;
                    }else{
                        if (xDiff != 0) {
                            x += Math.cos((deg)*rad)* xDiff - xDiff;
                            y += Math.sin((deg)*rad)* xDiff - yDiff;
                        }else{
                            x += Math.sin((deg)*rad)* yDiff - xDiff;
                            y += Math.cos((deg)*rad)* yDiff - yDiff;
                        }
                    }
            }
            shape.vertices[i].x += x;
            shape.vertices[i].y += y;
            shape.vertices[i].z += z;
        }       
        
        shape.rotation[axis] += deg;
        return shape;
    };
    Shape.scale = function (shape, axis, factor, center) {
        if (factor == 0) return;
        if (!Array.isArray(center)) {
            var center = [shape.center.x,shape.center.y,shape.center.z];
        }
        var verts = shape.vertices;
        var a, f;
        switch (axis) {
            case 'x' :
                a = 0;
                f = factor / shape.scale.x;
                break;
            case 'y' :
                a = 1;
                f = factor / shape.scale.y;
                break;
            case 'z' :
                a = 2;
                f = factor / shape.scale.z;
        }
        
        for (var i=0; i<verts.length; i++) {
            var coord = verts[i].getCoords()[a];
            var diff = coord - center[a];
            diff = (diff*f) - diff; //get the distance to be moved.
            verts[i][axis] += diff;
        }
        shape.scale[axis] = factor;
        return shape;
    };
    Shape.createPrimitive = function(type, name) { //create a primative of 'type'
        var shape = new Shape(name||type);
        
        switch (type) {
            case 'cube':
                var i = 2;
                var xC = arguments[i++] || 0;
                var yC = arguments[i++] || 0;
                var zC = arguments[i++] || 0;
                var rotX = arguments[i++] || 0;
                var rotY = arguments[i++] || 0;
                var rotZ = arguments[i++] || 0;
                var width = arguments[i++] || 10;
                var height = arguments[i++] || 10;
                var depth = arguments[i++] || 10;
                var subX = arguments[i++] || 0;
                var subY = arguments[i++] || 0;
                var subZ = arguments[i++] || 0;
                var verts = [];
                
                var x, y, z, v, offset;
                
                //create left face.
                x = -width/2;
                for (var z=-depth/2; parseFloat(z.toFixed(5))<=parseFloat((depth/2).toFixed(5)); z+=depth/(subZ+1)) {
                    for (var y=-height/2; parseFloat(y.toFixed(5))<=parseFloat((height/2).toFixed(5)); y+=height/(subY+1)) {
                        v = new Vertex(x,y,z, shape);
                        if (y > (-height/2)) {
                            v.connectTo(shape.vertices[shape.vertices.length-2]);
                        }
                        if (z > -depth/2) {
                            v.connectTo(shape.vertices[shape.vertices.length-1 - (subY+2)]);
                        }
                    }
                }
                //create main body.
                for (var x=-width/2+width/(subX+1); x<width/2; x+=width/(subX+1)) {
                    for (var y=-height/2; parseFloat(y.toFixed(5))<=parseFloat((height/2).toFixed(5)); y+=height/(subY+1)) {
                        v = new Vertex(x,y,-depth/2, shape);
                        v.connectTo(shape.getVertAtCoord(x-width/(subX+1),y,-depth/2));
                        if (parseFloat(y.toFixed(5)) !== parseFloat((-height/2).toFixed(5)))
                            v.connectTo(shape.getVertAtCoord(x,y-height/(subY+1),-depth/2));
                        
                        if (parseFloat(y.toFixed(5)) === parseFloat((-height/2).toFixed(5)) || parseFloat(y.toFixed(5)) === parseFloat((height/2).toFixed(5))) {
                            for (var z=-depth/2+depth/(subZ+1); z<depth/2; z+=depth/(subZ+1)) {
                                v = new Vertex(x,y,z, shape);
                                v.connectTo(shape.getVertAtCoord(x-width/(subX+1),y,z));
                                v.connectTo(shape.vertices[shape.vertices.length-2]);
                            }
                        }
                        v = new Vertex(x,y,depth/2, shape);
                        v.connectTo(shape.getVertAtCoord(x-width/(subX+1),y,depth/2));
                        if (parseFloat(y.toFixed(5)) !== parseFloat((-height/2).toFixed(5)))
                            v.connectTo(shape.getVertAtCoord(x,y-height/(subY+1),depth/2));
                        if (parseFloat(y.toFixed(5)) === parseFloat((-height/2).toFixed(5)) || parseFloat(y.toFixed(5)) === parseFloat((height/2).toFixed(5)))
                            v.connectTo(shape.getVertAtCoord(x,y,depth/2-depth/(subZ+1)));
                    }
                }
                //create the right side.
                x = width/2;
                for (var z=-depth/2; parseFloat(z.toFixed(5))<=parseFloat((depth/2).toFixed(5)); z+=depth/(subZ+1)) {
                    for (var y=-height/2; parseFloat(y.toFixed(5))<=parseFloat((height/2).toFixed(5)); y+=height/(subY+1)) {
                        v = new Vertex(x,y,z, shape);
                        if (y > (-height/2)) {
                            v.connectTo(shape.vertices[shape.vertices.length-2]);
                        }
                        if (z > -depth/2) {
                            v.connectTo(shape.vertices[shape.vertices.length-1 - (subY+2)]);
                        }
                        if (parseFloat(y.toFixed(5)) === parseFloat((-height/2).toFixed(5)) || parseFloat(y.toFixed(5)) === parseFloat((height/2).toFixed(5)) || parseFloat(z.toFixed(5)) === parseFloat((-depth/2).toFixed(5)) || parseFloat(z.toFixed(5)) === parseFloat((depth/2).toFixed(5)))
                            v.connectTo(shape.getVertAtCoord(x-width/(subX+1),y,z));
                    }
                }
                
                break;
                
            case 'cone':
                var i = 2;
                var xC = arguments[i++] || 0;
                var yC = arguments[i++] || 0;
                var zC = arguments[i++] || 0;
                var rotX = arguments[i++] || 0;
                var rotY = arguments[i++] || 0;
                var rotZ = arguments[i++] || 0;
                var radius = arguments[i++] || 5;
                var height = arguments[i++] || 5;
                var faces = arguments[i++] || 10;
                var sub = arguments[i++] || 0;
                
                var pin = new Vertex(0,height/2,0,shape); //the pinacle
                var angle = 2*Math.PI/faces;
                
                for(var s=1; s<=sub+1; s++) {
                    for(var i=0; i<faces; i++) { //create the base
                        var x,z;
                        x = Math.sin(angle*i)*(1/(sub+1)*(s)*radius);
                        z = Math.cos(angle*i)*(1/(sub+1)*(s)*radius);
                        var base = new Vertex(x,(height/(sub+1)*(sub+1-s)-height/2),z,shape); //add vertex
                        if (s === 1) {
                            base.connectTo(pin);
                        }
                        if (sub && (s>1)) {
                            //base.connectTo(shape.vertices[i+(faces*(s-1)>0?(s-1):0)-1]);
                            base.connectTo(shape.vertices[shape.vertices.length-faces-1]);
                            //base.connectTo(shape.vertices[shape.vertices.length-faces-1]);
                        }
                        if (i>0) {
                            base.connectTo(shape.vertices[i+(faces*(s-1))]);
                        }
                    }
                    base.connectTo(shape.vertices[shape.vertices.length-faces]);
                }
                
                break;
                
            case 'cylinder':
                var i = 2;
                var xC = arguments[i++] || 0;
                var yC = arguments[i++] || 0;
                var zC = arguments[i++] || 0;
                var rotX = arguments[i++] || 0;
                var rotY = arguments[i++] || 0;
                var rotZ = arguments[i++] || 0;
                var radius = arguments[i++] || 5;
                var height = arguments[i++] || 5;
                var faces = arguments[i++] || 10;
                var sub = arguments[i++] || 0;
                
                var angle = 2*Math.PI/faces;
                
                for(var s=1; s<=sub+2; s++) {
                    for(var i=0; i<faces; i++) {
                        var x,z;
                        x = Math.sin(angle*i)*radius;
                        z = Math.cos(angle*i)*radius;
                        var base = new Vertex(x,(height/(sub+1)*(sub+2-s)-height/2),z,shape); //add vertex
                        if (s>1) {
                            base.connectTo(shape.vertices[shape.vertices.length-faces-1]);
                        }
                        if (i>0) {
                            base.connectTo(shape.vertices[i-1+(s-1)*faces]);
                        }
                    }
                    base.connectTo(shape.vertices[shape.vertices.length-faces]);
                }
                
                break;
                
            case 'sphere':
                var i = 2;
                var xC = arguments[i++] || 0;
                var yC = arguments[i++] || 0;
                var zC = arguments[i++] || 0;
                var rotX = arguments[i++] || 0;
                var rotY = arguments[i++] || 0;
                var rotZ = arguments[i++] || 0;
                var radius = arguments[i++] || 5;
                var faces = arguments[i++] || 10;
                var sub = arguments[i++] || 10;
                
                var top = new Vertex(0,radius,0, shape);
                var bottom = new Vertex(0,-radius,0, shape);
                var angle = 2*Math.PI/faces;
                var a = Math.PI/(sub+1); //the angle for each sub level.
                var x,y,z,r,v
                for(var s=1; s<sub+1; s++) {
                    y = Math.cos(a*s)*radius; //get the y value for each layer
                    r = Math.sin(a*s)*radius; //get the radius for each layer
                    for (var i=0; i<faces; i++) {
                        x = Math.sin(angle*i)*r;
                        z = Math.cos(angle*i)*r;
                        v = new Vertex(x,y,z, shape);
                        if (s>1) {
                            v.connectTo(shape.vertices[shape.vertices.length-faces-1]);
                        }
                        if (i>0) {
                            v.connectTo(shape.vertices[i+1+(s-1)*faces]);
                        }
                        if (s === 1) {
                            v.connectTo(top);
                        }
                        if (s === sub) {
                            v.connectTo(bottom);
                        }
                    }
                    v.connectTo(shape.vertices[shape.vertices.length-faces]);
                }
                
                break;
            case 'plane':
                var i = 2;
                var xC = arguments[i++] || 0;
                var yC = arguments[i++] || 0;
                var zC = arguments[i++] || 0;
                var rotX = arguments[i++] || 0;
                var rotY = arguments[i++] || 0;
                var rotZ = arguments[i++] || 0;
                var width = arguments[i++] || 10;
                var depth = arguments[i++] || 10;
                var subX = arguments[i++] || 0;
                var subZ = arguments[i++] || 0;
                
                var segX = width/(subX+1); //length of X segments
                var segZ = depth/(subZ+1);
                var x,z,v;
                for (var i=0; i<=subX+1; i++) {
                    x = -width/2 + i*segX;
                    for (var t=0; t<=subZ+1; t++) {
                        z = -depth/2 + t*segZ;
                        v = new Vertex(x,0,z, shape);
                        if (t>0) {
                            v.connectTo(shape.vertices[t-1+(subZ+2)*i]);
                        }
                        if (i>0) {
                            v.connectTo(shape.vertices[t+(subZ+2)*(i-1)]);
                        }
                    }
                }
        }
        //translate
        if (xC)
            Shape.translate(shape, 'x', xC);
        if (yC)
            Shape.translate(shape, 'y', yC);
        if (zC)
            Shape.translate(shape, 'z', zC);
        //perform rotations
        if (rotX)
            Shape.rotate(shape, 'x', rotX, [xC,yC,zC]);
        if (rotY)
            Shape.rotate(shape, 'y', rotY, [xC,yC,zC]);
        if (rotZ)
            Shape.rotate(shape, 'z', rotZ, [xC,yC,zC]);
        
        //shape.updateUI(); //apply any transforms to the UI input values.
        return shape;
    };
    Shape.shapes = []; //array of all shapes.
    Shape.selected = null; //holds the currently selected shape.
    //Define Vertex class
    function Vertex(x,y,z,shape) { //'shape' (optional) can be a Shape object or a shape's name string.
        this.x = x;
        this.y = y;
        this.z = z;
        this.shape;
        this.dist;
        this.visCoords = [];
        if (shape) {
            if (typeof shape === 'string') {
                this.shape = Shape.shapes.filter(function(x){return x.name === shape;})[0];
            }else
                this.shape = shape;
            shape.addVert(this);
        }
        this.connectedTo = [];
    }
    Vertex.prototype.getCoords = function() {
        return [this.x,this.y,this.z];
    };
    Vertex.prototype.connectTo = function(vert) {
        if (this.shape === vert.shape && this.connectedTo.indexOf(vert) === -1) {
            this.connectedTo.push(vert);
            vert.connectedTo.push(this);
        }
        return this;
    };
    Vertex.prototype.disconnectFrom = function(vert) {
        var pos = this.connectedTo.indexOf(vert);
        var pos2 = vert.connectedTo.indexOf(this);
        if (pos !== -1) {
            this.connectedTo.splice(pos,1);
            vert.connectedTo.splice(pos2,1);
        }
        return this;
    };
    Vertex.prototype.delete = function() {
        var shape = this.shape;
        shape.removeVert(this);
        
        for (var i=0; i<this.connectedTo.length; i++) {
            this.connectedTo[i].disconnectFrom(this);
        }
        delete this;
    };
    Vertex.prototype.setVisualCoords = function(vect, cam, camObj) { //vector coords, cam coords, camera object
        var yRot = camObj.yRot;
        var xRot = camObj.xRot;
        var bounds = camObj.visBounds;
        //var vect = camera.getVector();
        var vX = vect[0];
        var vY = vect[1];
        var vZ = vect[2];
        
        var vert = this.getCoords();
        var x = vert[0];
        var y = vert[1];
        var z = vert[2];
        
        //var cam = camera.getCoords();
        var cX = cam[0];
        var cY = cam[1];
        var cZ = cam[2];
        
        var xRem = Math.abs(xRot%360); //get base camera x rotation
        if (xRem > 90 && xRem < 270) { //if camera is upside down, we invert the Z and X coords of vector. b/c trig funcs used to find it only return positive.
            vZ = -vZ;
            vX = -vX;
        }
        
        //find the D constant of the scalar equation for the visual plane.
        var d = vX*(vX+camObj.x)+vY*(vY+camObj.y)+vZ*(vZ+camObj.z);
        
        //vX( x + (cX-x)t )+ vY( y + (cY-y)t  )+ vZ( z + (Cz-z)t  ) = d
        //substitute into plane equation and solve for t.
        //<x0,y0,z0>+t<x1-x0,y1-y0,z1-z0>
        //x0+tx1-tx0
        
        var tcX = (cX-x)*vX;
        var tcY = (cY-y)*vY;
        var tcZ = (cZ-z)*vZ;
        
        var tc = tcX + tcY + tcZ; //the coeffiecient of 't'
        var num = x*vX+y*vY+z*vZ;
        var t = (d - num)/tc;
        
        var coord = [x+t*(cX-x), y+t*(cY-y), z+t*(cZ-z)];
        
        if (dist(vert, cam) < dist(vert, coord)) { // vert is behind camera
            this.visCoords = null;
            return null;
        }
        
        //Now we need to transform these coords into 2d coords relative to 'center' of the visual plane (canvas).
        //1)bring the y coord of the intersect up or down to match the vector's Y.
        //2)Use a modified normal vector to project this point through the plane.
        //3)get coords of this mid-point intersection.
        //4)get distance from center point to mid point and first intersection to mid-point.
        var oX = coord[0];
        var oY = vY+camObj.y;
        var oZ = coord[2];
        
        if (xRem < 90 || xRem > 270) { //if camera is not upside down.
            var ySign = oY<coord[1]?1:-1; //get the sign of the Y coordinate.
        }else var ySign = oY<coord[1]?-1:1; //camera is upside down, flip Y coefficient.
        
        var xSign;
        
        if (dist(coord, camObj.LR.left) < dist(coord, camObj.LR.right))
            xSign = -1;
        else xSign = 1;
        //we need the line vector that reflects the Y rotation but not the X to find the midpoint- from which we can find the X and Y coords.
        // <oX,oY,oZ>+t<vX,0,vZ> -> the 'X-rotation only' normal vector.
        //find the point of intersection with the visual plane.
        tcX = vX*vX;
        tcY = vY*0; //vY;
        tcZ = vZ*vZ;
        tc = tcX + tcY + tcZ;
        num = oX*vX+oY*vY+oZ*vZ;
        t = (d-num)/tc;
        var midPoint = [oX+t*vX, oY, oZ+t*vZ];
        
        //get distance between center of plane and midPoint for X value. get distance btwn coord and midPoint for Y.
        var xCoord = dist([vX+camObj.x, vY+camObj.y, vZ+camObj.z], midPoint)*xSign;
        var yCoord = dist(coord, midPoint)*ySign;
        
        //scale to canvas coordinates
        var canX = xCoord/bounds[0]*(.5 * canvas.getAttribute('width'));
        var canY = yCoord/bounds[1]*(.5 * canvas.getAttribute('height'));
        //return the coordinates.
        this.visCoords = [canX, -canY]; //need to flip the Y coord for canvas.
    };
    
    /*to find the point of intersection btwn a line and a plane, we first get the cartesian equation of the plane.
    to do this, we need 3 points that are in the plane, points A(-3,4,1), B(0,2,5), and C(3,6,-2). We find two vectors AB and AC by subtracting
    the second point coords from the first. AB(3,-2,4) AC(6,2,-3). We then find the normal vector by cross multiplying
    these two vectors like this: Y1*Z2-Y2*Z1, Z1*X1-Z2*X1, X1*Y2-X2*Y1 = 6-8, 24+9, 6+12 = -2,33,18
    
    The normal vector is the coefficients of the scalar plane equation : X + Y + Z + D = 0. -2X+33Y+18Z+D=0
    To complete the equation, we solve for D by plugging in any of the three known points.
    -2*0+33*2+18*5+D=0
    D= -156
    -2x+33y+18z-156=0
    
    In the case of this program, we know the normal vector because its a plane that is perpendicular to and a set
    distance from the camera. So if the camera is at 0,0,0 and the projection plane is at 0,0,1 and camera rotation
    is all 0, the normal vector is <0,0,1> got by 0-0,0-0,1-0.
    
    Next we need a parametric representation for the line from the vertex to the camera origin.
    the formula is:
    F(t)=<X0,Y0,Z0>+t<X1-X0,Y1-Y0,Z1-Z0>
    X0,Y0,Z0 point can be the vertex and X1,Y1,Z1 can be the camera.
    so if the points were 1,3,2 and -4,3,0 we would have <1,3,2>+t<-5,0,-2>
    which simplifies to <1-5t,3,2-2t> these correspond to x,y,z values.
    we then substitute this into our plane equation and solve for t, then plug that value into the parametric equation.
    
    Finding the normal vector given camera origin(center of sphere) and distance to plane:
    to find Y, take sine of x-rotation * the hypotenuse.
    to find the inner hypenuse, sqrt of hypotenuse squared pluse Y squared
    to find X, take cos of y-rotation * the inner hypotenuse.
    to find Z, sine of y-rotation * the inner hypotenuse.
    */
    
    
    //define Camera class
    function Camera(X,Y,Z,x,y) {
        this.x = X || 0; //x coord
        this.y = Y || 0; //y coord
        this.z = Z || 0; //z coord
        this.xRot = x || 0; //look up and down in degrees. positive is up
        this.yRot = y || 0; //look left to right. positive is left
        //this.zRot = z || 0; //roll
        this.fov = 90;
        this.vectorLength = 1;
        this.LR = {left: null, right: null};
        this.visBounds = [];
        this.updateBounds();
    }
    Camera.prototype.distFrom = function(vert) { //calc linear distance to a vertex
        var xDiff = Math.abs(vert.x-this.x); 
        var yDiff = Math.abs(vert.y-this.y); 
        var zDiff = Math.abs(vert.z-this.z); 
        var side;
        if (xDiff === 0) side = zDiff;
        else if (zDiff === 0) side = xDiff;
        else
            side = Math.sqrt(Math.pow(xDiff,2)+Math.pow(zDiff,2));
        var distance = Math.sqrt(Math.pow(side,2)+Math.pow(yDiff,2));
        return distance;
    };
    Camera.prototype.getCoords = function() {
        return [this.x, this.y, this.z];
    };
    Camera.prototype.trans = function(axis, dist) {
        var rad = Math.PI/180;
        var xRot;
        var yRot;
        var x;
        var y;
        var z;
        var n;
        switch (axis) {
            case 'x' : //move left and right. Positive is right.
                xRot = 0; //x rotation is irrelevant.
                yRot = -this.yRot * rad;
                //y = Math.sin(xRot)*-dist;
                n = dist;
                x = Math.cos(yRot)*n;
                z = Math.sin(yRot)*n;

                y = 0; //theres no y component to this translation.
                break;
            case 'y' : //up and down. Positive is up.
                xRot = -(this.xRot+90) * rad;
                yRot = this.yRot * rad;
                y = Math.sin(xRot)*-dist;
                n = Math.cos(xRot)*-dist;
                z = Math.cos(yRot)*n;
                x = Math.sin(yRot)*n;
                break;
            case 'z' : //forward and back. Positive is forward.
                xRot = this.xRot * rad;
                yRot = -(this.yRot-90) * rad;
                y = Math.sin(xRot)*dist;
                n = Math.cos(xRot)*-dist;
                x = Math.cos(yRot)*n;
                z = Math.sin(yRot)*n;
        }
        this.x += x;
        this.y += y;
        this.z += z;
    };
    Camera.prototype.setRot = function(axis, deg) {
        if (axis === 'y') {
            this.yRot += deg;
            if (this.yRot > 180) {
                this.yRot -= 360;
            }else if (this.yRot < -180) {
                this.yRot += 360;
            }
        }else{
            this.xRot += deg;
            if (this.xRot > 180) {
                this.xRot -= 360;
            }else if (this.xRot < -180) {
                this.xRot += 360;
            }
        }
    };
    Camera.prototype.getRot = function() {
        return [this.xRot, this.yRot, this.zRot];
    };
    Camera.prototype.getVector = function() {
        var h = this.vectorLength;
        var y = Math.sin(-this.xRot*(Math.PI/180))*h;
        var n = Math.sqrt(h*h-y*y);
        var x = Math.sin(this.yRot*(Math.PI/180))*n;
        var z = Math.cos(this.yRot*(Math.PI/180))*n;
        var vector = [0-x, 0-y, 0-z];
        return vector;
    };
    Camera.prototype.updateBounds = function() { //updates the property that holds the size boundaries of the visual plane.
        var fov = this.fov;
        var len = this.vectorLength;
        
        var width = Math.tan(.5*fov*Math.PI/180)*len;
        var canWidth = canvas.getAttribute('width');
        var canHeight = canvas.getAttribute('height');
        var height = width*(canHeight/canWidth); //use the canvas size to get width to height ratio.
        //set the visBounds property
        this.visBounds = [width, height];
    };
    Camera.prototype.updateLR = function() {
        var yRot = this.yRot*(Math.PI/180);
        var x = Math.cos(yRot);
        var z = Math.sin(yRot)*-1;
        var right = [x+this.x,this.y,z+this.z];
        yRot += Math.PI;
        x = Math.cos(yRot);
        z = Math.sin(yRot)*-1;
        var left = [x+this.x,this.y,z+this.z];
        this.LR.left = left;
        this.LR.right = right;
    };
    
    //utility function for getting distance between two points.
    function dist(a,b) {
        var xDiff = a[0]-b[0]; 
        var yDiff = a[1]-b[1]; 
        var zDiff = a[2]-b[2]; 
        var side;
        if (xDiff === 0) side = zDiff;
        else if (zDiff === 0) side = xDiff;
        else
            side = Math.sqrt(Math.pow(xDiff,2)+Math.pow(zDiff,2));
        var distance = Math.sqrt(Math.pow(side,2)+Math.pow(yDiff,2));
        return distance;
    }
    function draw(camera, canvas) {
        canvas.setAttribute('width', canvas.getAttribute('width')); //clear the canvas
        var ctx = canvas.getContext('2d');
        ctx.translate(canvas.getAttribute('width')/2,canvas.getAttribute('height')/2);
        ctx.fillStyle = '#AEFF00';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        var vect = camera.getVector();
        var camCoords = camera.getCoords();
        camera.updateLR();
        var verts = [];
        for (var i = 0; i<Shape.shapes.length; i++) {
            Shape.shapes[i].vertices.forEach(function(x,i,a){
                //a[i].dist = camera.distFrom(a[i]);
                a[i].setVisualCoords(vect, camCoords, camera);
                if (a[i].visCoords !== null) //skip verts that are behind the camera
                    verts.push(a[i]);
            });
        }
        ctx.beginPath();
        //verts.sort(function(a,b){return b.dist-a.dist;}); //sort by distance from camera.
        verts.forEach(drawVert);
        ctx.stroke();
        function drawVert(vert) {
            if (vert === null) return;
            var index = verts.indexOf(vert);
            
            if (index === -1) return;
            
            var coords = vert.visCoords;
            //if (coords === null) return; //skip if vert is behind the camera.
            
            ctx.fillRect(coords[0]-1,coords[1]-1,3,3);
            
            for(var t =0; t<vert.connectedTo.length; t++) {
                if (verts.indexOf(vert.connectedTo[t]) === -1) continue;
                
                ctx.moveTo(coords[0],coords[1]);
                var to = vert.connectedTo[t].visCoords;
                if (to === null) return;
                ctx.lineTo(to[0],to[1]);
                //ctx.closePath();
            }
            verts[index] = null;
            
        }
    }
    function Stack(len) { //a simple stack class. extends array class
        this.constructor = Stack;
        Object.defineProperty(this, 'limit', { //non enumerable length limit
            writable: false, enumerable: false, value: len, configurable: true
        });
        Object.defineProperty(this, 'cur', {
            writable: true, enumerable: false, value: 0, configurable: true
        });
    }
    Stack.prototype = Object.create(Array.prototype);
    Stack.prototype.push = function(ele) { //modify the array.push method.
        if (this.cur < this.length -1) {
            this.splice(this.cur+1, this.length, ele); //if cursor is not at end of array, delete elements infront of cursor then add the new one.
            this.cur++;
        }else{
            Array.prototype.push.call(this,ele);
            this.cur = this.length-1;
        }
        if (this.length > this.limit) { //maintain stack size;
            this.shift();
        }
    }
    
    var camMove = (function() { //defines the keymap actions and returns the keydown and keyup handlers.
        var map = {
            38: false, //up arrow - move forward
            40: false, //down arrow - move back
            37: false, //left arrow - move left
            39: false, //right arrow - move right
            81: false, //Q - move up
            69: false, //E - move down
            87: false, //W - look up
            65: false, //A - look left
            83: false, //S - look down
            68: false //D - look right
        }
        var acting = false;
        var tStep = .25;
        var rStep = .5;
        var shapeTrans = false;
        
        function action() {
            if (acting) {
                applyTransforms();
                draw(camera, canvas);
                window.requestAnimationFrame(action);
            }
        }
        
        function applyTransforms() {
            if (!shapeTrans) {
                if (map[38]) {
                    camera.trans('z', tStep);
                }
                if (map[40]) {
                    camera.trans('z', -tStep);
                }
                if (map[37]) {
                    camera.trans('x', -tStep);
                }
                if (map[39]) {
                    camera.trans('x', tStep);
                }
                if (map[81]) {
                    camera.trans('y', tStep);
                }
                if (map[69]) {
                    camera.trans('y', -tStep);
                }
                if (map[87]) {
                    camera.setRot('x',rStep);
                }
                if (map[65]) {
                    camera.setRot('y',rStep);
                }
                if (map[83]) {
                    camera.setRot('x',-rStep);
                }
                if (map[68]) {
                    camera.setRot('y',-rStep);
                }
            }else{
                if (map[38]) {
                    Shape.translate(Shape.selected, 'z', tStep);
                }
                if (map[40]) {
                    Shape.translate(Shape.selected, 'z', -tStep);
                }
                if (map[37]) {
                    Shape.translate(Shape.selected, 'x', -tStep);
                }
                if (map[39]) {
                    Shape.translate(Shape.selected, 'x', tStep);
                }
                if (map[81]) {
                    Shape.translate(Shape.selected, 'y', tStep);
                }
                if (map[69]) {
                    Shape.translate(Shape.selected, 'y', -tStep);
                }
                if (map[87]) {
                    Shape.rotate(Shape.selected, 'x', rStep, [Shape.selected.pivot.x,Shape.selected.pivot.y,Shape.selected.pivot.z]);
                }
                if (map[65]) {
                    Shape.rotate(Shape.selected, 'y', rStep, [Shape.selected.pivot.x,Shape.selected.pivot.y,Shape.selected.pivot.z]);
                }
                if (map[83]) {
                    Shape.rotate(Shape.selected, 'x', -rStep, [Shape.selected.pivot.x,Shape.selected.pivot.y,Shape.selected.pivot.z]);
                }
                if (map[68]) {
                    Shape.rotate(Shape.selected, 'y', -rStep, [Shape.selected.pivot.x,Shape.selected.pivot.y,Shape.selected.pivot.z]);
                }
                Shape.selected.updateUI();
            }
        }
        
        function getPressed() { //return true if any of the keys are pressed
            for (var i in map) {
                if (!map.hasOwnProperty(i))
                    continue;
                if (map[i])
                    return true;
            }
            return false;
        }
        return [function(e) {
            if (map.hasOwnProperty(e.keyCode)) {
                e.preventDefault();
                map[e.keyCode] = true;
                if (acting) return;
                acting = true;
                if (e.shiftKey) {
                    if (Shape.selected)
                        shapeTrans = true;
                }
                else shapeTrans = false;
                action();
            }
        }, function(e) {
            if (map.hasOwnProperty(e.keyCode)) {
                e.preventDefault();
                map[e.keyCode] = false;
                var pressed = getPressed();
                if (getPressed() === false)
                    acting = false;
            }
        }];
    })();
    document.addEventListener('keydown', camMove[0]);
    document.addEventListener('keyup', camMove[1]);
    
    //get the canvas
    var canvas = document.getElementById('canvas');
    
    //instantiate the camera.
    var camera = new Camera(0,0,0,0,0);
    //get fov input
    var fovInput = document.getElementById('fov');
    fovInput.value = camera.fov;
    fovInput.addEventListener('change', changeFov);
    function changeFov() {
        camera.fov = fovInput.value;
        camera.updateBounds();
        draw(camera, canvas);
    }
    //primitive creation form
    var primSel = document.getElementById('createPrimSel');
    var primSub = document.getElementById('createPrimButton');
    var primHid = document.getElementById('createPrimHid'); //contains the options set by the parameters popup
    primSub.onclick = function() {
        var win = window.open('dialog.html', 'Parameters', 'width=400,height=350,status=no');
        win.onunload = function() {
            if (primHid.value != '') {
                var array = JSON.parse(primHid.value); //get the parameters
                var shape = Shape.createPrimitive.apply(this,array); //create the primitive
                shape.pushState();
                shape.updateUI();
                primHid.value = ''; //reset the hidden input
                draw(camera, canvas); //draw frame
            }
        }
    }
    //shape UI
    var shapesDiv = document.getElementById('shapesDiv');
    
    draw(camera, canvas); //draw initial frame.
}