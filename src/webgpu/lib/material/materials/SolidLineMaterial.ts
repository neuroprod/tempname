import Material from "../Material.ts";
import {ShaderType} from "../ShaderTypes.ts";

import {CompareFunction, CullMode} from "../../WebGPUConstants.ts";
import DefaultUniformGroups from "../DefaultUniformGroups.ts";
import UniformGroup from "../UniformGroup.ts";
import {Vector4} from "@math.gl/core";

export default class SolidLineMaterial extends Material
{
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aPosPrev", ShaderType.vec3);
        this.addAttribute("aPosNext", ShaderType.vec3);
        this.addAttribute("aDir", ShaderType.vec2);


        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer), true);
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer), true);

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("color",new Vector4(1,0,0,1))
        uniforms.addUniform("thickness",0.01)
        uniforms.addUniform("ratio",1)
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
    
    
    var posS=getPos2D(aPos);
    var posSNext =getPos2D(aPosNext);
    var posSPrev =getPos2D(aPosPrev);
    let dir = (posSNext.xy-posS.xy) +    (posS.xy-posSPrev.xy);
    let normal =normalize(vec2(-dir.y,dir.x));
    let pos =  posS.xy+(normal*uniforms.thickness*aDir.x*vec2(uniforms.ratio,1.0));
    output.position =vec4(pos.x,pos.y,posS.z,1.0);
    
 
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
    return uniforms.color;
}
///////////////////////////////////////////////////////////
        `
    }





}
