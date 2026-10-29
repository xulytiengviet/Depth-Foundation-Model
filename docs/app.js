'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const canvas = $('scene'), ctx = canvas.getContext('2d', {alpha:false});
  const buffer = document.createElement('canvas'); buffer.width = 240; buffer.height = 145;
  const bctx = buffer.getContext('2d', {alpha:false});
  const scenes = {
    robot: {name:'01 · HÀNH LANG ROBOT', height:1.3, pitch:0.05, description:'Un robot suit une trajectoire prédéfinie.', boxes:[[-5,0,1,-4,4,30],[4,0,1,5,4,30],[-2.7,0,7,-1,1.7,9],[1.1,0,13,3,2.6,15],[-3,0,20,0,1.2,22],[0.8,0,24,2.2,3,26]]},
    drone: {name:'02 · SURVOL / DRONE',height:7,pitch:0.42,description:'',boxes:[[-7,0,6,-3,4,11],[1,0,12,5,6,17],[-5,0,22,0,3,27],[7,0,20,10,8,25],[-10,0,14,-8,7,16]]},
    car: {name:'03 · ĐƯỜNG ĐÔ THỊ',height:1.5,pitch:0.02,description:'',boxes:[[-8,0,3,-5,6,12],[5,0,3,9,9,15],[-9,0,16,-5,8,28],[5,0,20,8,5,30],[-2.8,0,13,-1,1.5,17],[1.8,0,24,3.5,1.4,27]]},
    gis: {name:'04 · BẢN ĐỒ ĐỊA PHƯƠNG 3D',height:16,pitch:0.8,description:'',boxes:[[-8,0,2,-3,4,8],[2,0,3,7,6,10],[-9,0,13,-4,7,18],[1,0,15,5,3,19],[-6,0,23,-1,5,28],[7,0,23,10,8,29]]}
  };
  scenes.robot.description='Đường chuyển động đặt trước trong hành lang; khoảng cách được tính từ bề mặt vật cản phía trước.';
  scenes.drone.name='02 · DRONE KHẢO SÁT'; scenes.drone.description='Góc nhìn trên cao minh họa quan sát công trình. Chưa mô phỏng động lực học bay hay điều khiển tránh va chạm.';
  scenes.car.description='Xe quan sát đường và các khối xe, nhà giả lập. Độ sâu không cung cấp màu đèn giao thông.';
  scenes.gis.description='Góc nhìn xiên các khối công trình trong hệ tọa độ cục bộ. Chưa gắn GNSS, hệ tọa độ địa lý hay bản đồ nền.';
  let sceneKey='robot', mode='depth', phase=0, running=!matchMedia('(prefers-reduced-motion: reduce)').matches, last=0;
  let noise=4, far=24, width=800, height=480;
  const palette=[[55,117,139],[149,228,190],[241,185,108],[120,147,231],[191,127,203],[108,197,217],[216,209,130]];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  // Slab intersection: ray parameter t; all directions normalized (t is in scene metres).
  function intersect(origin, direction, box) {
    let near=0, end=Infinity;
    for(let axis=0;axis<3;axis++){
      if(Math.abs(direction[axis])<1e-8){if(origin[axis]<box[axis]||origin[axis]>box[axis+3])return Infinity;continue;}
      let a=(box[axis]-origin[axis])/direction[axis], b=(box[axis+3]-origin[axis])/direction[axis];
      if(a>b)[a,b]=[b,a]; near=Math.max(near,a);end=Math.min(end,b);if(near>end)return Infinity;
    }
    return end>0?near:Infinity;
  }
  function depthColor(d){
    const t=clamp(d/far,0,1), stops=[[255,229,155],[155,244,208],[41,156,198],[21,44,88]];
    const f=t*2.999, a=Math.floor(f), u=f-a;return stops[a].map((n,k)=>Math.round(n*(1-u)+stops[a+1][k]*u));
  }
  function resize(){const r=canvas.parentElement.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);render();}
  function render(){
    const config=scenes[sceneKey], z=-4+Math.sin(phase)*2, x=Math.sin(phase*.7)*.4;
    const origin=[x,config.height,z], W=buffer.width,H=buffer.height;
    const pixels=bctx.createImageData(W,H), cp=Math.cos(config.pitch),sp=Math.sin(config.pitch);
    let closest=Infinity;
    for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){
      const dx=(xx/W-.5)*1.7,dy=(.5-yy/H)*1.05, dz=1;
      let ray=[dx,dy*cp-dz*sp,dy*sp+dz*cp];const len=Math.hypot(...ray);ray=ray.map(v=>v/len);
      let distance=ray[1]<-.0001?-origin[1]/ray[1]:Infinity, id=0;
      config.boxes.forEach((box,i)=>{const t=intersect(origin,ray,box);if(t<distance){distance=t;id=i+1;}});
      if(id && Math.abs(xx-W/2)<W*.2 && distance<closest)closest=distance;
      const seed=Math.abs(Math.sin(xx*12.9898+yy*78.233+Math.floor(phase*15))*43758.5453)%1;
      const dropout=seed<noise/100*.7;
      const measured=clamp(distance+(seed-.5)*noise*.055,0,far);
      let col=[7,16,28];
      if(distance<far&&!dropout){
        col=mode==='semantic'?palette[id%palette.length]:depthColor(measured);
        // A metric floor grid adds spatial references without claiming learned features.
        if(id===0){const px=origin[0]+ray[0]*distance,pz=origin[2]+ray[2]*distance;const grid=Math.abs(px-Math.round(px))<.035||Math.abs(pz-Math.round(pz))<.035;col=col.map(v=>v*(grid?.9:.5));}
        if(mode==='points' && (xx%3!==0 || yy%3!==0))col=[7,16,28];
      }
      const offset=(yy*W+xx)*4;pixels.data[offset]=col[0];pixels.data[offset+1]=col[1];pixels.data[offset+2]=col[2];pixels.data[offset+3]=255;
    }
    bctx.putImageData(pixels,0,0);ctx.imageSmoothingEnabled=mode!=='points';ctx.drawImage(buffer,0,0,width,height);
    // Local overview; axes are arbitrary metres, not geographic coordinates.
    const size=Math.min(110,width*.21),ox=width-size-18,oy=height-size-65;
    ctx.fillStyle='#081522dd';ctx.fillRect(ox,oy,size,size);ctx.strokeStyle='#436578';ctx.strokeRect(ox,oy,size,size);
    const project=(px,pz)=>[ox+(px+12)/24*size,oy+size-(pz+8)/42*size];
    config.boxes.forEach((b,i)=>{const p=project(b[0],b[2]),q=project(b[3],b[5]);ctx.fillStyle=mode==='semantic'?`rgb(${palette[(i+1)%palette.length].join(',')})`:'#477e8c';ctx.fillRect(p[0],q[1],q[0]-p[0],p[1]-q[1]);});
    const marker=project(x,z);ctx.fillStyle='#b0ffda';ctx.beginPath();ctx.arc(...marker,3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#b0ffda88';ctx.beginPath();ctx.moveTo(...marker);ctx.lineTo(marker[0]-size*.22,marker[1]-size*.45);ctx.moveTo(...marker);ctx.lineTo(marker[0]+size*.22,marker[1]-size*.45);ctx.stroke();
    ctx.fillStyle='#bed5e0';ctx.font='9px Arial';ctx.fillText('SƠ ĐỒ CỤC BỘ',ox,oy-7);
    ctx.strokeStyle='#ffffff60';ctx.beginPath();ctx.moveTo(width/2-7,height/2);ctx.lineTo(width/2+7,height/2);ctx.moveTo(width/2,height/2-7);ctx.lineTo(width/2,height/2+7);ctx.stroke();
    $('distance').textContent=Number.isFinite(closest)&&closest<far?closest.toFixed(1)+' m':'Ngoài tầm';
    $('status').textContent=noise>=25?'Nhiễu cao · nhiều điểm bị mất':'Khoảng cách hình học · chưa suy luận AI';
  }
  function sync(){
    $('scene-name').textContent=scenes[sceneKey].name;$('scene-description').textContent=scenes[sceneKey].description;
    $('play').textContent=running?'Tạm dừng':'Tiếp tục';$('motion-label').textContent=running?'Đang di chuyển':'Đã tạm dừng';
    $('view-name').textContent=$('mode').selectedOptions[0].textContent.toUpperCase();
    document.querySelectorAll('[data-scene]').forEach(b=>{b.classList.toggle('active',b.dataset.scene===sceneKey);b.setAttribute('aria-pressed',String(b.dataset.scene===sceneKey));});render();
  }
  function choose(key){sceneKey=key;phase=0;sync();}
  document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.scene)));
  document.querySelectorAll('[data-try]').forEach(b=>b.addEventListener('click',()=>{choose(b.dataset.try);$('lab').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));
  $('mode').addEventListener('change',e=>{mode=e.target.value;sync();});
  $('noise').addEventListener('input',e=>{noise=+e.target.value;$('noise-out').textContent=noise+'%';render();});
  $('range').addEventListener('input',e=>{far=+e.target.value;$('range-out').textContent=far+' m';render();});
  $('play').addEventListener('click',()=>{running=!running;sync();});
  $('reset').addEventListener('click',()=>{phase=0;noise=4;far=24;mode='depth';$('mode').value=mode;$('noise').value=4;$('range').value=24;$('noise-out').textContent='4%';$('range-out').textContent='24 m';sync();});
  let visible=true;new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{threshold:0}).observe(canvas);
  function frame(time){if(time-last>90){if(running&&visible&&!document.hidden){phase+=Math.min((time-last)/1000,.15)*.5;render();}last=time;}requestAnimationFrame(frame);}
  new ResizeObserver(resize).observe(canvas.parentElement);sync();requestAnimationFrame(frame);
})();
