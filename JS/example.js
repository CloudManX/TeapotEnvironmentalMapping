var faces = [];

var vertices = [];

//declare an array that holds normals per vertex
var normals = [];

var gl;
var canvas;
var shaderProgram1;
var shaderProgram2;
var vertexPositionBuffer;


function exampleLoad() {
    this.RL = null; // 
}

exampleLoad.prototype.loadResources = function () {

    this.RL = new ResourceLoader(this.resourcesLoaded, this);
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/teapot_vertex_shader.txt");
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/teapot_fragment_shader.txt");
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/teapot_0.obj");
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/terrain_vertex_shader.txt");
    this.RL.addResourceRequest("TEXT", "JS/Assets/TEXT/terrain_fragment_shader.txt");

    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/posx.jpg");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/negx.jpg");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/posy.jpg");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/negy.jpg");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/posz.jpg");
    this.RL.addResourceRequest("IMAGE", "JS/Assets/IMAGE/negz.jpg");
    this.RL.loadRequestedResources();

};

exampleLoad.prototype.resourcesLoaded = function (exampleLoadReference) {
  //  exampleLoadReference.completeCheck();
    exampleLoadReference.extractData();
    exampleLoadReference.calculateNormals();
    exampleLoadReference.initShaders();
    start();

};

exampleLoad.prototype.completeCheck = function () {
    console.log(this.RL.RLStorage.TEXT[3]);
    console.log(this.RL.RLStorage.TEXT[4]);
};

exampleLoad.prototype.extractData = function () {
    // Split the data by lines and process them one by one
    var temp;
    var lines = this.RL.RLStorage.TEXT[2].trim().split("\r\n");
    //console.log(lines);
    for (var i = 0; i < lines.length; i++)
    {
        temp = lines[i].split(/\s+/);
        //console.log(temp);
        if (temp[0] == "v")
        {
            vertices.push(parseFloat(temp[1]));
            vertices.push(parseFloat(temp[2]));
            vertices.push(parseFloat(temp[3]));
        }
        else if (temp[0] == "f")
        {
            faces.push(parseInt(temp[1])-1);
            faces.push(parseInt(temp[2])-1);
            faces.push(parseInt(temp[3])-1);
        }
    }
};

exampleLoad.prototype.calculateNormals = function () {
    for (var i = 0; i < vertices.length; i++)
    {
        normals.push(0.0);
    }

    for (var i = 0; i < faces.length; i+=3)
    {
        // load the 3 vertices of a face
        var v_1 = vec3.fromValues(vertices[3*faces[i]], vertices[3*faces[i]+1], vertices[3*faces[i]+2]);
        var v_2 = vec3.fromValues(vertices[3*faces[i+1]], vertices[3*faces[i+1]+1], vertices[3*faces[i+1]+2]);
        var v_3 = vec3.fromValues(vertices[3*faces[i+2]], vertices[3*faces[i+2]+1], vertices[3*faces[i+2]+2]);

        //calculate the normal for the face
        var e_1 = vec3.create(); 
        var e_2 = vec3.create();
        var normal = vec3.create();
        vec3.subtract(e_1, v_3, v_2);
        vec3.subtract(e_2, v_1, v_2);
        vec3.cross(normal, e_1, e_2);
        vec3.normalize(normal, normal);

        //assign this normal to all three vertices
        normals[3*faces[i]] += normal[0];
        normals[3*faces[i]+1] += normal[1];
        normals[3*faces[i]+2] += normal[2];
        normals[3*faces[i+1]] += normal[0];
        normals[3*faces[i+1]+1] += normal[1];
        normals[3*faces[i+1]+2] += normal[2];
        normals[3*faces[i+2]] += normal[0];
        normals[3*faces[i+2]+1] += normal[1];
        normals[3*faces[i+2]+2] += normal[2];
    }
};

exampleLoad.prototype.initShaders = function () {

    //  Initialize shaders - we're using that have been loaded in.
    var teapotVertexShader = this.createShader(this.RL.RLStorage.TEXT[0], gl.VERTEX_SHADER); //  
    var teapotFragmentShader = this.createShader(this.RL.RLStorage.TEXT[1], gl.FRAGMENT_SHADER); //  

    var terrainVertexShader = this.createShader(this.RL.RLStorage.TEXT[3], gl.VERTEX_SHADER); //  
    var terrainFragmentShader = this.createShader(this.RL.RLStorage.TEXT[4], gl.FRAGMENT_SHADER); //  

    shaderProgram1 = gl.createProgram(); //  
    gl.attachShader(shaderProgram1, teapotVertexShader); //  
    gl.attachShader(shaderProgram1, teapotFragmentShader); //  
    gl.linkProgram(shaderProgram1); //  

    if (!gl.getProgramParameter(shaderProgram1, gl.LINK_STATUS)) //  
    {
        alert("Unable to initialize the teapot shader program."); //  
    }

    shaderProgram2 = gl.createProgram(); //  
    gl.attachShader(shaderProgram2, terrainVertexShader); //  
    gl.attachShader(shaderProgram2, terrainFragmentShader); //  
    gl.linkProgram(shaderProgram2); //  

    if (!gl.getProgramParameter(shaderProgram2, gl.LINK_STATUS)) //  
    {
        alert("Unable to initialize the terrain shader program."); //  
    }
};

exampleLoad.prototype.createShader = function (shaderSource, shaderType) {
    //  Create a shader, given the source and the type
    var shader = gl.createShader(shaderType); //  
    gl.shaderSource(shader, shaderSource); //  
    gl.compileShader(shader); //  

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) //  
    {
        alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader)); //
        return null; //
    }

    return shader; //
};