
import {Vector4} from "@math.gl/core";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import Material from "../../lib/material/Material.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import {CompareFunction, CullMode} from "../../lib/WebGPUConstants.ts";

export default class CircleLineMaterial extends Material
{
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aPosPrev", ShaderType.vec3);
        this.addAttribute("aPosNext", ShaderType.vec3);
        this.addAttribute("aDir", ShaderType.vec2);

this.addVertexOutput("world",ShaderType.vec3)
        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer), true);
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer), true);

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("color",new Vector4(1,0,0,1))
        uniforms.addUniform("thickness",0.01)
        uniforms.addUniform("ratio",1)
        uniforms.addUniform("maxDist",2)
        this.depthWrite = false
        this.depthCompare = CompareFunction.Always
        this.cullMode =CullMode.None

    }
    getShader(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////   

${this.getVertexOutputStruct()}   

${this.getShaderUniforms()}


fn getPos2D( pos: vec3f)->vec3f
{
   
    let position =camera.viewProjectionMatrix*model.modelMatrix* vec4(pos,1.0);
    return  vec3(position.x/position.w,position.y/position.w,position.z/position.w);
}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    let world = model.modelMatrix* vec4(aPos,1.0);
    
   
 
   
    
    let posS=getPos2D(aPos);
    let posSNext =getPos2D(aPosNext);
    let posSPrev =getPos2D(aPosPrev);
    let dir = (posSNext.xy-posS.xy) +    (posS.xy-posSPrev.xy);
    let normal =normalize(vec2(-dir.y,dir.x));
    let pos =  posS.xy+(normal*uniforms.thickness*aDir.x*vec2(uniforms.ratio,1.0));
    output.position =vec4(pos.x,pos.y,posS.z,1.0);
    output.world = world.xyz;
   
 
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
 let dist =distance(camera.worldPosition.xyz ,world.xyz);
 if(dist>uniforms.maxDist*1.01){discard;}
    return uniforms.color;
}
///////////////////////////////////////////////////////////
        `
    }





}
