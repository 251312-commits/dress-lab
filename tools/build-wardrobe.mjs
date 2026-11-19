// Run during GitHub Pages deployment to convert clothes/*/item.json into the public index.
import {readdir,readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {join,basename} from 'node:path';

const root='clothes',target='data/wardrobe.json';
const groups=new Set(['upper','top','vest','outer','dress','skirt','lower','socks','shoes','neck','waistAccessory']);
const modes={standard:[252,730],expanded:[504,900]};
const result=[];
let dirs=[];
try{dirs=await readdir(root,{withFileTypes:true})}catch(error){if(error.code!=='ENOENT')throw error}
for(const dir of dirs.filter(x=>x.isDirectory()&&!x.name.startsWith('_')).sort((a,b)=>a.name.localeCompare(b.name))){
  const id=dir.name;
  if(!/^[a-z][a-z0-9-]{0,63}$/.test(id))throw Error('Invalid garment folder: '+id);
  let config;
  try{config=JSON.parse(await readFile(join(root,id,'item.json'),'utf8'))}
  catch(e){throw Error('Missing or invalid item.json for '+id+': '+e.message)}
  if(config.id!==id)throw Error('Folder name and item.id differ: '+id);
  if(typeof config.name!=='string'||!config.name.trim())throw Error('Missing name for '+id);
  if(!groups.has(config.group))throw Error('Unknown group for '+id);
  if(!modes[config.canvas||'standard'])throw Error('Unknown canvas mode for '+id);
  if(!Array.isArray(config.parts)||!config.parts.length)throw Error('No layers for '+id);
  const parts=[];
  for(const p of config.parts){
    if(typeof p.file!=='string'||p.file!==basename(p.file)||!/\.(png|webp)$/i.test(p.file))
      throw Error('Invalid part file for '+id);
    if(!['front','back'].includes(p.plane))throw Error('Invalid front/back for '+id);
    await access(join(root,id,p.file));
    parts.push({path:join(root,id,p.file).replaceAll('\\','/'),plane:p.plane,order:Number(p.order)||0});
  }
  result.push({id,name:config.name.trim(),group:config.group,canvas:config.canvas||'standard',
    color:/^#[0-9a-f]{6}$/i.test(config.color||'')?config.color:'#808080',
    parts:parts.sort((a,b)=>a.order-b.order)});
}
await mkdir('data',{recursive:true});
await writeFile(target,JSON.stringify({schemaVersion:1,items:result},null,2)+'\n','utf8');
console.log('Prepared '+result.length+' garment packs in '+target);
