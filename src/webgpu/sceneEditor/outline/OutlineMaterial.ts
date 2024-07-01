import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultTextures from "../../lib/textures/DefaultTextures.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import {CompareFunction, CullMode} from "../../lib/WebGPUConstants.ts";


export default class OutlineMaterial extends Material
{
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("uv0", ShaderType.vec2 );

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addTexture("inputTexture",DefaultTextures.getWhite(this.renderer));


        this.depthWrite = false
        this.depthCompare = CompareFunction.Always

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
    output.uv0 = aUV0;

    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
    let textureSize =vec2<f32>( textureDimensions(inputTexture));
    let uvPos = vec2<i32>(floor(uv0*textureSize));
    
    var colorBlur =0.0;
    let step =2;
    for(var x=-step;x<=step;x+=step)
    {
        for(var y=-step;y<=step;y+=step)
        {
           colorBlur+= textureLoad(inputTexture,  uvPos+vec2i(x,y) ,0).x;
        }
    }
    colorBlur/=9.0;
    
  
     let alpha= (1.0-smoothstep(0.7,1.0,colorBlur))*smoothstep(0.0,0.3,colorBlur);
    
    return vec4(alpha,alpha*0.5,0.0,alpha) ;
}
///////////////////////////////////////////////////////////
        `
    }

}
