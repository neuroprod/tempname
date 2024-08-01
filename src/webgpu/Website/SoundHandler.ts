
import {Howl} from 'howler';
 class SoundHandler {
    public fxVolume =1;
    private coin!: Howl;
     private step!: Howl;
     private hitFloor!: Howl;


    init() {

       // this.fishFood = new Howl({src: ['sound/fishfood.mp3']});


        this.coin = new Howl({
            src: ['sound/coins.mp3'],
            sprite: {
                s0: [0, 800],
                s1: [1000, 800],
                s2: [2000, 800],
                s3: [3000, 800],


            }
        });
        this.step = new Howl({
            src: ['sound/step.mp3'],
            sprite: {
                s0: [0, 90],
                s1: [100, 90],
                s2: [200, 90],
                s3: [300, 90],
                s4: [400, 90],
                s5: [500, 90],
                s6: [600, 90],
                s7: [700, 90],
                s8: [800, 90],
                s9: [900, 90],



            }
        });

        this.hitFloor = new Howl({
            src: ['sound/step.mp3'],
            sprite: {
                s0: [0, 90],
                s1: [100, 90],
                s2: [200, 90],
                s3: [300, 90],
                s4: [400, 90],
                s5: [500, 90],
                s6: [600, 90],
                s7: [700, 90],
                s8: [800, 90],
                s9: [900, 90],



            }
        });

    }





    playCoin() {


        let s = Math.floor(Math.random() * 1000) % 4;

        this.coin.volume( this.fxVolume);
        this.coin.play("s" + s)

    }
     playStep() {


         let s = Math.floor(Math.random() * 1000) % 9;

         this.step.volume( this.fxVolume*0.1);
         this.step.play("s" + s)

     }
     playHitFloor(strength:number) {


         let s = Math.floor(Math.random() * 1000) % 9;

         this.hitFloor.volume( this.fxVolume);
         this.hitFloor.play("s" + s)

     }
}
export default new SoundHandler()
