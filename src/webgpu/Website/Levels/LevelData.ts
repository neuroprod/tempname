import Renderer from "../../lib/Renderer.ts";
import GameRenderer from "../../render/GameRenderer.ts";
import GameCamera from "../GameCamera.ts";
import GamePadInput from "../GamePadInput.ts";
import KeyInput from "../KeyInput.ts";
import TextBalloonHandler from "../conversation/TextBalloonHandler.ts";
import ConversationHandler from "../conversation/ConversationHandler.ts";

export default class LevelData {

    renderer!: Renderer;
    gameRenderer!: GameRenderer;
    gameCamera!: GameCamera;
    gamepadInput!: GamePadInput;
    keyInput!: KeyInput;
    textBalloonHandler!: TextBalloonHandler;
    conversationHandler!: ConversationHandler;

    //godPresent
    presentID=-1;

}
