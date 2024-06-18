

export default class SDFFontTexture {
    private device: GPUDevice;
    public texture: GPUTexture;

    constructor(device:GPUDevice) {
        this.device =device;
        this.texture = this.device.createTexture({
            label: "UI_fontTexture",
            size: [512, 512, 1],
            format: "rgba8unorm",
            sampleCount: 1,
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.loadURL("Inter-Bold.png").then();
    }
    async loadURL(url: string) {
        const response = await fetch(url);

        const imageBitmap = await createImageBitmap(await response.blob());
        let width = imageBitmap.width;
        let height = imageBitmap.height;


        this.device.queue.copyExternalImageToTexture(
            {source: imageBitmap},
            {texture: this.texture},
            [imageBitmap.width, imageBitmap.height]
        );


        console.log(width,height);

    }


}

