'use strict';
// Extra wardrobe packs: images remain independent files; the legacy 252×730 engine is intact.
const DRESS_LAB_CANVAS_FORMATS = Object.freeze({
  standard: {width:252,height:730,offsetX:0},
  expanded: {width:504,height:900,offsetX:126}
});
const DRESS_LAB_EXTERNAL_ITEMS = new Map();
const DRESS_LAB_EXPANDED_PARTS = new Set();
const DRESS_LAB_TINT_CACHE = new Map();

function isExpandedPart(key) { return DRESS_LAB_EXPANDED_PARTS.has(key); }

function updateWardrobeViewport() {
  const wide = Object.values(selectedLayers).some(id =>
    DRESS_LAB_EXTERNAL_ITEMS.get(id)?.canvas === 'expanded');
  const width = wide ? 580 : 400, height = wide ? 960 : 825;
  if (W === width && H === height) return;
  W=width; H=height; OX=(W-SW)/2; OY=30;
  outfitTemp.width=W; outfitTemp.height=H;
  const stage=document.querySelector('.canvas-bed');
  if(stage) stage.classList.toggle('wide-outfit',wide);
}

// External garment RGB tint is cached per part and chosen color.
function externalTint(item,key,image) {
  const color=garmentColors[item.id] || item.color;
  const record=DRESS_LAB_TINT_CACHE.get(key);
  if(record && record.color===color) return record.image;
  const tinted=tintGarment(image,color,item.id);
  DRESS_LAB_TINT_CACHE.set(key,{color,image:tinted});
  return tinted;
}

// Larger skirts are rendered around the same doll anchor, never resized into the narrow PNG grid.
// Horizontal bands follow the existing texturePoint morph, including waist and hip changes.
// Below the 730px body grid, the hem continues from the displaced foot baseline.
function drawExpandedPlane(plane) {
  if(!DRESS_LAB_EXTERNAL_ITEMS.size) return;
  const context=canvas.getContext('2d');
  const shape=values();
  const unchanged=shape.every(v=>Math.abs(v-1)<0.00001);
  const selected=[];
  for(let layer=0;layer<layerDrawOrder.length;layer++){
    const id=selectedLayers[layerDrawOrder[layer]];
    const item=DRESS_LAB_EXTERNAL_ITEMS.get(id);
    if(!item || item.canvas!=='expanded') continue;
    for(const part of item.parts){
      if(part.plane===plane) selected.push({layer,order:part.order,item,part});
    }
  }
  selected.sort((a,b)=>a.layer-b.layer || a.order-b.order);
  for(const {item,part} of selected) {
    const image=outfitImages[part.key];
    if(!image)continue;
    const tinted=externalTint(item,part.key,image);
    if(unchanged) {
      context.drawImage(tinted,(OX-126)*dpr,OY*dpr,504*dpr,900*dpr);
      continue;
    }
    const step=16;
    for(let y=0;y<900;y+=step){
      const height=Math.min(step,900-y);
      const q=Math.min(730,y),q2=Math.min(730,y+height);
      const left=texturePoint(0,q,shape),right=texturePoint(252,q,shape);
      const scale=Math.max(0.70,Math.min(1.35,(right[0]-left[0])/252));
      const center=(left[0]+right[0])/2;
      const yy=texturePoint(126,q,shape)[1]+Math.max(0,y-730);
      const yy2=texturePoint(126,q2,shape)[1]+Math.max(0,y+height-730);
      const outHeight=Math.max(0.5,yy2-yy);
      context.drawImage(tinted,0,y,504,height,
        (center-252*scale)*dpr,yy*dpr,504*scale*dpr,(outHeight+0.4)*dpr);
    }
  }
}

async function loadExternalWardrobe(){
  let manifest;
  try{
    const response=await fetch('data/wardrobe.json',{cache:'no-store'});
    if(!response.ok) throw Error('HTTP '+response.status);
    manifest=await response.json();
  }catch(error){
    console.warn('추가 의상 목록을 불러오지 못했다:',error);
    return;
  }
  if(!manifest || !Array.isArray(manifest.items))return;
  let count=0;
  for(const raw of manifest.items){
    try{
      if(!raw || !/^[a-z][a-z0-9-]{0,63}$/.test(raw.id))throw Error('invalid item id');
      if(DRESS_LAB_EXTERNAL_ITEMS.has(raw.id) || raw.id in imageGroup
         || raw.id in originalGarmentColors)throw Error('duplicate item id: '+raw.id);
      const format=DRESS_LAB_CANVAS_FORMATS[raw.canvas||'standard'];
      if(!format)throw Error('unknown canvas format: '+raw.canvas);
      if(!Array.isArray(raw.parts) || !raw.parts.length)throw Error('no garment parts');
      const name=String(raw.name||raw.id).replace(/[<>&"']/g,s=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[s]));
      const group=String(raw.group||'outer');
      if(!['upper','top','vest','outer','dress','skirt','lower','socks','shoes','neck','waistAccessory'].includes(group))throw Error('invalid group');
      const parts=[];
      const images=[];
      for(const [i,p] of raw.parts.entries()){
        if(!p || !['back','front'].includes(p.plane) || typeof p.path!=='string'
           || !p.path.startsWith('clothes/'+raw.id+'/') || !/\.(png|webp)$/i.test(p.path))throw Error('invalid part');
        const key='external_'+raw.id.replace(/-/g,'_')+'_'+i;
        const loaded=await new Promise((resolve,reject)=>{
          const img=new Image();
          img.onload=()=>resolve(img);
          img.onerror=()=>reject(Error('image load failed: '+p.path));
          img.src=p.path;
        });
        if(loaded.naturalWidth!==format.width || loaded.naturalHeight!==format.height)
          throw Error(p.path+' must be '+format.width+'×'+format.height);
        images.push([key,loaded]);
        parts.push({key,plane:p.plane,order:Number.isFinite(Number(p.order))?Number(p.order):i*10});
      }
      const item={id:raw.id,name,group,canvas:raw.canvas||'standard',
        color:/^#[0-9a-f]{6}$/i.test(raw.color||'')?raw.color:'#808080',
        parts:parts.sort((a,b)=>a.order-b.order)};
      DRESS_LAB_EXTERNAL_ITEMS.set(item.id,item);
      for(const [key,img] of images)outfitImages[key]=img;
      imageGroup[item.id]=item.parts.map(p=>p.key);
      for(const part of item.parts){
        if(part.plane==='back')behindBodyKeys.add(part.key);
        if(item.canvas==='expanded')DRESS_LAB_EXPANDED_PARTS.add(part.key);
      }
      originalGarmentColors[item.id]=item.color;
      garmentColors[item.id]=item.color;
      let category=wardrobeLayers.find(g=>g.id===group);
      if(!category){
        category={id:group,label:group==='dress'?'드레스':group,items:[['none','없음']]};
        wardrobeLayers.push(category);
        emptyOutfitDefault[group]='none';selectedLayers[group]='none';
        layerDrawOrder.splice(layerDrawOrder.indexOf('outer'),0,group);
        categoryIcons[group]='♧';categoryTypes[group]=group==='dress'?'lower':'upper';
      }
      const noneIndex=category.items.findIndex(x=>x[0]==='none');
      category.items.splice(noneIndex<0?category.items.length:noneIndex,0,[item.id,item.name]);
      count++;
    }catch(error){console.warn('의상 등록 실패:',raw?.id,error);}
  }
  if(count){
    buildWardrobeUI();
    composeOutfitSource();
    renderWardrobeThumbnails();
    syncWardrobeUI();
    queue();
  }
}