"use strict";

var Ops=Ops || {};
Ops.Gl=Ops.Gl || {};
Ops.Ui=Ops.Ui || {};
Ops.Gl2=Ops.Gl2 || {};
Ops.Math=Ops.Math || {};
Ops.Vars=Ops.Vars || {};
Ops.User=Ops.User || {};
Ops.Anim=Ops.Anim || {};
Ops.Color=Ops.Color || {};
Ops.Array=Ops.Array || {};
Ops.Value=Ops.Value || {};
Ops.Patch=Ops.Patch || {};
Ops.Boolean=Ops.Boolean || {};
Ops.Trigger=Ops.Trigger || {};
Ops.Gl.Shader=Ops.Gl.Shader || {};
Ops.Gl.Meshes=Ops.Gl.Meshes || {};
Ops.Gl.Matrix=Ops.Gl.Matrix || {};
Ops.User.action=Ops.User.action || {};
Ops.Gl.Geometry=Ops.Gl.Geometry || {};
Ops.Gl2.ForceField=Ops.Gl2.ForceField || {};

//----------------



// **************************************************************
// 
// Ops.Gl.MainLoop
// 
// **************************************************************

Ops.Gl.MainLoop = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
const fpsLimit=op.inValue("FPS Limit",0);
const trigger=op.outFunction("trigger");
const width=op.outValue("width");
const height=op.outValue("height");
const reduceLoadingFPS=op.inValueBool("Reduce FPS loading");
const clear=op.inValueBool("Clear",true);
const fullscreen=op.inValueBool("Fullscreen Button",false);
const active=op.inValueBool("Active",true);
const hdpi=op.inValueBool("Hires Displays",false);

hdpi.onChange=function()
{
    if(hdpi.get()) op.patch.cgl.pixelDensity=window.devicePixelRatio;
        else op.patch.cgl.pixelDensity=1;
        
    op.patch.cgl.updateSize();
    if(CABLES.UI) gui.setLayout();
};


var cgl=op.patch.cgl;
var rframes=0;
var rframeStart=0;

if(!op.patch.cgl) op.uiAttr( { 'error': 'No webgl cgl context' } );

var identTranslate=vec3.create();
vec3.set(identTranslate, 0,0,0);
var identTranslateView=vec3.create();
vec3.set(identTranslateView, 0,0,-2);

fullscreen.onChange=updateFullscreenButton;
setTimeout(updateFullscreenButton,100);
var fsElement=null;

function updateFullscreenButton()
{
    function onMouseEnter()
    {
        if(fsElement)fsElement.style.display="block";
    }

    function onMouseLeave()
    {
        if(fsElement)fsElement.style.display="none";
    }
    
    op.patch.cgl.canvas.addEventListener('mouseleave', onMouseLeave);
    op.patch.cgl.canvas.addEventListener('mouseenter', onMouseEnter);

    if(fullscreen.get())
    {
        if(!fsElement) 
        {
            fsElement = document.createElement('div');

            var container = op.patch.cgl.canvas.parentElement;
            if(container)container.appendChild(fsElement);
    
            fsElement.addEventListener('mouseenter', onMouseEnter);
            fsElement.addEventListener('click', function(e)
            {
                if(CABLES.UI && !e.shiftKey) gui.cycleRendererSize();
                    else
                    {
                        cgl.fullScreen();
                    }
            });

        }
        fsElement.style.padding="10px";
        fsElement.style.position="absolute";
        fsElement.style.right="5px";
        fsElement.style.top="5px";
        fsElement.style.width="20px";
        fsElement.style.height="20px";
        // fsElement.style.opacity="1.0";
        fsElement.style.cursor="pointer";
        fsElement.style['border-radius']="40px";
        fsElement.style.background="#444";
        fsElement.style["z-index"]="9999";
        fsElement.style.display="none";
        fsElement.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 490 490" style="width:20px;height:20px;" xml:space="preserve" width="512px" height="512px"><g><path d="M173.792,301.792L21.333,454.251v-80.917c0-5.891-4.776-10.667-10.667-10.667C4.776,362.667,0,367.442,0,373.333V480     c0,5.891,4.776,10.667,10.667,10.667h106.667c5.891,0,10.667-4.776,10.667-10.667s-4.776-10.667-10.667-10.667H36.416     l152.459-152.459c4.093-4.237,3.975-10.99-0.262-15.083C184.479,297.799,177.926,297.799,173.792,301.792z" fill="#FFFFFF"/><path d="M480,0H373.333c-5.891,0-10.667,4.776-10.667,10.667c0,5.891,4.776,10.667,10.667,10.667h80.917L301.792,173.792     c-4.237,4.093-4.354,10.845-0.262,15.083c4.093,4.237,10.845,4.354,15.083,0.262c0.089-0.086,0.176-0.173,0.262-0.262     L469.333,36.416v80.917c0,5.891,4.776,10.667,10.667,10.667s10.667-4.776,10.667-10.667V10.667C490.667,4.776,485.891,0,480,0z" fill="#FFFFFF"/><path d="M36.416,21.333h80.917c5.891,0,10.667-4.776,10.667-10.667C128,4.776,123.224,0,117.333,0H10.667     C4.776,0,0,4.776,0,10.667v106.667C0,123.224,4.776,128,10.667,128c5.891,0,10.667-4.776,10.667-10.667V36.416l152.459,152.459     c4.237,4.093,10.99,3.975,15.083-0.262c3.992-4.134,3.992-10.687,0-14.82L36.416,21.333z" fill="#FFFFFF"/><path d="M480,362.667c-5.891,0-10.667,4.776-10.667,10.667v80.917L316.875,301.792c-4.237-4.093-10.99-3.976-15.083,0.261     c-3.993,4.134-3.993,10.688,0,14.821l152.459,152.459h-80.917c-5.891,0-10.667,4.776-10.667,10.667s4.776,10.667,10.667,10.667     H480c5.891,0,10.667-4.776,10.667-10.667V373.333C490.667,367.442,485.891,362.667,480,362.667z" fill="#FFFFFF"/></g></svg>';

    }
    else
    {
        if(fsElement)
        {
            fsElement.style.display="none";
            fsElement.remove();
            fsElement=null;
        }
    }
}


fpsLimit.onChange=function()
{
    op.patch.config.fpsLimit=fpsLimit.get()||0;
};

op.onDelete=function()
{
    cgl.gl.clearColor(0,0,0,0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    op.patch.removeOnAnimFrame(op);
};


op.patch.loading.setOnFinishedLoading(function(cb)
{
    op.patch.config.fpsLimit=fpsLimit.get();
});



op.onAnimFrame=function(time)
{
    if(!active.get())return;
    if(cgl.aborted || cgl.canvas.clientWidth===0 || cgl.canvas.clientHeight===0)return;

    if(op.patch.loading.getProgress()<1.0 && reduceLoadingFPS.get())
    {
        op.patch.config.fpsLimit=5;
    }

    if(cgl.canvasWidth==-1)
    {
        cgl.setCanvas(op.patch.config.glCanvasId);
        return;
    }

    if(cgl.canvasWidth!=width.get() || cgl.canvasHeight!=height.get())
    {
        // cgl.canvasWidth=cgl.canvas.clientWidth;
        width.set(cgl.canvasWidth);
        // cgl.canvasHeight=cgl.canvas.clientHeight;
        height.set(cgl.canvasHeight);
    }

    if(CABLES.now()-rframeStart>1000)
    {
        CGL.fpsReport=CGL.fpsReport||[];
        if(op.patch.loading.getProgress()>=1.0 && rframeStart!==0)CGL.fpsReport.push(rframes);
        rframes=0;
        rframeStart=CABLES.now();
    }
    CGL.MESH.lastShader=null;
    CGL.MESH.lastMesh=null;

    cgl.renderStart(cgl,identTranslate,identTranslateView);

    if(clear.get())
    {
        cgl.gl.clearColor(0,0,0,1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    }

    trigger.trigger();


    if(CGL.MESH.lastMesh)CGL.MESH.lastMesh.unBind();


    if(CGL.Texture.previewTexture)
    {
        if(!CGL.Texture.texturePreviewer) CGL.Texture.texturePreviewer=new CGL.Texture.texturePreview(cgl);
        CGL.Texture.texturePreviewer.render(CGL.Texture.previewTexture);
    }
    cgl.renderEnd(cgl);
    
    
    // cgl.printError('mainloop end');
    
    

    if(!cgl.frameStore.phong)cgl.frameStore.phong={};
    rframes++;
};


};

Ops.Gl.MainLoop.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Sequence
// 
// **************************************************************

Ops.Sequence = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

var exes=[];
var triggers=[];

var triggerAll=function()
{
    for(var i=0;i<triggers.length;i++) triggers[i].trigger();
};

exe.onTriggered=triggerAll;

var num=16;

for(var i=0;i<num;i++)
{
    triggers.push( op.addOutPort(new Port(op,"trigger "+i,OP_PORT_TYPE_FUNCTION)) );
    
    if(i<num-1)
    {
        var newExe=op.addInPort(new Port(op,"exe "+i,OP_PORT_TYPE_FUNCTION));
        newExe.onTriggered=triggerAll;
        exes.push( newExe );
    }
}


};

Ops.Sequence.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Matrix.ArrayPathFollow
// 
// **************************************************************

Ops.Gl.Matrix.ArrayPathFollow = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
this.name="Array Path Follow";

var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var arrayIn=this.addInPort(new Port(this,"array",OP_PORT_TYPE_ARRAY));
var time=this.addInPort(new Port(this,"time",OP_PORT_TYPE_VALUE));

var duration=this.addInPort(new Port(this,"duration",OP_PORT_TYPE_VALUE));
duration.set(0.1);

var offset=this.addInPort(new Port(this,"offset",OP_PORT_TYPE_VALUE));
offset.set(0.0);

var lookAhead=this.addInPort(new Port(this,"look ahead",OP_PORT_TYPE_VALUE));
lookAhead.set(3.0);

var trigger=this.addOutPort(new Port(this,"trigger",OP_PORT_TYPE_FUNCTION));
var triggerLookat=this.addOutPort(new Port(this,"transform lookat",OP_PORT_TYPE_FUNCTION));
var idx=this.addOutPort(new Port(this,"index"));

var vec=vec3.create();
var vecn=vec3.create();
var cgl=this.patch.cgl;

var startTime=CABLES.now();

var animX=new CABLES.TL.Anim();
var animY=new CABLES.TL.Anim();
var animZ=new CABLES.TL.Anim();

var animQX=new CABLES.TL.Anim();
var animQY=new CABLES.TL.Anim();
var animQZ=new CABLES.TL.Anim();
var animQW=new CABLES.TL.Anim();

var animLength=0;
var timeStep=0.1;
function setup()
{
    animX.clear();
    animY.clear();
    animZ.clear();

    animQX.clear();
    animQY.clear();
    animQZ.clear();
    animQW.clear();

    var i=0;
    var arr=arrayIn.get();
    if(!arr)return;
    timeStep=parseFloat(duration.get());

    for(i=0;i<arr.length;i+=3)
    {
        animX.setValue(i/3*timeStep,arr[i+0]);
        animY.setValue(i/3*timeStep,arr[i+1]);
        animZ.setValue(i/3*timeStep,arr[i+2]);
        animLength=i/3*timeStep;
    }
    
    for(i=0;i<arr.length/3;i++)
    {
        var t = i*timeStep;
        var nt = (i*timeStep+timeStep)%animLength;
        
        vec3.set(vec, 
            animX.getValue(t),
            animY.getValue(t),
            animZ.getValue(t)
        );
        vec3.set(vecn, 
            animX.getValue(nt),
            animY.getValue(nt),
            animZ.getValue(nt)
        );
    
    // console.log( nt,animLength,vecn );
    
    
        vec3.set(vec,vecn[0]-vec[0],vecn[1]-vec[1],vecn[2]-vec[2]);
        vec3.normalize(vec,vec);
        vec3.set(vecn,0,0,1);
    
        quat.rotationTo(q,vecn,vec);
        
        
        
        
        animQX.setValue(i*timeStep,q[0]);
        animQY.setValue(i*timeStep,q[1]);
        animQZ.setValue(i*timeStep,q[2]);
        animQW.setValue(i*timeStep,q[3]);


        // t,nt);


    }

}

arrayIn.onValueChange(setup);
duration.onValueChange(setup);

var q=quat.create();
var qMat=mat4.create();

function render()
{
    if(!arrayIn.get())return;

    var t = (time.get() +parseFloat(offset.get()) )%animLength;
    var nt = (time.get()+timeStep*lookAhead.get()+parseFloat(offset.get()))%animLength;
    
    vec3.set(vec, 
        animX.getValue(t),
        animY.getValue(t),
        animZ.getValue(t)
    );
    
    idx.set(nt);

    if(triggerLookat.isLinked())
    {
        vec3.set(vecn, 
            animX.getValue(nt),
            animY.getValue(nt),
            animZ.getValue(nt)
        );

        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vecn);
        triggerLookat.trigger();
        cgl.popModelMatrix();
    }

    cgl.pushModelMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);

    CABLES.TL.Anim.slerpQuaternion(t,q,animQX,animQY,animQZ,animQW);
    mat4.fromQuat(qMat, q);
    mat4.multiply(cgl.mvMatrix,cgl.mvMatrix, qMat);

    trigger.trigger();
    cgl.popModelMatrix();

}

exe.onTriggered=render;

};

Ops.Gl.Matrix.ArrayPathFollow.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Meshes.Cone
// 
// **************************************************************

Ops.Gl.Meshes.Cone = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
// adapted from the FreeGLUT project

op.name='Cone';

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var slices=op.addInPort(new Port(op,"slices",OP_PORT_TYPE_VALUE));
var stacks=op.addInPort(new Port(op,"stacks",OP_PORT_TYPE_VALUE));
var radius=op.addInPort(new Port(op,"radius",OP_PORT_TYPE_VALUE));
var height=op.addInPort(new Port(op,"height",OP_PORT_TYPE_VALUE));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));

slices.set(32);
stacks.set(5);
radius.set(1);
height.set(2);
geomOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
var mesh=null;
var geom=null;
var i=0,j=0,idx=0,offset=0;

render.onTriggered=function()
{
    if(mesh!==null) mesh.render(cgl.getShader());
    trigger.trigger();
};

function updateMesh()
{
    var nstacks=Math.round(stacks.get());
    var nslices=Math.round(slices.get());
    if(nstacks<2)nstacks=2;
    if(nslices<2)nslices=2;
    var r=radius.get();
    generateCone(r,height.get(), nstacks, nslices);
}

stacks.onValueChanged=updateMesh;
slices.onValueChanged=updateMesh;
radius.onValueChanged=updateMesh;
height.onValueChanged=updateMesh;

updateMesh();

function circleTable(n,halfCircle)
{
    var i;
    /* Table size, the sign of n flips the circle direction */
    var size = Math.abs(n);

    /* Determine the angle between samples */
    var angle = (halfCircle?1:2)*Math.PI/n;// ( n === 0 ) ? 1 : n ;

    /* Allocate memory for n samples, plus duplicate of first entry at the end */
    var sint=[];
    var cost=[];

    /* Compute cos and sin around the circle */
    sint[0] = 0.0;
    cost[0] = 1.0;

    for (i=1; i<size; i++)
    {
        sint[i] = Math.sin(angle*i);
        cost[i] = Math.cos(angle*i);
    }
    
    if (halfCircle)
    {
        sint[size] =  0.0;  /* sin PI */
        cost[size] = -1.0;  /* cos PI */
    }
    else
    {
        /* Last sample is duplicate of the first (sin or cos of 2 PI) */
        sint[size] = sint[0];
        cost[size] = cost[0];
    }
    return {cost:cost,sint:sint};
}

function generateCone(base,height,stacks,slices)
{
    var r=base;
    var z=0;
    var geom=new CGL.Geometry();

    var table=circleTable(-slices,false);

    var zStep = height / ( ( stacks > 0 ) ? stacks : 1 );
    var rStep = base / ( ( stacks > 0 ) ? stacks : 1 );

    /* Scaling factors for vertex normals */
    var cosn = (height / Math.sqrt( height * height + base * base ));
    var sinn = (base   / Math.sqrt( height * height + base * base ));


    /* bottom */
    geom.vertices[0] =  0;
    geom.vertices[1] =  0;
    geom.vertices[2] =  z;
    geom.vertexNormals[0] =  0;
    geom.vertexNormals[1] =  0;
    geom.vertexNormals[2] = -1;
    idx = 3;
    /* other on bottom (get normals right) */
    for (j=0; j<slices; j++, idx+=3)
    {
        geom.vertices[idx  ] = table.cost[j]*r;
        geom.vertices[idx+1] = table.sint[j]*r;
        geom.vertices[idx+2] = z;
        geom.vertexNormals[idx  ] =  0;
        geom.vertexNormals[idx+1] =  0;
        geom.vertexNormals[idx+2] = -1;
    }

    /* each stack */
    for (i=0; i<stacks+1; i++ )
    {
        for (j=0; j<slices; j++, idx+=3)
        {
            geom.vertices[idx  ] = table.cost[j]*r;
            geom.vertices[idx+1] = table.sint[j]*r;
            geom.vertices[idx+2] = z;
            geom.vertexNormals[idx  ] = table.cost[j]*cosn;
            geom.vertexNormals[idx+1] = table.sint[j]*cosn;
            geom.vertexNormals[idx+2] = sinn;
        }

        z += zStep;
        r -= rStep;
    }

    /* top stack */
    for (j=0, idx=0;  j<slices;  j++, idx+=2)
    {
        geom.verticesIndices[idx  ] = 0;
        geom.verticesIndices[idx+1] = j+1;              /* 0 is top vertex, 1 is first for first stack */
    }
    geom.verticesIndices[idx  ] = 0;                    /* repeat first slice's idx for closing off shape */
    geom.verticesIndices[idx+1] = 1;
    idx+=2;

    /* middle stacks: */
    /* Strip indices are relative to first index belonging to strip, NOT relative to first vertex/normal pair in array */
    for (i=0; i<stacks; i++, idx+=2)
    {
        offset = 1+(i+1)*slices;                /* triangle_strip indices start at 1 (0 is top vertex), and we advance one stack down as we go along */
        for (j=0; j<slices; j++, idx+=2)
        {
            geom.verticesIndices[idx  ] = offset+j;
            geom.verticesIndices[idx+1] = offset+j+slices;
        }
        geom.verticesIndices[idx  ] = offset;               /* repeat first slice's idx for closing off shape */
        geom.verticesIndices[idx+1] = offset+slices;
    }

    mesh=new CGL.Mesh(cgl,geom,cgl.gl.TRIANGLE_STRIP);
    geomOut.set(geom);
}




};

Ops.Gl.Meshes.Cone.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.PointCollector
// 
// **************************************************************

Ops.Gl.PointCollector = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name="PointCollector";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var outPoints=op.addOutPort(new Port(op,"Points",OP_PORT_TYPE_ARRAY));
outPoints.ignoreValueSerialize=true;

var inAbsolute=op.inValueBool("Absolute",true);

var points=[];
var cgl=op.patch.cgl;

var oldSplinePoints=null;

var pos=vec3.create();
var empty=vec3.create();
var m=mat4.create();

var mySplinePoints=[];

render.onTriggered=function()
{
    if(cgl.frameStore.SplinePoints) 
    {
        oldSplinePoints=cgl.frameStore.SplinePoints;
        cgl.frameStore.SplinePoints=[];
    }

    cgl.frameStore.SplinePointCounter=0;
    
    cgl.frameStore.SplinePoints=mySplinePoints;//cgl.frameStore.SplinePoints||[];
    
    if(cgl.frameStore.SplinePointCounter!=cgl.frameStore.SplinePoints.length)
    cgl.frameStore.SplinePoints.length=cgl.frameStore.SplinePointCounter;

    if(!inAbsolute.get())
    {
        mat4.invert(m,cgl.mvMatrix);
        cgl.frameStore.SplinePointsInverseOriginalMatrix=m;
    } 
    else
    {
        cgl.frameStore.SplinePointsInverseOriginalMatrix=null;
    }

    trigger.trigger();

    outPoints.set(null);
    outPoints.set(cgl.frameStore.SplinePoints);

    if(oldSplinePoints) cgl.frameStore.SplinePoints=oldSplinePoints;
};


};

Ops.Gl.PointCollector.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.PointCollectorCollect
// 
// **************************************************************

Ops.Gl.PointCollectorCollect = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name="PointCollectorCollect";

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

var pos=vec3.create();
var empty=vec3.create();
var tempMat=mat4.create();

render.onTriggered=function()
{
    if(!cgl.frameStore.SplinePoints)return;

    if(cgl.frameStore.SplinePointsInverseOriginalMatrix)
    {
        mat4.multiply(tempMat,cgl.frameStore.SplinePointsInverseOriginalMatrix,cgl.mvMatrix);
        vec3.transformMat4(pos, empty, tempMat);
    }
    else    
    {
        vec3.transformMat4(pos, empty, cgl.mvMatrix);
    }

    cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+0]=pos[0];
    cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+1]=pos[1];
    cgl.frameStore.SplinePoints[cgl.frameStore.SplinePointCounter+2]=pos[2];

    cgl.frameStore.SplinePointCounter+=3;

    trigger.trigger();
};


};

Ops.Gl.PointCollectorCollect.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Matrix.CircleMovement
// 
// **************************************************************

Ops.Gl.Matrix.CircleMovement = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));

var segments=op.addInPort(new Port(op,"segments"));
var radius=op.addInPort(new Port(op,"radius"));
var mulX=op.addInPort(new Port(op,"mulX"));
var mulY=op.addInPort(new Port(op,"mulY"));
var percent=op.addInPort(new Port(op,"percent",OP_PORT_TYPE_VALUE,{display:'range'}));

var offset=op.addInPort(new Port(op,"offset"));

var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var index=op.addOutPort(new Port(op,"index"));

var outX=op.addOutPort(new Port(op,"X"));
var outY=op.addOutPort(new Port(op,"Y"));


var speed=op.inValue("speed",1);

var startTime=CABLES.now()/1000;
var cgl=op.patch.cgl;
var animX=new CABLES.TL.Anim();
var animY=new CABLES.TL.Anim();
var pos=[];
animX.loop=true;
animY.loop=true;

segments.set(40);
radius.set(1);
mulX.set(1);
mulY.set(1);

segments.onValueChanged=calc;

calc();

render.onTriggered=function()
{
    cgl.pushModelMatrix();


    var time=(CABLES.now()/1000-startTime)*speed.get()+Math.round(segments.get())*0.1*percent.get();

    var x=animX.getValue(time+offset.get())*mulX.get()*radius.get();
    var y=animY.getValue(time+offset.get())*mulY.get()*radius.get();

    outX.set(x);
    outY.set(y);

    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, [
        x,
        y,
        0] );

    trigger.trigger();

    cgl.popModelMatrix();
};

function calc()
{
    pos.length=0;
    var i=0,degInRad=0;
    animX.clear();
    animY.clear();

    for (i=0; i <= Math.round(segments.get()); i++)
    {
        index.set(i);
        degInRad = (360/Math.round(segments.get()))*i*CGL.DEG2RAD;
        animX.setValue(i*0.1,Math.cos(degInRad));
        animY.setValue(i*0.1,Math.sin(degInRad));
    }
}



};

Ops.Gl.Matrix.CircleMovement.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Array.ArrayIterator3x
// 
// **************************************************************

Ops.Array.ArrayIterator3x = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name='ArrayIterator 3x';
var exe=op.addInPort(new Port(op,"Execute",OP_PORT_TYPE_FUNCTION));
var arr=op.addInPort(new Port(op,"Array",OP_PORT_TYPE_ARRAY));

var pStep=op.inValue("Step");

var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));
var idx=op.addOutPort(new Port(op,"Index"));

var valX=op.addOutPort(new Port(op,"Value 1"));
var valY=op.addOutPort(new Port(op,"Value 2"));
var valZ=op.addOutPort(new Port(op,"Value 3"));

var ar=arr.get()||[];


arr.onChange=function()
{
    ar=arr.get()||[];  
};

var vstep=1;
pStep.onChange=changeStep;

function changeStep()
{
    vstep=pStep.get()||1;
    if(vstep<1.0)vstep=1.0;
    vstep=3*vstep;
}
changeStep();

var i=0;
var count=0;
exe.onTriggered=function()
{
    count=0;
    
    for (var i = 0, len = ar.length; i < len; i+=vstep)
    {
        idx.set(count);
        valX.set( ar[i+0] );
        valY.set( ar[i+1] );
        valZ.set( ar[i+2] );
        trigger.trigger();
        count++;
    }

};


};

Ops.Array.ArrayIterator3x.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Matrix.Transform
// 
// **************************************************************

Ops.Gl.Matrix.Transform = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
const render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
const trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));


const posX=op.addInPort(new Port(op,"posX"),0);
const posY=op.addInPort(new Port(op,"posY"),0);
const posZ=op.addInPort(new Port(op,"posZ"),0);

const scale=op.addInPort(new Port(op,"scale"));

const rotX=op.addInPort(new Port(op,"rotX"));
const rotY=op.addInPort(new Port(op,"rotY"));
const rotZ=op.addInPort(new Port(op,"rotZ"));

op.setPortGroup([rotX,rotY,rotZ]);
op.setPortGroup([posX,posY,posZ]);


var cgl=op.patch.cgl;
var vPos=vec3.create();
var vScale=vec3.create();
var transMatrix = mat4.create();
mat4.identity(transMatrix);

var doScale=false;
var doTranslate=false;

var translationChanged=true;
var scaleChanged=true;
var rotChanged=true;

scale.setUiAttribs({"divider":true});

render.onTriggered=function()
{
    var updateMatrix=false;
    if(translationChanged)
    {
        updateTranslation();
        updateMatrix=true;
    }
    if(scaleChanged)
    {
        updateScale();
        updateMatrix=true;
    }
    if(rotChanged)
    {
        updateMatrix=true;
    }
    if(updateMatrix)doUpdateMatrix();

    cgl.pushModelMatrix();
    mat4.multiply(cgl.mMatrix,cgl.mMatrix,transMatrix);

    trigger.trigger();
    cgl.popModelMatrix();
    
    if(CABLES.UI && gui.patch().isCurrentOp(op)) 
        gui.setTransformGizmo(
            {
                posX:posX,
                posY:posY,
                posZ:posZ,
            });

    
};

op.transform3d=function()
{
    return {
            pos:[posX,posY,posZ]
        };
    
};

var doUpdateMatrix=function()
{
    mat4.identity(transMatrix);
    if(doTranslate)mat4.translate(transMatrix,transMatrix, vPos);

    if(rotX.get()!==0)mat4.rotateX(transMatrix,transMatrix, rotX.get()*CGL.DEG2RAD);
    if(rotY.get()!==0)mat4.rotateY(transMatrix,transMatrix, rotY.get()*CGL.DEG2RAD);
    if(rotZ.get()!==0)mat4.rotateZ(transMatrix,transMatrix, rotZ.get()*CGL.DEG2RAD);

    if(doScale)mat4.scale(transMatrix,transMatrix, vScale);
    rotChanged=false;
};

function updateTranslation()
{
    doTranslate=false;
    if(posX.get()!==0.0 || posY.get()!==0.0 || posZ.get()!==0.0) doTranslate=true;
    vec3.set(vPos, posX.get(),posY.get(),posZ.get());
    translationChanged=false;
}

function updateScale()
{
    doScale=false;
    if(scale.get()!==0.0)doScale=true;
    vec3.set(vScale, scale.get(),scale.get(),scale.get());
    scaleChanged=false;
}

var translateChanged=function()
{
    translationChanged=true;
};

var scaleChanged=function()
{
    scaleChanged=true;
};

var rotChanged=function()
{
    rotChanged=true;
};


rotX.onChange=rotChanged;
rotY.onChange=rotChanged;
rotZ.onChange=rotChanged;

scale.onChange=scaleChanged;

posX.onChange=translateChanged;
posY.onChange=translateChanged;
posZ.onChange=translateChanged;

rotX.set(0.0);
rotY.set(0.0);
rotZ.set(0.0);

scale.set(1.0);

posX.set(0.0);
posY.set(0.0);
posZ.set(0.0);

doUpdateMatrix();



};

Ops.Gl.Matrix.Transform.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Math.Multiply
// 
// **************************************************************

Ops.Math.Multiply = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
const number1=op.addInPort(new Port(op,"number1"));
const number2=op.addInPort(new Port(op,"number2"));
const result=op.addOutPort(new Port(op,"result"));

function update()
{
    const n1=number1.get();
    const n2=number2.get();

    if(isNaN(n1))n1=0;
    if(isNaN(n2))n2=0;

    result.set( n1*n2 );
}

number1.onValueChanged=update;
number2.onValueChanged=update;

number1.set(1);
number2.set(2);


};

Ops.Math.Multiply.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Meshes.TriangleArray
// 
// **************************************************************

Ops.Gl.Meshes.TriangleArray = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name="TriangleArray";

var render=op.inFunction("Render");
var inArr=op.inArray("Points");
var next=op.outFunction("Next");
var geomOut=op.outObject("Geometry");

var geom=new CGL.Geometry("triangle array");

var mesh=null;

var cgl=op.patch.cgl;

inArr.onChange=function()
{
    var verts=inArr.get();
    geom.vertices = verts;

    mesh=new CGL.Mesh(cgl,geom);
    geomOut.set(null);
    geomOut.set(geom);
};

render.onTriggered=function()
{
    if(mesh)mesh.render(cgl.getShader());
    next.trigger();
};

};

Ops.Gl.Meshes.TriangleArray.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Performance
// 
// **************************************************************

Ops.Gl.Performance = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var exe=this.addInPort(new Port(this,"exe",OP_PORT_TYPE_FUNCTION));
var next=this.addOutPort(new Port(this,"childs",OP_PORT_TYPE_FUNCTION)) ;

var inShow=op.inValueBool("Visible",true);

var outFPS=op.outValue("FPS");
var element = document.createElement('div');
var ctx=null;
var cgl=op.patch.cgl;
var opened=false;
var frameCount=0;
var fps=0;
var fpsStartTime=0;
var childsTime=0;
var avgMsChilds=0;
var queue=[];
var queueChilds=[];
var numBars=128;
var avgMs=0;
var selfTime=0;
var canvas=null;
var lastTime=0;
var loadingCounter=0;

var loadingChars=['|','/','-','\\'];

for(var i=0;i<numBars;i++)
{
    queue[i]=-1;
    queueChilds[i]=-1;
}

element.id="performance";
element.style.position="absolute";
element.style.left="0px";
element.style.top="0px";
element.style.opacity="0.8";
element.style.padding="10px";
element.style.cursor="pointer";
element.style.background="#222";
element.style.color="white";
element.style["font-family"]="monospace";
element.style["font-size"]="11px";
element.style["z-index"]="9999";
element.innerHTML="&nbsp;";

var container = op.patch.cgl.canvas.parentElement;
container.appendChild(element);

element.addEventListener("click", toggleOpened);

op.onDelete=function()
{
    element.remove();
};

inShow.onChange=function()
{
    if(!inShow.get())element.style.opacity=0;
        else element.style.opacity=1;
    
};

function toggleOpened()
{
    element.style.opacity=1;
    opened=!opened;
    updateText();
    if(!canvas)createCanvas();
    if(opened)
    {
        canvas.style.display="block";
        element.style.left=numBars+"px";
        element.style["min-height"]="56px";
    }
    else 
    {
        canvas.style.display="none";
        element.style.left="0px";
        element.style["min-height"]="auto";
    }
}

function updateCanvas()
{
    ctx.fillStyle="#222222";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle="#555555";
    var k=0;
    for(k=numBars;k>=0;k--)
    {
        if(queue[k]>30)ctx.fillStyle="#ff5555";
        ctx.fillRect(numBars-k,canvas.height-queue[k]*2.5,1,queue[k]*2.5);
        if(queue[k]>30)ctx.fillStyle="#555555";
    }

    ctx.fillStyle="#aaaaaa";
    for(k=numBars;k>=0;k--)
    {
        if(queueChilds[k]>30)ctx.fillStyle="#ff00ff";
        ctx.fillRect(numBars-k,canvas.height-queueChilds[k]*2.5,1,queueChilds[k]*2.5);
        if(queueChilds[k]>30)ctx.fillStyle="#aaaaaa";
    }

}

function createCanvas()
{
    canvas = document.createElement('canvas');
    canvas.id     = "performance_"+op.patch.config.glCanvasId;
    canvas.width  = numBars;
    canvas.height = "128";
    canvas.style.display   = "block";
    canvas.style.opacity   = 0.9;
    canvas.style.position  = "absolute";
    canvas.style.left  = "0px";
    canvas.style.cursor  = "pointer";
    canvas.style.top  = "-64px";
    canvas.style['z-index']   = "9998";
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    canvas.addEventListener("click", toggleOpened);
    
}

function updateText()
{

    var warn="";
    if(CGL.profileShaderCompiles>0)warn+='Shader compile ('+CGL.profileShaderCompileName+') ';
    if(CGL.profileShaderGetUniform>0)warn+='Shader get uni loc! ('+CGL.profileShaderGetUniformName+')';
    if(CGL.profileTextureResize>0)warn+='Texture resize! ';
    if(CGL.profileFrameBuffercreate>0)warn+='Framebuffer create! ';
    if(CGL.profileEffectBuffercreate>0)warn+='Effectbuffer create! ';
    if(CGL.profileTextureDelete>0)warn+='Texture delete! ';

    if(CGL.profileNonTypedAttrib>0)warn+='Not-Typed Buffer Attrib! '+CGL.profileNonTypedAttribNames;
    
    //     CGL.profileNonTypedAttrib=0;
    // CGL.profileNonTypedAttribNames="";

    // if(warn && warn.length>0)console.warn(warn);
    
    if(warn.length>0)
    {
        warn='| <span style="color:#f80;">WARNING: '+warn+'<span>';
    }

    element.innerHTML=fps+" fps | "+Math.round(childsTime*100)/100+"ms "+warn;
    if(op.patch.loading.getProgress()!=1.0)
    {
        element.innerHTML+="<br/>loading "+op.patch.loading.getProgress()+' '+loadingChars[ (++loadingCounter)%loadingChars.length ];
    }
    
    if(opened)
    {
        var count=0;
        avgMs=0;
        avgMsChilds=0;
        for(var i=queue.length;i>queue.length-queue.length/3;i--)
        {
            if(queue[i]>-1)
            {
                avgMs+=queue[i];
                count++;
            }

            if(queueChilds[i]>-1)
            {
                avgMsChilds+=queueChilds[i];
            }
        }
        
        avgMs/=count;
        avgMsChilds/=count;

        element.innerHTML+='<br/> '+cgl.canvasWidth+' x '+cgl.canvasHeight+' (x'+cgl.pixelDensity+') ';
        element.innerHTML+='<br/>frame avg: '+Math.round(avgMsChilds*100)/100+' ms ('+Math.round(avgMsChilds/avgMs*100)+'%) / '+Math.round(avgMs*100)/100+' ms';
        element.innerHTML+=' (self: '+Math.round((selfTime)*100)/100+' ms) ';
        
        element.innerHTML+='<br/>shader binds: '+Math.ceil(CGL.profileShaderBinds/fps)+
            ' uniforms: '+Math.ceil(CGL.profileUniformCount/fps)+
            ' mvp_uni_mat4: '+Math.ceil(CGL.profileMVPMatrixCount/fps)+
                

            ' mesh.setGeom: '+CGL.profileMeshSetGeom+
            ' videos: '+CGL.profileVideosPlaying;
        
    }


    CGL.profileUniformCount=0;
    CGL.profileShaderGetUniform=0;
    CGL.profileShaderCompiles=0;
    CGL.profileShaderBinds=0;
    CGL.profileTextureResize=0;
    CGL.profileFrameBuffercreate=0;
    CGL.profileEffectBuffercreate=0;
    CGL.profileTextureDelete=0;
    CGL.profileMeshSetGeom=0;
    CGL.profileVideosPlaying=0;
    CGL.profileMVPMatrixCount=0;

    CGL.profileNonTypedAttrib=0;
    CGL.profileNonTypedAttribNames="";

}


exe.onTriggered=function()
{
    var selfTimeStart=performance.now();
    frameCount++;

    if(fpsStartTime===0)fpsStartTime=Date.now();
    if(Date.now()-fpsStartTime>=1000)
    {
        fps=frameCount;
        frameCount=0;
        frames=0;
        outFPS.set(fps);
        updateText();
        
        fpsStartTime=Date.now();
    }
   
    if(opened)
    {
        var timeUsed=performance.now()-lastTime;
        // if(timeUsed>30)console.log("peak ",performance.now()-lastTime);
        queue.push(timeUsed);
        queue.shift();
    
        queueChilds.push(childsTime);
        queueChilds.shift();

        updateCanvas();
    }
    
    lastTime=performance.now();
    selfTime=performance.now()-selfTimeStart;
    var startTimeChilds=performance.now();

    next.trigger();

    childsTime=performance.now()-startTimeChilds;
    
};


op.onDelete=function()
{
  if(canvas)canvas.remove();
  if(element)element.remove();
};

};

Ops.Gl.Performance.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Value.Value
// 
// **************************************************************

Ops.Value.Value = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};


var v=op.addInPort(new Port(op,"value",OP_PORT_TYPE_VALUE));
var result=op.addOutPort(new Port(op,"result"));

var exec=function()
{
    result.set(parseFloat(v.get()));
};

v.onValueChanged=exec;


};

Ops.Value.Value.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Shader.BasicMaterial
// 
// **************************************************************

Ops.Gl.Shader.BasicMaterial = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
attachments["shader_frag"]="{{MODULES_HEAD}}\n\nIN vec2 texCoord;\n#ifdef HAS_TEXTURES\n    IN vec2 texCoordOrig;\n    #ifdef HAS_TEXTURE_DIFFUSE\n        uniform sampler2D tex;\n    #endif\n    #ifdef HAS_TEXTURE_OPACITY\n        uniform sampler2D texOpacity;\n   #endif\n#endif\nuniform float r;\nuniform float g;\nuniform float b;\nuniform float a;\n\nvoid main()\n{\n    {{MODULE_BEGIN_FRAG}}\n    vec4 col=vec4(r,g,b,a);\n    \n    #ifdef HAS_TEXTURES\n        #ifdef HAS_TEXTURE_DIFFUSE\n\n           col=texture2D(tex,vec2(texCoord.x,(1.0-texCoord.y)));\n\n//         col=texture2D(tex,vec2(texCoords.x*1.0,(1.0-texCoords.y)*1.0));\n           #ifdef COLORIZE_TEXTURE\n               col.r*=r;\n               col.g*=g;\n               col.b*=b;\n           #endif\n    #endif\n    col.a*=a;\n    #ifdef HAS_TEXTURE_OPACITY\n      \n            #ifdef TRANSFORMALPHATEXCOORDS\n                col.a*=texture2D(texOpacity,vec2(texCoordOrig.s,1.0-texCoordOrig.t)).g;\n            #endif\n            #ifndef TRANSFORMALPHATEXCOORDS\n                col.a*=texture2D(texOpacity,vec2(texCoord.s,1.0-texCoord.t)).g;\n            #endif\n       #endif\n       \n    #endif\n\n    {{MODULE_COLOR}}\n\n    outColor = col;\n}\n";
attachments["shader_vert"]="{{MODULES_HEAD}}\n\nIN vec3 vPosition;\nIN vec3 attrVertNormal;\nIN vec2 attrTexCoord;\n\nOUT vec3 norm;\nOUT vec2 texCoord;\nOUT vec2 texCoordOrig;\n\nUNI mat4 projMatrix;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\n\n#ifdef HAS_TEXTURES\n    #ifdef TEXTURE_REPEAT\n        UNI float diffuseRepeatX;\n        UNI float diffuseRepeatY;\n        UNI float texOffsetX;\n        UNI float texOffsetY;\n    #endif\n#endif\n\n\nvoid main()\n{\n    mat4 mMatrix=modelMatrix;\n    mat4 mvMatrix;\n    \n    texCoordOrig=attrTexCoord;\n    texCoord=attrTexCoord;\n    #ifdef HAS_TEXTURES\n        #ifdef TEXTURE_REPEAT\n            texCoord.x=texCoord.x*diffuseRepeatX+texOffsetX;\n            texCoord.y=texCoord.y*diffuseRepeatY+texOffsetY;\n        #endif\n    #endif\n\n    vec4 pos = vec4( vPosition, 1. );\n\n\n    #ifdef BILLBOARD\n       vec3 position=vPosition;\n       mvMatrix=viewMatrix*modelMatrix;\n\n       gl_Position = projMatrix * mvMatrix * vec4((\n           position.x * vec3(\n               mvMatrix[0][0],\n               mvMatrix[1][0],\n               mvMatrix[2][0] ) +\n           position.y * vec3(\n               mvMatrix[0][1],\n               mvMatrix[1][1],\n               mvMatrix[2][1]) ), 1.0);\n    #endif\n\n    {{MODULE_VERTEX_POSITION}}\n\n    #ifndef BILLBOARD\n        mvMatrix=viewMatrix * mMatrix;\n    #endif\n\n\n    #ifndef BILLBOARD\n        // gl_Position = projMatrix * viewMatrix * modelMatrix * pos;\n        gl_Position = projMatrix * mvMatrix * pos;\n    #endif\n}\n";
const render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );
const trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
const shaderOut=op.addOutPort(new Port(op,"shader",OP_PORT_TYPE_OBJECT));
shaderOut.ignoreValueSerialize=true;

const cgl=op.patch.cgl;


var shader=new CGL.Shader(cgl,'BasicMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);
shader.bindTextures=bindTextures;
shader.setSource(attachments.shader_vert,attachments.shader_frag);
shaderOut.set(shader);

render.onTriggered=doRender;




function bindTextures()
{
    if(diffuseTexture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, diffuseTexture.get().tex);
    }

    if(op.textureOpacity.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, op.textureOpacity.get().tex);
    }
}

op.preRender=function()
{
    shader.bind();
    doRender();
};

function doRender()
{
    if(!shader)return;

    cgl.setShader(shader);
    shader.bindTextures();

    trigger.trigger();

    cgl.setPreviousShader();
}


{
    // rgba colors
    
    var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
    r.set(Math.random());
    r.uniform=new CGL.Uniform(shader,'f','r',r);
    
    var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range'}));
    g.set(Math.random());
    g.uniform=new CGL.Uniform(shader,'f','g',g);
    
    var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
    b.set(Math.random());
    b.uniform=new CGL.Uniform(shader,'f','b',b);
    
    var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range'}));
    a.uniform=new CGL.Uniform(shader,'f','a',a);
    a.set(1.0);
    
}

{
    // diffuse outTexture
    
    var diffuseTexture=this.addInPort(new Port(this,"texture",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
    var diffuseTextureUniform=null;
    shader.bindTextures=bindTextures;
    
    diffuseTexture.onChange=function()
    {
        if(diffuseTexture.get())
        {
            // if(diffuseTextureUniform!==null)return;
            // shader.addveUniform('texDiffuse');
            if(!shader.hasDefine('HAS_TEXTURE_DIFFUSE'))shader.define('HAS_TEXTURE_DIFFUSE');
            if(!diffuseTextureUniform)diffuseTextureUniform=new CGL.Uniform(shader,'t','texDiffuse',0);
            updateTexRepeat();
        }
        else
        {
            shader.removeUniform('texDiffuse');
            shader.removeDefine('HAS_TEXTURE_DIFFUSE');
            diffuseTextureUniform=null;
        }
    };
    
}

{
    // opacity texture 
    op.textureOpacity=op.addInPort(new Port(op,"textureOpacity",OP_PORT_TYPE_TEXTURE,{preview:true,display:'createOpHelper'}));
    op.textureOpacityUniform=null;
    
    op.textureOpacity.onChange=function()
    {
        if(op.textureOpacity.get())
        {
            if(op.textureOpacityUniform!==null)return;
            shader.removeUniform('texOpacity');
            shader.define('HAS_TEXTURE_OPACITY');
            if(!op.textureOpacityUniform)op.textureOpacityUniform=new CGL.Uniform(shader,'t','texOpacity',1);
        }
        else
        {
            shader.removeUniform('texOpacity');
            shader.removeDefine('HAS_TEXTURE_OPACITY');
            op.textureOpacityUniform=null;
        }
    };
    
}

op.colorizeTexture=op.addInPort(new Port(op,"colorizeTexture",OP_PORT_TYPE_VALUE,{ display:'bool' }));
op.colorizeTexture.set(false);
op.colorizeTexture.onChange=function()
{
    if(op.colorizeTexture.get()) shader.define('COLORIZE_TEXTURE');
        else shader.removeDefine('COLORIZE_TEXTURE');
};


op.doBillboard=op.addInPort(new Port(op,"billboard",OP_PORT_TYPE_VALUE,{ display:'bool' }));
op.doBillboard.set(false);
op.doBillboard.onChange=function()
{
    if(op.doBillboard.get()) shader.define('BILLBOARD');
        else shader.removeDefine('BILLBOARD');
};

var texCoordAlpha=op.inValueBool("Opacity TexCoords Transform",false);

texCoordAlpha.onChange=function()
{
    if(texCoordAlpha.get()) shader.define('TRANSFORMALPHATEXCOORDS');
        else shader.removeDefine('TRANSFORMALPHATEXCOORDS');
    
};

var preMultipliedAlpha=op.addInPort(new Port(op,"preMultiplied alpha",OP_PORT_TYPE_VALUE,{ display:'bool' }));

function updateTexRepeat()
{
    if(!diffuseRepeatXUniform)
    {
        diffuseRepeatXUniform=new CGL.Uniform(shader,'f','diffuseRepeatX',diffuseRepeatX);
        diffuseRepeatYUniform=new CGL.Uniform(shader,'f','diffuseRepeatY',diffuseRepeatY);
        diffuseOffsetXUniform=new CGL.Uniform(shader,'f','texOffsetX',diffuseOffsetX);
        diffuseOffsetYUniform=new CGL.Uniform(shader,'f','texOffsetY',diffuseOffsetY);
    }

    diffuseRepeatXUniform.setValue(diffuseRepeatX.get());
    diffuseRepeatYUniform.setValue(diffuseRepeatY.get());
    diffuseOffsetXUniform.setValue(diffuseOffsetX.get());
    diffuseOffsetYUniform.setValue(diffuseOffsetY.get());
}


{
    // texture coords
    
    var diffuseRepeatX=op.addInPort(new Port(op,"diffuseRepeatX",OP_PORT_TYPE_VALUE));
    var diffuseRepeatY=op.addInPort(new Port(op,"diffuseRepeatY",OP_PORT_TYPE_VALUE));
    var diffuseOffsetX=op.addInPort(new Port(op,"Tex Offset X",OP_PORT_TYPE_VALUE));
    var diffuseOffsetY=op.addInPort(new Port(op,"Tex Offset Y",OP_PORT_TYPE_VALUE));
    
    diffuseRepeatX.onChange=updateTexRepeat;
    diffuseRepeatY.onChange=updateTexRepeat;
    diffuseOffsetY.onChange=updateTexRepeat;
    diffuseOffsetX.onChange=updateTexRepeat;
    
    var diffuseRepeatXUniform=null;
    var diffuseRepeatYUniform=null;
    var diffuseOffsetXUniform=null;
    var diffuseOffsetYUniform=null;
    
    shader.define('TEXTURE_REPEAT');
    

    diffuseOffsetX.set(0);
    diffuseOffsetY.set(0);
    diffuseRepeatX.set(1);
    diffuseRepeatY.set(1);
}


};

Ops.Gl.Shader.BasicMaterial.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Meshes.SimpleSpline
// 
// **************************************************************

Ops.Gl.Meshes.SimpleSpline = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var render=op.inFunction("Render");

var inPoints=op.inArray("Points");
var strip=op.inValueBool("Line Strip",true);
var numPoints=op.inValue("Num Points");

var next=op.outFunction("Next");

var cgl=op.patch.cgl;

var geom=new CGL.Geometry("simplespline");
geom.vertices=[0,0,0,0,0,0,0,0,0];
var mesh=new CGL.Mesh(cgl,geom);
var buff=new Float32Array();

render.onTriggered=function()
{
    var points=inPoints.get();

    if(!points)return;
    if(points.length===0)return;
    if(op.instanced(render))return;

    if(!(points instanceof Float32Array))
    {
        if(points.length!=buff.length)
        {
            buff=new Float32Array(points.length);
            buff.set(points);
        }
        else
        {
            buff.set(points);
        }
    }
    else
    {
        buff=points;
    }
    
    var shader=cgl.getShader();
    if(!shader)return;

    var oldPrim=shader.glPrimitive;
    if(strip.get())shader.glPrimitive=cgl.gl.LINE_STRIP;
        else shader.glPrimitive=cgl.gl.LINES;
    var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,buff,3);

    
    var numTc=(points.length/3)*2;
    if(mesh.getAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD).numItems!=numTc/2)
    {
        var bufTexCoord=new Float32Array(numTc);
        var attrTc=mesh.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD,bufTexCoord,2);
    }
    
    
    if(numPoints.get()<=0)attr.numItems=buff.length/3;
        else attr.numItems=Math.min(numPoints.get(),buff.length/3);





    mesh.render(shader);
    
    // mesh.printDebug();
    
    shader.glPrimitive=oldPrim;
    
    
    next.trigger();
    
};

};

Ops.Gl.Meshes.SimpleSpline.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Array.ArrayGetValue3x
// 
// **************************************************************

Ops.Array.ArrayGetValue3x = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name="ArrayGetValue3x";

var pArr=op.inArray("Array");
// var pIndex=op.inValue("Index");
var pIndex=op.inValueInt("Index");

var outX=op.outValue("X");
var outY=op.outValue("Y");
var outZ=op.outValue("Z");


pArr.onChange=update;
pIndex.onChange=update;

function update()
{
    var arr=pArr.get();
    if(!arr)
    {
        outX.set(0);
        outY.set(0);
        outZ.set(0);
        return;
    }
    var ind=Math.min(arr.length-3,pIndex.get()*3);
    if(arr)
    {
        outX.set(arr[ind+0]);
        outY.set(arr[ind+1]);
        outZ.set(arr[ind+2]);
    }
}

};

Ops.Array.ArrayGetValue3x.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Math.Sum
// 
// **************************************************************

Ops.Math.Sum = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var result=op.addOutPort(new Port(op,"result"));
var number1=op.inValue("number1");
var number2=op.inValue("number2");

function exec()
{
    var v=parseFloat(number1.get())+parseFloat(number2.get());
    if(!isNaN(v)) result.set( v );
}

number1.onValueChanged=exec;
number2.onValueChanged=exec;

number1.set(1);
number2.set(1);


};

Ops.Math.Sum.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Anim.Timer2
// 
// **************************************************************

Ops.Anim.Timer2 = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
const playPause=op.inValueBool("Play",true);
const reset=op.inFunctionButton("Reset");
const outTime=op.outValue("Time");
const inSpeed=op.inValue("Speed",1);

let timer=new CABLES.Timer();
let lastTime=0;
let time=0;

playPause.onChange=setState;
setState();

function setState()
{
    if(playPause.get())
    {
        timer.play();
        op.patch.addOnAnimFrame(op);
    }
    else
    {
        timer.pause();
        op.patch.removeOnAnimFrame(op);
    }
}

reset.onTriggered=function()
{
    time=0;
    lastTime=0;
    timer.setTime(0);
    outTime.set(0);
};

op.onAnimFrame=function()
{
    if(timer.isPlaying())
    {
        timer.update();
        if(lastTime===0)
        {
            lastTime=timer.get();
            return;
        }

        const t=timer.get()-lastTime;
        lastTime=timer.get();
        time+=t*inSpeed.get();
        if(time!=time)time=0;
        outTime.set(time);
    }
};


};

Ops.Anim.Timer2.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Math.Sine
// 
// **************************************************************

Ops.Math.Sine = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
// input
var value = op.inValue('value');

var phase = op.inValue('phase', 0.0);
var mul = op.inValue('frequency', 1.0);
var amplitude = op.inValue('amplitude', 1.0);
var invert = op.inValueBool("asine", false);

// output
var result = op.outValue('result');

var calculate = Math.sin;

value.onValueChanged = function()
{
    result.set(
        amplitude.get() * calculate( ( value.get()*mul.get() ) + phase.get() )
    );
};

invert.onChange = function()
{
    if(invert.get()) calculate = Math.asin;
    else calculate = Math.sin;
}


};

Ops.Math.Sine.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Meshes.SplineMesh
// 
// **************************************************************

Ops.Gl.Meshes.SplineMesh = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var render=op.addInPort(new Port(op,"Render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"Next",OP_PORT_TYPE_FUNCTION));
var thick=op.inValue("Thickness");
var inStart=op.inValueSlider("Start");
var inLength=op.inValueSlider("Length",1);
var calcNormals=op.inValueBool("Calculate Normals",false);
var inStrip=op.inValueBool("Line Strip",true);
var inPoints=op.inArray('points');
var inNumPoints=op.inValue("Num Points",0);

var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));

geomOut.ignoreValueSerialize=true;

var geom=new CGL.Geometry("splinemesh");
var cgl=op.patch.cgl;

var draw=false;
var mesh=null;
var geom=null;
var needsBuild=true;

inPoints.onChange=rebuild;
thick.onChange=rebuild;
inNumPoints.onChange=rebuild;
inStrip.onChange=rebuild;
calcNormals.onChange=rebuild;
var numItems=0;

render.onTriggered=function()
{
    if(needsBuild)doRebuild();
    if(inLength.get()===0 || inStart.get()==1.0)return;

    // console.log('draw',draw);

    if(mesh && draw)
    {


        mesh._bufVertexAttrib.startItem=Math.floor(
            inStart.get()*(numItems/3))*3;
        mesh._bufVertexAttrib.numItems=
            Math.floor(
                Math.min(1,inLength.get()+inStart.get()) * (numItems)
            );

        mesh.render(cgl.getShader());

    }
    trigger.trigger();
};

function rebuild()
{
    needsBuild=true;
}

var vecRot=vec3.create();
var vecA=vec3.create();
var vecB=vec3.create();
var vecC=vec3.create();
var vecD=vec3.create();
var vStart=vec3.create();
var vEnd=vec3.create();
var q=quat.create();
var vecRotation=vec3.create();
vec3.set(vecRotation, 1,0,0);
var vecX=[1,0,0];
var vv=vec3.create();

var index=0;

function linesToGeom(points,options)
{
    if(!geom)
        geom=new CGL.Geometry();

    var i=0;

    points=points||[];

    if(points.length===0)
    {
        for(i=0;i<8;i++)
        {
            points.push(Math.random()*2-1);
            points.push(Math.random()*2-1);
            points.push(0);
        }
    }

    var numPoints=points.length;
    if(inNumPoints.get()!=0 &&
        inNumPoints.get()*3<points.length)numPoints=(inNumPoints.get()-1)*3;

    if(numPoints<2)
    {
        draw=false;
        return;
    }

    // console.log(numPoints);

    var count=0;
    var lastPA=null;
    var lastPB=null;

    if((numPoints/3)*18 > geom.vertices.length )
    {
        geom.vertices=new Float32Array( (numPoints/3*18 ) );
        geom.texCoords=new Float32Array( (numPoints/3*12) );
        // console.log('resize');
    }

    index=0;

    var indexTc=0;
    var lastC=null;
    var lastD=null;

    var m=(thick.get()||0.1)/2;
    var ppl=p/numPoints;

    var pi2=Math.PI/4;

    var strip=inStrip.get();

    var it=3;
    if(!strip)it=6;
    var vv=vec3.create();

    for(var p=0;p<numPoints;p+=it)
    {
        vec3.set(vStart,
            points[p+0],
            points[p+1],
            points[p+2]);

        vec3.set(vEnd,
            points[p+3],
            points[p+4],
            points[p+5]);

        vv[0]=vStart[0]-vEnd[0];
        vv[1]=vStart[1]-vEnd[1];
        vv[2]=vStart[2]-vEnd[2];

        vec3.normalize(vv,vv);
        quat.rotationTo(q,vecX,vv);
        quat.rotateZ(q, q, pi2);
        vec3.transformQuat(vecRot,vecRotation,q);

        if(strip)
        {
            if(lastC)
            {
                vec3.copy(vecA,lastC);
                vec3.copy(vecB,lastD);
            }
            else
            {
                vec3.set(vecA,
                    points[p+0]+vecRot[0]*m,
                    points[p+1]+vecRot[1]*m,
                    points[p+2]+vecRot[2]*m);

                vec3.set(vecB,
                    points[p+0]+vecRot[0]*-m,
                    points[p+1]+vecRot[1]*-m,
                    points[p+2]+vecRot[2]*-m);
            }
        }
        else
        {
            vec3.set(vecA,
                points[p+0]+vecRot[0]*m,
                points[p+1]+vecRot[1]*m,
                points[p+2]+vecRot[2]*m);

            vec3.set(vecB,
                points[p+0]+vecRot[0]*-m,
                points[p+1]+vecRot[1]*-m,
                points[p+2]+vecRot[2]*-m);
        }

        vec3.set(vecC,
            points[p+3]+vecRot[0]*m,
            points[p+4]+vecRot[1]*m,
            points[p+5]+vecRot[2]*m);

        vec3.set(vecD,
            points[p+3]+vecRot[0]*-m,
            points[p+4]+vecRot[1]*-m,
            points[p+5]+vecRot[2]*-m);


//    A-----C
//    |     |
//    B-----D
//
// var xd = vecC[0]-vecA[0];
// var yd = vecC[1]-vecA[1];
// var zd = vecC[2]-vecA[2];
// var dist = 3*Math.sqrt(xd*xd + yd*yd + zd*zd);

var repx0=0;
var repy0=0;
var repx=1;
var repy=1;

repx0=p/(numPoints);
repx=repx0+1/(numPoints/3);



        // a
        geom.vertices[index++]=vecA[0];
        geom.vertices[index++]=vecA[1];
        geom.vertices[index++]=vecA[2];

        geom.texCoords[indexTc++]=repx;
        geom.texCoords[indexTc++]=repy0;

        // b
        geom.vertices[index++]=vecB[0];
        geom.vertices[index++]=vecB[1];
        geom.vertices[index++]=vecB[2];

        geom.texCoords[indexTc++]=repx;
        geom.texCoords[indexTc++]=repy;

        // c
        geom.vertices[index++]=vecC[0];
        geom.vertices[index++]=vecC[1];
        geom.vertices[index++]=vecC[2];

        geom.texCoords[indexTc++]=repx0;
        geom.texCoords[indexTc++]=repy0;

        // d
        geom.vertices[index++]=vecD[0];
        geom.vertices[index++]=vecD[1];
        geom.vertices[index++]=vecD[2];

        geom.texCoords[indexTc++]=repx0;
        geom.texCoords[indexTc++]=repy;

        // c
        geom.vertices[index++]=vecC[0];
        geom.vertices[index++]=vecC[1];
        geom.vertices[index++]=vecC[2];

        geom.texCoords[indexTc++]=repx0;
        geom.texCoords[indexTc++]=repy0;

        // b
        geom.vertices[index++]=vecB[0];
        geom.vertices[index++]=vecB[1];
        geom.vertices[index++]=vecB[2];

        geom.texCoords[indexTc++]=repx;
        geom.texCoords[indexTc++]=repy;

        if(!lastC)
        {
            lastC=vec3.create();
            lastD=vec3.create();
        }

        if(strip)
        {
            lastC[0]=vecC[0];
            lastC[1]=vecC[1];
            lastC[2]=vecC[2];

            lastD[0]=vecD[0];
            lastD[1]=vecD[1];
            lastD[2]=vecD[2];
        }
    }
}

function doRebuild()
{
    draw=true;
    var points=inPoints.get()||[];
    if(!points.length)return;

    linesToGeom(points);

    if(!mesh)
        mesh=new CGL.Mesh(cgl,geom);

    geomOut.set(null);
    geomOut.set(geom);

    if(!draw)
        return;

    // mesh.addVertexNumbers=true;

    numItems=index/3;

    var attr=mesh.setAttribute(CGL.SHADERVAR_VERTEX_POSITION,geom.vertices,3);
    attr.numItems=numItems;

    var attr2=mesh.setAttribute(CGL.SHADERVAR_VERTEX_TEXCOORD,geom.texCoords,2);
    attr2.numItems=numItems;

    // console.log(numItems);

    // mesh._setVertexNumbers();

    if(calcNormals.get())geom.calculateNormals({forceZUp:true});

    needsBuild=false;
}


};

Ops.Gl.Meshes.SplineMesh.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.MeshInstancer
// 
// **************************************************************

Ops.Gl.MeshInstancer = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
// TODO: remove array3xtransformedinstanced....

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

var inTransformations=op.inArray("positions");
var inScales=op.inArray("Scale Array");
var inScale=op.inValue("Scale",1);
var geom=op.inObject("geom");
geom.ignoreValueSerialize=true;

var mod=null;
var mesh=null;
var shader=null;
var uniDoInstancing=null;
var recalc=true;
var cgl=op.patch.cgl;

exe.onTriggered=doRender;
exe.onLinkChanged=removeModule;

var matrixArray= new Float32Array(1);
var m=mat4.create();
inTransformations.onChange=reset;
inScales.onChange=reset;


var srcHeadVert=''
    .endl()+'UNI float do_instancing;'
    .endl()+'UNI float MOD_scale;'
    
    .endl()+'#ifdef INSTANCING'
    .endl()+'   IN mat4 instMat;'
    .endl()+'   OUT mat4 instModelMat;'
    .endl()+'#endif';

var srcBodyVert=''
    .endl()+'#ifdef INSTANCING'
    .endl()+'   if(do_instancing==1.0)'
    .endl()+'   {'
    .endl()+'       mMatrix*=instMat;'
    .endl()+'       mMatrix[0][0]*=MOD_scale;'
    .endl()+'       mMatrix[1][1]*=MOD_scale;'
    .endl()+'       mMatrix[2][2]*=MOD_scale;'
    .endl()+'   }'
    .endl()+'#endif'
    .endl();



geom.onChange=function()
{
    if(!geom.get())
    {
        mesh=null;
        return;
    }
    mesh=new CGL.Mesh(cgl,geom.get());
    reset();
};

function removeModule()
{
    if(shader && mod)
    {
        shader.removeDefine('INSTANCING');
        shader.removeModule(mod);
        shader=null;
    }
}

function reset()
{
    recalc=true;
}

function setupArray()
{
    if(!mesh)return;
    
    var transforms=inTransformations.get();
    if(!transforms)
    {
        transforms=[0,0,0];
    }
    var num=Math.floor(transforms.length/3);
    
    
    var scales=inScales.get();
    // console.log('scales',scales);
    // console.log('setup array!');

    if(matrixArray.length!=num*16)
    {
        matrixArray=new Float32Array(num*16);
    }

    for(var i=0;i<num;i++)
    {
        mat4.identity(m);
        mat4.translate(m,m,
            [
                transforms[i*3],
                transforms[i*3+1],
                transforms[i*3+2]
            ]);
        
        if(scales && scales.length>i)
        {
            mat4.scale(m,m,[scales[i],scales[i],scales[i]]);
            // console.log('scale',scales[i]);
        }
        else
        {
            mat4.scale(m,m,[1,1,1]);
        }

        for(var a=0;a<16;a++)
        {
            matrixArray[i*16+a]=m[a];
        }
    }

    mesh.numInstances=num;
    mesh.addAttribute('instMat',matrixArray,16);
    recalc=false;
}

function doRender()
{
    if(recalc)setupArray();
    if(matrixArray.length<=1)return;
    if(!mesh) return;

    if(cgl.getShader() && cgl.getShader()!=shader)
    {
        if(shader && mod)
        {
            shader.removeModule(mod);
            shader=null;
        }

        shader=cgl.getShader();
        if(!shader.hasDefine('INSTANCING'))
        {
            mod=shader.addModule(
                {
                    name: 'MODULE_VERTEX_POSITION',
                    priority:-2,
                    srcHeadVert: srcHeadVert,
                    srcBodyVert: srcBodyVert
                });

            shader.define('INSTANCING');
            uniDoInstancing=new CGL.Uniform(shader,'f','do_instancing',0);
            inScale.uniform=new CGL.Uniform(shader,'f',mod.prefix+'scale',inScale);
        }
        else
        {
            uniDoInstancing=shader.getUniform('do_instancing');
        }
    }

    uniDoInstancing.setValue(1);
    mesh.render(shader);
    uniDoInstancing.setValue(0);


}


};

Ops.Gl.MeshInstancer.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Meshes.Cube
// 
// **************************************************************

Ops.Gl.Meshes.Cube = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name='Cube';

var render=op.inFunction('render');
var width=op.inValue('width');
var height=op.inValue('height');
var lengt=op.inValue('length');
var center=op.inValueBool('center');

var active=op.inValueBool('Active',true);

var trigger=op.outFunction('trigger');
var geomOut=op.outObject("geometry");


var cgl=op.patch.cgl;
var geom=null;
var mesh=null;
width.set(1.0);
height.set(1.0);
lengt.set(1.0);
center.set(true);

render.onTriggered=function()
{
    if(active.get() && mesh) mesh.render(cgl.getShader());
    trigger.trigger();
};

op.preRender=function()
{
    buildMesh();
    mesh.render(cgl.getShader());
};


function buildMesh()
{
    if(!geom)geom=new CGL.Geometry("cubemesh");
    geom.clear();

    var x=width.get();
    var nx=-1*width.get();
    var y=lengt.get();
    var ny=-1*lengt.get();
    var z=height.get();
    var nz=-1*height.get();

    if(!center.get())
    {
        nx=0;
        ny=0;
        nz=0;
    }
    else
    {
        x*=0.5;
        nx*=0.5;
        y*=0.5;
        ny*=0.5;
        z*=0.5;
        nz*=0.5;
    }

    geom.vertices = [
        // Front face
        nx, ny,  z,
        x, ny,  z,
        x,  y,  z,
        nx,  y,  z,
        // Back face
        nx, ny, nz,
        nx,  y, nz,
        x,  y, nz,
        x, ny, nz,
        // Top face
        nx,  y, nz,
        nx,  y,  z,
        x,  y,  z,
        x,  y, nz,
        // Bottom face
        nx, ny, nz,
        x, ny, nz,
        x, ny,  z,
        nx, ny,  z,
        // Right face
        x, ny, nz,
        x,  y, nz,
        x,  y,  z,
        x, ny,  z,
        // zeft face
        nx, ny, nz,
        nx, ny,  z,
        nx,  y,  z,
        nx,  y, nz
        ];

    geom.setTexCoords( [
          // Front face
          0.0, 1.0,
          1.0, 1.0,
          1.0, 0.0,
          0.0, 0.0,
          // Back face
          1.0, 1.0,
          1.0, 0.0,
          0.0, 0.0,
          0.0, 1.0,
          // Top face
          0.0, 0.0,
          0.0, 1.0,
          1.0, 1.0,
          1.0, 0.0,
          // Bottom face
          1.0, 0.0,
          0.0, 0.0,
          0.0, 1.0,
          1.0, 1.0,
          // Right face
          1.0, 1.0,
          1.0, 0.0,
          0.0, 0.0,
          0.0, 1.0,
          // Left face
          0.0, 1.0,
          1.0, 1.0,
          1.0, 0.0,
          0.0, 0.0,
        ]);

    geom.vertexNormals = [
        // Front face
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,
         0.0,  0.0,  1.0,

        // Back face
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,
         0.0,  0.0, -1.0,

        // Top face
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,
         0.0,  1.0,  0.0,

        // Bottom face
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,
         0.0, -1.0,  0.0,

        // Right face
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,
         1.0,  0.0,  0.0,

        // Left face
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0,
        -1.0,  0.0,  0.0
    ];


    geom.verticesIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
    ];

    mesh=new CGL.Mesh(cgl,geom);
    geomOut.set(null);
    geomOut.set(geom);

}

width.onValueChanged=buildMesh;
height.onValueChanged=buildMesh;
lengt.onValueChanged=buildMesh;
center.onValueChanged=buildMesh;



buildMesh();

};

Ops.Gl.Meshes.Cube.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Array.Array3xRandomSelection
// 
// **************************************************************

Ops.Array.Array3xRandomSelection = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};

var inArray=op.inArray("Array");
var inNum=op.inValueInt("Elements",10);
var inSeed=op.inValue("Seed",0);
var result=op.outArray("Result");

var arr=[];
inSeed.onChange=inArray.onChange=inNum.onChange=update;

function update()
{
    if(Math.floor(inNum.get())<0 || !inArray.get())
    {
        result.set(null);
        return;
    }
    
    var oldArr=inArray.get();
    
    arr.length=Math.floor(inNum.get()*3);
    
    // if(arr.length>oldArr.length)arr.length=oldArr.length;
    
    Math.randomSeed=inSeed.get();
    
    for(var i=0;i<inNum.get();i++)
    {
        var index=Math.floor((Math.seededRandom()*oldArr.length/3))*3;
        arr[i*3+0]=oldArr[index+0];
        arr[i*3+1]=oldArr[index+1];
        arr[i*3+2]=oldArr[index+2];
    }
    
    result.set(null);
    result.set(arr);
    
    
}

};

Ops.Array.Array3xRandomSelection.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Math.Divide
// 
// **************************************************************

Ops.Math.Divide = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
const number1 = op.addInPort(new Port(op, "number1"));
const number2 = op.addInPort(new Port(op, "number2"));
const result = op.addOutPort(new Port(op, "result"));

const exec = function() {
    result.set( number1.get() / number2.get() );
};

number1.set(1);
number2.set(1);

number1.onValueChanged = exec;
number2.onValueChanged = exec;
exec();


};

Ops.Math.Divide.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Math.Subtract
// 
// **************************************************************

Ops.Math.Subtract = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var number1=op.addInPort(new Port(op,"number1"));
var number2=op.addInPort(new Port(op,"number2"));
var result=op.addOutPort(new Port(op,"result"));

number1.onValueChanged=exec;
number2.onValueChanged=exec;

number1.set(1);
number2.set(1);


function exec()
{
    var v=number1.get()-number2.get();
    if(!isNaN(v)) result.set( v );
}



};

Ops.Math.Subtract.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Array.ArrayLength
// 
// **************************************************************

Ops.Array.ArrayLength = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name='ArrayLength';

var array=op.addInPort(new Port(op, "array",OP_PORT_TYPE_ARRAY));
var outLength=op.addOutPort(new Port(op, "length",OP_PORT_TYPE_VALUE));
outLength.ignoreValueSerialize=true;

function update()
{
    var l=0;
    if(array.get()) l=array.get().length;
    else l=-1;
    outLength.set(l);
}

array.onValueChanged=update;


};

Ops.Array.ArrayLength.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Patch.Function
// 
// **************************************************************

Ops.Patch.Function = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name='ExternalFunction';

var funcName=op.addInPort(new Port(op,"Function Name",OP_PORT_TYPE_VALUE,{type:'string'}));
var triggerButton=op.inFunctionButton("trigger");
var trigger=op.addOutPort(new Port(op,"Trigger",OP_PORT_TYPE_FUNCTION));

triggerButton.onTriggered=triggered;

funcName.onValueChanged=function()
{
    op.patch.config[funcName.get()]=triggered;
};

function triggered()
{
    trigger.trigger();
}



};

Ops.Patch.Function.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Vars.Variable
// 
// **************************************************************

Ops.Vars.Variable = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name="Variable";

op.varName=op.inValueSelect("Variable");
var val=op.outValue("Value");

var variable=null;
op.patch.addVariableListener(init);
init();

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.getVars();

        for(var i in vars) varnames.push(i);

        varnames.push('+ create new one');
        op.varName.uiAttribs.values=varnames;
    }
}

op.varName.onChange=function()
{
    init();
};

function init()
{
    updateVarNamesDropdown();

    if(CABLES.UI)
    {
        if(op.varName.get()=='+ create new one')
        {
            CABLES.CMD.PATCH.createVariable(op);
            return;
        }
    }

    if(variable)
    {
        variable.removeListener(onChange);
    }

    variable=op.patch.getVar(op.varName.get());

    if(variable)
    {
        variable.addListener(onChange);
        op.uiAttr({error:null,});
        op.setTitle('#'+op.varName.get());
        onChange(variable.getValue());
        // console.log("var value ",variable.getName(),variable.getValue());
    }
    else
    {
        op.uiAttr({error:"unknown variable! - there is no setVariable with this name"});
        op.setTitle('#invalid');
    }
}


function onChange(v)
{
    updateVarNamesDropdown();
    val.set(v);
}

op.onDelete=function()
{
    if(variable)
        variable.removeListener(onChange);
};


};

Ops.Vars.Variable.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Ui.PatchInput
// 
// **************************************************************

Ops.Ui.PatchInput = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
this.name='PatchInput';

op.getPatchOp=function()
{
    for(var i in op.patch.ops)
    {
        if(op.patch.ops[i].patchId)
        {
            if(op.patch.ops[i].patchId.get()==op.uiAttribs.subPatch)
            {
                return op.patch.ops[i];
            }
        }
    }
};


};

Ops.Ui.PatchInput.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Ui.PatchOutput
// 
// **************************************************************

Ops.Ui.PatchOutput = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};

this.name='PatchOutput';



};

Ops.Ui.PatchOutput.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Ui.SubPatch
// 
// **************************************************************

Ops.Ui.SubPatch = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name="SubPatch";

op.dyn=op.addInPort(new Port(op,"create port",OP_PORT_TYPE_DYNAMIC));
op.dynOut=op.addOutPort(new Port(op,"create port out",OP_PORT_TYPE_DYNAMIC));

var dataStr=op.addInPort(new Port(op,"dataStr",OP_PORT_TYPE_VALUE,{ display:'readonly' }));
op.patchId=op.addInPort(new Port(op,"patchId",OP_PORT_TYPE_VALUE,{ display:'readonly' }));

var data={"ports":[],"portsOut":[]};

// Ops.Ui.Patch.maxPatchId=CABLES.generateUUID();

op.patchId.onChange=function()
{
    // console.log("subpatch changed...");
    // clean up old subpatch if empty
    var oldPatchOps=op.patch.getSubPatchOps(oldPatchId);

    // console.log("subpatch has childs ",oldPatchOps.length);

    if(oldPatchOps.length==2)
    {
        for(var i=0;i<oldPatchOps.length;i++)
        {
            // console.log("delete ",oldPatchOps[i]);
            op.patch.deleteOp(oldPatchOps[i].id);
        }
    }
    else
    {
        // console.log("old subpatch has ops.,...");
    }


};

var oldPatchId=CABLES.generateUUID();
op.patchId.set(oldPatchId);

op.onLoaded=function()
{
    // op.patchId.set(CABLES.generateUUID());
};

op.onLoadedValueSet=function()
{
    data=JSON.parse(dataStr.get());
    setupPorts();


};




function loadData()
{


}




getSubPatchInputOp();
getSubPatchOutputOp();

var dataLoaded=false;
dataStr.onChange=function()
{
    if(dataLoaded)return;

    if(!dataStr.get())return;
    try
    {
        // console.log('parse subpatch data');
        loadData();
    }
    catch(e)
    {
        // op.log('cannot load subpatch data...');
        console.log(e);
    }
};

function saveData()
{
    dataStr.set(JSON.stringify(data));
}

function addPortListener(newPort,newPortInPatch)
{
    //console.log('newPort',newPort.name);
    if(newPort.direction==PORT_DIR_IN)
    {
        if(newPort.type==OP_PORT_TYPE_FUNCTION)
        {
            newPort.onTriggered=function()
            {
                if(newPortInPatch.isLinked())
                    newPortInPatch.trigger();
            };
        }
        else
        {
            newPort.onChange=function()
            {
                newPortInPatch.set(newPort.get());
            };
        }
    }
}

function setupPorts()
{
    if(!op.patchId.get())return;
    var ports=data.ports||[];
    var portsOut=data.portsOut||[];
    var i=0;

    for(i=0;i<ports.length;i++)
    {
        if(!op.getPortByName(ports[i].name))
        {
            // console.log("ports[i].name",ports[i].name);

            var newPort=op.addInPort(new Port(op,ports[i].name,ports[i].type));
            var patchInputOp=getSubPatchInputOp();

            // console.log(patchInputOp);

            var newPortInPatch=patchInputOp.addOutPort(new Port(patchInputOp,ports[i].name,ports[i].type));

// console.log('newPortInPatch',newPortInPatch);


            newPort.ignoreValueSerialize=true;
            addPortListener(newPort,newPortInPatch);
        }
    }

    for(i=0;i<portsOut.length;i++)
    {
        if(!op.getPortByName(portsOut[i].name))
        {
            var newPortOut=op.addOutPort(new Port(op,portsOut[i].name,portsOut[i].type));
            var patchOutputOp=getSubPatchOutputOp();
            var newPortOutPatch=patchOutputOp.addInPort(new Port(patchOutputOp,portsOut[i].name,portsOut[i].type));

            newPortOut.ignoreValueSerialize=true;

            addPortListener(newPortOutPatch,newPortOut);
        }
    }

    dataLoaded=true;

}



op.dyn.onLinkChanged=function()
{
    if(op.dyn.isLinked())
    {
        var otherPort=op.dyn.links[0].getOtherPort(op.dyn);
        op.dyn.removeLinks();
        otherPort.removeLinkTo(op.dyn);

        var newName="in"+data.ports.length+" "+otherPort.parent.name+" "+otherPort.name;

        data.ports.push({"name":newName,"type":otherPort.type});

        setupPorts();

        var l=gui.scene().link(
            otherPort.parent,
            otherPort.getName(),
            op,
            newName
            );

        // console.log('-----+===== ',otherPort.getName(),otherPort.get() );
        // l._setValue();
        // l.setValue(otherPort.get());

        dataLoaded=true;
        saveData();
    }
    else
    {
        setTimeout(function()
        {
            op.dyn.removeLinks();
            gui.patch().removeDeadLinks();
        },100);
    }

};

op.dynOut.onLinkChanged=function()
{
    if(op.dynOut.isLinked())
    {
        var otherPort=op.dynOut.links[0].getOtherPort(op.dynOut);
        op.dynOut.removeLinks();
        otherPort.removeLinkTo(op.dynOut);
        var newName="out"+data.ports.length+" "+otherPort.parent.name+" "+otherPort.name;

        data.portsOut.push({"name":newName,"type":otherPort.type});

        setupPorts();

        gui.scene().link(
            otherPort.parent,
            otherPort.getName(),
            op,
            newName
            );

        dataLoaded=true;
        saveData();
    }
    else
    {
        setTimeout(function()
        {
            op.dynOut.removeLinks();
            gui.patch().removeDeadLinks();
        },100);


        op.log('dynOut unlinked...');
    }
    gui.patch().removeDeadLinks();
};



function getSubPatchOutputOp()
{
    var patchOutputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchOutput');

    if(!patchOutputOP)
    {
        // console.log("Creating output for ",op.patchId.get());
        op.patch.addOp('Ops.Ui.PatchOutput',{'subPatch':op.patchId.get()} );
        patchOutputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchOutput');

        if(!patchOutputOP) console.warn('no patchinput2!');
    }
    return patchOutputOP;

}

function getSubPatchInputOp()
{
    var patchInputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchInput');

    if(!patchInputOP)
    {
        op.patch.addOp('Ops.Ui.PatchInput',{'subPatch':op.patchId.get()} );
        patchInputOP=op.patch.getSubPatchOp(op.patchId.get(),'Ops.Ui.PatchInput');
        if(!patchInputOP) console.warn('no patchinput2!');
    }


    return patchInputOP;
}

op.addSubLink=function(p,p2)
{
    var num=data.ports.length;

    console.log('sublink! ',p.getName(), (num-1)+" "+p2.parent.name+" "+p2.name);


    if(p.direction==PORT_DIR_IN)
    {
        var l=gui.scene().link(
            p.parent,
            p.getName(),
            getSubPatchInputOp(),
            "in"+(num-1)+" "+p2.parent.name+" "+p2.name
            );

        // console.log('- ----=====EEE ',p.getName(),p.get() );
        // console.log('- ----=====EEE ',l.getOtherPort(p).getName() ,l.getOtherPort(p).get() );
    }
    else
    {
        var l=gui.scene().link(
            p.parent,
            p.getName(),
            getSubPatchOutputOp(),
            "out"+(num)+" "+p2.parent.name+" "+p2.name
            );
    }

    var bounds=gui.patch().getSubPatchBounds(op.patchId.get());

    getSubPatchInputOp().uiAttr(
        {
            "translate":
            {
                "x":bounds.minx,
                "y":bounds.miny-100
            }
        });

    getSubPatchOutputOp().uiAttr(
        {
            "translate":
            {
                "x":bounds.minx,
                "y":bounds.maxy+100
            }
        });
    saveData();
};



op.onDelete=function()
{
    for (var i = op.patch.ops.length-1; i >=0 ; i--)
    {
        if(op.patch.ops[i].uiAttribs && op.patch.ops[i].uiAttribs.subPatch==op.patchId.get())
        {
            console.log(op.patch.ops[i].objName);
            op.patch.deleteOp(op.patch.ops[i].id);
        }
    }



};


};

Ops.Ui.SubPatch.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Trigger.SwitchTrigger
// 
// **************************************************************

Ops.Trigger.SwitchTrigger = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
// constants
var NUM_PORTS = 10;

// inputs
var exePort = op.inFunctionButton('Execute');
var switchPort = op.inValue('Switch Value');

// outputs
var nextTriggerPort = op.outFunction('Next Trigger');
var valueOutPort = op.outValue('Switched Value');
var triggerPorts = [];
for(var j=0; j<NUM_PORTS; j++) {
    triggerPorts[j] = op.outFunction('Trigger ' + j);
}
var defaultTriggerPort = op.outFunction('Default Trigger');

// functions

/**
 * Performs the switch case
 */
function update() {
    var index = Math.round(switchPort.get());
    if(index >= 0 && index < NUM_PORTS) {
        valueOutPort.set(index);    
        triggerPorts[index].trigger();
    } else {
        valueOutPort.set(-1);    
        defaultTriggerPort.trigger();   
    }
    nextTriggerPort.trigger();
}

// change listeners / trigger events
exePort.onTriggered = update;

};

Ops.Trigger.SwitchTrigger.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Array.ArrayBuffer3x
// 
// **************************************************************

Ops.Array.ArrayBuffer3x = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name="ArrayBuffer3x";

var exec=op.inFunction("exec");
var maxLength=op.inValue("Max Num Elements",100);

var valX=op.inValue("Value X");
var valY=op.inValue("Value Y");
var valZ=op.inValue("Value Z");

var inReset=op.inFunctionButton("Reset");

var arr=[];

var arrOut=op.outArray("Result");

arrOut.set(arr);

maxLength.onChange=reset;
inReset.onTriggered=reset;
reset();

var wasReset=true;

function reset()
{
    arr.length=Math.abs(Math.floor(maxLength.get()*3))||0;
    for(var i=0;i<arr.length;i++) arr[i]=0;
    wasReset=true;
    arrOut.set(null);
    arrOut.set(arr);
}

exec.onTriggered=function()
{
    // if(op.instanced(exec))return;
    if(wasReset)
    {
        for (var i = 0, len = arr.length; i < len; i+=3)
        {
            arr[i+0]=valX.get();    
            arr[i+1]=valY.get();    
            arr[i+2]=valZ.get();    
        }

        wasReset=false;
    }

    for (var i = 0, len = arr.length; i < len; i++)
        arr[i-3]=arr[i];


    // for(var i=3;i<arr.length;i++)

    arr[arr.length-3]=valX.get();
    arr[arr.length-2]=valY.get();
    arr[arr.length-1]=valZ.get();
    arrOut.set(null);
    arrOut.set(arr);

};

};

Ops.Array.ArrayBuffer3x.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Array.ArraySwitcher
// 
// **************************************************************

Ops.Array.ArraySwitcher = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name="ArraySwitcher";

var N_PORTS = 8;

// input ports
var inTrigger1 = op.inFunctionButton("Trigger 1");
var inArray1 = op.inArray("Array 1");
var inTrigger2 = op.inFunctionButton("Trigger 2");
var inArray2 = op.inArray("Array 2");
var inTrigger3 = op.inFunctionButton("Trigger 3");
var inArray3 = op.inArray("Array 3");
var inTrigger4 = op.inFunctionButton("Trigger 4");
var inArray4 = op.inArray("Array 4");
var inTrigger5 = op.inFunctionButton("Trigger 5");
var inArray5 = op.inArray("Array 5");
var inTrigger6 = op.inFunctionButton("Trigger 6");
var inArray6 = op.inArray("Array 6");
var inTrigger7 = op.inFunctionButton("Trigger 7");
var inArray7 = op.inArray("Array 7");
var inTrigger8 = op.inFunctionButton("Trigger 8");
var inArray8 = op.inArray("Array 8");

// output ports
var outArray = op.outArray("Out Array");

// change listeners
inTrigger1.onTriggered = function() {
    outArray.set(inArray1.get());
};
inTrigger2.onTriggered = function() {
    outArray.set(inArray2.get());
};
inTrigger3.onTriggered = function() {
    outArray.set(inArray3.get());
};
inTrigger4.onTriggered = function() {
    outArray.set(inArray4.get());
};
inTrigger5.onTriggered = function() {
    outArray.set(inArray5.get());
};
inTrigger6.onTriggered = function() {
    outArray.set(inArray6.get());
};
inTrigger7.onTriggered = function() {
    outArray.set(inArray7.get());
};
inTrigger8.onTriggered = function() {
    outArray.set(inArray8.get());
};

// input ports
/*
var inTriggers = [];
var inArrays = [];
for(var i=0; i<N_PORTS; i++) {
    var triggerPort = op.inFunction("Trigger " + i);
    inTriggers.push(triggerPort);
    var arrPort = op.inArray("Array " + i);
    inArrays.push(arrPort);
    triggerPort.onTriggered = function() {
        outArray.set(arrPort.get() || [] );
        op.log("Array set to ", arrPort.get());
    };
}
*/


};

Ops.Array.ArraySwitcher.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Vars.VariableArray
// 
// **************************************************************

Ops.Vars.VariableArray = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.varName=op.inValueSelect("Variable");
var val=op.outArray("Array");

var variable=null;
op.patch.addVariableListener(init);
init();

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.getVars();

        for(var i in vars) varnames.push(i);

        varnames.push('+ create new one');
        op.varName.uiAttribs.values=varnames;
    }
}

op.varName.onChange=function()
{
    init();
};

function init()
{
    updateVarNamesDropdown();

    if(CABLES.UI)
    {
        if(op.varName.get()=='+ create new one')
        {
            CABLES.CMD.PATCH.createVariable(op);
            return;
        }
    }

    if(variable)
    {
        variable.removeListener(onChange);
    }

    variable=op.patch.getVar(op.varName.get());

    if(variable)
    {
        variable.addListener(onChange);
        op.uiAttr({error:null,});
        op.setTitle('#'+op.varName.get());
        onChange(variable.getValue());
        // console.log("var value ",variable.getName(),variable.getValue());
    }
    else
    {
        op.uiAttr({error:"unknown variable! - there is no setVariable with this name"});
        op.setTitle('#invalid');
    }
}


function onChange(v)
{
    updateVarNamesDropdown();
    val.set(v);
}

op.onDelete=function()
{
    if(variable)
        variable.removeListener(onChange);
};


};

Ops.Vars.VariableArray.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Vars.SetVariable
// 
// **************************************************************

Ops.Vars.SetVariable = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};

var val=op.inValue("Value");
op.varName=op.inValueSelect("Variable");

op.varName.onChange=updateName;
val.onChange=update;
val.changeAlways=true;
val.set(false);

op.patch.addVariableListener(updateVarNamesDropdown);

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.getVars();

        for(var i in vars) varnames.push(i);

        varnames.push('+ create new one');
        op.varName.uiAttribs.values=varnames;
    }
}

function updateName()
{
    if(CABLES.UI)
    {
        if(op.varName.get()=='+ create new one')
        {
            CABLES.CMD.PATCH.createVariable(op);
            return;
        }

        op.setTitle('#'+op.varName.get());
    }
    update();
}

function update()
{
    op.patch.setVarValue(op.varName.get(),val.get());
}


};

Ops.Vars.SetVariable.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Vars.SetVariableArray
// 
// **************************************************************

Ops.Vars.SetVariableArray = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var val=op.inArray("Array");
op.varName=op.inValueSelect("Variable");

op.varName.onChange=updateName;
val.onChange=update;

op.patch.addVariableListener(updateVarNamesDropdown);

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if(CABLES.UI)
    {
        var varnames=[];
        var vars=op.patch.getVars();

        for(var i in vars) varnames.push(i);

        varnames.push('+ create new one');
        op.varName.uiAttribs.values=varnames;
    }
}

function updateName()
{
    if(CABLES.UI)
    {
        if(op.varName.get()=='+ create new one')
        {
            CABLES.CMD.PATCH.createVariable(op);
            return;
        }

        op.setTitle('#'+op.varName.get());
    }
    update();
}

function update()
{
    op.patch.setVarValue(op.varName.get(),val.get());
}


};

Ops.Vars.SetVariableArray.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Geometry.TransformGeometry
// 
// **************************************************************

Ops.Gl.Geometry.TransformGeometry = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};

var geometry=op.addInPort(new Port(op,"Geometry",OP_PORT_TYPE_OBJECT));


var transX=op.inValue("Translate X");
var transY=op.inValue("Translate Y");
var transZ=op.inValue("Translate Z");

var scaleX=op.inValueSlider("Scale X",1);
var scaleY=op.inValueSlider("Scale Y",1);
var scaleZ=op.inValueSlider("Scale Z",1);

var rotX=op.inValue("Rotation X");
var rotY=op.inValue("Rotation Y");
var rotZ=op.inValue("Rotation Z");

var outGeom=op.outObject("Result");


transX.onChange=
transY.onChange=
transZ.onChange=
scaleX.onChange=
scaleY.onChange=
scaleZ.onChange=
rotX.onChange=
rotY.onChange=
rotZ.onChange=
geometry.onChange=update;


function update()
{
    var oldGeom=geometry.get();

    if(oldGeom)
    {
        var geom=oldGeom.copy();
        var rotVec=vec3.create();
        var emptyVec=vec3.create();
        var transVec=vec3.create();
        var centerVec=vec3.create();


        
        for(var i=0;i<geom.vertices.length;i+=3)
        {
            geom.vertices[i+0]*=scaleX.get();
            geom.vertices[i+1]*=scaleY.get();
            geom.vertices[i+2]*=scaleZ.get();

            geom.vertices[i+0]+=transX.get();
            geom.vertices[i+1]+=transY.get();
            geom.vertices[i+2]+=transZ.get();
        }

        // var bounds=geom.getBounds();
    
        // vec3.set(centerVec,
        //         bounds.minX+(bounds.maxX-bounds.minX)/2,
        //         bounds.minY+(bounds.maxY-bounds.minY)/2,
        //         bounds.minZ+(bounds.maxZ-bounds.minZ)/2
        //     );

        for(var i=0;i<geom.vertices.length;i+=3)
        {

            vec3.set(rotVec,
                geom.vertices[i+0],
                geom.vertices[i+1],
                geom.vertices[i+2]);

            vec3.rotateX(rotVec,rotVec,transVec,rotX.get()*CGL.DEG2RAD);
            vec3.rotateY(rotVec,rotVec,transVec,rotY.get()*CGL.DEG2RAD);
            vec3.rotateZ(rotVec,rotVec,transVec,rotZ.get()*CGL.DEG2RAD);

            geom.vertices[i+0]=rotVec[0];
            geom.vertices[i+1]=rotVec[1];
            geom.vertices[i+2]=rotVec[2];


        }
        
        outGeom.set(geom);
    }
    
    
    
}

};

Ops.Gl.Geometry.TransformGeometry.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Anim.SimpleAnim
// 
// **************************************************************

Ops.Anim.SimpleAnim = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

var reset=op.inFunctionButton("reset");
var rewind=op.inFunctionButton("rewind");

var inStart=op.addInPort(new Port(op,"start"));
var inEnd=op.addInPort(new Port(op,"end"));
var duration=op.addInPort(new Port(op,"duration"));

var loop=op.addInPort(new Port(op,"loop",OP_PORT_TYPE_VALUE,{display:"bool"}));
var waitForReset=op.inValueBool("Wait for Reset",true);

var next=op.outFunction("Next");
var result=op.addOutPort(new Port(op,"result"));
var finished=op.addOutPort(new Port(op,"finished",OP_PORT_TYPE_VALUE));
var finishedTrigger=op.outFunction("Finished Trigger");

var resetted=false;



var anim=new CABLES.TL.Anim();

anim.createPort(op,"easing",init);

var currentEasing=-1;
function init()
{
    if(anim.keys.length!=3)
    {
        anim.setValue(0,0);
        anim.setValue(1,0);
        anim.setValue(2,0);
    }
    
    anim.keys[0].time=CABLES.now()/1000.0;
    anim.keys[0].value=inStart.get();
    if(anim.defaultEasing!=currentEasing) anim.keys[0].setEasing(anim.defaultEasing);

    anim.keys[1].time=duration.get()+CABLES.now()/1000.0;
    anim.keys[1].value=inEnd.get();
    
    if(anim.defaultEasing!=currentEasing) anim.keys[1].setEasing(anim.defaultEasing);

    anim.loop=loop.get();
    if(anim.loop)
    {
        anim.keys[2].time=(2.0*duration.get())+CABLES.now()/1000.0;
        anim.keys[2].value=inStart.get();
        if(anim.defaultEasing!=currentEasing) anim.keys[2].setEasing(anim.defaultEasing);
    }
    else
    {
        anim.keys[2].time=anim.keys[1].time;
        anim.keys[2].value=anim.keys[1].value;
        if(anim.defaultEasing!=currentEasing) anim.keys[2].setEasing(anim.defaultEasing);
    }
    finished.set(false);

    currentEasing=anim.defaultEasing;
}

loop.onValueChanged=init;
reset.onTriggered=function()
{
    resetted=true;
    init();
};

rewind.onTriggered=function()
{
    anim.keys[0].time=CABLES.now()/1000.0;
    anim.keys[0].value=inStart.get();

    anim.keys[1].time=CABLES.now()/1000.0;
    anim.keys[1].value=inStart.get();

    anim.keys[2].time=CABLES.now()/1000.0;
    anim.keys[2].value=inStart.get();
    
    result.set(inStart.get());
};

exe.onTriggered=function()
{
    if(waitForReset.get() && !resetted) 
    {
        result.set(inStart.get());
        return;
    }
    var t=CABLES.now()/1000;
    var v=anim.getValue(t);
    result.set(v);
    if(anim.hasEnded(t))
    {
        if(!finished.get()) finishedTrigger.trigger();
        finished.set(true);
    }
    
    next.trigger();
};

inStart.set(0.0);
inEnd.set(1.0);
duration.set(0.5);
init();

duration.onChange=init;


};

Ops.Anim.SimpleAnim.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Trigger.TriggerExtender
// 
// **************************************************************

Ops.Trigger.TriggerExtender = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
// inputs
var inTriggerPort = op.inFunctionButton('Execute');

// outputs
var outTriggerPort = op.outFunction('Next');

// trigger listener
inTriggerPort.onTriggered = function() {
    outTriggerPort.trigger();
};

};

Ops.Trigger.TriggerExtender.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Array.ArrayContains
// 
// **************************************************************

Ops.Array.ArrayContains = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name="ArrayContains";

var inArr=op.inArray("Array");
var inValue=op.inValueString("SearchValue");

var outFound=op.outValue("Found",false);
var outIndex=op.outValue("Index",-1);

inValue.onChange=exec;
inArr.onChange=exec;

function exec()
{
    if(inArr.get())
    {
        var index=inArr.get().indexOf(inValue.get());
        
        outIndex.set(index);
        outFound.set(index>-1);
    }
}

};

Ops.Array.ArrayContains.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Boolean.IfTrueThen
// 
// **************************************************************

Ops.Boolean.IfTrueThen = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};

var exe=op.addInPort(new Port(op,"exe",OP_PORT_TYPE_FUNCTION));

var boolean=op.addInPort(new Port(op,"boolean",OP_PORT_TYPE_VALUE,{display:'bool'}));

var triggerThen=op.addOutPort(new Port(op,"then",OP_PORT_TYPE_FUNCTION));
var triggerElse=op.addOutPort(new Port(op,"else",OP_PORT_TYPE_FUNCTION));

boolean.set(false);

function execBool()
{
    if(exe.isLinked())return;
    exec();
}

function exec()
{
    if(boolean.get() || boolean.get()>=1 )
    {
        triggerThen.trigger();
    }
    else
    {
        triggerElse.trigger();
    }
}

boolean.onValueChanged=execBool;
exe.onTriggered=exec;


};

Ops.Boolean.IfTrueThen.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Trigger.TriggerCounter
// 
// **************************************************************

Ops.Trigger.TriggerCounter = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
const exe=op.inFunctionButton("exe");
const reset=op.inFunctionButton("reset");//op.addInPort(new Port(op,"reset",OP_PORT_TYPE_FUNCTION));
const trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
const num=op.addOutPort(new Port(op,"timesTriggered",OP_PORT_TYPE_VALUE));

var n=0;

exe.onTriggered= function()
{
    n++;
    num.set(n);
    trigger.trigger();
};

reset.onTriggered= function()
{
    n=0;
    num.set(n);
};


};

Ops.Trigger.TriggerCounter.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Texture
// 
// **************************************************************

Ops.Gl.Texture = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'image' } ));
var tfilter=op.inValueSelect("filter",['nearest','linear','mipmap']);
var wrap=op.inValueSelect("wrap",['repeat','mirrored repeat','clamp to edge'],"clamp to edge");
var flip=op.addInPort(new Port(op,"flip",OP_PORT_TYPE_VALUE,{display:'bool'}));
var unpackAlpha=op.addInPort(new Port(op,"unpackPreMultipliedAlpha",OP_PORT_TYPE_VALUE,{display:'bool'}));


var textureOut=op.outTexture("texture");
var width=op.addOutPort(new Port(op,"width",OP_PORT_TYPE_VALUE));
var height=op.addOutPort(new Port(op,"height",OP_PORT_TYPE_VALUE));
var loading=op.addOutPort(new Port(op,"loading",OP_PORT_TYPE_VALUE));
var ratio=op.outValue("Aspect Ratio");

flip.set(false);
unpackAlpha.set(false);
unpackAlpha.hidePort();

var cgl=op.patch.cgl;
var cgl_filter=0;
var cgl_wrap=0;

flip.onChange=function(){reload();};
filename.onChange=reload;

tfilter.onChange=onFilterChange;
wrap.onChange=onWrapChange;
unpackAlpha.onChange=function(){ reload(); };

var timedLoader=0;

var setTempTexture=function()
{
    var t=CGL.Texture.getTempTexture(cgl);
    textureOut.set(t);
};

var loadingId=null;

function reload(nocache)
{
    if(!loadingId)loadingId=cgl.patch.loading.start('texture',filename.get());
    clearTimeout(timedLoader);
    timedLoader=setTimeout(function()
    {
        realReload(nocache);
    },30);
}

function realReload(nocache)
{
    if(!loadingId)loadingId=cgl.patch.loading.start('texture',filename.get());
    
    var url=op.patch.getFilePath(String(filename.get()));
    if(nocache)url+='?rnd='+CABLES.generateUUID();

    if((filename.get() && filename.get().length>1))
    {
        loading.set(true);

        var tex=CGL.Texture.load(cgl,url,
            function(err)
            {
                // console.log('tex loaded!!');

                if(err)
                {
                    setTempTexture();
                    op.uiAttr({'error':'could not load texture "'+filename.get()+'"'});
                    cgl.patch.loading.finished(loadingId);
                    return;
                }
                else op.uiAttr({'error':null});
                textureOut.set(tex);
                width.set(tex.width);
                height.set(tex.height);
                ratio.set(tex.width/tex.height);

                if(!tex.isPowerOfTwo()) op.uiAttr(
                    {
                        hint:'texture dimensions not power of two! - texture filtering will not work.',
                        warning:null
                    });
                    else op.uiAttr(
                        {
                            hint:null,
                            warning:null
                        });

                textureOut.set(null);
                textureOut.set(tex);
                cgl.patch.loading.finished(loadingId);
                
                // tex.printInfo();

            },{
                wrap:cgl_wrap,
                flip:flip.get(),
                unpackAlpha:unpackAlpha.get(),
                filter:cgl_filter
            });

        textureOut.set(null);
        textureOut.set(tex);

        if(!textureOut.get() && nocache)
        {
        }
        loading.set(false);
        cgl.patch.loading.finished(loadingId);
    }
    else
    {
        cgl.patch.loading.finished(loadingId);
        setTempTexture();
    }
}


function onFilterChange()
{
    if(tfilter.get()=='nearest') cgl_filter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear') cgl_filter=CGL.Texture.FILTER_LINEAR;
    if(tfilter.get()=='mipmap') cgl_filter=CGL.Texture.FILTER_MIPMAP;

    reload();
}

function onWrapChange()
{
    if(wrap.get()=='repeat') cgl_wrap=CGL.Texture.WRAP_REPEAT;
    if(wrap.get()=='mirrored repeat') cgl_wrap=CGL.Texture.WRAP_MIRRORED_REPEAT;
    if(wrap.get()=='clamp to edge') cgl_wrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reload();
}

op.onFileUploaded=function(fn)
{
    if(filename.get() && filename.get().indexOf(fn)>-1)
    {
        textureOut.set(null);
        textureOut.set(CGL.Texture.getTempTexture(cgl));

        realReload(true);
    }
};




tfilter.set('linear');
wrap.set('repeat');


textureOut.set(CGL.Texture.getEmptyTexture(cgl));



};

Ops.Gl.Texture.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Meshes.Rectangle
// 
// **************************************************************

Ops.Gl.Meshes.Rectangle = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var render=op.inFunction("render");
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var width=op.inValue("width",1);
var height=op.inValue("height",1);

var pivotX=op.addInPort(new Port(op,"pivot x",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","left","right"]} ));
var pivotY=op.addInPort(new Port(op,"pivot y",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["center","top","bottom"]} ));

var nColumns=op.inValueInt("num columns",1);
var nRows=op.inValueInt("num rows",1);
var axis=op.addInPort(new Port(op,"axis",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["xy","xz"]} ));



var active=op.inValueBool('Active',true);

var geomOut=op.addOutPort(new Port(op,"geometry",OP_PORT_TYPE_OBJECT));
geomOut.ignoreValueSerialize=true;

var cgl=op.patch.cgl;
axis.set('xy');
pivotX.set('center');
pivotY.set('center');

op.setPortGroup([pivotX,pivotY]);
op.setPortGroup([width,height]);
op.setPortGroup([nColumns,nRows]);



var geom=new CGL.Geometry('rectangle');
var mesh=null;

axis.onChange=rebuild;
pivotX.onChange=rebuild;
pivotY.onChange=rebuild;
width.onChange=rebuild;
height.onChange=rebuild;
nRows.onChange=rebuild;
nColumns.onChange=rebuild;
rebuild();

render.onTriggered=function()
{
    if(active.get() && mesh) mesh.render(cgl.getShader());
    
    trigger.trigger();
};

function rebuild()
{
    var w=width.get();
    var h=height.get();
    var x=0;
    var y=0;
    
    if(typeof w=='string')w=parseFloat(w);
    if(typeof h=='string')h=parseFloat(h);
    
    if(pivotX.get()=='center') x=0;
    if(pivotX.get()=='right') x=-w/2;
    if(pivotX.get()=='left') x=+w/2;

    if(pivotY.get()=='center') y=0;
    if(pivotY.get()=='top') y=-h/2;
    if(pivotY.get()=='bottom') y=+h/2;

    var verts=[];
    var tc=[];
    var norms=[];
    var indices=[];

    var numRows=Math.round(nRows.get());
    var numColumns=Math.round(nColumns.get());

    var stepColumn=w/numColumns;
    var stepRow=h/numRows;

    var c,r;

    for(r=0;r<=numRows;r++)
    {
        for(c=0;c<=numColumns;c++)
        {
            verts.push( c*stepColumn - width.get()/2+x );
            if(axis.get()=='xz') verts.push( 0.0 );
            verts.push( r*stepRow - height.get()/2+y );
            if(axis.get()=='xy') verts.push( 0.0 );

            tc.push( c/numColumns );
            tc.push( 1.0-r/numRows );

            if(axis.get()=='xz')
            {
                norms.push(0);
                norms.push(1);
                norms.push(0);
            }

            if(axis.get()=='xy')
            {
                norms.push(0);
                norms.push(0);
                norms.push(-1);
            }
        }
    }
    
    for(c=0;c<numColumns;c++)
    {
        for(r=0;r<numRows;r++)
        {
            var ind = c+(numColumns+1)*r;
            var v1=ind;
            var v2=ind+1;
            var v3=ind+numColumns+1;
            var v4=ind+1+numColumns+1;

            indices.push(v1);
            indices.push(v3);
            indices.push(v2);

            indices.push(v2);
            indices.push(v3);
            indices.push(v4);
        }
    }

    geom.clear();
    geom.vertices=verts;
    geom.texCoords=tc;
    geom.verticesIndices=indices;
    geom.vertexNormals=norms;
    geom.calculateNormals();

    if(!mesh) mesh=new CGL.Mesh(cgl,geom);
        else mesh.setGeom(geom);

    geomOut.set(null);
    geomOut.set(geom);

}


};

Ops.Gl.Meshes.Rectangle.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Color.HSBtoRGB
// 
// **************************************************************

Ops.Color.HSBtoRGB = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var outR=op.outValue("R");
var outG=op.outValue("G");
var outB=op.outValue("B");

var inH=op.inValueSlider("Hue");
var inS=op.inValueSlider("Saturation",1);
var inV=op.inValueSlider("Brightness",0.5);

// var hslToRgb = function(hue, saturation, lightness){
inH.onChange=inS.onChange=inV.onChange=update;
update();

function update()
{

    var hue=(inH.get());
    var saturation=(inS.get());
    var lightness=(inV.get());
    
    // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
    
    var chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
    var huePrime = hue *6; // / 60;
    var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

    huePrime = Math.floor(huePrime)||0;
    var red=0;
    var green=0;
    var blue=0;

    if( huePrime === 0 ){
        red = chroma;
        green = secondComponent;
        blue = 0;
    }else if( huePrime === 1 ){
        red = secondComponent;
        green = chroma;
        blue = 0;
    }else if( huePrime === 2 ){
        red = 0;
        green = chroma;
        blue = secondComponent;
    }else if( huePrime === 3 ){
        red = 0;
        green = secondComponent;
        blue = chroma;
    }else if( huePrime === 4 ){
        red = secondComponent;
        green = 0;
        blue = chroma;
    }else if( huePrime === 5 ){
        red = chroma;
        green = 0;
        blue = secondComponent;
    }
    var lightnessAdjustment = (lightness - (chroma / 2));
    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;

    outR.set(red);
    outG.set(green);
    outB.set(blue);

//   return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];

};


};

Ops.Color.HSBtoRGB.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Math.MapRange
// 
// **************************************************************

Ops.Math.MapRange = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};

var result=op.addOutPort(new Port(op,"result"));
var v=op.addInPort(new Port(op,"value"));
var old_min=op.addInPort(new Port(op,"old min"));
var old_max=op.addInPort(new Port(op,"old max"));
var new_min=op.addInPort(new Port(op,"new min"));
var new_max=op.addInPort(new Port(op,"new max"));
var easing=op.inValueSelect("Easing",["Linear","Smoothstep","Smootherstep"],"Linear");

var ease=0;
var r=0;

easing.onChange=function()
{
    if(easing.get()=="Smoothstep") ease=1;
        else if(easing.get()=="Smootherstep") ease=2;
            else ease=0;
};


function exec()
{
    if(v.get()>=Math.max( old_max.get(),old_min.get() ))
    {
        result.set(new_max.get());
        return;
    }
    else
    if(v.get()<=Math.min( old_max.get(),old_min.get() )) 
    {
        result.set(new_min.get());
        return;
    }

    var nMin=new_min.get();
    var nMax=new_max.get();
    var oMin=old_min.get();
    var oMax=old_max.get();
    var x=v.get();

    var reverseInput = false;
    var oldMin = Math.min( oMin, oMax );
    var oldMax = Math.max( oMin, oMax );
    if(oldMin!= oMin) reverseInput = true;

    var reverseOutput = false;
    var newMin = Math.min( nMin, nMax );
    var newMax = Math.max( nMin, nMax );
    if(newMin != nMin) reverseOutput = true;

    var portion=0;

    if(reverseInput) portion = (oldMax-x)*(newMax-newMin)/(oldMax-oldMin);
        else portion = (x-oldMin)*(newMax-newMin)/(oldMax-oldMin);

    if(reverseOutput) r=newMax - portion;
        else r=portion + newMin;

    if(ease===0)
    {
        result.set(r);
    }
    else
    if(ease==1)
    {
        x = Math.max(0, Math.min(1, (r-nMin)/(nMax-nMin)));
        result.set( nMin+x*x*(3 - 2*x)* (nMax-nMin) ); // smoothstep
    }
    else
    if(ease==2)
    {
        x = Math.max(0, Math.min(1, (r-nMin)/(nMax-nMin)));
        result.set( nMin+x*x*x*(x*(x*6 - 15) + 10) * (nMax-nMin) ) ; // smootherstep
    }

}

v.set(0);
old_min.set(0);
old_max.set(1);
new_min.set(-1);
new_max.set(1);


v.onValueChanged=exec;
old_min.onValueChanged=exec;
old_max.onValueChanged=exec;
new_min.onValueChanged=exec;
new_max.onValueChanged=exec;

result.set(0);

exec();

};

Ops.Math.MapRange.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.User.action.modulo
// 
// **************************************************************

Ops.User.action.modulo = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};

var result=op.addOutPort(new Port(op,"result"));
var number1=op.addInPort(new Port(op,"number1"));
var number2=op.addInPort(new Port(op,"number2"));

function exec()
{
    var n2 = number2.get();
    var n1 = number1.get();
    
    var re = ((n1%n2)+n2)%n2;
    if(re!=re) re=0;
    result.set(re);
    
    
}

number1.onChange=exec;
number2.onChange=exec;

number1.set(1);
number2.set(2);


};

Ops.User.action.modulo.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Matrix.Camera
// 
// **************************************************************

Ops.Gl.Matrix.Camera = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

/* Inputs */
// projection | prespective & ortogonal
var projectionMode=op.addInPort(new Port(op,"projection mode",OP_PORT_TYPE_VALUE,{display:'dropdown',values:['prespective','ortogonal']}));
var zNear=op.addInPort(new Port(op,"frustum near",OP_PORT_TYPE_VALUE ));
var zFar=op.addInPort(new Port(op,"frustum far",OP_PORT_TYPE_VALUE ));

var fov=op.addInPort(new Port(op,"fov",OP_PORT_TYPE_VALUE ));

var autoAspect=op.inValueBool("Auto Aspect Ratio",true);
var aspect=op.inValue("Aspect Ratio");

// look at camera
var eyeX=op.addInPort(new Port(op,"eye X"));
var eyeY=op.addInPort(new Port(op,"eye Y"));
var eyeZ=op.addInPort(new Port(op,"eye Z"));

var centerX=op.addInPort(new Port(op,"center X"));
var centerY=op.addInPort(new Port(op,"center Y"));
var centerZ=op.addInPort(new Port(op,"center Z"));

// camera transform and movements
var posX=op.addInPort(new Port(op,"truck"),0);
var posY=op.addInPort(new Port(op,"boom"),0);
var posZ=op.addInPort(new Port(op,"dolly"),0);

var rotX=op.addInPort(new Port(op,"tilt"),0);
var rotY=op.addInPort(new Port(op,"pan"),0);
var rotZ=op.addInPort(new Port(op,"roll"),0);


/* Outputs */
var outAsp=op.addOutPort(new Port(op,"Aspect",OP_PORT_TYPE_VALUE));
var outArr=op.outArray("Look At Array");


/* logic */
var cgl=op.patch.cgl;

// prespective
projectionMode.set('prespective');
zNear.set(0.01);
zFar.set(500.0);
fov.set(45);
aspect.set(1);

var asp=0;

// look at camera
centerX.set(0);
centerY.set(0);
centerZ.set(0);

eyeX.set(0);
eyeY.set(0);
eyeZ.set(5);

var vUp=vec3.create();
var vEye=vec3.create();
var vCenter=vec3.create();
var transMatrix=mat4.create();
mat4.identity(transMatrix);

var arr=[];

// Transform and move
var vPos=vec3.create();
var transMatrixMove=mat4.create();
mat4.identity(transMatrixMove);

var updateCameraMovementMatrix=true;

render.onTriggered=function() {
    // Aspect ration
    if(!autoAspect.get()) asp=aspect.get();
    else asp=cgl.getViewPort()[2]/cgl.getViewPort()[3];
    outAsp.set(asp);
    
    // translation (truck, boom, dolly)
    cgl.pushViewMatrix();
    
    if (updateCameraMovementMatrix) {
        mat4.identity(transMatrixMove);
        
        vec3.set(vPos, posX.get(),posY.get(),posZ.get());
        if(posX.get()!==0.0 || posY.get()!==0.0 || posZ.get()!==0.0)
            mat4.translate(transMatrixMove,transMatrixMove, vPos);
        
        if(rotX.get()!==0)
            mat4.rotateX(transMatrixMove,transMatrixMove, rotX.get()*CGL.DEG2RAD);
        if(rotY.get()!==0)
            mat4.rotateY(transMatrixMove,transMatrixMove, rotY.get()*CGL.DEG2RAD);
        if(rotZ.get()!==0)
            mat4.rotateZ(transMatrixMove,transMatrixMove, rotZ.get()*CGL.DEG2RAD);
        
        updateCameraMovementMatrix = false;
    }
    
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrixMove);
    
    // projection (prespective / ortogonal)
    cgl.pushPMatrix();
    
    // look at
    cgl.pushViewMatrix();
 
    if (projectionMode.get()=='prespective') {
        mat4.perspective(
            cgl.pMatrix,
            fov.get()*0.0174533,
            asp, 
            zNear.get(), 
            zFar.get()
        );
    } else if (projectionMode.get()=='ortogonal') {
        mat4.ortho(
            cgl.pMatrix,
            -1 * (fov.get() / 14),
             1 * (fov.get() / 14),
            -1 * (fov.get() / 14) / asp,
             1 * (fov.get() / 14) / asp,
            zNear.get(), 
            zFar.get()
        );
    }
    
    
	arr[0]=eyeX.get();
	arr[1]=eyeY.get();
	arr[2]=eyeZ.get();

	arr[3]=centerX.get();
	arr[4]=centerY.get();
	arr[5]=centerZ.get();

	arr[6]=0;
	arr[7]=1;
	arr[8]=0;

	outArr.set(arr);

	vec3.set(vUp, 0, 1, 0);
	vec3.set(vEye, eyeX.get(),eyeY.get(),eyeZ.get());
	vec3.set(vCenter, centerX.get(),centerY.get(),centerZ.get());

	mat4.lookAt(transMatrix, vEye, vCenter, vUp);

	mat4.multiply(cgl.vMatrix,cgl.vMatrix,transMatrix);

	trigger.trigger();

	cgl.popViewMatrix();
	cgl.popPMatrix();

	cgl.popViewMatrix();
    
    
	// GUI for dolly, boom and truck
	if(CABLES.UI && gui.patch().isCurrentOp(op)) 
		gui.setTransformGizmo({
			posX:posX,
			posY:posY,
			posZ:posZ
		});
};

var updateUI=function() {
	if(!autoAspect.get()) {
		aspect.setUiAttribs({hidePort:false,greyout:false});
	} else {
		aspect.setUiAttribs({hidePort:true,greyout:true});
	}
};

var cameraMovementChanged=function() {
	updateCameraMovementMatrix = true;
};

// listeners
posX.onChange=cameraMovementChanged;
posY.onChange=cameraMovementChanged;
posZ.onChange=cameraMovementChanged;

rotX.onChange=cameraMovementChanged;
rotY.onChange=cameraMovementChanged;
rotZ.onChange=cameraMovementChanged;

autoAspect.onChange=updateUI;
updateUI();




};

Ops.Gl.Matrix.Camera.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Anim.RandomAnim
// 
// **************************************************************

Ops.Anim.RandomAnim = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};

var exe=op.inFunction("exe");
var min=op.inValue("min",0);
var max=op.inValue("max",1);

var pause=op.inValue("pause between",0);
var seed=op.inValue("random seed",0);

var duration=op.inValue("duration",0.5);

var result=op.outValue("result");

var anim=new CABLES.TL.Anim();
anim.createPort(op,"easing",reinit);

reinit();

min.onChange=reinit;
max.onChange=reinit;
pause.onChange=reinit;
seed.onChange=reinit;
duration.onChange=reinit;

function getRandom()
{
    var minVal = parseFloat( min.get() );
    var maxVal = parseFloat( max.get() );
    return Math.seededRandom() * ( maxVal - minVal ) + minVal;
}

function reinit()
{
    Math.randomSeed=seed.get();
    init(getRandom());
}

function init(v)
{
    anim.clear();
    
    anim.setValue(op.patch.freeTimer.get(), v);
    if(pause.get()!=0.0)anim.setValue(op.patch.freeTimer.get()+pause.get(), v);
    
    anim.setValue(parseFloat(duration.get())+op.patch.freeTimer.get()+pause.get(), getRandom());
}


exe.onTriggered=function()
{
    if(op.instanced(exe))return;


    Math.randomSeed=seed.get();

// +offset.get())%duration.get()
    var t=op.patch.freeTimer.get();
    var v=anim.getValue(t);
    if(anim.hasEnded(t))
    {
        anim.clear();
        init(v);
    }
    result.set(v);
};



};

Ops.Anim.RandomAnim.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Array.Array
// 
// **************************************************************

Ops.Array.Array = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
var inLength=op.inValueInt("Length",100);
var inDefaultValue=op.inValueInt("DefaultValue");
var inReset=op.inFunctionButton("Reset");
var outArr=op.outArray("Array");

var arr=[];
inReset.onTriggered=reset;
inDefaultValue.onChange=reset;
inLength.onChange=function() {
    if (inLength.get()!=arr.length)
        reset();
}

function reset()
{
    outArr.set(arr);
    var l=parseInt(inLength.get(),10);
    if(l<0)return;
    
    arr.length=l;
    
    for(var i=0;i<l;i++)
    {
        arr[i]=inDefaultValue.get();
    }
    outArr.set(null);
    outArr.set(arr);
}

reset();


};

Ops.Array.Array.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl2.ForceField.ForceFieldSimulationParticles
// 
// **************************************************************

Ops.Gl2.ForceField.ForceFieldSimulationParticles = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
attachments["flowfield_vert"]="bool respawn=false;\n// respawn\n\n\n// respawn=(attrVertIndex> MOD_spawnFrom && attrVertIndex<MOD_spawnTo);\n\nif(attrVertIndex> MOD_spawnFrom && attrVertIndex<MOD_spawnTo)\n{\n    respawn=true;\n}\n\n\n// float respawn=(1.0-step(MOD_spawnFrom,attrVertIndex))*\n    // (step(MOD_spawnTo,attrVertIndex));\n\n\n// if(!respawn)\n{\n// calculate position...\n\n    col=rndpos+0.5;\n    \n    // bool respawn=false;\n    vec3 velocity=vec3(0.0);\n    \n    for(int i=0;i<NUM_FORCES;i++)\n    {\n        if(forces[i].time<MOD_time)continue;\n    \n        vec3 vecToOrigin=inPos-forces[i].pos;\n        float dist=abs(length(vecToOrigin));\n    \n        if(forces[i].range > dist)\n        {\n            // velocity=vec3(11.0,11.0,11.0);\n    \n            float distAlpha = (forces[i].range - dist) / forces[i].range;\n    \n            // if (abs(distAlpha) > 0.98)\n            // {\n                // respawn=true;\n            // }\n    \n            vec3 vecNormal=normalize(vecToOrigin);\n    \n            velocity += (vecNormal * distAlpha * forces[i].attraction )*MOD_timeDiff;\n    \n            vec3 tangentForce=vec3(\n                vecNormal.y,\n                -vecNormal.x,\n                -vecNormal.z\n                );\n\n            float f=distAlpha * forces[i].angle;\n\n            velocity+=(tangentForce*f)*MOD_timeDiff;\n        }\n    }\n    \n    outLife=life;\n    \n    if(MOD_time-life.x>MOD_lifeTime)\n    {\n        outLife.x=MOD_time;\n        // respawn=;\n    }\n    \n    outPos=inPos+velocity;\n\n    #ifdef POINTMATERIAL\n        float lifeElapsed=(MOD_time-life.x)/MOD_lifeTime;\n        sizeMultiply *= smoothstep(0.0, MOD_fadeinout, lifeElapsed) * (1.0 - smoothstep(1.0-MOD_fadeinout, 1.0, lifeElapsed));\n    #endif\n}\n\n\nif(respawn)\n{\n    outPos.xyz=vec3(0.0);\n    int ind=int( random(vec2(MOD_time+rndpos.y,rndpos.x+MOD_time))*MOD_numSpawns );\n    outPos=MOD_spawnPositions[ind];\n\n    float spawnAreaSize=1.3;\n    outPos.x+=MOD_sizeX*random(vec2(MOD_time+rndpos.y,rndpos.x+MOD_time))-MOD_sizeX/2.0;\n    outPos.y+=MOD_sizeY*random(vec2(rndpos.y,rndpos.x+MOD_time))-MOD_sizeY/2.0;\n    outPos.z+=MOD_sizeZ*random(vec2(MOD_time+rndpos.y,rndpos.x))-MOD_sizeZ/2.0;\n\n\n\n    // outPos=(\n    //     2.0*vec3(\n    //     (random(vec2(MOD_time+rndpos.y,rndpos.x))-0.5),\n    //     (random(vec2(MOD_time+rndpos.z,rndpos.x))-0.5),\n    //     (random(vec2(rndpos.x,MOD_time+rndpos.z))-0.5)\n    //     ));\n\n    // outPos.x*=MOD_sizeX;\n    // outPos.y*=MOD_sizeY;\n    // outPos.z*=MOD_sizeZ;\n    // outPos+=MOD_emitterPos;\n    outLife.x=MOD_time;\n    \n    #ifdef POINTMATERIAL\n        sizeMultiply =0.0;\n    #endif\n\n}\n\npos=vec4(outPos,1.0);\n";
attachments["flowfield_head_vert"]="#define NUM_FORCES 80\n\nIN vec3 rndpos;\nOUT vec3 col;\n\nUNI vec3 MOD_emitterPos;\n\nUNI float MOD_time;\nUNI float MOD_sizeX;\nUNI float MOD_sizeY;\nUNI float MOD_sizeZ;\nUNI float MOD_timeDiff;\nUNI float MOD_lifeTime;\nUNI float MOD_fadeinout;\nUNI float MOD_spawnTo;\nUNI float MOD_spawnFrom;\n\n\nIN float timeOffset;\n\nIN vec3 life;\nOUT vec3 outLife;\n\nIN vec3 inPos;\nOUT vec3 outPos;\n\nstruct force\n{\n    vec3 pos;\n    float attraction;\n    float angle;\n    float range;\n    float time;\n};\n\n\nUNI force forces[NUM_FORCES];\n\nUNI vec3 MOD_spawnPositions[32];\nUNI float MOD_numSpawns;\n\n\n\nfloat random(vec2 co)\n{\n    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n";
op.name="ForceFieldParticleEmitter";

const render=op.inFunction("render");
const resetButton=op.inFunctionButton("Reset");
const inSizeX=op.inValue("Size Area X",3);
const inSizeY=op.inValue("Size Area Y",3);
const inSizeZ=op.inValue("Size Area Z",3);
const numPoints=op.inValue("Particles",300);
const speed=op.inValue("Speed",0.2);
const lifetime=op.inValue("Lifetime",5);
const fadeInOut=op.inValueSlider("Fade Birth Death",0.2);
const show=op.inValueBool("Show");
const posX=op.inValue("Pos X");
const posY=op.inValue("Pos Y");
const posZ=op.inValue("Pos Z");
const spawns=op.inArray("Spawn Positions");

var cgl=op.patch.cgl;
var shaderModule=null;
var bufferB=null;
var verts=null;
var geom=null;
var mesh=null;
var shader=null;

numPoints.onChange=reset;
inSizeX.onChange=reset;
inSizeY.onChange=reset;
inSizeZ.onChange=reset;
resetButton.onTriggered=reset;

const id=CABLES.generateUUID();

var lastTime=0;
var mark=new CGL.Marker(cgl);
var needsRebuild=false;
var life;

function reset()
{
    needsRebuild=true;
}

function doReset()
{
    // var stopwatch=new CABLES.StopWatch();
    // mesh=null;
    needsRebuild=false;
    var i=0;
    var num=Math.floor(numPoints.get())*3;
    if(!verts || verts.length!=num) verts=new Float32Array(num);
    if(!bufferB || bufferB.length!=num)bufferB=new Float32Array(num);

    // stopwatch.stop('init');

    var sizeX=inSizeX.get();
    var sizeY=inSizeY.get();
    var sizeZ=inSizeZ.get();
    
    var pX=posX.get();
    var pY=posY.get();
    var pZ=posZ.get();
    var vl=verts.length;
    for(i=0;i<vl;i+=3)
    {
        verts[i+0]=(Math.random()-0.5)*sizeX+pX;
        verts[i+1]=(Math.random()-0.5)*sizeY+pY;
        verts[i+2]=(Math.random()-0.5)*sizeZ+pZ;
        // verts[i+2]=0.0;

        bufferB[i+0]=(Math.random()-0.5)*sizeX+pX;
        bufferB[i+1]=(Math.random()-0.5)*sizeY+pY;
        bufferB[i+2]=(Math.random()-0.5)*sizeZ+pZ;
        // bufferB[i+2]=0.0;
    }
    
    // stopwatch.stop('randoms');

    if(!geom)geom=new CGL.Geometry();
    geom.setPointVertices(verts);
    
    // stopwatch.stop('geom');

    vl=(verts.length/3)*2;
    for(i=0;i<vl;i+=2)
    {
        geom.texCoords[i]=Math.random();
        geom.texCoords[i+1]=Math.random();
    }
    
    // stopwatch.stop('tc');

    if(!mesh)
    {
        mesh =new CGL.Mesh(cgl,geom,cgl.gl.POINTS);

        mesh.addVertexNumbers=true;
        


        op.log("NEW MESH");
    }
    else
    {
        mesh.unBind();
    }
    mesh.addVertexNumbers=true;
    mesh._verticesNumbers=null;
    mesh.setGeom(geom);
    
    // stopwatch.stop('mesh');

    // mesh.updateVertices(geom);

    // op.log("set geom",mesh._attributes.length);
    // op.log("set geom",mesh._attributes.length);


    // buffB = cgl.gl.createBuffer();
    // cgl.gl.bindBuffer(cgl.gl.ARRAY_BUFFER, buffB);
    // cgl.gl.bufferData(cgl.gl.ARRAY_BUFFER, bufferB, cgl.gl.DYNAMIC_COPY);
    // buffB.itemSize = 3;
    // buffB.numItems = bufferB.length/3;

    mesh.setAttribute("rndpos",bufferB,3);


    op.log("Reset particles",num,numPoints.get());

    mesh.removeFeedbacks();
// stopwatch.stop('attribfeedbacks');


    if(!life || life.length!=num) life=new Float32Array(num);
    var lt=lifetime.get();
    var time=op.patch.freeTimer.get();

    for(i=0;i<num;i+=3)
    {
        life[i]=op.patch.freeTimer.get()-Math.random()*lt;
        life[i+1]=time;
        life[i+2]=time;
    }
    
    // stopwatch.stop('life');

    // console.log(op.patch.freeTimer.get(),life[0],bufferB[0]);

    // mesh.setAttribute("life",life,3);
    // mesh.setAttributeFeedback("life","outLife",life),





    mesh.setFeedback(
        mesh.setAttribute("inPos",bufferB,3),
        "outPos",bufferB );


    mesh.setFeedback(
        mesh.setAttribute("life",life,3),
        "outLife",life );


        // feebackOutpos.buffer=buffB;



    // var timeOffsetArr=new Float32Array(num/3);
    // for(i=0;i<num;i++)timeOffsetArr[i]=Math.random();

    // mesh.setAttribute("timeOffset",timeOffsetArr,1);

    // if(feebackOutpos)feebackOutpos.buffer=buffB;
}

reset();

var numForces=0;
var forceUniforms=[];
var firstTime=true;


function removeModule()
{
    if(shader && shaderModule)
    {
        shader.removeModule(shaderModule);
        shader=null;
    }
}
render.onLinkChanged=removeModule;


var particleSpawnStart=0;
var uniTime=null;
var uniSize=null;
var uniSizeX=null;
var uniSizeY=null;
var uniSizeZ=null;
var uniTimeDiff=null;
var uniPos=null;
var uniLifetime=null;
var uniFadeInOut=null;
var uniSpawnFrom=null;
var uniSpawnTo=null;
var uniSpawnPositions=null;
var uniNumSpawns=null;

render.onTriggered=function()
{
    if(needsRebuild)doReset();
    var time=op.patch.freeTimer.get();
    var timeDiff=time-lastTime;

    if(cgl.getShader()!=shader)
    {
        if(shader) removeModule();
        shader=cgl.getShader();
        shader.glslVersion=300;
        shaderModule=shader.addModule(
            {
                title:op.objName,
                name:'MODULE_VERTEX_POSITION',
                srcHeadVert:attachments.flowfield_head_vert,
                srcBodyVert:attachments.flowfield_vert,
                priority:-2,

            });

        uniTime=new CGL.Uniform(shader,'f',shaderModule.prefix+'time',0);
        uniPos=new CGL.Uniform(shader,'3f',shaderModule.prefix+'emitterPos',0);
        uniSizeX=new CGL.Uniform(shader,'f',shaderModule.prefix+'sizeX',inSizeX.get());
        uniSizeY=new CGL.Uniform(shader,'f',shaderModule.prefix+'sizeY',inSizeY.get());
        uniSizeZ=new CGL.Uniform(shader,'f',shaderModule.prefix+'sizeZ',inSizeZ.get());
        uniTimeDiff=new CGL.Uniform(shader,'f',shaderModule.prefix+'timeDiff',0);
        uniLifetime=new CGL.Uniform(shader,'f',shaderModule.prefix+'lifeTime',lifetime);
        uniFadeInOut=new CGL.Uniform(shader,'f',shaderModule.prefix+'fadeinout',fadeInOut);
        
        uniSpawnPositions=new CGL.Uniform(shader,'3f[]',shaderModule.prefix+'spawnPositions',[]);
        uniNumSpawns=new CGL.Uniform(shader,'f',shaderModule.prefix+'numSpawns',0);


        uniSpawnFrom=new CGL.Uniform(shader,'f',shaderModule.prefix+'spawnFrom',0);
        uniSpawnTo=new CGL.Uniform(shader,'f',shaderModule.prefix+'spawnTo',0);
    }

    if(!shader)return;

    for(var i=0;i<CABLES.forceFieldForces.length;i++)
    {
        var force=CABLES.forceFieldForces[i];
        if(force)
        if(!force.hasOwnProperty(id+"uniRange"))
        {
            force[id+'uniRange']=new CGL.Uniform(shader,'f','forces['+i+'].range',force.range);
            force[id+'uniAttraction']=new CGL.Uniform(shader,'f','forces['+i+'].attraction',force.attraction);
            force[id+'uniAngle']=new CGL.Uniform(shader,'f','forces['+i+'].angle',force.angle);
            force[id+'uniPos']=new CGL.Uniform(shader,'3f','forces['+i+'].pos',force.pos);
            force[id+'uniTime']=new CGL.Uniform(shader,'f','forces['+i+'].time',time);
        }
        else
        {
            force[id+'uniRange'].setValue(force.range);
            force[id+'uniAttraction'].setValue(force.attraction);
            force[id+'uniAngle'].setValue(force.angle);
            force[id+'uniPos'].setValue(force.pos);
            force[id+'uniTime'].setValue(time);
        }
    }

    uniSizeX.setValue(inSizeX.get());
    uniSizeY.setValue(inSizeY.get());
    uniSizeZ.setValue(inSizeZ.get());
    uniTimeDiff.setValue(timeDiff*(speed.get()));
    uniTime.setValue(time);



    uniPos.setValue([posX.get(),posY.get(),posZ.get()]);

    if(mesh) mesh.render(shader);

    // console.log( '1',mesh._bufVertexAttrib );
    // console.log( '1',feebackOutpos.buffer );

    // var t=mesh._bufVertexAttrib.buffer;
    // mesh._bufVertexAttrib.buffer=feebackOutpos.buffer;
    // feebackOutpos.buffer=t;
    lastTime=op.patch.freeTimer.get();


    if(show.get())
    {
        cgl.pushModelMatrix();
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,[posX.get(),posY.get(),posZ.get()]);
        mark.draw(cgl);
        cgl.popModelMatrix();
    }
    
    uniSpawnPositions.set(spawns.get() || []);
    var numSpawnPos=( (spawns.get()||[]).length)/3;
    // op.log('numSpawnPos',numSpawnPos);
    uniNumSpawns.set( numSpawnPos );
    

    if(particleSpawnStart>numPoints.get())particleSpawnStart=0;

    var perSecond=numPoints.get()/lifetime.get();
    var numSpawn=perSecond*Math.min(1/33,timeDiff);
    uniSpawnFrom.setValue(particleSpawnStart);
    uniSpawnTo.setValue(particleSpawnStart+numSpawn);

    // op.log(particleSpawnStart,particleSpawnStart+numSpawn);
    // if(numSpawn>30)
    // console.log("should spawn",numSpawn);
    particleSpawnStart+=numSpawn;





};


};

Ops.Gl2.ForceField.ForceFieldSimulationParticles.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Shader.PointMaterial
// 
// **************************************************************

Ops.Gl.Shader.PointMaterial = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
attachments["shader_frag"]="precision highp float;\n\n{{MODULES_HEAD}}\n\nIN vec2 texCoord;\n#ifdef HAS_TEXTURES\n   \n   #ifdef HAS_TEXTURE_DIFFUSE\n       uniform sampler2D diffTex;\n   #endif\n   #ifdef HAS_TEXTURE_MASK\n       uniform sampler2D texMask;\n   #endif\n#endif\nuniform float r;\nuniform float g;\nuniform float b;\nuniform float a;\n\nvoid main()\n{\n    {{MODULE_BEGIN_FRAG}}\n\n    vec4 col=vec4(r,g,b,a);\n\n    #ifdef HAS_TEXTURES\n\n        #ifdef HAS_TEXTURE_MASK\n            float mask=texture2D(texMask,vec2(gl_PointCoord.x,(1.0-gl_PointCoord.y))).r;\n        #endif\n\n        #ifdef HAS_TEXTURE_DIFFUSE\n\n            #ifdef LOOKUP_TEXTURE\n                col=texture2D(diffTex,texCoord);\n            #endif\n            #ifndef LOOKUP_TEXTURE\n                col=texture2D(diffTex,vec2(gl_PointCoord.x,(1.0-gl_PointCoord.y)));\n            #endif\n\n            #ifdef COLORIZE_TEXTURE\n              col.r*=r;\n              col.g*=g;\n              col.b*=b;\n            #endif\n        #endif\n        col.a*=a;\n    #endif\n\n    {{MODULE_COLOR}}\n\n    #ifdef MAKE_ROUND\n        if ((gl_PointCoord.x-0.5)*(gl_PointCoord.x-0.5) + (gl_PointCoord.y-0.5)*(gl_PointCoord.y-0.5) > 0.25) discard; //col.a=0.0;\n    #endif\n\n    #ifdef HAS_TEXTURE_MASK\n        col.a=mask;\n    #endif\n\n\n    // #ifdef RANDOMIZE_COLOR\n        // col.rgb*=fract(sin(dot(texCoord.xy ,vec2(12.9898,78.233))) * 43758.5453);\n    // #endif\n\n\n\n    outColor = col;\n}\n";
attachments["shader_vert"]="{{MODULES_HEAD}}\nIN vec3 vPosition;\nIN vec2 attrTexCoord;\n\nOUT vec3 norm;\n#ifdef HAS_TEXTURES\n    OUT vec2 texCoord;\n#endif\n\nUNI mat4 projMatrix;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\n\nUNI float pointSize;\nUNI vec3 camPos;\n\nUNI float canvasWidth;\nUNI float canvasHeight;\nUNI float camDistMul;\n\nUNI float randomSize;\n\nIN float attrVertIndex;\n\nfloat rand(float n){return fract(sin(n) * 43758.5453123);}\n\n#define POINTMATERIAL\n\nvoid main()\n{\n    float psMul=sqrt(canvasWidth*canvasHeight)*0.001+0.00000000001;\n    float sizeMultiply=1.0;\n\n    #ifdef HAS_TEXTURES\n        texCoord=attrTexCoord;\n    #endif\n    \n    mat4 mMatrix=modelMatrix;\n\n    vec4 pos = vec4( vPosition, 1. );\n\n    {{MODULE_VERTEX_POSITION}}\n\n    vec4 model=mMatrix * pos;\n\n    psMul+=rand(attrVertIndex)*randomSize;\n\n    psMul*=sizeMultiply;\n\n    #ifndef SCALE_BY_DISTANCE\n        gl_PointSize = pointSize * psMul;\n    #endif\n    #ifdef SCALE_BY_DISTANCE\n        float cameraDist = distance(model.xyz, camPos);\n        gl_PointSize = (pointSize / cameraDist) * psMul;\n    #endif\n\n\n\n\n    gl_Position = projMatrix * viewMatrix * model;\n\n\n}\n";
var cgl=op.patch.cgl;

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION) );
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
var shaderOut=op.addOutPort(new Port(op,"shader",OP_PORT_TYPE_OBJECT));

var pointSize=op.addInPort(new Port(op,"PointSize",OP_PORT_TYPE_VALUE));
var randomSize=op.inValue("Random Size",0);

var makeRound=op.addInPort(new Port(op,"Round",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var doScale=op.addInPort(new Port(op,"Scale by Distance",OP_PORT_TYPE_VALUE,{ display:'bool' }));
var r=op.addInPort(new Port(op,"r",OP_PORT_TYPE_VALUE,{ display:'range',colorPick:'true' }));
var g=op.addInPort(new Port(op,"g",OP_PORT_TYPE_VALUE,{ display:'range' }));
var b=op.addInPort(new Port(op,"b",OP_PORT_TYPE_VALUE,{ display:'range' }));
var a=op.addInPort(new Port(op,"a",OP_PORT_TYPE_VALUE,{ display:'range' }));
var preMultipliedAlpha=op.addInPort(new Port(op,"preMultiplied alpha",OP_PORT_TYPE_VALUE,{ display:'bool' }));


makeRound.set(true);
doScale.set(false);
pointSize.set(3);


var shader=new CGL.Shader(cgl,'PointMaterial');
shader.setModules(['MODULE_VERTEX_POSITION','MODULE_COLOR','MODULE_BEGIN_FRAG']);

shader.define('MAKE_ROUND');

var uniPointSize=new CGL.Uniform(shader,'f','pointSize',pointSize);
var uniRandomSize=new CGL.Uniform(shader,'f','randomSize',randomSize);


shaderOut.set(shader);
shader.setSource(attachments.shader_vert,attachments.shader_frag);
shader.glPrimitive=cgl.gl.POINTS;
shader.bindTextures=bindTextures;
shaderOut.ignoreValueSerialize=true;

r.set(Math.random());
g.set(Math.random());
b.set(Math.random());
a.set(1.0);

r.uniform=new CGL.Uniform(shader,'f','r',r);
g.uniform=new CGL.Uniform(shader,'f','g',g);
b.uniform=new CGL.Uniform(shader,'f','b',b);
a.uniform=new CGL.Uniform(shader,'f','a',a);

var uniWidth=new CGL.Uniform(shader,'f','canvasWidth',cgl.canvasWidth);
var uniHeight=new CGL.Uniform(shader,'f','canvasHeight',cgl.canvasHeight);

render.onTriggered=doRender;

var texture=op.inTexture("texture");
var textureUniform=null;

var textureMask=op.inTexture("Texture Mask");
var textureMaskUniform=null;

op.preRender=function()
{
    if(shader)shader.bind();
    doRender();
};

function bindTextures()
{
    if(texture.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE0);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, texture.get().tex);
    }
    if(textureMask.get())
    {
        cgl.gl.activeTexture(cgl.gl.TEXTURE1);
        cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, textureMask.get().tex);
    }
}

function doRender()
{
    uniWidth.setValue(cgl.canvasWidth);
    uniHeight.setValue(cgl.canvasHeight);
    
    
    cgl.setShader(shader);
    bindTextures();
    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.ONE, cgl.gl.ONE_MINUS_SRC_ALPHA);

    trigger.trigger();
    if(preMultipliedAlpha.get())cgl.gl.blendFunc(cgl.gl.SRC_ALPHA,cgl.gl.ONE_MINUS_SRC_ALPHA);

    cgl.setPreviousShader();
}


doScale.onValueChanged=function()
{
    if(doScale.get()) shader.define('SCALE_BY_DISTANCE');
        else shader.removeDefine('SCALE_BY_DISTANCE');
};

makeRound.onValueChanged=function()
{
    if(makeRound.get()) shader.define('MAKE_ROUND');
        else shader.removeDefine('MAKE_ROUND');
};

texture.onValueChanged=function()
{
    if(texture.get())
    {
        if(textureUniform!==null)return;
        shader.removeUniform('diffTex');
        shader.define('HAS_TEXTURE_DIFFUSE');
        textureUniform=new CGL.Uniform(shader,'t','diffTex',0);
    }
    else
    {
        shader.removeUniform('diffTex');
        shader.removeDefine('HAS_TEXTURE_DIFFUSE');
        textureUniform=null;
    }
};

textureMask.onValueChanged=function()
{
    if(textureMask.get())
    {
        if(textureMaskUniform!==null)return;
        shader.removeUniform('texMask');
        shader.define('HAS_TEXTURE_MASK');
        textureMaskUniform=new CGL.Uniform(shader,'t','texMask',1);
    }
    else
    {
        shader.removeUniform('texMask');
        shader.removeDefine('HAS_TEXTURE_MASK');
        textureMaskUniform=null;
    }
};



var colorizeTexture=op.addInPort(new Port(op,"colorizeTexture",OP_PORT_TYPE_VALUE,{ display:'bool' }));
colorizeTexture.set(false);
colorizeTexture.onValueChanged=function()
{
    if(colorizeTexture.get()) shader.define('COLORIZE_TEXTURE');
        else shader.removeDefine('COLORIZE_TEXTURE');
};

var textureLookup=op.addInPort(new Port(op,"texture Lookup",OP_PORT_TYPE_VALUE,{ display:'bool' }));
textureLookup.set(false);
textureLookup.onValueChanged=function()
{
    if(textureLookup.get()) shader.define('LOOKUP_TEXTURE');
        else shader.removeDefine('LOOKUP_TEXTURE');
};



};

Ops.Gl.Shader.PointMaterial.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl2.ForceField.ForceFieldForce
// 
// **************************************************************

Ops.Gl2.ForceField.ForceFieldForce = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
op.name="ForceFieldForce";

var exec=op.inFunction("Exec");

var range=op.inValue("Range Radius",1);
var attraction=op.inValue("attraction");
var angle=op.inValue("Angle");
var show=op.inValueBool("Show");

var posX=op.inValue("Pos X");
var posY=op.inValue("Pos Y");
var posZ=op.inValue("Pos Z");

var next=op.outFunction("next");

var forceObj={};
var mesh=null;
var pos=[0,0,0];
var cgl=op.patch.cgl;

range.onChange=updateForceObject;
attraction.onChange=updateForceObject;
angle.onChange=updateForceObject;
posX.onChange=updateForceObject;
posY.onChange=updateForceObject;
posZ.onChange=updateForceObject;

function updateForceObject()
{
    forceObj.range=range.get();
    forceObj.attraction=attraction.get();
    forceObj.angle=angle.get();
    forceObj.pos=pos;
}

op.onDelete=function()
{
    
};

var mark=new CGL.Marker(cgl);

exec.onTriggered=function()
{
    if(show.get())
    {
        cgl.pushModelMatrix();

        // if(!mesh)mesh=new CGL.WirePoint(cgl);
        mat4.translate(cgl.mvMatrix,cgl.mvMatrix,[posX.get(),posY.get(),posZ.get()]);
        // mesh.render(cgl,range.get()*2);
        mark.draw(cgl);
        cgl.popModelMatrix();
    }

    // vec3.transformMat4(pos, [posX.get(),posY.get(),posZ.get()], cgl.mvMatrix);
    pos=[posX.get(),posY.get(),posZ.get()];

    updateForceObject();

    CABLES.forceFieldForces=CABLES.forceFieldForces||[];
    CABLES.forceFieldForces.push(forceObj);
    
    next.trigger();
    
    CABLES.forceFieldForces.pop();
    
    if(CABLES.UI && gui.patch().isCurrentOp(op)) 
        gui.setTransformGizmo(
            {
                posX:posX,
                posY:posY,
                posZ:posZ,
            });
};


};

Ops.Gl2.ForceField.ForceFieldForce.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Matrix.Translate
// 
// **************************************************************

Ops.Gl.Matrix.Translate = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};

var render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
var trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));

var cgl=op.patch.cgl;

var x=op.addInPort(new Port(op,"x"));
var y=op.addInPort(new Port(op,"y"));
var z=op.addInPort(new Port(op,"z"));

x.set(0.0);
y.set(0.0);
z.set(0.0);

var vec=vec3.create();

render.onTriggered=function()
{
    vec3.set(vec, x.get(),y.get(),z.get());
    cgl.pushModelMatrix();
    mat4.translate(cgl.mvMatrix,cgl.mvMatrix, vec);
    trigger.trigger();
    cgl.popModelMatrix();
};


};

Ops.Gl.Matrix.Translate.prototype = new CABLES.Op();

//----------------



// **************************************************************
// 
// Ops.Gl.Matrix.OrbitControls
// 
// **************************************************************

Ops.Gl.Matrix.OrbitControls = function()
{
Op.apply(this, arguments);
var op=this;
var attachments={};
const render=op.addInPort(new Port(op,"render",OP_PORT_TYPE_FUNCTION));
const minDist=op.addInPort(new Port(op,"min distance",OP_PORT_TYPE_VALUE));
const maxDist=op.addInPort(new Port(op,"max distance",OP_PORT_TYPE_VALUE));
const initialAxis=op.addInPort(new Port(op,"initial axis y",OP_PORT_TYPE_VALUE,{display:'range'}));
const initialX=op.addInPort(new Port(op,"initial axis x",OP_PORT_TYPE_VALUE,{display:'range'}));
const initialRadius=op.inValue("initial radius",0);

const mul=op.addInPort(new Port(op,"mul",OP_PORT_TYPE_VALUE));

const smoothness=op.inValueSlider("Smoothness",1.0);
const restricted=op.addInPort(new Port(op,"restricted",OP_PORT_TYPE_VALUE,{display:'bool'}));

const active=op.inValueBool("Active",true);

const inReset=op.inFunctionButton("Reset");

const allowPanning=op.inValueBool("Allow Panning",true);
const allowZooming=op.inValueBool("Allow Zooming",true);
const allowRotation=op.inValueBool("Allow Rotation",true);
const pointerLock=op.inValueBool("Pointerlock",false);

const speedX=op.inValue("Speed X",1);
const speedY=op.inValue("Speed Y",1);

const trigger=op.addOutPort(new Port(op,"trigger",OP_PORT_TYPE_FUNCTION));
const outRadius=op.addOutPort(new Port(op,"radius",OP_PORT_TYPE_VALUE));
const outYDeg=op.addOutPort(new Port(op,"Rot Y",OP_PORT_TYPE_VALUE));
const outXDeg=op.addOutPort(new Port(op,"Rot X",OP_PORT_TYPE_VALUE));

restricted.set(true);
mul.set(1);
minDist.set(0.05);
maxDist.set(99999);

inReset.onTriggered=reset;

var cgl=op.patch.cgl;
var eye=vec3.create();
var vUp=vec3.create();
var vCenter=vec3.create();
var viewMatrix=mat4.create();
var vOffset=vec3.create();

initialAxis.set(0.5);


var mouseDown=false;
var radius=5;
outRadius.set(radius);

var lastMouseX=0,lastMouseY=0;
var percX=0,percY=0;


vec3.set(vCenter, 0,0,0);
vec3.set(vUp, 0,1,0);

var tempEye=vec3.create();
var finalEye=vec3.create();
var tempCenter=vec3.create();
var finalCenter=vec3.create();

var px=0;
var py=0;

var divisor=1;
var element=null;
updateSmoothness();

op.onDelete=unbind;

var doLockPointer=false;

pointerLock.onChange=function()
{
    doLockPointer=pointerLock.get();
    console.log("doLockPointer",doLockPointer);
};

function reset()
{
    px=px%(Math.PI*2);
    py=py%(Math.PI*2);

    percX=(initialX.get()*Math.PI*2);
    percY=(initialAxis.get()-0.5);
    radius=initialRadius.get();
    eye=circlePos( percY );
}

function updateSmoothness()
{
    divisor=smoothness.get()*10+1.0;
}

smoothness.onChange=updateSmoothness;

var initializing=true;

function ip(val,goal)
{
    if(initializing)return goal;
    return val+(goal-val)/divisor;
}

render.onTriggered=function()
{
    cgl.pushViewMatrix();

    px=ip(px,percX);
    py=ip(py,percY);
    
    outYDeg.set( (py+0.5)*180 );
    outXDeg.set( (px)*180 );

    eye=circlePos(py);

    vec3.add(tempEye, eye, vOffset);
    vec3.add(tempCenter, vCenter, vOffset);

    finalEye[0]=ip(finalEye[0],tempEye[0]);
    finalEye[1]=ip(finalEye[1],tempEye[1]);
    finalEye[2]=ip(finalEye[2],tempEye[2]);
    
    finalCenter[0]=ip(finalCenter[0],tempCenter[0]);
    finalCenter[1]=ip(finalCenter[1],tempCenter[1]);
    finalCenter[2]=ip(finalCenter[2],tempCenter[2]);
    
    mat4.lookAt(viewMatrix, finalEye, finalCenter, vUp);
    mat4.rotate(viewMatrix, viewMatrix, px, vUp);
    mat4.multiply(cgl.vMatrix,cgl.vMatrix,viewMatrix);

    trigger.trigger();
    cgl.popViewMatrix();
    initializing=false;
};

function circlePos(perc)
{
    if(radius<minDist.get()*mul.get())radius=minDist.get()*mul.get();
    if(radius>maxDist.get()*mul.get())radius=maxDist.get()*mul.get();
    
    outRadius.set(radius*mul.get());
    
    var i=0,degInRad=0;
    var vec=vec3.create();
    degInRad = 360*perc/2*CGL.DEG2RAD;
    vec3.set(vec,
        Math.cos(degInRad)*radius*mul.get(),
        Math.sin(degInRad)*radius*mul.get(),
        0);
    return vec;
}

function onmousemove(event)
{
    if(!mouseDown) return;

    var x = event.clientX;
    var y = event.clientY;
    
    var movementX=(x-lastMouseX)*speedX.get();
    var movementY=(y-lastMouseY)*speedY.get();

    if(doLockPointer)
    {
        movementX=event.movementX*mul.get();
        movementY=event.movementY*mul.get();
    }

    if(event.which==3 && allowPanning.get())
    {
        vOffset[2]+=movementX*0.01*mul.get();
        vOffset[1]+=movementY*0.01*mul.get();
    }
    else
    if(event.which==2 && allowZooming.get())
    {
        radius+=(movementY)*0.05;
        eye=circlePos(percY);
    }
    else
    {
        if(allowRotation.get())
        {
            percX+=(movementX)*0.003;
            percY+=(movementY)*0.002;
            
            if(restricted.get())
            {
                if(percY>0.5)percY=0.5;
                if(percY<-0.5)percY=-0.5;
            }
            
        }
    }

    lastMouseX=x;
    lastMouseY=y;
}

function onMouseDown(event)
{
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    mouseDown=true;
    
    if(doLockPointer)
    {
        var el=op.patch.cgl.canvas;
        el.requestPointerLock = el.requestPointerLock || el.mozRequestPointerLock || el.webkitRequestPointerLock;
        if(el.requestPointerLock) el.requestPointerLock();
        else console.log("no t found");
        // document.addEventListener("mousemove", onmousemove, false);

        document.addEventListener('pointerlockchange', lockChange, false);
        document.addEventListener('mozpointerlockchange', lockChange, false);
        document.addEventListener('webkitpointerlockchange', lockChange, false);
    }
}

function onMouseUp()
{
    mouseDown=false;
    // cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';
            
    if(doLockPointer)
    {
        document.removeEventListener('pointerlockchange', lockChange, false);
        document.removeEventListener('mozpointerlockchange', lockChange, false);
        document.removeEventListener('webkitpointerlockchange', lockChange, false);

        if(document.exitPointerLock) document.exitPointerLock();
        document.removeEventListener("mousemove", onmousemove, false);
    }
}

function lockChange()
{
    var el=op.patch.cgl.canvas;

    if (document.pointerLockElement === el || document.mozPointerLockElement === el || document.webkitPointerLockElement === el)
    {
        document.addEventListener("mousemove", onmousemove, false);
        console.log("listening...");
    }
}

function onMouseEnter(e)
{
    // cgl.canvas.style.cursor='url(/ui/img/rotate.png),pointer';
}

initialRadius.onValueChange(function()
{
    // percX=(initialX.get()*Math.PI*2);
    console.log('init radius');
    radius=initialRadius.get();
    reset();
});

initialX.onValueChange(function()
{
    px=percX=(initialX.get()*Math.PI*2);
    
});

initialAxis.onValueChange(function()
{
    py=percY=(initialAxis.get()-0.5);
    eye=circlePos( percY );
});

var onMouseWheel=function(event)
{
    if(allowZooming.get())
    {
        var delta=CGL.getWheelSpeed(event)*0.06;
        radius+=(parseFloat(delta))*1.2;

        eye=circlePos(percY);
        event.preventDefault();
    }
};

var ontouchstart=function(event)
{
    doLockPointer=false;
    if(event.touches && event.touches.length>0) onMouseDown(event.touches[0]);
};

var ontouchend=function(event)
{
    doLockPointer=false;
    onMouseUp();
};

var ontouchmove=function(event)
{
    doLockPointer=false;
    if(event.touches && event.touches.length>0) onmousemove(event.touches[0]);
};

active.onChange=function()
{
    if(active.get())bind();
        else unbind();
}


this.setElement=function(ele)
{
    unbind();
    element=ele;
    bind();
}

function bind()
{
    element.addEventListener('mousemove', onmousemove);
    element.addEventListener('mousedown', onMouseDown);
    element.addEventListener('mouseup', onMouseUp);
    element.addEventListener('mouseleave', onMouseUp);
    element.addEventListener('mouseenter', onMouseEnter);
    element.addEventListener('contextmenu', function(e){e.preventDefault();});
    element.addEventListener('wheel', onMouseWheel);

    element.addEventListener('touchmove', ontouchmove);
    element.addEventListener('touchstart', ontouchstart);
    element.addEventListener('touchend', ontouchend);

}

function unbind()
{
    if(!element)return;
    
    element.removeEventListener('mousemove', onmousemove);
    element.removeEventListener('mousedown', onMouseDown);
    element.removeEventListener('mouseup', onMouseUp);
    element.removeEventListener('mouseleave', onMouseUp);
    element.removeEventListener('mouseenter', onMouseUp);
    element.removeEventListener('wheel', onMouseWheel);

    element.removeEventListener('touchmove', ontouchmove);
    element.removeEventListener('touchstart', ontouchstart);
    element.removeEventListener('touchend', ontouchend);
}



eye=circlePos(0);
this.setElement(cgl.canvas);


bind();

initialX.set(0.25);
initialRadius.set(0.05);


};

Ops.Gl.Matrix.OrbitControls.prototype = new CABLES.Op();

//----------------

