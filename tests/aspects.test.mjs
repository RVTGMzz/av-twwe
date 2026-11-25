import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const d=JSON.parse(readFileSync(new URL('../data/aspects.json',import.meta.url),'utf8'));
const svg=readFileSync(new URL('../assets/ui/aspects/glyphs.svg',import.meta.url),'utf8');
const ids=d.aspects.map(a=>a.id);
assert.equal(ids.length,12);assert.equal(new Set(ids).size,12);
assert.equal(d.resonance_enabled,false);assert(!ids.includes('neutral'));
function multiplier(atk,def){if(!ids.includes(atk)&&atk!=='neutral')throw Error('invalid attack');
if(def.length<1||def.length>2||new Set(def).size!==def.length||def.some(x=>!ids.includes(x)))throw Error('invalid defender');
if(atk==='neutral')return 100;
return Math.max(75,Math.min(125,100+def.reduce((s,x)=>s+d.matrix[atk][x]-100,0)));}
assert.equal(Object.keys(d.matrix).length,12);
let single=0,dual=0;
for(const a of d.aspects){const x=a.id;assert(svg.includes('id="'+a.icon_id+'"'));assert.equal(Object.keys(d.matrix[x]).length,12);
assert.equal(d.matrix[x][x],100);
for(const direction of [ids.map(y=>d.matrix[x][y]),ids.map(y=>d.matrix[y][x])]){assert.equal(direction.filter(v=>v===125).length,2);assert.equal(direction.filter(v=>v===75).length,2);assert.equal(direction.filter(v=>v===100).length,8);}
for(const y of ids){assert.equal(d.matrix[x][y]+d.matrix[y][x],200);assert.equal(multiplier(x,[y]),d.matrix[x][y]);single++;}}
for(const x of [...ids,'neutral'])for(let i=0;i<12;i++){if(x==='neutral'){assert.equal(multiplier(x,[ids[i]]),100);single++;}
for(let j=i+1;j<12;j++){const y=ids[i],z=ids[j];const m=multiplier(x,[y,z]);assert([75,100,125].includes(m));assert.equal(m,multiplier(x,[z,y]));const expected=x==='neutral'?100:Math.max(75,Math.min(125,d.matrix[x][y]+d.matrix[x][z]-100));assert.equal(m,expected);dual++;}}
assert.equal(multiplier('ember',['grove','frost']),125);
assert.equal(multiplier('ember',['gale','tide']),75);
assert.equal(multiplier('ember',['grove','tide']),100);
assert.equal(multiplier('ember',['grove','stone']),125===d.matrix.ember.stone?125:Math.max(75,Math.min(125,125+d.matrix.ember.stone-100)));
assert.throws(()=>multiplier('ember',['grove','grove']));assert.throws(()=>multiplier('ember',[]));assert.throws(()=>multiplier('ember',['neutral']));
for(const k of d.prototype_kin)assert.doesNotThrow(()=>multiplier('neutral',k.aspects));
console.log('PASS: '+single+' single and '+dual+' dual matchup cases; glyph IDs and roster validated');
