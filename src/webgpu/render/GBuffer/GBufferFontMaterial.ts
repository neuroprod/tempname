import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import DefaultTextures from "../../lib/textures/DefaultTextures.ts";
import {CullMode} from "../../lib/WebGPUConstants.ts";
import {Textures} from "../../data/Textures.ts";


export default class GBufferFontMaterial extends Material{

    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aNormal", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("normal", ShaderType.vec3 );
        this.addVertexOutput("uv", ShaderType.vec2 );

        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer));


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);

        uniforms.addTexture("colorTexture",this.renderer.getTexture(Textures.MAINFONT))
        uniforms.addSampler("mySampler")
this.cullMode =CullMode.None;
        //this.logShader =true;
    }
    getShader(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////   
struct GBufferOutput {
  @location(0) color : vec4f,
  @location(1) normal : vec4f,
   
}
${this.getVertexOutputStruct()}   


${this.getShaderUniforms()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    output.position =camera.viewProjectionMatrix*model.modelMatrix* vec4( aPos,1.0);
    output.normal = model.normalMatrix*aNormal;
    output.uv =aUV0;
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  GBufferOutput
{
    var output : GBufferOutput;
    
    
     var text= textureSample(colorTexture, mySampler,  uv);//textureLoad(fontTexture,  mySampler,0);
      let sigDist = max(min(text.r, text.g), min(max(text.r, text.g), text.b))- 0.5;

  let pxRange = 4.0;

  let dx = 512*length(vec2f(dpdxFine(uv.x), dpdyFine(uv.x)));
  let dy = 512*length(vec2f(dpdxFine(uv.y), dpdyFine(uv.y)));
  let toPixels = pxRange * inverseSqrt(dx * dx + dy * dy);

  let pxDist = sigDist * toPixels;

  let edgeWidth = 0.5;

  let alpha = smoothstep(-edgeWidth, edgeWidth, pxDist);
   
    if(sigDist<0.0){
     discard;
    }
    
    
    output.color =vec4(0.0,0.0,0.0,1.0);
    output.normal =vec4(normalize(normal)*vec3f(0.5) +vec3f(0.5),0.0);

    return output;
}
///////////////////////////////////////////////////////////
        `
    }


}
