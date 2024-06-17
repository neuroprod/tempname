import Texture, {TextureOptions, TextureOptionsDefault} from "./Texture";
import Renderer from "../Renderer";


export type BaseRenderTextureOptions = TextureOptions & {
    scaleToCanvas: boolean
    sizeMultiplier: number
}
export const BaseRenderTextureOptionsDefault:BaseRenderTextureOptions = {
    ...TextureOptionsDefault,
    scaleToCanvas: false,
    sizeMultiplier : 1,
}


export default class RenderTexture extends Texture {


    constructor(renderer: Renderer, label: string = "", options: Partial<BaseRenderTextureOptions>) {
        super(renderer, label, options);
        this.options = { ...BaseRenderTextureOptionsDefault,...options} as TextureOptions;

        if((this.options as BaseRenderTextureOptions).scaleToCanvas){
            this.renderer.textureHandler.addScaleToCanvasTexture(this);
        }
        this.make()
    }

    resize(width:number,height:number)
    {
        let options=this.options as BaseRenderTextureOptions
        if( this.options.width ==width*options.sizeMultiplier && this.options.height ==height*options.sizeMultiplier)return;

        this.options.width =Math.max(width*options.sizeMultiplier,1.0);
        this.options.height =Math.max(height*options.sizeMultiplier,1.0);

        this.isDirty =true;
    }
}
