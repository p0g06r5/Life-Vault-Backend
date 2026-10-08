import type {Context} from 'hono';
import {currentUser,type Bindings} from './auth';
type Ctx=Context<{Bindings:Bindings}>;
const TYPES=['space','collections','professional'] as const;
type Type=typeof TYPES[number];
const validType=(x:string):x is Type=>TYPES.includes(x as Type);
const limits:Record<Type,number>={space:180000,collections:180000,professional:120000};
const empty:Record<Type,unknown>={
 space:{profile:{name:'Your LifeVault',subtitle:'A home for your memories, places, and experiences.',about:'A little space for all the things that make life yours.',location:''},experiences:[],projects:[],achievements:[],education:[],memories:[]},
 collections:[],
 professional:{name:'',headline:'',location:'',email:'',website:'',about:'',skills:[],experience:[],projects:[],education:[],certifications:[]}
};
function isRecord(x:unknown):x is Record<string,unknown>{return !!x && typeof x==='object' && !Array.isArray(x)}
function checkData(kind:Type,data:unknown):boolean{
 if(kind==='collections'){
  return Array.isArray(data)&&data.length<=100&&data.every(a=>isRecord(a)&&typeof a.title==='string'&&a.title.length<=180&&Array.isArray(a.photos)&&a.photos.length<=12&&a.photos.every(p=>isRecord(p)&&p.mode==='remote'&&typeof p.url==='string'&&p.url.startsWith('https://')));
 }
 if(!isRecord(data))return false;
 if(kind==='space')return isRecord(data.profile)&&['experiences','projects','achievements','education','memories'].every(k=>Array.isArray(data[k])&&(data[k] as unknown[]).length<=1000);
 return ['skills','experience','projects','education','certifications'].every(k=>Array.isArray(data[k])&&(data[k] as unknown[]).length<=500);
}
export async function listDocuments(c:Ctx){
 const user=await currentUser(c);if(!user)return c.json({error:'Please sign in.'},401);
 const rows=await c.env.DB.prepare('SELECT kind,body,version FROM user_documents WHERE user_id=?').bind(user.id).all<{kind:string;body:string;version:number}>();
 const docs:Record<string,unknown>={};for(const kind of TYPES)docs[kind]={body:empty[kind],version:0};
 for(const row of rows.results||[]){if(validType(row.kind))try{docs[row.kind]={body:JSON.parse(row.body),version:row.version}}catch{}}
 c.header('Cache-Control','no-store');return c.json({documents:docs});
}
export async function putDocument(c:Ctx){
 const user=await currentUser(c);if(!user)return c.json({error:'Please sign in.'},401);
 const kind=c.req.param('kind')||'';if(!validType(kind))return c.json({error:'Unknown document type.'},404);
 const length=Number(c.req.header('content-length')||'0');if(length>limits[kind]*2)return c.json({error:'Document is too large.'},413);
 let request:{body:unknown;version:unknown};try{
  const raw=await c.req.text();
  if(raw.length>limits[kind]*2)return c.json({error:'Document is too large.'},413);
  request=JSON.parse(raw) as {body:unknown;version:unknown};
 }catch{return c.json({error:'Invalid document.'},400)}
 if(!Number.isSafeInteger(request.version)||Number(request.version)<0||!checkData(kind,request.body))return c.json({error:'Document format is invalid.'},400);
 const serialized=JSON.stringify(request.body);
 if(serialized.length>limits[kind])return c.json({error:'This document is too large for cloud sync. Remove device-only photos or reduce content.'},413);
 const ver=Number(request.version);
 if(ver===0){
  const result=await c.env.DB.prepare('INSERT OR IGNORE INTO user_documents(user_id,kind,body,version,updated_at) VALUES(?,?,?,1,datetime("now"))').bind(user.id,kind,serialized).run();
  if(result.meta.changes===1)return c.json({version:1});
 }else{
  const result=await c.env.DB.prepare('UPDATE user_documents SET body=?,version=version+1,updated_at=datetime("now") WHERE user_id=? AND kind=? AND version=?').bind(serialized,user.id,kind,ver).run();
  if(result.meta.changes===1)return c.json({version:ver+1});
 }
 return c.json({error:'Your information was changed in another session. Reload to avoid overwriting it.',code:'VERSION_CONFLICT'},409);
}
