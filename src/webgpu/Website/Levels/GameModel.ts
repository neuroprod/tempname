import Renderer from "../../lib/Renderer.ts";
import GameRenderer from "../../render/GameRenderer.ts";
import GameCamera from "../GameCamera.ts";
import GamePadInput from "../GamePadInput.ts";
import KeyInput from "../KeyInput.ts";
import TextBalloonHandler from "../conversation/TextBalloonHandler.ts";
import ConversationHandler from "../conversation/ConversationHandler.ts";
import MouseListener from "../../lib/MouseListener.ts";
import SoundHandler from "../SoundHandler.ts";

 class GameModel {

    renderer!: Renderer;
    gameRenderer!: GameRenderer;
    gameCamera!: GameCamera;
    gamepadInput!: GamePadInput;
    keyInput!: KeyInput;
    textBalloonHandler!: TextBalloonHandler;
    conversationHandler!: ConversationHandler;
    mouseListener!: MouseListener;

    //godPresent
    presentID=-1;
    numCoins: number =0;


    addCoins(number: number) {
       this.numCoins+=number
       SoundHandler.playCoin()
    }
 }
export default  new GameModel()
