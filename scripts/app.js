//import { mat4 } from "./gl-matrix";

let hasInit = false;

document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOMCONTENT");
    //InitDemo();

    let canvas = document.getElementById('application');
    // Resize canvas
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
});

document.addEventListener("mousedown", (event) => {
    if(!hasInit){
        InitDemo();
        document.getElementById('splash').style.display = 'none';
        hasInit = true;
    }
    //console.log("Mouse Down");
});

var vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec2 vertTexCoord;',
'varying vec2 fragTexCoord;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'   fragTexCoord = vertTexCoord;',
'   gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}',
].join('\n');

var fragmentShaderText = 
[
'precision mediump float;',
'',
'varying vec2 fragTexCoord;',
'uniform sampler2D sampler;',
'',
'void main()',
'{',
'   gl_FragColor = texture2D(sampler, fragTexCoord);',
'}',
].join('\n');

var InitDemo = function() {

    var canvas = document.getElementById('application');
    var gl = canvas.getContext('webgl2');
    if(!gl) {
        console.log("WebGL not supported, falling back on experimental");
        gl = canvas.getContext('experimental-webgl');
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // <img> tag flips images

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /*
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    */
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
        console.error("ERROR compiling vertex shader");
        return;
    }
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)){
        console.error("ERROR compiling fragment shader");
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        console.error("ERROR linking program", gl.getProgramInfoLog(program));
        return;
    }

    gl.validateProgram(program); //Expensive, remove in release
    if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
        console.error("ERROR validating program", gl.getProgramInfoLog(program));
        return;
    }

    
    let uvB = (window.innerWidth / window.innerHeight) * 1.25066;
    console.log(window.innerWidth);
    console.log(window.innerHeight);
    console.log(uvB);

    var uTop = 1.0;
    var uBottom = 0.0 - ((1 - uvB) * (window.innerHeight / window.innerWidth));
    
    // Create buffer

    var boxVertices = 
	[ // X, Y, Z            U, V
		// Front
		1.0, 1.0, 1.0,      1.0, uTop,
		1.0, -1.0, 1.0,     1.0, uBottom,
		-1.0, -1.0, 1.0,    0.0, uBottom,
		-1.0, 1.0, 1.0,     0.0, uTop,
	];

	var boxIndices =
	[
		// Front
		1, 0, 2,
		3, 2, 0,
	];

    var boxVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

    var boxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
    gl.vertexAttribPointer(
        positionAttribLocation, // Attributes location
        3, // Number of elements per attribute
        gl.FLOAT, // type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex attribute
    );

    gl.vertexAttribPointer(
        texCoordAttribLocation,
        2,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT 
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);

    // Create texture
    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); //MIRRORED_REPEAT
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D( 
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        document.getElementById('my-image')
        );
    gl.bindTexture(gl.TEXTURE_2D, null);


    gl.useProgram(program); // Needs to know the program by this point

    var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    
    var worldMatrix = new Float32Array(16); 
    var viewMatrix = new Float32Array(16); 
    var projMatrix = new Float32Array(16); 
    //mat4.identity(worldMatrix);
    //mat4.lookAt(viewMatrix, [0,0,-7], [0,0,0], [0,1,0]);
    //mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);
    mat4.identity(worldMatrix);
    mat4.identity(viewMatrix);
    mat4.identity(projMatrix);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);





    // Main Render Loop

    //var identityMatrix = new Float32Array(16);
    //mat4.identity(identityMatrix);
    //var angle = 0;
    var loop = function() {
        //angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        //mat4.rotate(worldMatrix, identityMatrix, angle, [0,1,0]);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);


        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        gl.activeTexture(gl.TEXTURE0);

        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}