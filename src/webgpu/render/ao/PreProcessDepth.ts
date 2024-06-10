import Renderer from "../../lib/Renderer";
import RenderTexture from "../../lib/textures/RenderTexture";
import {Textures} from "../../data/Textures.ts";
import {TextureFormat} from "../../lib/WebGPUConstants.ts";
import CopyMaterial from "./depthPre/CopyMaterial.ts";
import Blit from "../../lib/blit/Blit.ts";
import CopyPass from "./depthPre/CopyPass.ts";
import DepthBlurPass from "./depthPre/DepthBlurPass.ts";
import Texture from "../../lib/textures/Texture.ts";




export default class PreProcessDepth{
result: RenderTexture
    private renderer: Renderer;

    private copyPass: CopyPass;
    private mip0: RenderTexture;
    private mip1: RenderTexture;
    private mip2: RenderTexture;
    private mip3: RenderTexture;
    private mip4: RenderTexture;
    private depthBlurMip1: DepthBlurPass;
    private depthBlurMip2: DepthBlurPass;
    private depthBlurMip3: DepthBlurPass;
    private depthBlurMip4: DepthBlurPass;


constructor(renderer:Renderer){

    this.renderer =renderer;

    this.result = new RenderTexture(renderer, Textures.DEPTH_BLUR,
        {
            scaleToCanvas: true,
            sizeMultiplier: 1,
            format: TextureFormat.R16Float,
            mipLevelCount: 5,
            usage: GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT  | GPUTextureUsage.COPY_DST
        })

    this.mip0 = new RenderTexture(renderer, Textures.DEPTH_BLUR_MIP0,
        {
            scaleToCanvas: true,
            sizeMultiplier: 1,
            format: TextureFormat.R16Float,
            mipLevelCount: 1,
            usage: GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT  | GPUTextureUsage.COPY_SRC
        })
    this.copyPass =new CopyPass(renderer, this.mip0)


    this.mip1= new RenderTexture(renderer, Textures.DEPTH_BLUR_MIP1,
        {
            scaleToCanvas: true,
            sizeMultiplier: 0.5,
            format: TextureFormat.R16Float,
            mipLevelCount: 1,
            usage: GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT  | GPUTextureUsage.COPY_SRC
        })
    this.depthBlurMip1  =new DepthBlurPass(renderer,this.mip1,this.mip0)


    this.mip2= new RenderTexture(renderer, Textures.DEPTH_BLUR_MIP2,
        {
            scaleToCanvas: true,
            sizeMultiplier: 0.25,
            format: TextureFormat.R16Float,
            mipLevelCount: 1,
            usage: GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT  | GPUTextureUsage.COPY_SRC
        })
    this.depthBlurMip2  =new DepthBlurPass(renderer,this.mip2,this.mip1)


    this.mip3= new RenderTexture(renderer, Textures.DEPTH_BLUR_MIP3,
        {
            scaleToCanvas: true,
            sizeMultiplier: 0.125,
            format: TextureFormat.R16Float,
            mipLevelCount: 1,
            usage: GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT  | GPUTextureUsage.COPY_SRC
        })
    this.depthBlurMip3  =new DepthBlurPass(renderer,this.mip3,this.mip2)

    this.mip4= new RenderTexture(renderer, Textures.DEPTH_BLUR_MIP4,
        {
            scaleToCanvas: true,
            sizeMultiplier: 0.0625,
            format: TextureFormat.R16Float,
            mipLevelCount: 1,
            usage: GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.RENDER_ATTACHMENT  | GPUTextureUsage.COPY_SRC
        })
    this.depthBlurMip4  =new DepthBlurPass(renderer,this.mip4,this.mip3)


}


public add(){
    this.copyPass.add();
    this.depthBlurMip1.add()
    this.depthBlurMip2.add()
    this.depthBlurMip3.add()
    this.depthBlurMip4.add()


    this.copyToMip(this.result,this.mip0,0);
    this.copyToMip(this.result,this.mip1,1);
    this.copyToMip(this.result,this.mip2,2);
    this.copyToMip(this.result,this.mip3,3);
    this.copyToMip(this.result,this.mip4,4);

}
private copyToMip(destT:Texture,srcT:Texture,mipLevel:number){
    let source: GPUImageCopyTexture = {texture: srcT.textureGPU};
    let w =  srcT.options.width;
    let h =  srcT.options.height;
    let dest: GPUImageCopyTexture = {texture: destT.textureGPU, mipLevel: mipLevel};
    this.renderer.commandEncoder.copyTextureToTexture(source, dest, {
        width: w,
        height: h
    })

}



}
