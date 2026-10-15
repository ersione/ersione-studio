// Serve the build as a static host: unknown URLs are 404, never SPA fallbacks.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.ico':'image/x-icon'};
createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=resolve(root,'.'+path+(path.endsWith('/')?'index.html':''));
  if(!file.startsWith(root+sep))throw new Error('Invalid path');
  if(!(await stat(file)).isFile())throw new Error('Not a file');
  const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end('<!doctype html><html lang="ko"><meta name="robots" content="noindex"><title>페이지를 찾을 수 없습니다</title><p>페이지를 찾을 수 없습니다. <a href="/">Studio로 돌아가기</a></p></html>');}
}).listen(4177,'127.0.0.1');
