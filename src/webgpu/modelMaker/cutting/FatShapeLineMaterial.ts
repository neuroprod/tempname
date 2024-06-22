import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import {CompareFunction,  VertexStepMode} from "../../lib/WebGPUConstants.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import {Vector2, Vector4} from "@math.gl/core";



export default class FatShapeLineMaterial extends Material{

    setup(){

        this.addAttribute("aInstPos0", ShaderType.vec3,1,VertexStepMode.Instance);
        this.addAttribute("aInstPos1", ShaderType.vec3,1,VertexStepMode.Instance);
        this.addAttribute("aPos", ShaderType.vec3);


        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer), true);

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("color",new Vector4(0.5,0.5,0.5,1))
        uniforms.addUniform("ratio",1)
        uniforms.addUniform("lineSize",5)


        this.depthCompare = CompareFunction.Always;
        this.depthWrite =false;

    }
    getShader(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////   

${this.getVertexOutputStruct()}   


${this.getShaderUniforms()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
    var screen0 =camera.viewProjectionMatrix*model.modelMatrix*vec4( aInstPos0,1.0);
    var screen1 =camera.viewProjectionMatrix*model.modelMatrix*vec4( aInstPos1,1.0);

    let sDir = screen1.xy-screen0.xy;
    let dir = vec2 (sDir.x*uniforms.ratio,sDir.y);
    let normal =normalize(vec2(-dir.y,dir.x));
    var offset = dir*aPos.y -(normal*aPos.x*uniforms.lineSize);
    offset.x = offset.x /uniforms.ratio;
    screen0 =vec4(screen0.xy + offset,screen0.z,screen0.w);
   
    output.position = screen0 ;


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
