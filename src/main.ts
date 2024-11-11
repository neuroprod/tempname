import './style.css'
import Main from "./webgpu/Main.ts";



document.querySelector<HTMLDivElement>('#app')!.innerHTML = `

  <canvas id="webGPUCanvas"></canvas>

`

// @ts-ignore
const main  =new Main()
