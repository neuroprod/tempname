import Renderer from "../Renderer.ts";

import VideoRenderPass from "./VideoRenderPass.ts";
import {Vector2} from "@math.gl/core";

export default class VideoPlayer{

    video: HTMLVideoElement;
    private renderer: Renderer;
    private videoRenderPass: VideoRenderPass;


    constructor(renderer:Renderer,file:string,size:Vector2) {

            this.video = document.createElement("Video") as HTMLVideoElement;
            this.renderer =renderer
        this.videoRenderPass  =new VideoRenderPass(renderer,file,size)
        this.video.src =file;
        this.video.autoplay=false;
        this.video.loop =true;
        this.video.muted =true;
    }
    getTexture(){
        return this.videoRenderPass.texture
    }

    play(){

        this.video.play().then(()=>{

            this.video.requestVideoFrameCallback(this.setFrame.bind(this));
        })

    }
    public pauze(){
        this.video.pause()

    }
    public setFrame(){
       // this.isReady = true;
        let videoFrame = new VideoFrame(this.video)

        this.videoRenderPass.material.uniformGroups[0].setVideoFrameTexture("colorTexture",videoFrame)
        this.videoRenderPass.material.uniformGroups[0].update();

        let comEncoder = this.renderer.device.createCommandEncoder()
        this.videoRenderPass.addToCommandEncoder(comEncoder)

        this.renderer.device.queue.submit([comEncoder.finish()]);


        //console.log(videoFrame)

        this.video.requestVideoFrameCallback(this.setFrame.bind(this));
        // this.onVideoFrame()*/
        videoFrame.close()

    }

}
