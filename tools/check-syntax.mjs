import {readFile,access} from 'node:fs/promises';
import {Script} from 'node:vm';
const htmls=['index.html','editor.html'];
for(const path of htmls){
 const html=await readFile(path,'utf8');
 const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
 if(!scripts.length)throw Error('No scripts in '+path);
 scripts.forEach((src,i)=>new Script(src,{filename:path+' inline #'+(i+1)}));
 console.log(path+': '+scripts.length+' inline script(s) parsed');
}
const index=await readFile('index.html','utf8');
const used=[...new Set([...index.matchAll(/assets\/legacy\/sprite-\d{3}\.png/g)].map(x=>x[0]))];
if(used.length!==51)throw Error('Expected 51 legacy assets, got '+used.length);
for(const f of used)await access(f);
console.log('All 51 legacy sprite files exist');
