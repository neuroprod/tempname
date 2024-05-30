import Texture from "./textures/Texture.ts";
import RenderTexture, {BaseRenderTextureOptions} from "./textures/RenderTexture.ts";

export default class TextureHandler{
    public texturesByLabel: { [label: string]: Texture } = {};
    public textures: Array<Texture> = [];
    private scaleToCanvasTextures: Array<RenderTexture> = [];


    constructor() {
    }
    addTexture(texture: Texture) {
        this.textures.push(texture);
        this.texturesByLabel[texture.label] = texture;
    }
    addScaleToCanvasTexture(texture: RenderTexture) {
        this.scaleToCanvasTextures.push(texture);
    }
    public resize(width:number,height:number)
    {
        for (let t of this.scaleToCanvasTextures) {
            let options = t.options as BaseRenderTextureOptions;
            t.resize(width*options.sizeMultiplier, height*options.sizeMultiplier);
            t.make();
        }
    }
}
