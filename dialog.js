window.onload = function() {
    console.log(window.opener.document.getElementById('createPrimSel'));
    var type = window.opener.document.getElementById('createPrimSel').value;
    var okButton = document.getElementById('okButton');
    okButton.innerHTML += type[0].toUpperCase() + type.slice(1);
    var optionsDiv = document.getElementById('optionsDiv');
    //define elements for all parameters
    var radius = document.createElement('input');
    radius.type = 'text';
    radius.value = 5;
    radius.id = 'radius';
    var radiusSpan = document.createElement('span');
    radiusSpan.innerHTML = 'Radius: ';
    radiusSpan.appendChild(radius);
    
    var width = document.createElement('input');
    width.type = 'text';
    width.value = 10;
    width.id = 'width';
    var widthSpan = document.createElement('span');
    widthSpan.innerHTML = 'Width: ';
    widthSpan.appendChild(width);
    
    var height = document.createElement('input');
    height.type = 'text';
    height.value = 10;
    height.id = 'height';
    var heightSpan = document.createElement('span');
    heightSpan.innerHTML = 'Height: ';
    heightSpan.appendChild(height);
    
    var depth = document.createElement('input');
    depth.type = 'text';
    depth.value = 10;
    depth.id = 'depth';
    var depthSpan = document.createElement('span');
    depthSpan.innerHTML = 'Depth: ';
    depthSpan.appendChild(depth);
    
    var x = document.createElement('input');
    x.type = 'text';
    x.value = 0;
    x.id = 'x';
    var y = document.createElement('input');
    y.type = 'text';
    y.value = 0;
    y.id = 'y';
    var z = document.createElement('input');
    z.type = 'text';
    z.value = 0;
    z.id = 'z';
    var centerSpan = document.createElement('span');
    centerSpan.innerHTML = 'Center Coordinates (x,y,z): ';
    centerSpan.appendChild(x);
    centerSpan.appendChild(y);
    centerSpan.appendChild(z);
    
    var rotX = document.createElement('input');
    rotX.type = 'text';
    rotX.value = 0;
    rotX.id = 'rotX';
    var rotY = document.createElement('input');
    rotY.type = 'text';
    rotY.value = 0;
    rotY.id = 'rotY';
    var rotZ = document.createElement('input');
    rotZ.type = 'text';
    rotZ.value = 0;
    rotZ.id = 'rotZ';
    var rotSpan = document.createElement('span');
    rotSpan.innerHTML = 'Rotation (x,y,z): ';
    rotSpan.appendChild(rotX);
    rotSpan.appendChild(rotY);
    rotSpan.appendChild(rotZ);
    
    var faces = document.createElement('input');
    faces.type = 'text';
    faces.value = 20;
    faces.id = 'faces';
    var facesSpan = document.createElement('span');
    facesSpan.innerHTML = 'Number of Radial Divisions: ';
    facesSpan.appendChild(faces);
    
    var subX = document.createElement('input');
    subX.type = 'text';
    subX.value = 0;
    subX.id = 'subX';
    var subXSpan = document.createElement('span');
    subXSpan.innerHTML = 'Number of Divisions Along X Axis: ';
    subXSpan.appendChild(subX);
    
    var subY = document.createElement('input');
    subY.type = 'text';
    subY.value = (type === 'sphere')?10:0;
    subY.id = 'subY';
    var subYSpan = document.createElement('span');
    subYSpan.innerHTML = 'Number of Divisions Along Y Axis: ';
    subYSpan.appendChild(subY);
    
    var subZ = document.createElement('input');
    subZ.type = 'text';
    subZ.value = 0;
    subZ.id = 'subZ';
    var subZSpan = document.createElement('span');
    subZSpan.innerHTML = 'Number of Divisions Along Z Axis: ';
    subZSpan.appendChild(subZ);
    //check list of params
    var param = {
        radius : radiusSpan,
        width : widthSpan,
        height : heightSpan,
        depth : depthSpan,
        faces : facesSpan,
        subX : subXSpan,
        subY : subYSpan,
        subZ : subZSpan
    };
    //will hold the returned object.
    var result = {
        x : null,
        y : null,
        z : null,
        rotX : null,
        rotY : null,
        rotZ : null
    };
    
    var p;
    switch (type) { //which params to display for each type.
        case 'cube' :
            p = ['width','height','depth','subX','subY','subZ'];
            break;
        case 'cone' :
            p = ['radius','height','faces','subY'];
            break;
        case 'cylinder' :
            p = ['radius','height','faces','subY'];
            break;
        case 'sphere' :
            p = ['radius','faces','subY'];
            break;
        case 'plane' :
            p = ['width','depth','subX','subZ'];
    }
    
    for (var i = 0; i<p.length; i++) {
        optionsDiv.appendChild(param[p[i]]); //append the span element which contains the input
        result[p[i]] = null; //add a prop to result
    }
    optionsDiv.appendChild(centerSpan); //all primitives
    result.x = result.y = result.z = null;
    optionsDiv.appendChild(rotSpan);
    result.rotX = result.rotY = result.rotZ = null;
    
    var args = [type,type];
    okButton.onclick = function() {
        for (var p in result) {
            if (!result.hasOwnProperty(p)) continue;
            result[p] = document.getElementById(p).value;
            args.push(parseFloat(result[p]));
        }
        window.opener.document.getElementById('createPrimHid').value = JSON.stringify(args);
        //window.opener.Shape.createPrimitive.apply(null, args);
        window.close();
    }
}