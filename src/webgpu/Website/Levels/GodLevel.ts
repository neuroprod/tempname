
import {PlatformLevel} from "./PlatformLevel.ts";
import LoadHandler from "../../data/LoadHandler.ts";
import SceneHandler from "../../data/SceneHandler.ts";

export class GodLevel extends PlatformLevel{

    init() {
        super.init();

        LoadHandler.startLoading()

        SceneHandler.setScene("5bbc5c44-a584-4d65-").then(() => {



                this.levelObjects.gameRenderer.gBufferPass.modelRenderer.setModels(SceneHandler.usedModels)
                this.levelObjects.gameRenderer.shadowMapPass.modelRenderer.setModels(SceneHandler.usedModels)

            LoadHandler.stopLoading()
        })

    }
}
