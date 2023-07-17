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
let copyVideo = false;
let enableVideo = false;
let needsInvert = false;

var nextFrameIsHQ = false;

var testMob = (function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))window.location=b})(navigator.userAgent||navigator.vendor||window.opera,'http://detectmobilebrowser.com/mobile');

if(testMob != null){
    document.getElementById('splash').style.backgroundColor = "lime";
}else{
    document.getElementById('splash').style.backgroundColor = "red";
}


if(isMobile){
    document.addEventListener("touchstart", e => { inputDown(e); });
    document.addEventListener("touchmove", e => { inputMove(e); });
    document.addEventListener("touchend", e => { inputUp(e); });
}else{
    document.addEventListener("mousedown", e => { inputDown(e); });
    document.addEventListener("mousemove", e => { inputMove(e); });
    document.addEventListener("mouseup", e => { inputUp(e); });
}

console.log("Is Mobile: " + isMobile);


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
    const blurShaderText = await fetch('./assets/shaders/blur_fragment.glsl')
        .then(result => result.text());
    
    hasInit = true;
    RunDemo(vertexShaderText,fragmentShaderText,blurShaderText);
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

var RunDemo = function(vertexShaderText, fragmentShaderText, blurShaderText) {

    var canvas = document.getElementById('application');
    var gl = canvas.getContext('webgl2');
    if(!gl) {
        console.log("WebGL not supported, falling back on experimental");
        gl = canvas.getContext('experimental-webgl');
    }

    const ext = gl.getExtension('GMAN_webgl_memory'); // Memory Extension
    

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // <img> tag flips images, and also affects video?

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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

    // Create main program
    
        
    var mainProgram = gl.createProgram();
    gl.attachShader(mainProgram, vertexShader);
    gl.attachShader(mainProgram, fragmentShader);
    gl.linkProgram(mainProgram);
    if(!gl.getProgramParameter(mainProgram, gl.LINK_STATUS)){
        console.error("ERROR linking main program", gl.getProgramInfoLog(mainProgram));
        return;
    }

    gl.validateProgram(mainProgram); //Expensive, remove in release
    if(!gl.getProgramParameter(mainProgram, gl.VALIDATE_STATUS)){
        console.error("ERROR validating main program", gl.getProgramInfoLog(mainProgram));
        return;
    }

    gl.useProgram(mainProgram);

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

    var positionAttribLocation = gl.getAttribLocation(mainProgram, 'vertPosition');
    var texCoordAttribLocation = gl.getAttribLocation(mainProgram, 'vertTexCoord');
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


    var matWorldUniformLocation = gl.getUniformLocation(mainProgram, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(mainProgram, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(mainProgram, 'mProj');
    
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

    

    var boxTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); // MIRRORED_REPEAT
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
        gl.UNSIGNED_BYTE,
        imageList[1][0] //imageList[1][0]
        );
    //gl.activeTexture(gl.TEXTURE0);

    const targetTextureWidth = 750;
    const targetTextureHeight = 938; //938
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);

    // define size and format of level 0
    const lv = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, lv, internalFormat,
                  targetTextureWidth, targetTextureHeight, border,
                  format, type, data);

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

    // Create and bind the framebuffer
    
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);
    
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);

    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    //return;
    // Create blur program
    
        var blurShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(vertexShader, vertexShaderText);
        gl.shaderSource(blurShader, blurShaderText);

        gl.compileShader(blurShader);
        if(!gl.getShaderParameter(blurShader,gl.COMPILE_STATUS)){
            console.error("ERROR compiling blur shader");
            return;
        }

        var blurProgram = gl.createProgram();
        gl.attachShader(blurProgram, vertexShader);
        gl.attachShader(blurProgram, blurShader);
        gl.linkProgram(blurProgram);
        if(!gl.getProgramParameter(blurProgram, gl.LINK_STATUS)){
            console.error("ERROR linking main program", gl.getProgramInfoLog(blurProgram));
            return;
        }
    
        gl.validateProgram(blurProgram); //Expensive, remove in release
        if(!gl.getProgramParameter(blurProgram, gl.VALIDATE_STATUS)){
            console.error("ERROR validating main program", gl.getProgramInfoLog(blurProgram));
            return;
        }

        gl.useProgram(blurProgram);
    
        var blurVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, blurVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
    
        var blurIndexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, blurIndexBufferObject);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);
    
        var blurPositionAttribLocation = gl.getAttribLocation(blurProgram, 'vertPosition');
        var blurTexCoordAttribLocation = gl.getAttribLocation(blurProgram, 'vertTexCoord');
        gl.vertexAttribPointer(
            blurPositionAttribLocation, // Attributes location
            3, // Number of elements per attribute
            gl.FLOAT, // type of elements
            gl.FALSE,
            7 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
            0 // Offset from the beginning of a single vertex attribute
        );
    
        gl.vertexAttribPointer(
            blurTexCoordAttribLocation,
            4,
            gl.FLOAT,
            gl.FALSE,
            7 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT 
        );
    
        gl.enableVertexAttribArray(blurPositionAttribLocation);
        gl.enableVertexAttribArray(blurTexCoordAttribLocation);
    
    
        var blurMatWorldUniformLocation = gl.getUniformLocation(blurProgram, 'mWorld');
        var blurMatViewUniformLocation = gl.getUniformLocation(blurProgram, 'mView');
        var blurMatProjUniformLocation = gl.getUniformLocation(blurProgram, 'mProj');
        
        var blurWorldMatrix = new Float32Array(16); 
        var blurViewMatrix = new Float32Array(16); 
        var blurProjMatrix = new Float32Array(16); 
        //mat4.identity(worldMatrix);
        //mat4.lookAt(viewMatrix, [0,0,-7], [0,0,0], [0,1,0]);
        //mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);
        mat4.identity(blurWorldMatrix);
        mat4.identity(blurViewMatrix);
        mat4.identity(blurProjMatrix);
    
        gl.uniformMatrix4fv(blurMatWorldUniformLocation, gl.FALSE, blurWorldMatrix);
        gl.uniformMatrix4fv(blurMatViewUniformLocation, gl.FALSE, blurViewMatrix);
        gl.uniformMatrix4fv(blurMatProjUniformLocation, gl.FALSE, blurProjMatrix);


        //gl.activeTexture(gl.TEXTURE1);
        var blurTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, blurTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); // MIRRORED_REPEAT
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null); //fb
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        var textureLocation = gl.getUniformLocation(blurProgram, "sampler_1");
        gl.uniform1i(textureLocation, 0);
        
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        var textureLocation_2 = gl.getUniformLocation(blurProgram, "sampler_2");
        gl.uniform1i(textureLocation_2, 1);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        /*
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGB, gl.RGB,
            gl.UNSIGNED_BYTE,
            imageList[1][0]
            );
            gl.activeTexture(gl.TEXTURE0);
        */
        
    //gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    

    // Create video element

    //var videoTex = gl.createTexture();

    //var currentVideo = setupVideo("https://cfzcrwfmlxquedvdajiw.supabase.co/storage/v1/object/public/main-pages/Video/Video_F0001_1500.mp4");

    
    // Resize observer

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
            //const displayWidth = Math.round(width * dpr); //dpr
            //const displayHeight = Math.round(height * dpr); //dpr
            const displayWidth = 750;
            const displayHeight = parseInt(750 * (height / width));

            canvasToDisplaySizeMap.set(entry.target, [displayWidth, displayHeight]);
        }
    }

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas, {box: 'content-box'});

    function resizeCanvasToDisplaySize(canvas) {
        // Get the size the browser is displaying the canvas in device pixels.
        const [displayWidth, displayHeight] = canvasToDisplaySizeMap.get(canvas);

        // Check if the canvas is not the same size.
        const needResize = canvas.width  !== displayWidth || canvas.height !== displayHeight || needsInvert;

        if (needResize) {
            // Make the canvas the same size
            canvas.width  = displayWidth;
            canvas.height = displayHeight;

            let sa_t = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sat"));
            sa_t *= (displayHeight / window.innerHeight);
            var correctUV = fitImageToUV(displayWidth, displayHeight, sa_t);
            var uTop = correctUV[0];
            var uBottom = correctUV[1];

            let pageBlock = document.getElementById('page-block');
            let paraOffset = getParaOffset(displayWidth, displayHeight, sa_t) * 0.9;
            console.log(paraOffset);
            pageBlock.style.top = (100 * paraOffset).toString() + "vh";
            pageBlock.style.height = ((1 - paraOffset) * 100).toString() + "vh";

            console.log("VertBuffer Updating");

            console.log("Safe Area Top: " + sa_t);
            console.log("Width: " + displayWidth);
            console.log("Height: " + displayHeight);

            var newBoxVertices = 
            [ // X, Y, Z            U, V
                // Front
                1.0, 1.0, 1.0,      1.0, enableVideo ? uTop : 1 - uTop, canvas.width, displayHeight,
                1.0, -1.0, 1.0,     1.0, enableVideo ? uBottom : 1 - uBottom, canvas.width, displayHeight,
                -1.0, -1.0, 1.0,    0.0, enableVideo ? uBottom : 1 - uBottom, canvas.width, displayHeight,
                -1.0, 1.0, 1.0,     0.0, enableVideo ? uTop : 1 - uTop, canvas.width, displayHeight,
            ];
            gl.useProgram(mainProgram);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newBoxVertices), gl.STATIC_DRAW);
            gl.useProgram(blurProgram);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newBoxVertices), gl.STATIC_DRAW);
            needsInvert = false;
        }

        return needResize;
    }

    // Main Render Loop
    //return;
    var fpsLastTick = new Date().getTime();
    var fpsTri = [15, 15, 15]; // aims for 60fps

    var loop = function() {
        let isNewFrame = previousFrameViewerID != vID;
        if(isNewFrame && enableVideo) {
            needsInvert = true;
            enableVideo = false;
        }

        resizeCanvasToDisplaySize(gl.canvas);

        //gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        if(isNewFrame || (copyVideo && enableVideo))
        {
            gl.clearColor(0.75, 0.85, 0.8, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            if (copyVideo && enableVideo && false) {
                gl.activeTexture(gl.TEXTURE0);//TEXTURE1
                gl.bindTexture(gl.TEXTURE_2D, boxTexture);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    currentVideo
                );
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }else if(previousFrameViewerID != vID && !enableVideo){
                

            }

            gl.useProgram(mainProgram);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, boxTexture);
            gl.texImage2D( 
                gl.TEXTURE_2D, 
                0, 
                gl.RGBA,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                copyVideo && enableVideo ? currentVideo : (nextFrameIsHQ ? currentHighRes : imageList[vID][0])
                );
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
            //gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
            //gl.drawArrays(gl.POINTS, 0, 1);

            gl.bindFramebuffer(gl.FRAMEBUFFER, fb); //fb
            gl.useProgram(blurProgram);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, targetTexture);
            gl.uniform1i(textureLocation, 0);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null); //fb
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, boxTexture);
            gl.uniform1i(textureLocation_2, 1);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

            gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        }
        //gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        
        //gl.activeTexture(gl.TEXTURE0);
        
        //gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        

        // update fps at last
        /*
        var now = new Date().getTime();
        var frameTime = (now - fpsLastTick);
        fpsTri.shift(); // drop one
        fpsTri.push(frameTime); // append one
        fpsLastTick = now;
        fps = Math.floor(3000 / (fpsTri[0] + fpsTri[1] + fpsTri[2])); // mean of 3
        var fpsElement = document.getElementById('fps');
        */
        //if (fpsElement) {
        //    fpsElement.innerHTML = fps;
        //}
        
        previousFrameViewerID = vID;

        if(currentHighRes != null)
            nextFrameIsHQ = true;

        if (ext) { // Memory Info
            //const info = ext.getMemoryInfo();
            //document.querySelector('#info').textContent = JSON.stringify(info, null, 2);
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
        

        needsInvert = true;
        enableVideo = !enableVideo; // DELETE
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
    if(vID % 2 != 0){
        vID++;
    }

    previousViewerID = vID;

    let screenX = isMobile ? event.changedTouches[0].clientX : event.x;
    let screenY = isMobile ? event.changedTouches[0].clientY : event.y;

    currentHoldPosVal_X = screenX;
    currentHoldPosVal_Y = screenY;

    targetHoldPosVal = [screenX, screenY];

    var canvas = document.getElementById('application');
    var fpsElement = document.getElementById('fps');
    if (fpsElement) {
        fpsElement.innerHTML = "vID: " + vID;
    }

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

function getParaOffset(containerWidth, containerHeight, safeArea){
    let card_prop = (containerWidth * 1.25066) / containerHeight;;
    let sa_prop = safeArea / containerHeight;

    return card_prop + sa_prop;
}

function setupVideo(url) {
    const video = document.createElement("video");
  
    let playing = false;
    let timeupdate = false;
  
    video.crossOrigin = "anonymous";
    video.playsInline = true;
    video.muted = true;
    video.loop = true;
  
    // Waiting for these 2 events ensures
    // there is data in the video
  
    video.addEventListener(
      "playing",
      () => {
        playing = true;
        //console.log("Video wants to play");
        checkReady();
      },
      true
    );
  
    video.addEventListener(
      "timeupdate",
      () => {
        timeupdate = true;
        //console.log("Video wants to update");
        checkReady();
      },
      true
    );
  
    video.src = url;
    video.play();
  
    function checkReady() {
      if (playing && timeupdate) {
        copyVideo = true;
      }
    }
  
    return video;
  }