const root=document.getElementById('loop-atlas-proposal');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const design={speed:0.8,glow:1.1,density:'comfortable'};
const canvas=root.querySelector('#la-orbit'),ctx=canvas.getContext('2d');
const motion=root.querySelector('#la-motion-toggle');
let paused=reduced.matches,visible=true,raf=0,last=0,phase=0,width=400,height=222;
let colors=[];
function resolveColors(){const swatch=document.createElement('span');swatch.hidden=true;root.appendChild(swatch);colors=['--la-brand','--la-blue','--la-purple','--la-paper'].map(key=>{swatch.style.color='var('+key+')';return getComputedStyle(swatch).color;});swatch.remove();}
function point(a,layer){const stretch=Math.min(width*.38,195),squash=height*(.28+layer*.014),angle=-.19+layer*.07;const x=Math.sin(a)*stretch,y=Math.sin(2*a)*squash;return [width/2+x*Math.cos(angle)-y*Math.sin(angle),height*.46+x*Math.sin(angle)+y*Math.cos(angle)];}
function draw(){if(!ctx||!width)return;ctx.clearRect(0,0,width,height);ctx.globalAlpha=1;
for(let side=0;side<2;side++){const glow=ctx.createRadialGradient(width*(side?.7:.3),height*.45,0,width*(side?.7:.3),height*.45,width*.33);glow.addColorStop(0,colors[side]);glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.globalAlpha=.14*design.glow;ctx.fillRect(0,0,width,height);}
ctx.globalAlpha=1;
for(let layer=0;layer<3;layer++){
ctx.strokeStyle=colors[layer];ctx.lineWidth=.8;ctx.globalAlpha=.27;ctx.beginPath();for(let i=0;i<=240;i++){const p=point(i/240*Math.PI*2,layer);i?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.stroke();
for(let j=0;j<13;j++){const angle=phase*(1+layer*.11)+j/13*Math.PI*2+layer*.43;for(let tail=18;tail>=0;tail--){const p=point(angle-tail*.014,layer);ctx.globalAlpha=(1-tail/19)*.66;ctx.fillStyle=colors[layer];ctx.shadowColor=colors[layer];ctx.shadowBlur=tail===0?12*design.glow:0;ctx.beginPath();ctx.arc(p[0],p[1],tail===0?2.1:1.25,0,Math.PI*2);ctx.fill();}}
}
ctx.shadowBlur=0;
for(let i=0;i<35;i++){const x=((Math.sin(i*73.21)*43758.5453)%1+1)%1*width;const y=((Math.sin(i*29.79)*17913.75)%1+1)%1*(height-42)+5;const offset=Math.sin(phase*.5+i)*4;ctx.globalAlpha=.14+.15*(Math.sin(phase+i)+1)/2;ctx.fillStyle=colors[i%3];ctx.beginPath();ctx.arc(x,y+offset,i%4===0?1.7:1,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
}
function tick(now){raf=0;if(!root.isConnected)return;if(!paused&&visible&&!document.hidden){if(now-last>=32){phase+=Math.min((now-last)/1000,.05)*design.speed;last=now;draw();}raf=requestAnimationFrame(tick);}}
function sync(){cancelAnimationFrame(raf);raf=0;motion.textContent=reduced.matches?'Reduced motion':paused?'Play motion':'Pause motion';motion.disabled=reduced.matches;motion.setAttribute('aria-pressed',String(paused));if(!paused&&visible&&!document.hidden){last=performance.now();raf=requestAnimationFrame(tick);}else draw();}
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);resolveColors();draw();}
motion.onclick=()=>{paused=!paused;sync();};
reduced.addEventListener('change',()=>{paused=reduced.matches;sync();});
document.addEventListener('visibilitychange',sync);
new ResizeObserver(resize).observe(canvas);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(canvas);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{resolveColors();draw();});
function paint(){root.style.setProperty('--la-space',design.density==='comfortable'?'22px':'15px');resolveColors();draw();}paint();resize();sync();
