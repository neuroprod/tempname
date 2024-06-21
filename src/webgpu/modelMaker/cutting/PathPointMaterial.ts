import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import {CompareFunction,  VertexStepMode} from "../../lib/WebGPUConstants.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";


export default class PathPointMaterial extends Material{

    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("positionData", ShaderType.vec4,1,VertexStepMode.Instance);

        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer), true);


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("scale",this.renderer.inverseSizePixelRatio);
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
   
    var pos =camera.viewProjectionMatrix *model.modelMatrix*vec4( positionData.xyz,1.0);
    
    output.position =pos+ vec4(aPos*vec3(uniforms.scale,1.0)*(6.0-(positionData.w*2.0)),0.0);


    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
    return vec4f(0.0,0.5,1.0,1.0);
}
///////////////////////////////////////////////////////////
        `
    }


}
