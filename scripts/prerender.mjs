import {build} from 'esbuild';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {siteUrl,siteName,ownerName,personalLinks} from '../src/site.js';

const temporary=await mkdtemp(resolve('.prerender-'));
try {
  const entry=join(temporary,'App.mjs');
  await build({entryPoints:['src/App.jsx'],outfile:entry,bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},define:{'import.meta.env.BASE_URL':JSON.stringify('/')}});
  const {default:App}=await import(pathToFileURL(entry).href);
  const markup=renderToString(React.createElement(App));
  let html=await readFile('dist/index.html','utf8');
  const metadata=property=>{const escaped=property.replaceAll(':','\\:');const value=html.match(new RegExp('<meta property="'+escaped+'" content="([^"]+)"'));if(!value)throw new Error('Missing metadata: '+property);return value[1];};
  const personId=siteUrl+'#louis-kim';
  const graph={'@context':'https://schema.org','@graph':[
    {'@type':'Person','@id':personId,name:ownerName,alternateName:'Ersione',url:'https://ersione.com',image:siteUrl+'avatar.png',sameAs:personalLinks.map(link=>link.url)},
    {'@type':'WebSite','@id':siteUrl+'#website',url:siteUrl,name:siteName,inLanguage:'ko-KR',publisher:{'@id':personId}},
    {'@type':'WebPage','@id':siteUrl+'#webpage',url:siteUrl,name:metadata('og:title'),description:metadata('og:description'),inLanguage:'ko-KR',isPartOf:{'@id':siteUrl+'#website'},about:{'@id':personId},primaryImageOfPage:{'@type':'ImageObject',url:metadata('og:image'),width:1200,height:630}}
  ]};
  const structured=JSON.stringify(graph).replaceAll('<','\\u003c');
  if(!html.includes('<div id="root"></div>'))throw new Error('Prerender root placeholder missing');
  html=html.replace('<div id="root"></div>',`<div id="root">${markup}</div>`).replace('</head>',`<script type="application/ld+json">${structured}</script>\n</head>`);
  await writeFile('dist/index.html',html);
  await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${siteUrl}sitemap.xml\n`);
  // There is one real indexable page. Rooms and games are interactions, not URLs.
  await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`);
  console.log('Prerendered portfolio HTML, structured data, robots.txt and sitemap.xml');
} finally {await rm(temporary,{recursive:true,force:true});}
