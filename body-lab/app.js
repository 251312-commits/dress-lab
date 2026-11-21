"use strict";
(() => {
 const NS="http://www.w3.org/2000/svg",el=(id)=>document.getElementById(id),svg=(tag)=>document.createElementNS(NS,tag);
 const defaults={head:100,neck:100,shoulders:100,bust:100,waist:100,hips:100,ratio:100,arms:100,armLength:100,thighs:100,calves:100};
 const state={...defaults};
 const presets={
  default:{}, slim:{bust:94,waist:90,hips:93,arms:95,thighs:94,calves:95},
  curvy:{bust:115,waist:92,hips:114,thighs:111,shoulders:104},
  long:{ratio:87,thighs:101,calves:98,neck:104}
 };
 const controls=[
  ["head","머리 크기",90,112,"머리 · 상체"],["neck","목 길이",80,125],
  ["shoulders","어깨 너비",88,116],["bust","가슴둘레",88,118],
  ["waist","허리 너비",86,116,"허리 · 골반"],["hips","골반 너비",88,116],
  ["ratio","상·하체 비율",86,114],["arms","팔 굵기",90,112,"팔"],
  ["armLength","팔 길이",90,114],["thighs","허벅지 굵기",90,114,"다리"],["calves","종아리 굵기",90,112]
 ];
 const layer=[
  ["foot_left","foot",false,"왼발"],["foot_right","foot",true,"오른발"],
  ["shin_left","shin",false,"왼쪽 종아리"],["shin_right","shin",true,"오른쪽 종아리"],
  ["thigh_left","thigh",false,"왼쪽 허벅지"],["thigh_right","thigh",true,"오른쪽 허벅지"],
  ["forearm_left","forearm",false,"왼쪽 아래팔"],["forearm_right","forearm",true,"오른쪽 아래팔"],
  ["upper_arm_left","upper_arm",false,"왼쪽 위팔"],["upper_arm_right","upper_arm",true,"오른쪽 위팔"],
  ["neck","neck",false,"목"],["pelvis","pelvis",false,"골반"],["torso","torso",false,"상체"],["head","head",false,"머리"],
  ["hand_left","hand",false,"왼손"],["hand_right","hand",true,"오른손"]
 ];
 const pieces=el("pieces"),anchors=el("anchors"),model=el("doll"),map=new Map();
 function path(fill,attrs){
  const p=svg("path");p.setAttribute("fill",fill);
  for(const [k,v] of Object.entries(attrs))p.setAttribute(k,v);
  return p;
 }
 for(const [id,key,mirror] of layer){
  const g=svg("g");g.setAttribute("data-part",id);
  if(mirror)g.setAttribute("transform","translate(252 0) scale(-1 1)");
  const fill=path("url(#skin)",{});
  const outline=path("none",{stroke:"#90665f","stroke-width":"1.65","stroke-linejoin":"round","stroke-linecap":"round"});
  const detail=path("none",{stroke:"#bf857a","stroke-width":"1.4","stroke-opacity":".34","stroke-linecap":"round"});
  g.append(fill,outline,detail);pieces.appendChild(g);map.set(id,{key,fill,outline,detail});
 }
 for(const [id,label,min,max,section] of controls){
  if(section){const h=document.createElement("h3");h.className="section-title";h.textContent=section;el("controls").appendChild(h);}
  const box=document.createElement("div");box.className="control";
  const readout=document.createElement("div");readout.className="readout";
  const title=document.createElement("label");title.htmlFor="shape-"+id;title.textContent=label;
  const output=document.createElement("output");output.textContent="100%";readout.append(title,output);
  const input=document.createElement("input");input.type="range";input.id="shape-"+id;input.min=String(min);input.max=String(max);input.step="1";input.value="100";
  input.addEventListener("input",()=>{
   state[id]=Number(input.value);
   updateSlider(input,output,min,max);
   setSelectedPreset(null);
   render();
  });
  updateSlider(input,output,min,max);box.append(readout,input);el("controls").appendChild(box);
 }
 function updateSlider(input,output,min,max){
  const v=Number(input.value);output.value=String(v)+"%";
  input.style.setProperty("--fill",String((v-min)/(max-min)*100)+"%");
 }
 for(const [id,key,mirrored,label] of layer){
  const a=document.createElement("a");a.href="./assets/parts/"+id+".svg";a.download=id+".svg";a.textContent=label+" SVG";a.title=id+".svg";
  el("assets").appendChild(a);
 }
 function setSelectedPreset(key){
  for(const b of document.querySelectorAll("[data-preset]"))b.classList.toggle("active",b.dataset.preset===key);
 }
 function render(){
  const result=window.DressLabBodyGeometry(state);
  for(const [id,layer] of map){
   const p=result.parts[layer.key];
   layer.fill.setAttribute("d",p.fill||"");
   layer.outline.setAttribute("d",p.outline||"");
   layer.detail.setAttribute("d",p.detail||"");
  }
  anchors.replaceChildren();
  for(const [x,y,label] of result.anchors){
   const dot=svg("circle");dot.setAttribute("cx",x);dot.setAttribute("cy",y);dot.setAttribute("r","3");
   dot.setAttribute("fill","#4382bd");dot.setAttribute("stroke","#fff");dot.setAttribute("stroke-width","1");
   const title=svg("title");title.textContent=label;dot.appendChild(title);anchors.appendChild(dot);
  }
 }
 function change(values,key){
  Object.assign(state,defaults,values);
  for(const [name,label,min,max] of controls){
   const input=el("shape-"+name);input.value=String(state[name]);updateSlider(input,input.parentElement.querySelector("output"),min,max);
  }
  setSelectedPreset(key);render();
 }
 for(const b of document.querySelectorAll("[data-preset]"))b.addEventListener("click",()=>change(presets[b.dataset.preset],b.dataset.preset));
 el("reset").addEventListener("click",()=>change({},"default"));
 el("show-anchors").addEventListener("change",e=>{anchors.style.display=e.currentTarget.checked?"":"none";});
 el("checker").addEventListener("change",e=>{el("stage").classList.toggle("checker",e.currentTarget.checked);});
 function download(blob,name){
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1800);
 }
 function serialized(){
  const copy=model.cloneNode(true);
  copy.querySelector("#anchors")?.remove();
  copy.setAttribute("xmlns",NS);copy.setAttribute("width","504");copy.setAttribute("height","1460");
  copy.removeAttribute("role");copy.removeAttribute("aria-label");
  return new XMLSerializer().serializeToString(copy);
 }
 el("save-json").addEventListener("click",()=>{
  const json={format:"dress-lab-body-v2",canvas:{width:252,height:730},parameters:{...state}};
  download(new Blob([JSON.stringify(json,null,2)],{type:"application/json"}),"dress-lab-body-v2.json");
 });
 el("save-svg").addEventListener("click",()=>download(new Blob([serialized()],{type:"image/svg+xml;charset=utf-8"}),"dress-lab-body-v2.svg"));
 el("save-png").addEventListener("click",()=>{
  const button=el("save-png");button.disabled=true;button.textContent="변환 중...";
  const blob=new Blob([serialized()],{type:"image/svg+xml;charset=utf-8"}),url=URL.createObjectURL(blob),img=new Image();
  img.onload=()=>{
   const canvas=document.createElement("canvas");canvas.width=504;canvas.height=1460;
   const ctx=canvas.getContext("2d");ctx.clearRect(0,0,504,1460);ctx.drawImage(img,0,0,504,1460);
   URL.revokeObjectURL(url);
   canvas.toBlob(out=>{
    if(out)download(out,"dress-lab-body-v2.png");
    else alert("PNG를 변환하지 못했어. SVG로 저장해 줘.");
    button.disabled=false;button.textContent="투명 PNG 저장";
   },"image/png");
  };
  img.onerror=()=>{URL.revokeObjectURL(url);button.disabled=false;button.textContent="투명 PNG 저장";alert("PNG 변환 실패. SVG로 저장해 줘.");};
  img.src=url;
 });
 change({},"default");
})();