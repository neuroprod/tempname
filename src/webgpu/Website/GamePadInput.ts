export default class GamePadInput{
    private gamepad: Gamepad|null =null;
    public connected: boolean =false;
    private hDir: number =0;
    private jump: boolean =false;
    constructor() {
       let pads =  navigator.getGamepads()

        window.addEventListener(
            "gamepadconnected",
            (e) => {
                this.gamepadHandler(e, true);
            },
            false,
        );
        window.addEventListener(
            "gamepaddisconnected",
            (e) => {
                this.gamepadHandler(e, false);
            },
            false,
        );
    }

    public gamepadHandler(event:GamepadEvent, connected:boolean)
    {
        this.gamepad = event.gamepad;

        // Note:
        // gamepad === navigator.getGamepads()[gamepad.index]
        this.connected  =connected


    }

    update() {
        if(this.connected){
            const gamepads = navigator.getGamepads();

            this.gamepad = gamepads[0];
            if(this.gamepad) {
                this.hDir = this.gamepad.axes[0];
                this.jump = this.gamepad.buttons[0].pressed
            }

        }
    }

    getHdir() {

        if(Math.abs(this.hDir)<0.1) this.hDir =0
        return this.hDir;
    }

    getJump() {
        return  this.jump;
    }
}
