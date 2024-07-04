import UI from "./UI/UI";
import Texture from "./textures/Texture.ts";


function download(content: any, fileName: string, contentType: string) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

export function saveToJsonFile(data: any, filename: string) {
    let dataString = JSON.stringify(data);
    download(dataString, filename + ".json", "text/plain");
    UI.logEvent("Downloading", filename + ".json");
}

export function saveToBinFile(data: any, filename: string) {

    download(data, filename + ".bin", "application/octet-stream");
    UI.logEvent("Downloading", filename + ".bin");
}

// RGBA8Unorm GPUTextureUsage.COPY_SRC
export async function sendTextureToServer(texture:Texture,filename:string,saveTarget:string,data:string=""){

    let blob = await getImageBlob (texture)

    await sendBlobToServer(blob as Blob,"image/png",filename+".png",saveTarget,data)
}

export async function  sendBlobToServer(b:Blob,mime:string,filename:string,saveTarget:string,data:string ="") {

    const file = new File( [b], filename , {
        type: mime
    });

    let formData = new FormData();
    formData.set("destination",saveTarget);
    formData.set("data",data);
    formData.append("file",file);
    const response = await fetch("http://localhost:3001/save", {
        method: "POST",
        body: formData,
    });


}
export async function  saveScene(fileName:string,data:string ="") {

    let formData = new FormData();
    formData.set("fileName",fileName);
    formData.set("data",data);

    const response = await fetch("http://localhost:3001/saveScene", {
        method: "post",
        body: formData,
    });


}

// RGBA8Unorm GPUTextureUsage.COPY_SRC
export async function getImageBlob (texture:Texture){

   const device = texture.renderer.device

    const bytesPerRow  =texture.options.width*4
    const bytesPerRowAligned = Math.ceil(bytesPerRow / 256) * 256;

    const bufferSize =  bytesPerRowAligned * texture.options.height;

    const stagingBuffer = device.createBuffer({
        size:bufferSize,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });
    let commandEncoder = device.createCommandEncoder();
    commandEncoder.copyTextureToBuffer(
        {
            texture: texture.textureGPU,mipLevel:0,origin: {
                x:0,
                y:0,
                z: 0,
            },
        },
        {
            buffer: stagingBuffer,
            bytesPerRow:bytesPerRowAligned
        },
        {
            width: texture.options.width,
            height: texture.options.height,
            depthOrArrayLayers: 1,
        },
    );
    device.queue.submit([commandEncoder.finish()]);


    await stagingBuffer.mapAsync(
        GPUMapMode.READ,
        0, // Offset
        bufferSize, // Length
    );

    const copyArrayBuffer = stagingBuffer.getMappedRange(0, bufferSize);
    const dataTemp = new Uint8Array(copyArrayBuffer.slice(0))//blue red green alpha?
    stagingBuffer.unmap();
    stagingBuffer.destroy()

   const data  =new Uint8Array(texture.options.width*texture.options.height*4)
    let targetPos =0;
   for(let i=0;i<texture.options.height;i++){
       let srcPos = i*bytesPerRowAligned;
       for(let j=0;j<texture.options.width;j++) {
           data[targetPos++] = dataTemp[srcPos];
           data[targetPos++] = dataTemp[srcPos+1];
           data[targetPos++] = dataTemp[srcPos+2];

           data[targetPos++] = dataTemp[srcPos+3];
           srcPos+=4;

       }
   }


    let canvas  = document.createElement("canvas");//HTMLCanvasElement()
    canvas.width = texture.options.width;
    canvas.height = texture.options.height;
    let ctx = canvas.getContext("2d");

    if(ctx) {
        let imData = ctx.createImageData(texture.options.width, texture.options.height)
        imData.data.set(data)
        ctx.putImageData(imData,0,0)

    }

    return await new Promise(resolve => canvas.toBlob(resolve,"image/png",1));

}
