window.onload = function() {
    //Define Shape class. Shapes are a group of vertices
    function Shape(name) {
        this.setName(name);
        this.vertices = [];
        Shape.shapes.push(this);
    }
    Shape.prototype.addVert = function(vert) {
        if (vert.shape) {
            this.vertices.push(vert);
            vert.shape = this;
        }
    }
    Shape.prototype.removeVert = function(vert) {
        var pos = this.vertices.indexOf(vert);
        if (pos !== -1) {
            this.vertices.splice(pos,1);
            vert.shape = undefined;
        }
    }
    Shape.prototype.setName = function(name) {
        //check for duplicate name and add/change numeric suffix. Shape names should always be unique.
        var dupe;
        if (dupe = Shape.shapes.filter(function(x){return x.name === name;})[0]) {
            var pos
            if (pos = dupe.name.search(/\d+$/)) {
                this.setName(name.slice(0,pos) + (parseInt(name.slice(pos))+1));
            }else{
                this.setName(name + '2');
            }
        }else
            this.name = name;
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
    }
    Shape.rotate = function(shape, axis, deg, center) {
        if (!center)
            center = shape.getCenter();
        var rad = Math.PI/180;
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
                    if (xAngle != 0) {
                        y += Math.sin(deg*rad+xAngle)*(yDiff/Math.sin(xAngle)) - yDiff;
                        z += Math.cos(deg*rad+xAngle)*(yDiff/Math.sin(xAngle)) - zDiff;
                    }else{ // if the angle is 0, we would end up dividing by 0 getting NaN. need a special case.
                        y += Math.sin(deg*rad)* zDiff - yDiff;
                        z += Math.cos(deg*rad)* zDiff - zDiff;
                    }
                    break;
                case 'y' :
                    yAngle = Math.atan(zDiff/xDiff) || 0;
                    if (yAngle != 0) {
                        x += Math.cos(deg*rad+yAngle)*(zDiff/Math.sin(yAngle)) - xDiff;
                        z += Math.sin(deg*rad+yAngle)*(zDiff/Math.sin(yAngle)) - zDiff;
                    }else{
                        x += Math.sin(deg*rad) * zDiff - xDiff;
                        z += Math.cos(deg*rad) * zDiff - zDiff;
                    }
                    
                    break;
                case 'z' :
                    zAngle = Math.atan(yDiff/xDiff) || 0;
                    if (zAngle != 0) {
                        x += Math.sin((deg+90)*rad+zAngle)*(yDiff/Math.sin(zAngle)) - xDiff;
                        y -= Math.cos((deg+90)*rad+zAngle)*(yDiff/Math.sin(zAngle)) + yDiff;
                    }else{
                        x += Math.cos((deg)*rad)* xDiff - xDiff;
                        y += Math.sin((deg)*rad)* xDiff - yDiff;
                    }
            }
            shape.vertices[i].x += x;
            shape.vertices[i].y += y;
            shape.vertices[i].z += z;
        }
        return shape;
    }
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
                
                var x, y, z, offset;
                //find the 8 vertices.
                for (var w =1; w>-2; w-=2)
                    for (var h=1; h>-2; h-=2)
                        for (var d=1; d>-2; d-=2) {
                            x = width/2*w + xC;
                            y = height/2*h + yC;
                            z = depth/2*d + zC;
                            new Vertex(x,y,z,shape);
                        }
                
                //perform rotations
                if (rotZ)
                    Shape.rotate(shape, 'z', rotZ, [xC,yC,zC]);
                if (rotX)
                    Shape.rotate(shape, 'x', rotX, [xC,yC,zC]);
                if (rotY)
                    Shape.rotate(shape, 'y', rotY, [xC,yC,zC]);
                
                //make the connections
                verts = shape.vertices;
                verts[0].connectTo(verts[1].connectTo(
                    verts[3].connectTo(verts[2].connectTo(
                        verts[0]).connectTo(verts[6].connectTo(verts[4]))).connectTo(
                        verts[7].connectTo(verts[6]))).connectTo(verts[5].connectTo(verts[7]))).connectTo(
                    verts[4].connectTo(verts[5])
                );
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
                
                var pin = new Vertex(xC,yC+height/2,zC,shape); //the pinacle
                var angle = 2*Math.PI/faces;
                
                for(var s=1; s<=sub+1; s++) {
                    for(var i=0; i<faces; i++) { //create the base
                        var x,z;
                        x = Math.sin(angle*i)*(1/(sub+1)*(s)*radius) + xC;
                        z = Math.cos(angle*i)*(1/(sub+1)*(s)*radius) + zC;
                        var base = new Vertex(x,(yC + height/(sub+1)*(sub+1-s)-height/2),z,shape); //add vertex
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
                
                //perform rotations
                if (rotX)
                    Shape.rotate(shape,'x',rotX,[xC,yC,zC]);
                if (rotY)
                    Shape.rotate(shape,'y',rotY,[xC,yC,zC]);
                if (rotZ)
                    Shape.rotate(shape,'z',rotZ,[xC,yC,zC]);
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
                        x = Math.sin(angle*i)*radius + xC;
                        z = Math.cos(angle*i)*radius + zC;
                        var base = new Vertex(x,(yC + height/(sub+1)*(sub+2-s)-height/2),z,shape); //add vertex
                        if (s>1) {
                            base.connectTo(shape.vertices[shape.vertices.length-faces-1]);
                        }
                        if (i>0) {
                            base.connectTo(shape.vertices[i-1+(s-1)*faces]);
                        }
                    }
                    base.connectTo(shape.vertices[shape.vertices.length-faces]);
                }
                //perform rotations
                if (rotX)
                    Shape.rotate(shape,'x',rotX,[xC,yC,zC]);
                if (rotY)
                    Shape.rotate(shape,'y',rotY,[xC,yC,zC]);
                if (rotZ)
                    Shape.rotate(shape,'z',rotZ,[xC,yC,zC]);
                
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
                
                var top = new Vertex(xC,radius+yC,zC, shape);
                var bottom = new Vertex(xC,-radius+yC,zC, shape);
                var angle = 2*Math.PI/faces;
                var a = Math.PI/(sub+1); //the angle for each sub level.
                var x,y,z,r,v
                for(var s=1; s<sub+1; s++) {
                    y = Math.cos(a*s)*radius + yC; //get the y value for each layer
                    r = Math.sin(a*s)*radius; //get the radius for each layer
                    for (var i=0; i<faces; i++) {
                        x = Math.sin(angle*i)*r + xC;
                        z = Math.cos(angle*i)*r + zC;
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
                //perform rotations
                if (rotX)
                    Shape.rotate(shape,'x',rotX,[xC,yC,zC]);
                if (rotY)
                    Shape.rotate(shape,'y',rotY,[xC,yC,zC]);
                if (rotZ)
                    Shape.rotate(shape,'z',rotZ,[xC,yC,zC]);
                
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
                        v = new Vertex(x+xC,yC,z+zC, shape);
                        if (t>0) {
                            v.connectTo(shape.vertices[t-1+(subZ+2)*i]);
                        }
                        if (i>0) {
                            v.connectTo(shape.vertices[t+(subZ+2)*(i-1)]);
                        }
                    }
                }
                //perform rotations
                if (rotX)
                    Shape.rotate(shape,'x',rotX,[xC,yC,zC]);
                if (rotY)
                    Shape.rotate(shape,'y',rotY,[xC,yC,zC]);
                if (rotZ)
                    Shape.rotate(shape,'z',rotZ,[xC,yC,zC]);
        }
        return shape;
    }
    Shape.shapes = []; //array of all shapes.
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
    }
    Vertex.prototype.connectTo = function(vert) {
        if (this.shape === vert.shape && this.connectedTo.indexOf(vert) === -1) {
            this.connectedTo.push(vert);
            vert.connectedTo.push(this);
        }
        return this;
    }
    Vertex.prototype.disconnectFrom = function(vert) {
        var pos = this.connectedTo.indexOf(vert);
        var pos2 = vert.connectedTo.indexOf(this);
        if (pos !== -1) {
            this.connectedTo.splice(pos,1);
            vert.connectedTo.splice(pos2,1);
        }
        return this;
    }
    Vertex.prototype.delete = function() {
        var shape = this.shape;
        shape.removeVert(this);
        
        for (var i=0; i<this.connectedTo.length; i++) {
            this.connectedTo[i].disconnectFrom(this);
        }
        delete this;
    }
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
        
        var ySign = oY<coord[1]?1:-1; //get the sign of the Y coordinate. Bugs out if camera is moving over and looking down at object.
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
    }
    
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
    }
    Camera.prototype.getCoords = function() {
        return [this.x, this.y, this.z];
    }
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
    }
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
    }
    Camera.prototype.getRot = function() {
        return [this.xRot, this.yRot, this.zRot];
    }
    Camera.prototype.getVector = function() {
        var h = this.vectorLength;
        var y = Math.sin(-this.xRot*(Math.PI/180))*h;
        var n = Math.sqrt(h*h-y*y);
        var x = Math.sin(this.yRot*(Math.PI/180))*n;
        var z = Math.cos(this.yRot*(Math.PI/180))*n;
        var vector = [0-x, 0-y, 0-z];
        return vector;
    }
    Camera.prototype.updateBounds = function() { //updates the property that holds the size boundaries of the visual plane.
        var fov = this.fov;
        var len = this.vectorLength;
        
        var width = Math.tan(.5*fov*Math.PI/180)*len;
        var canWidth = canvas.getAttribute('width');
        var canHeight = canvas.getAttribute('height');
        var height = width*(canHeight/canWidth); //use the canvas size to get width to height ratio.
        //set the visBounds property
        this.visBounds = [width, height];
    }
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
    }
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
        ctx.fillStyle = 'yellow';
        ctx.strokeStyle = '#FFFFFF';
        var vect = camera.getVector();
        var camCoords = camera.getCoords();
        camera.updateLR();
        var verts = [];
        for (var i = 0; i<Shape.shapes.length; i++) {
            Shape.shapes[i].vertices.forEach(function(x,i,a){
                a[i].dist = camera.distFrom(a[i]);
                a[i].setVisualCoords(vect, camCoords, camera);
                if (a[i].visCoords !== null) //skip verts that are behind the camera
                    verts.push(a[i]);
            });
        }
        
        verts.sort(function(a,b){return b.dist-a.dist;}); //sort by distance from camera.
        verts.forEach(drawVert);
            
        function drawVert(vert, line) {
            if (vert === null) return;
            var index = verts.indexOf(vert);
            
            if (index === -1) return;
            
            var coords = vert.visCoords;
            //if (coords === null) return; //skip if vert is behind the camera.
            
            ctx.fillRect(coords[0]-1,coords[1]-1,3,3);
            
            for(var t =0; t<vert.connectedTo.length; t++) {
                if (verts.indexOf(vert.connectedTo[t]) === -1) continue;
                ctx.beginPath();
                ctx.moveTo(coords[0],coords[1]);
                var to = vert.connectedTo[t].visCoords;
                if (to === null) return;
                ctx.lineTo(to[0],to[1]);
                ctx.closePath();
                ctx.stroke();
                verts[index] = null;
            }
        }
    }
    
    var camMove = (function() {
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
        
        function action() {
            if (acting) {
                applyTransforms();
                draw(camera, canvas);
                window.requestAnimationFrame(action);
            }
        }
        
        function applyTransforms() {
            if (map[38]) {
                //camera.z -= tStep;
                camera.trans('z', tStep);
            }
            if (map[40]) {
                //camera.z += tStep;
                camera.trans('z', -tStep);
            }
            if (map[37]) {
                //camera.x -= tStep;
                camera.trans('x', -tStep);
            }
            if (map[39]) {
                //camera.x += tStep;
                camera.trans('x', tStep);
            }
            if (map[81]) {
                //camera.y += tStep;
                camera.trans('y', tStep);
            }
            if (map[69]) {
                //camera.y -= tStep;
                camera.trans('y', -tStep);
            }
            if (map[87]) {
                //camera.xRot += rStep;
                camera.setRot('x',rStep);
            }
            if (map[65]) {
                //camera.yRot += rStep;
                camera.setRot('y',rStep);
            }
            if (map[83]) {
                //camera.xRot -= rStep;
                camera.setRot('x',-rStep);
            }
            if (map[68]) {
                //camera.yRot -= rStep;
                camera.setRot('y',-rStep);
            }
        }
        
        function getPressed() {
            //var pressed = [];
            for (var i in map) {
                if (!map.hasOwnProperty(i))
                    continue;
                if (map[i])
                    return true;//pressed.push(i);
            }
            return false;
        }
        return [function(e) {
            if (map.hasOwnProperty(e.keyCode)) {
                e.preventDefault();
                map[e.keyCode] = true;
                if (acting) return;
                acting = true;
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
                Shape.createPrimitive.apply(this,array); //create the primitive
                primHid.value = ''; //reset the hidden input
                draw(camera, canvas); //draw frame
            }
        }
    }

    draw(camera, canvas); //draw initial frame.
}