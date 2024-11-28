import Texture, {TextureOptions} from "./Texture";
import Renderer from "../Renderer";
import {TextureFormat} from "../WebGPUConstants";

export default class TextureLoader extends Texture {
    public loaded: boolean=false;

    onComplete=()=>{}
    constructor(renderer: Renderer, url: string = "", options: Partial<TextureOptions>={}) {
        super(renderer, url, options)

        this.options.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST|GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT;
     //  if(url.includes("_Op."))
      // this.options.format = TextureFormat.R8Unorm

        this.make();

        if(url=="")return;

        this.loadURL(url).then(() => {

            this.onComplete();
        });


    }
    reload(url:string){
        this.loadURL(url).then(() => {

            this.onComplete();
        });
    }
    async loadURL(url: string) {
        const response = await fetch(url);

        const imageBitmap = await createImageBitmap(await response.blob());
        this.options.width = imageBitmap.width;
        this.options.height = imageBitmap.height;

     if (this.options.mipLevelCount > Math.log2(imageBitmap.height) - 2) {
           this.options.mipLevelCount = Math.max(Math.log2(imageBitmap.height) - 2, 0);

        }

        //this.options.usage = GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT;
        this.isDirty = true;
        this.make();


        this.device.queue.copyExternalImageToTexture(
            {source: imageBitmap},
            {texture: this.textureGPU},
            [imageBitmap.width, imageBitmap.height]
        );

       this.renderer.mipmapQueue.addTexture(this)
        this.loaded=true;
    }

}
