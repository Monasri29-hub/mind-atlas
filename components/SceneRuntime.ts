export type FrameDriver={request:(callback:(time:number)=>void)=>number;cancel:(id:number)=>void};

/** A single pending frame at most; idle reduced-motion scenes can sleep completely. */
export function createRenderLoop(driver:FrameDriver,draw:(time:number)=>boolean){
 let pending:number|null=null,disposed=false;
 const wake=()=>{if(!disposed&&pending===null)pending=driver.request(time=>{pending=null;if(draw(time))wake()})};
 const stop=()=>{if(pending!==null)driver.cancel(pending);pending=null};
 return {wake,stop,dispose(){disposed=true;stop()}};
}

/** Limit framebuffer work independently of CSS size, including large high-DPI screens. */
export function sceneQuality(width:number,height:number,dpr:number,limited:boolean){
 const pixels=limited?900_000:2_000_000;
 return {pixelRatio:Math.min(dpr>0?dpr:1,limited?1.25:1.65,Math.sqrt(pixels/Math.max(1,width*height))),fps:limited?30:45};
}
