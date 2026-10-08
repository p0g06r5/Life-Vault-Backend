import {Hono} from 'hono';
import {cors} from 'hono/cors';
import {secureHeaders} from 'hono/secure-headers';
import {currentUser,register,login,logout,me,type Bindings} from './auth';
const app=new Hono<{Bindings:Bindings}>();
app.use('*',secureHeaders());
app.use('/api/v1/*',async(c,next)=>{
 const allowed=[c.env.APP_ORIGIN||'https://life-vault-c3b.pages.dev','http://localhost:5173'];
 return cors({origin:(origin)=>allowed.includes(origin)?origin:null,allowMethods:['GET','POST','PATCH','DELETE','OPTIONS'],allowHeaders:['Content-Type'],credentials:true,maxAge:600})(c,next);
});
app.use('/api/v1/*',async(c,next)=>{
 if(!['GET','HEAD','OPTIONS'].includes(c.req.method)){
  const origin=c.req.header('origin');
  if(!origin||![c.env.APP_ORIGIN||'https://life-vault-c3b.pages.dev','http://localhost:5173'].includes(origin))return c.json({error:'Untrusted request origin.'},403);
  if(!(c.req.header('content-type')||'').toLowerCase().startsWith('application/json'))return c.json({error:'JSON content type required.'},415);
 }
 await next();
});
app.get('/health',async c=>{
 let database:'ready'|'migration-required'|'unavailable'='unavailable';
 if(c.env.DB){try{await c.env.DB.prepare('SELECT id FROM users LIMIT 1').first();await c.env.DB.prepare('SELECT user_id FROM auth_credentials LIMIT 1').first();database='ready'}catch{database='migration-required'}}
 return c.json({status:database==='ready'?'ok':'setup-required',service:'lifevault-api',version:2,database},database==='ready'?200:503);
});
app.get('/api/v1',c=>c.json({service:'LifeVault API',version:'v1',status:'authentication'}));
app.post('/api/v1/auth/register',c=>register(c));
app.post('/api/v1/auth/login',c=>login(c));
app.post('/api/v1/auth/logout',c=>logout(c));
app.get('/api/v1/auth/me',c=>me(c));
app.get('/api/v1/me',c=>me(c));
app.all('/api/v1/collections',async c=>{if(!await currentUser(c))return c.json({error:'Sign in to continue.'},401);return c.json({error:'Collections cloud sync is not available yet. Data still lives in this browser.'},501)});
app.all('/api/v1/collections/*',async c=>{if(!await currentUser(c))return c.json({error:'Sign in to continue.'},401);return c.json({error:'Collections cloud sync is not available yet.'},501)});
app.notFound(c=>c.json({error:'Not found'},404));
app.onError((err,c)=>{console.error('LifeVault API error',err instanceof Error?err.name:'unknown');return c.json({error:'Service temporarily unavailable.'},503)});
export default app;
