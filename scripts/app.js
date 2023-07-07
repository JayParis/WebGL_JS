//import { mat4 } from "./gl-matrix";

let hasInit = false;

var imageList = [];
var bmpOrder = [];
var currentHighRes = null;

var remoteImagesLoadStep = 1; // 1 for all images, 2 for every other

const _supabaseUrl = 'https://cfzcrwfmlxquedvdajiw.supabase.co';
const _supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmemNyd2ZtbHhxdWVkdmRhaml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODc3ODM3MjksImV4cCI6MjAwMzM1OTcyOX0.ISyn717q7x4h9SXUtn0nj9U2jaTzmOHqmfjL5FiswYE";

var isMobile = navigator.maxTouchPoints > 0;
var tapPosVal = [0,0];
var targetHoldPosVal = [0,0];
var currentHoldPosVal_X = 0;
var currentHoldPosVal_Y = 0;
var inputting = false;

const vSens = 0.55; //5
var targetViewerID = 0;
var currViewerID = 0;
var previousViewerID = 0;
var previousFrameViewerID = 0;
let vID = 0;

var nextFrameIsHQ = false;

if(isMobile){
    document.addEventListener("touchstart", e => { inputDown(e); });
    document.addEventListener("touchmove", e => { inputMove(e); });
    document.addEventListener("touchend", e => { inputUp(e); });
}else{
    document.addEventListener("mousedown", e => { inputDown(e); });
    document.addEventListener("mousemove", e => { inputMove(e); });
    document.addEventListener("mouseup", e => { inputUp(e); });
}



document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOMCONTENT");

    let canvas = document.getElementById('application');
    // Resize canvas
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";

    if (window.document) {
        document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)');
        document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)');
        document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)');
    }

    document.getElementById('my-image').crossOrigin = "anonymous"; // DELETE
});

document.addEventListener("mousedown", (event) => {
    if(!hasInit){
        loadImageURLs();
        document.getElementById('splash').style.display = 'none';
    }
});

async function loadShadersAndRunDemo(){

    const vertexShaderText = await fetch('./assets/shaders/main_vertex.glsl')
        .then(result => result.text());
    const fragmentShaderText = await fetch('./assets/shaders/main_fragment.glsl')
        .then(result => result.text());
    
    hasInit = true;
    RunDemo(vertexShaderText,fragmentShaderText);
}

function loadImageURLs(){
    for (let i = 1; i <= 160; i += remoteImagesLoadStep) { //160
        let end = i.toString().padStart(4,'0');
        fetch(_supabaseUrl + '/storage/v1/object/public/main-pages/750/Page_1_Main_' + end + '.webp')
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], i.toString(), {type: blob.type});
                
                var newImage = createImageBitmap(file).then(img => {
                    imageList.push([img, i]);
                    bmpOrder.push(i);
                    
                    console.log(i);

                    if(imageList.length == (160 / remoteImagesLoadStep))
                        allImagesReady();
                });
            })
    }
    console.log("Finished Loading");
}

function allImagesReady(){

    imageList.sort((a, b) => {
        if(a[1] > b[1])
            return 1;
        if(a[1] < b[1])
            return -1;
        return 0;
    });
    
    console.log(imageList[0]);
    loadedPage = true;
    console.log("Finished Sorting");

    //viewer();
    loadShadersAndRunDemo();
}

var RunDemo = function(vertexShaderText, fragmentShaderText) {

    var canvas = document.getElementById('application');
    var gl = canvas.getContext('webgl2');
    if(!gl) {
        console.log("WebGL not supported, falling back on experimental");
        gl = canvas.getContext('experimental-webgl');
    }

    const ext = gl.getExtension('GMAN_webgl_memory');
    

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

    
    


    //var fpsElement = document.getElementById('fps');
    //if (fpsElement) {
    //    fpsElement.innerHTML = "Width: " + window.innerWidth + "<br/>" + "Window height: " + window.innerHeight;
    //}


    // OLD
    /*
    let sa_t = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sat"));
    sa_t = 100;
    let uvB = (window.innerWidth * 1.25066) / window.innerHeight;
    let aspectOffset = ((1 - uvB) * (1 / uvB));
    let uvT = sa_t / window.innerHeight;
    let topOffset = (uvT * (1 / uvB));

    var uTop = 1.0 + topOffset;
    var uBottom = (-aspectOffset) + topOffset;

    console.log(window.innerWidth);
    console.log(window.innerHeight);
    console.log(1 - uvB);
    console.log("UVT: " + uvT);
    */

    let sa_t = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sat"));
    var correctUV = fitImageToUV(canvas.width, canvas.height, sa_t);
    var uTop = correctUV[0];
    var uBottom = correctUV[1];

    

    // Create buffer


    var boxVertices = 
	[ // X, Y, Z            U, V
		// Front
		1.0, 1.0, 1.0,      1.0, 1 - uTop, canvas.width, canvas.height,
		1.0, -1.0, 1.0,     1.0, 1 - uBottom, canvas.width, canvas.height,
		-1.0, -1.0, 1.0,    0.0, 1 - uBottom, canvas.width, canvas.height,
		-1.0, 1.0, 1.0,     0.0, 1 - uTop, canvas.width, canvas.height,
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
        7 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex attribute
    );

    gl.vertexAttribPointer(
        texCoordAttribLocation,
        4,
        gl.FLOAT,
        gl.FALSE,
        7 * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT 
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);


    // Create texture
    /*
    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); //MIRRORED_REPEAT
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D( 
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        imageList[currViewerID][0]
        );
    gl.bindTexture(gl.TEXTURE_2D, null);
    */


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

    //let updateView = vID != previousFrameViewerID;
    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); // MIRRORED_REPEAT
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        imageList[1][0]
        );
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    //gl.bindTexture(gl.TEXTURE_2D, null);

    const canvasToDisplaySizeMap = new Map([[canvas, [750, 938]]]);

    function onResize(entries) {
        for (const entry of entries) {
            let width;
            let height;
            let dpr = window.devicePixelRatio;
            if (entry.devicePixelContentBoxSize) {
                // NOTE: Only this path gives the correct answer
                // The other 2 paths are an imperfect fallback
                // for browsers that don't provide anyway to do this
                width = entry.devicePixelContentBoxSize[0].inlineSize;
                height = entry.devicePixelContentBoxSize[0].blockSize;
                dpr = 1; // it's already in width and height
            } else if (entry.contentBoxSize) {
                if (entry.contentBoxSize[0]) {
                    width = entry.contentBoxSize[0].inlineSize;
                    height = entry.contentBoxSize[0].blockSize;
                } else {
                    // legacy
                    width = entry.contentBoxSize.inlineSize;
                    height = entry.contentBoxSize.blockSize;
                }
            } else {
                // legacy
                width = entry.contentRect.width;
                height = entry.contentRect.height;
            }
            const displayWidth = Math.round(width * 1); //dpr
            const displayHeight = Math.round(height * 1); //dpr
            canvasToDisplaySizeMap.set(entry.target, [displayWidth, displayHeight]);
        }
    }

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas, {box: 'content-box'});

    function resizeCanvasToDisplaySize(canvas) {
        // Get the size the browser is displaying the canvas in device pixels.
        const [displayWidth, displayHeight] = canvasToDisplaySizeMap.get(canvas);

        // Check if the canvas is not the same size.
        const needResize = canvas.width  !== displayWidth || canvas.height !== displayHeight;

        if (needResize) {
            // Make the canvas the same size
            canvas.width  = displayWidth;
            canvas.height = displayHeight;

            let sa_t = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sat"));
            sa_t *= (displayHeight / window.innerHeight);
            var correctUV = fitImageToUV(displayWidth, displayHeight, sa_t);
            var uTop = correctUV[0];
            var uBottom = correctUV[1];

            console.log("VertBuffer Updating");

            console.log("Safe Area Top: " + sa_t);
            console.log("Width: " + displayWidth);
            console.log("Height: " + displayHeight);

            var newBoxVertices = 
            [ // X, Y, Z            U, V
                // Front
                1.0, 1.0, 1.0,      1.0, 1 - uTop, canvas.width, displayHeight,
                1.0, -1.0, 1.0,     1.0, 1 - uBottom, canvas.width, displayHeight,
                -1.0, -1.0, 1.0,    0.0, 1 - uBottom, canvas.width, displayHeight,
                -1.0, 1.0, 1.0,     0.0, 1 - uTop, canvas.width, displayHeight,
            ];

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newBoxVertices), gl.STATIC_DRAW);

        }

        return needResize;
    }

    // Main Render Loop

    //var identityMatrix = new Float32Array(16);
    //mat4.identity(identityMatrix);
    //var angle = 0;

    var fpsLastTick = new Date().getTime();
    var fpsTri = [15, 15, 15]; // aims for 60fps

    var loop = function() {

        resizeCanvasToDisplaySize(gl.canvas);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //currentHoldPosVal_X = MoveTowards(currentHoldPosVal_X, targetHoldPosVal[0], 1.05);
        //currentHoldPosVal_Y = MoveTowards(currentHoldPosVal_Y, targetHoldPosVal[1], 1.05);
        //let currentCoord = [currentHoldPosVal_X, currentHoldPosVal_Y];


        //angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        //mat4.rotate(worldMatrix, identityMatrix, angle, [0,1,0]);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);


        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //gl.drawArrays(gl.TRIANGLES, 0, 3);

        //grabbedViewerID = targetViewerID;

        gl.texSubImage2D( 
            gl.TEXTURE_2D, 0, 0, 0, gl.RGBA,
            gl.UNSIGNED_BYTE,
            nextFrameIsHQ ? currentHighRes : imageList[vID][0]
            );
        //gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        
        //gl.activeTexture(gl.TEXTURE0);
        
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        

        // update fps at last
        var now = new Date().getTime();
        var frameTime = (now - fpsLastTick);
        fpsTri.shift(); // drop one
        fpsTri.push(frameTime); // append one
        fpsLastTick = now;
        fps = Math.floor(3000 / (fpsTri[0] + fpsTri[1] + fpsTri[2])); // mean of 3
        //var fpsElement = document.getElementById('fps');
        //if (fpsElement) {
        //    fpsElement.innerHTML = fps;
        //}

        //if(updateView)
        //gl.bindTexture(gl.TEXTURE_2D, null);

        previousFrameViewerID = vID;

        if(currentHighRes != null)
            nextFrameIsHQ = true;

        //gl.finish();

        if (ext) { // Memory Info
            const info = ext.getMemoryInfo();
            document.querySelector('#info').textContent = JSON.stringify(info, null, 2);
        }

        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

// Input events ---------------------------------------

function inputDown(event) {
    inputting = true;

    let screenX = isMobile ? event.changedTouches[0].clientX : event.x;
    let screenY = isMobile ? event.changedTouches[0].clientY : event.y;

    tapPosVal = [screenX, screenY];
    currentHoldPosVal_X = screenX;
    currentHoldPosVal_Y = screenY;
    targetHoldPosVal = [screenX, screenY];
    
    if(screenY < window.innerHeight * 0.25 && hasInit) {
        /*
        let end = "30".padStart(4,'0');
        fetch(_supabaseUrl + '/storage/v1/object/public/main-pages/750/Page_1_Main_' + end + '.webp')
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], vID.toString(), {type: blob.type});
                var newImage = createImageBitmap(file).then(img => {
                    currentHighRes = img;
                    console.log("High Res Image Loaded");
                });
            })
        */
        var canvas = document.getElementById('application');
        var fpsElement = document.getElementById('fps');
        if (fpsElement) {
            //fpsElement.innerHTML = canvas.width + " x " + canvas.height;
            fpsElement.innerHTML = canvas.width + " x " + canvas.height + " - " + 
            parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sat"));
        }
        
    }

    event.preventDefault();
}

function inputMove(event) {
    if(!inputting)
        return;


    let screenX = isMobile ? event.changedTouches[0].clientX : event.x;
    let screenY = isMobile ? event.changedTouches[0].clientY : event.y;

    targetHoldPosVal = [screenX, screenY];

    let moduloVal = 160 / remoteImagesLoadStep;
    vID = Math.abs(mod(previousViewerID + Math.trunc((tapPosVal[0] * vSens) - (targetHoldPosVal[0] * vSens)), moduloVal));


    event.preventDefault();

    //if(hasInit)
    //    viewer();
}

function inputUp(event) {
    inputting = false;
    previousViewerID = vID;

    let screenX = isMobile ? event.changedTouches[0].clientX : event.x;
    let screenY = isMobile ? event.changedTouches[0].clientY : event.y;

    currentHoldPosVal_X = screenX;
    currentHoldPosVal_Y = screenY;

    targetHoldPosVal = [screenX, screenY];

    if(hasInit)
        console.log(imageList.length);
}

// Helper methods ---------------------------------------

function mod(n, m) {
    return ((n % m) + m) % m;
}

function MoveTowards(current, target, maxDelta) {
    if (Math.abs(target - current) <= maxDelta) {
        return target;
    }
    return current + Math.sign(target - current) * maxDelta;
}

function fitImageToUV(containerWidth, containerHeight, safeArea){
    let uvTop, uvBottom;

    let v_B = (containerWidth * 1.25066) / containerHeight;
    let a_off = ((1 - v_B) * (1 / v_B));
    let v_T = safeArea / containerHeight;
    let t_off = (v_T * (1 / v_B));

    uvTop = 1.0 + t_off;
    uvBottom = (-a_off) + t_off;

    return [uvTop, uvBottom];
}