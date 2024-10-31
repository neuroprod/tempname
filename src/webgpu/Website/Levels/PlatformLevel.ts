import {BaseLevel} from "./BaseLevel.ts";
import CharacterController from "../CharacterController.ts";
import Timer from "../../lib/Timer.ts";

export class PlatformLevel extends BaseLevel{
    public characterController!: CharacterController;



    init() {
        super.init();
        this.characterController = new CharacterController(this.levelObjects.renderer)
    }

    update(){
        this.levelObjects.gamepadInput.update();
        let delta = Timer.delta;
        let jump = this.levelObjects.keyInput.getJump()
        let hInput = this.levelObjects.keyInput.getHdir()
        if (this.levelObjects.gamepadInput.connected) {

            if (hInput == 0) hInput = this.levelObjects.gamepadInput.getHdir()

            if (!jump) jump = this.levelObjects.gamepadInput.getJump()
        }

        this.characterController.update(      delta, hInput, jump)
    }
}
