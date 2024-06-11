import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";

import UniformGroup from "../../lib/material/UniformGroup.ts";
import DefaultTextures from "../../lib/textures/DefaultTextures.ts";
import {TextureSampleType} from "../../lib/WebGPUConstants.ts";

export default class DebugTextureMaterial extends Material {
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);
        this.addVertexOutput("uv0", ShaderType.vec2 );


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);

        uniforms.addUniform("renderType", 0)
        uniforms.addTexture("colorTexture", DefaultTextures.getWhite(this.renderer), {sampleType:TextureSampleType.UnfilterableFloat})
        this.depthWrite =false;
        this.depthCompare ="always"
        //this.logShader =true;
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
    output.position =vec4( aPos,1.0);
    output.uv0 =aUV0;
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) -> @location(0) vec4f
{
   
      let textureSize =vec2<f32>( textureDimensions(colorTexture));
      let uvPos = vec2<i32>(floor(uv0*textureSize));
      let color=textureLoad(colorTexture,  uvPos ,0); ;
      if(uniforms.renderType>3.5){
        return vec4(color.w,color.w,color.w,1.0) ;
      }
      else if(uniforms.renderType>2.5){
        return vec4(color.z,color.z,color.z,1.0) ;
      }
      else if(uniforms.renderType>1.5){
        return vec4(-color.x/10.0,-color.x/10.0,-color.x/10.0,1.0) ;
      }
      else if(uniforms.renderType>0.5){
        return vec4(color.x,color.x,color.x,1.0) ;
      }
      
     return vec4(color.xyz,1.0) ;
}
///////////////////////////////////////////////////////////
        `
    }






}
