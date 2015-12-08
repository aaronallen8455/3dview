window.onload = function() {
    //Define Shape object. Shapes are a group of vertices
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
    Shape.shapes = []; //array of all shapes.
    //Define Vertex object
    function Vertex(x,y,z,shape) { //'shape' (optional) can be a Shape object or a shape's name string.
        this.x = x;
        this.y = y;
        this.z = z;
        this.shape;
        this.dist;
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
        if (this.shape === vert.shape && this.connectedTo.indexOf(vert) !== -1) {
            this.connectedTo.push(vert);
            vert.connectedTo.push(this);
        }
    }
    Vertex.prototype.disconnectFrom = function(vert) {
        var pos = this.connectedTo.indexOf(vert);
        var pos2 = vert.connectedTo.indexOf(this);
        if (pos !== -1) {
            this.connectedTo.splice(pos,1);
            vert.connectedTo.splice(pos2,1);
        }
    }
    Vertex.prototype.delete = function() {
        var shape = this.shape;
        shape.removeVert(this);
        
        for (var i=0; i<this.connectedTo.length; i++) {
            this.connectedTo[i].disconnectFrom(this);
        }
        delete this;
    }
    Vertex.prototype.getVisualCoords = function(vect, cam, camObj) { //vector coords, cam coords, camera Y rotation
        var yRot = camObj.yRot;
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
        //console.log(vect);
        //find the D constant of the scalar equation for the visual plane.
        var d = vX*(vX+camObj.x)+vY*(vY+camObj.y)+vZ*(vZ+camObj.z);
        //console.log(cZ+cZ)
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
        //console.log(coord);
        //need to transform into 2d coords relative to 'center' of plane.
        //1)bring the y coord of the intersect up or down to match the vector's Y.
        //2)determine set of conditions to determine which axis (x or z) the
        //line needs to be drawn to go back into the plane.
        //3)get coords of this second intersection.
        //4)get distance from vector to mid point and first intersection to mid-point.
        var oX = coord[0];
        var oY = vY+camObj.y;
        var oZ = coord[2];
        
        var ySign = oY<coord[1]?1:-1; //get the sign of the Y coordinate.
        var xSign;
        if (yRot >= -45 && yRot <= 45) { //determine the sign of the X coordinate.
            xSign = coord[0]>vect[0]+camObj.x?1:-1;
        }else if (yRot > 45 && yRot < 135) {
            xSign = coord[2]>vect[2]+camObj.z?1:-1;
        }else if ((yRot >= 135 && yRot <= 180)||(yRot <= -135 && yRot >= -180)) {
            xSign = coord[0]>vect[0]+camObj.x?-1:1;
        }else if (yRot < -45 && yRot > -135) {
            xSign = coord[2]>vect[2]+camObj.z?1:-1;
        }
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
        
        //return the coordinates.
        //return [dist(vect, midPoint)*xSign, dist(coord, midPoint)*ySign];
        var xCoord = dist([vX+camObj.x, vY+camObj.y, vZ+camObj.z], midPoint)*xSign;
        var yCoord = dist(coord, midPoint)*ySign;
        //console.log(xCoord+' '+yCoord);
        //scale to canvas coordinates
        var canX = xCoord/bounds[0]*(.5 * canvas.getAttribute('width'));
        var canY = yCoord/bounds[1]*(.5 * canvas.getAttribute('height'));
        
        return [canX, -canY]; //need to flip the Y coord for canvas.
    }
    
    /*to find the point of intersection btwn a line and a plane, we first get the cartesian equation of the plane.
    to do this, we need 3 points that are in the plane, points A(-3,4,1), B(0,2,5), and C(3,6,-2). We find two vectors AB and AC by subtracting
    the second point coords from the first. AB(3,-2,4) AC(6,2,-3). We then find the normal vector by cross multiplying
    these two vectors like this: Y1*Z2-Y2*Z1, Z1*X1-Z2*X1, X1*Y2-X2*Y1 = 6-8, 24+9, 6+12 = -2,33,18
    
    The normal vector is the coefficients of the scalar equation : X + Y + Z + D = 0. -2X+33Y+18Z+D=0
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
        this.x = X || 0;
        this.y = Y || 0;
        this.z = Z || 0;
        this.xRot = x || 0; //look up and down. positive is up
        this.yRot = y || 0; //look left to right. positive is left
        //this.zRot = z || 0; //roll
        this.fov = 120;
        this.vectorLength = 1;
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
        // h*h = y*y + n*n
        var n = Math.sqrt(h*h-y*y);
        var x = Math.sin(this.yRot*(Math.PI/180))*n;
        var z = Math.cos(this.yRot*(Math.PI/180))*n;
        //console.log(x+' '+y+' '+z);
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
    //utility function for getting distance between two points.
    function dist(a,b) {
        var xDiff = Math.abs(a[0]-b[0]); 
        var yDiff = Math.abs(a[1]-b[1]); 
        var zDiff = Math.abs(a[2]-b[2]); 
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
        ctx.fillStyle = '#FFFFFF';
        var vect = camera.getVector();
        var camCoords = camera.getCoords();
        var verts = [];
        for (var i = 0; i<Shape.shapes.length; i++) {
            Shape.shapes[i].vertices.forEach(function(x,i,a){
                a[i].dist = camera.distFrom(a[i]);
                verts.push(a[i]);
            });
            //Shape.shapes[i].vertices.sort(function(a,b){return a.dist-b.dist;});
        }
        verts.sort(function(a,b){return a.dist-b.dist;});
        for (var i= 0; i<verts.length; i++) {
            var coords = verts[i].getVisualCoords(vect, camCoords, camera);
            ctx.fillRect(coords[0]-1,coords[1]-1,3,3);
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
                camera.z -= tStep;
            }
            if (map[40]) {
                camera.z += tStep;
            }
            if (map[37]) {
                camera.x -= tStep;
            }
            if (map[39]) {
                camera.x += tStep;
            }
            if (map[81]) {
                camera.y += tStep;
            }
            if (map[69]) {
                camera.y -= tStep;
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
                map[e.keyCode] = true;
                if (acting) return;
                acting = true;
                action();
            }
            
        }, function(e) {
            if (map.hasOwnProperty(e.keyCode)) {
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
    //var ctx = canvas.getContext('2d');
    
    var camera = new Camera(0,0,0,0,0);
    var shape = new Shape('test');
    new Vertex(10,-10,-10,shape);
    //new Vertex(-10,-10,-10,shape);
    new Vertex(10,-10,-20,shape);
    //new Vertex(-10,-10,-20,shape);
    new Vertex(10,10,-10,shape);
    //new Vertex(-10,10,-10,shape);
    new Vertex(10,10,-20,shape);
    //new Vertex(0,0,-1,shape);
    //new Vertex(-10,10,-20,shape);
    //ctx.translate(canvas.getAttribute('width')/2,canvas.getAttribute('height')/2);
    draw(camera, canvas);
    //console.log(camera.distFrom(shape.vertices[0]));
}