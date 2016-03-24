

// Create a place to store terrain geometry
var teapotPositionBuffer;
var terrainPositionBuffer;

//Create a place to store normals for shading
var teapotNormalBuffer;
var terrainNormalBuffer;

// Create a place to store the terrain triangles
var teapotIndexTriBuffer;
var terrainIndexTriBuffer;

var terrainTexCoordBuffer;
var terrainIndexEdgeBuffer;
// View parameters
var eyePt = vec3.fromValues(0, 5.0,10.0);
var viewDir = vec3.fromValues(0.0,0.0,0.0);
var up = vec3.fromValues(0.0,1.0,0.0);
var viewPt = vec3.fromValues(0.25,3.0,0.0);

// Create the normal
var nMatrix = mat3.create();

// Create ModelView matrix
var mvMatrix = mat4.create();

//Create Projection matrix
var pMatrix = mat4.create();

var mvMatrixStack = [];

var shaderSwitch = 1;

var then = 0;
var modelXRotationRadians = degToRad(0);
var modelYRotationRadians = degToRad(0);

//-------------------------------------------------------------------------
function setupTeapotBuffers() {
    teapotPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotPositionBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    teapotPositionBuffer.itemSize = 3;
    teapotPositionBuffer.numItems =  vertices.length/3;
    
    // Specify normals to be able to do lighting calculations
    teapotNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals),
                  gl.STATIC_DRAW);
    teapotNormalBuffer.itemSize = 3;
    teapotNormalBuffer.numItems = normals.length/3;
    
    // Specify faces of the terrain 
    teapotIndexTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotIndexTriBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces),
                  gl.STATIC_DRAW);
    teapotIndexTriBuffer.itemSize = 1;
    teapotIndexTriBuffer.numItems = faces.length;
}

//-------------------------------------------------------------------------
function setupTerrainBuffers() {
    var vTerrain=[];
    var fTerrain=[];
    var nTerrain=[];
    var eTerrain=[];
    var tTerrain = [];
    var gridN=20;
    
    var numT = terrainFromIteration(gridN, -4,4,-4,4, vTerrain, fTerrain, nTerrain, tTerrain);
    console.log("Generated ", numT, " triangles"); 
    terrainPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainPositionBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTerrain), gl.STATIC_DRAW);
    terrainPositionBuffer.itemSize = 3;
    terrainPositionBuffer.numItems = (gridN+1)*(gridN+1);
    
    // Specify normals to be able to do lighting calculations
    terrainNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nTerrain),
                  gl.STATIC_DRAW);
    terrainNormalBuffer.itemSize = 3;
    terrainNormalBuffer.numItems = (gridN+1)*(gridN+1);
    
    // Specify faces of the terrain 
    terrainIndexTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexTriBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fTerrain),
                  gl.STATIC_DRAW);
    terrainIndexTriBuffer.itemSize = 1;
    terrainIndexTriBuffer.numItems = numT*3;

    //Setup Edges
    generateLinesFromIndexedTriangles(fTerrain,eTerrain);  
    terrainIndexEdgeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexEdgeBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(eTerrain),
                  gl.STATIC_DRAW);
    terrainIndexEdgeBuffer.itemSize = 1;
    terrainIndexEdgeBuffer.numItems = eTerrain.length;

    terrainTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, terrainTexCoordBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tTerrain), gl.STATIC_DRAW);
    terrainTexCoordBuffer.itemSize = 2;
    terrainTexCoordBuffer.numItems = (gridN+1)*(gridN+1);
}


//-------------------------------------------------------------------------
function drawTeapot(){
 gl.polygonOffset(0,0);
 gl.bindBuffer(gl.ARRAY_BUFFER, teapotPositionBuffer);
 gl.vertexAttribPointer(shaderProgram1.vertexPositionAttribute, teapotPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, teapotNormalBuffer);
 gl.vertexAttribPointer(shaderProgram1.vertexNormalAttribute, 
                           teapotNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   

 //Draw 
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotIndexTriBuffer);
 gl.drawElements(gl.TRIANGLES, teapotIndexTriBuffer.numItems, gl.UNSIGNED_SHORT,0);      
}

function drawTerrain(){
 gl.polygonOffset(0,0);
 gl.bindBuffer(gl.ARRAY_BUFFER, terrainPositionBuffer);
 gl.vertexAttribPointer(shaderProgram2.vertexPositionAttribute, terrainPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, terrainNormalBuffer);
 gl.vertexAttribPointer(shaderProgram2.vertexNormalAttribute, 
                           terrainNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   

 gl.bindBuffer(gl.ARRAY_BUFFER, terrainTexCoordBuffer);
 gl.vertexAttribPointer(shaderProgram2.texCoordAttribute, 2,
                      gl.FLOAT, false, 0, 0);   
  
 gl.activeTexture(gl.TEXTURE0);
 gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
 gl.uniform1i(gl.getUniformLocation(shaderProgram2, "uSampler"),0);
 // //Draw 
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexTriBuffer);
 gl.drawElements(gl.TRIANGLES, terrainIndexTriBuffer.numItems, gl.UNSIGNED_SHORT,0);      
}

function drawTerrainEdges(){
 gl.polygonOffset(1,1);
 gl.bindBuffer(gl.ARRAY_BUFFER, terrainPositionBuffer);
 gl.vertexAttribPointer(shaderProgram2.vertexPositionAttribute, terrainPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, terrainNormalBuffer);
 gl.vertexAttribPointer(shaderProgram2.vertexNormalAttribute, 
                           terrainNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
 //Draw 
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrainIndexEdgeBuffer);
 gl.drawElements(gl.LINES, terrainIndexEdgeBuffer.numItems, gl.UNSIGNED_SHORT,0);      
}

//-------------------------------------------------------------------------
function uploadModelViewMatrixToShader() {
  if(shaderSwitch)
  gl.uniformMatrix4fv(shaderProgram1.mvMatrixUniform, false, mvMatrix);
  else
  gl.uniformMatrix4fv(shaderProgram2.mvMatrixUniform, false, mvMatrix);
}

//-------------------------------------------------------------------------
function uploadProjectionMatrixToShader() {
  if(shaderSwitch)
  gl.uniformMatrix4fv(shaderProgram1.pMatrixUniform, false, pMatrix);
  else
  gl.uniformMatrix4fv(shaderProgram2.pMatrixUniform, false, pMatrix);
}

//-------------------------------------------------------------------------
function uploadNormalMatrixToShader() {
  mat3.fromMat4(nMatrix,mvMatrix);
  mat3.transpose(nMatrix,nMatrix);
  mat3.invert(nMatrix,nMatrix);
  if(shaderSwitch)
  gl.uniformMatrix3fv(shaderProgram1.nMatrixUniform, false, nMatrix);
  else
  gl.uniformMatrix3fv(shaderProgram2.nMatrixUniform, false, nMatrix);
}

//----------------------------------------------------------------------------------
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}


//----------------------------------------------------------------------------------
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//----------------------------------------------------------------------------------
function setMatrixUniforms() {
    uploadModelViewMatrixToShader();
    uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
}
//----------------------------------------------------------------------------------
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

//----------------------------------------------------------------------------------
function setupTeapotShaders() {

  shaderProgram1.vertexPositionAttribute = gl.getAttribLocation(shaderProgram1, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram1.vertexPositionAttribute);

  shaderProgram1.vertexNormalAttribute = gl.getAttribLocation(shaderProgram1, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram1.vertexNormalAttribute);

  shaderProgram1.mvMatrixUniform = gl.getUniformLocation(shaderProgram1, "uMVMatrix");
  shaderProgram1.pMatrixUniform = gl.getUniformLocation(shaderProgram1, "uPMatrix");
  shaderProgram1.nMatrixUniform = gl.getUniformLocation(shaderProgram1, "uNMatrix");
  shaderProgram1.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram1, "uLightPosition");    
  shaderProgram1.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram1, "uAmbientLightColor");  
  shaderProgram1.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram1, "uDiffuseLightColor");
  shaderProgram1.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram1, "uSpecularLightColor");
  shaderProgram1.uniformTexMap = gl.getUniformLocation(shaderProgram1, "texMap");
}

function setupTerrainShaders() {

  shaderProgram2.vertexPositionAttribute = gl.getAttribLocation(shaderProgram2, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram2.vertexPositionAttribute);

  shaderProgram2.vertexNormalAttribute = gl.getAttribLocation(shaderProgram2, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram2.vertexNormalAttribute);

  shaderProgram2.texCoordAttribute = gl.getAttribLocation(shaderProgram2, "aTexCoord");
  gl.enableVertexAttribArray(shaderProgram2.texCoordAttribute);

  shaderProgram2.mvMatrixUniform = gl.getUniformLocation(shaderProgram2, "uMVMatrix");
  shaderProgram2.pMatrixUniform = gl.getUniformLocation(shaderProgram2, "uPMatrix");
  shaderProgram2.nMatrixUniform = gl.getUniformLocation(shaderProgram2, "uNMatrix");
  shaderProgram2.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram2, "uLightPosition");    
  shaderProgram2.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram2, "uAmbientLightColor");  
  shaderProgram2.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram2, "uDiffuseLightColor");
  shaderProgram2.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram2, "uSpecularLightColor");
  shaderProgram2.uniformSampler = gl.getUniformLocation(shaderProgram2, "uSampler");
}


//-------------------------------------------------------------------------
function uploadLightsToShader(loc,a,d,s) {
  if(shaderSwitch)
  {
  gl.uniform3fv(shaderProgram1.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram1.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram1.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram1.uniformSpecularLightColorLoc, s);
  }
  else {
  gl.uniform3fv(shaderProgram2.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram2.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram2.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram2.uniformSpecularLightColorLoc, s);
  }
}

//----------------------------------------------------------------------------------
function setupBuffers() {
    setupTeapotBuffers();
    setupTerrainBuffers();
}

//----------------------------------------------------------------------------------
function draw() { 
    gl.useProgram(shaderProgram1);
    // gl.enableVertexAttribArray(shaderProgram1.vertexPositionAttribute);
    // gl.enableVertexAttribArray(shaderProgram1.vertexNormalAttribute);
    // gl.disableVertexAttribArray(shaderProgram2.vertexPositionAttribute);
    // gl.disableVertexAttribArray(shaderProgram2.vertexNormalAttribute);
    // // gl.disableVertexAttribArray(shaderProgram2.texCoordAttribute);
    shaderSwitch = 1;
    gl.uniform1i(gl.getUniformLocation(shaderProgram1, "texMap"),0);
    var transformVec = vec3.create();
  
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0.1, 0.1, 0.1, 1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // We'll use perspective 
    mat4.perspective(pMatrix, Math.PI / 3, gl.viewportWidth / gl.viewportHeight, 0.1, 60.0);

    // We want to look down -z, so create a lookat point in that direction    
    // vec3.add(viewPt, eyePt, viewDir);
    // Then generate the lookat matrix and initialize the MV matrix to that view
    mat4.lookAt(mvMatrix,eyePt,viewPt,up);    
 
    mvPushMatrix();
    vec3.set(transformVec,0.0,2.25,-3.0);
    mat4.translate(mvMatrix, mvMatrix,transformVec);
    mat4.rotateX(mvMatrix,mvMatrix,modelXRotationRadians);
    mat4.rotateY(mvMatrix,mvMatrix,modelYRotationRadians); 
    setMatrixUniforms();
    uploadLightsToShader([0, 0,0],[0.0,0.0,0.0],[1.0,1.0,1.0],[1.0,1.0,1.0]);
    drawTeapot();
    mvPopMatrix();

    
    gl.useProgram(shaderProgram2);
    // gl.disableVertexAttribArray(shaderProgram1.vertexPositionAttribute);
    // gl.disableVertexAttribArray(shaderProgram1.vertexPositionAttribute);
    //gl.enableVertexAttribArray(shaderProgram2.vertexPositionAttribute);
    //gl.enableVertexAttribArray(shaderProgram2.vertexNormalAttribute);
    // gl.enableVertexAttribArray(shaderProgram2.texCoordAttribute);
    shaderSwitch = 0;
    mvPushMatrix();
    vec3.set(transformVec,0.0,-0.25,-3.0);
    mat4.translate(mvMatrix, mvMatrix,transformVec);
    mat4.rotateX(mvMatrix, mvMatrix, degToRad(0));
    mat4.rotateZ(mvMatrix, mvMatrix, degToRad(0));     
    setMatrixUniforms();
    uploadLightsToShader([0, 0,0],[0.6,0.1,0.1],[0.0,0.0,0.0],[0.0,0.0,0.0]);
    drawTerrain();
    uploadLightsToShader([0,1,1],[0.0,0.0,0.0],[0.0,0.0,0.0],[0.0,0.0,0.0]);
    drawTerrainEdges();
    mvPopMatrix();
}

//----------------------------------------------------------------------------------
function animate() {
    if (then==0)
    {
        then = Date.now();
    }
    else
    {
        now=Date.now();
        // Convert to seconds
        now *= 0.001;
        // Subtract the previous time from the current time
        var deltaTime = now - then;
        // Remember the current time for the next frame.
        then = now;

        //Animate the rotation
        if(document.getElementById("v").checked)
        modelXRotationRadians += 0.5 * deltaTime;
        else if(document.getElementById("h").checked)
        modelYRotationRadians += 0.5 * deltaTime;  
    }
}

//----------------------------------------------------------------------------------
function start() {
  setupTeapotShaders();
  setupTerrainShaders();
  setupBuffers();
  setupTextures();
  gl.enable(gl.DEPTH_TEST);
  cubeMapping();
  tick();
}

//----------------------------------------------------------------------------------
function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}

