import {BlendFactor, BlendOperation} from "../WebGPUConstants.ts";


export default class Blend {

    static preMultAlpha():GPUBlendState {
       return  {

            color: {
                srcFactor: BlendFactor.One,
                    dstFactor: BlendFactor.OneMinusSrcAlpha,
                    operation: BlendOperation.Add,
            },
            alpha: {
                srcFactor: BlendFactor.One,
                    dstFactor: BlendFactor.OneMinusSrcAlpha,
                    operation: BlendOperation.Add,
            }
        }
    }

    static add():GPUBlendState {
        return  {

            color: {
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.One,
                operation: BlendOperation.Add,
            },
            alpha: {
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.OneMinusSrcAlpha,
                operation: BlendOperation.Add,
            }
        }
    }
}
