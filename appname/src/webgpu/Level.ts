import Renderer from "./lib/Renderer.ts";
import Model from "./lib/model/Model.ts";
import Box from "./lib/mesh/geometry/Box.ts";
import TestMaterial from "./lib/material/TestMaterial.ts";

export default class Level{

     models:Array<Model>=[];
    private renderer: Renderer;

    constructor(renderer:Renderer)
    {
        this.renderer =renderer;

        let material = new TestMaterial(this.renderer, "testMaterial");

        let floor = new Model(this.renderer, "floor");
        floor.material = material
        floor.mesh = new Box(this.renderer,{width:10,depth:1.5,height:0.3})
        floor.setPosition(0,-3,0);
        this.models.push(floor)



        let platform = new Model(this.renderer, "platform");
        platform.material = material
        platform.mesh = new Box(this.renderer,{width:4,depth:1.5})
        platform.setPosition(6.5,-1.5,0);
        platform.setEuler(0,0,0.0)
        this.models.push(platform)




        let rock = new Model(this.renderer, "rock2");
        rock.material = material
        rock.mesh = new Box(this.renderer,{width:1,depth:1.5,height:100})
        rock.setPosition(-4.5,-2,0);
        this.models.push(rock)


        let rock2 = new Model(this.renderer, "rock2");
        rock2.material = material
        rock2.mesh = new Box(this.renderer,{width:1,depth:1.5})
        rock2.setPosition(4.5,-2.5,0);
        this.models.push(rock2)


        let platform2 = new Model(this.renderer, "platform");
        platform2.material = material
        platform2.mesh = new Box(this.renderer,{width:3,depth:1.5})
        platform2.setPosition(4,3,0);
        platform2.setEuler(0,0,0)
        this.models.push(platform2)

        {
            let platform2 = new Model(this.renderer, "platform");
            platform2.material = material
            platform2.mesh = new Box(this.renderer,{width:3,depth:1.5})
            platform2.setPosition(-3,2,0);
            this.models.push(platform2)
        }

        {
            let platform2 = new Model(this.renderer, "platform");
            platform2.material = material
            platform2.mesh = new Box(this.renderer,{width:3,depth:1.5})
            platform2.setPosition(3,5,0);
            this.models.push(platform2)
        }
    }
}
