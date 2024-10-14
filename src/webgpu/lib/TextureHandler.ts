import Texture from "./textures/Texture.ts";
import RenderTexture, {BaseRenderTextureOptions} from "./textures/RenderTexture.ts";

export default class TextureHandler{
    private texturesByLabel:Map<string,Texture> =new Map();
    public textures: Array<Texture> = [];
    private scaleToCanvasTextures: Array<RenderTexture> = [];

    constructor() {
    }
    addTexture(texture: Texture) {
        this.textures.push(texture);
        this.texturesByLabel.set(texture.label,texture);

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

    removeTexture(texture: Texture) {
        let index = this.textures.indexOf(texture)
        if(index>-1) this.textures.splice(index,1)


       index = this.scaleToCanvasTextures.indexOf(texture as RenderTexture)
        if(index>-1) this.scaleToCanvasTextures.splice(index,1)

        this.texturesByLabel.delete(texture.label);

    }

    getTextureByName(name: string) {
        let t =  this.texturesByLabel.get(name)
        if(!t)console.log("Texture not found:",name)
        return t;
    }
}
