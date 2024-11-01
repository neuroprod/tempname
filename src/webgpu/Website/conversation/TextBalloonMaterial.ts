import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";

import {CullMode} from "../../lib/WebGPUConstants.ts";
import Blend from "../../lib/material/Blend.ts";

import {Vector4} from "@math.gl/core";


export default class TextBalloonMaterial extends Material{

    setup(){
        this.addAttribute("aPos", ShaderType.vec3);


        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer));

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("color",new Vector4(0.1,0,0,1))

        this.cullMode =CullMode.None;
        this.depthCompare="always"
        this.depthWrite =false;

        this.blendModes =[Blend.preMultAlpha()]
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
    output.position =camera.viewProjectionMatrix*model.modelMatrix* vec4( aPos,1.0);
   

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
