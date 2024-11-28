
import ColorAttachment from "./ColorAttachment";

import Renderer from "../Renderer";
import RenderTexture from "./RenderTexture";
import Texture from "./Texture";

import RenderPass from "../RenderPass.ts";
import Blit from "../blit/Blit.ts";

import MipMapMaterial from "./MipMapMaterial.ts";

export default class MipMapRenderPass extends RenderPass {
    public colorAttachment: ColorAttachment;
    private blitMaterial:MipMapMaterial;
    private blit: Blit;
    public target: RenderTexture;


    constructor(renderer: Renderer, size: number, format: GPUTextureFormat) {

        super(renderer, "mipmapPass");

        this.target = new RenderTexture(renderer, "mipPrep" + size, {
            format: format,
            sampleCount: 1,
            scaleToCanvas: false,
            width: size,
            height: size,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC
        });
        this.target.make()
        this.colorAttachment = new ColorAttachment(this.target, {clearValue: {r: 1, g: 0, b: 0, a: 1}});

        this.colorAttachments = [this.colorAttachment];

        this.blitMaterial = new MipMapMaterial(renderer,"mipmap")
        this.blit = new Blit(renderer, 'mip', this.blitMaterial)
    }

    public setInputTexture(input: Texture) {
        this.blitMaterial.setTexture("inputTexture", input)
        this.blitMaterial.uniformGroups[0].update()
    }

    draw() {

        this.blit.draw(this);


    }


}
