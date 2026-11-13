/* ryngrafy.com.pl – koncepcja sklepu (wersja demonstracyjna, bez płatności) */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const app=$('#app');
const ENGR_NET=1.50, ENGR_GROSS=1.85; // obecny cennik pracowni: 1,50 zł netto za znak
const CATS=[
 {id:'patriotyczne',name:'Ryngrafy patriotyczne',short:'Patriotyczne',img:'img/p/r002.webp',desc:'Orzeł w koronie, Matka Boża Częstochowska i hasło „Bóg Honor Ojczyzna”. Mosiądz patynowany lub posrebrzany, grawerowany i malowany ręcznie farbami olejnymi.'},
 {id:'maryjne',name:'Ryngrafy maryjne',short:'Maryjne',img:'img/p/r007.webp',desc:'Matka Boża Częstochowska, Ostrobramska i Kalwaryjska. Prezent na chrzest, komunię, bierzmowanie, ślub i jubileusz, z dedykacją wygrawerowaną na rewersie.'},
 {id:'strazacy',name:'Dla strażaków',short:'Dla strażaków',img:'img/p/f001.webp',desc:'Ryngrafy, odznaki, znaczki i różańce ze św. Florianem, z motywem OSP i PSP. Dla jednostek realizujemy też zamówienia hurtowe.'},
 {id:'miniatury',name:'Miniatury i przypinki',short:'Miniatury i przypinki',img:'img/p/ryn4.webp',desc:'Małe ryngrafy do portfela i samochodu oraz przypinki patriotyczne do klapy marynarki.'},
 {id:'wizerunki',name:'Płaskorzeźby i wizerunki',short:'Płaskorzeźby',img:'img/p/s019.webp',desc:'Posrebrzane płaskorzeźby, szkaplerz i kapliczki z wizerunkami Matki Bożej i św. Jana Pawła II.'}
];
const OCC=[
 {id:'chrzest',name:'Na chrzest'},{id:'komunia',name:'Na komunię'},{id:'bierzmowanie',name:'Na bierzmowanie'},
 {id:'slub',name:'Na ślub'},{id:'jubileusz',name:'Na jubileusz'},{id:'kaplan',name:'Dla kapłana'},
 {id:'wojsko',name:'Dla żołnierza'},{id:'osp',name:'Dla strażaka'}
];
let P=[]; const byId={};
const fmt=n=>n.toLocaleString('pl-PL',{minimumFractionDigits:2,maximumFractionDigits:2})+' zł';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l');
const catOf=id=>CATS.find(c=>c.id===id);
const engrChars=t=>(t||'').replace(/\s/g,'').length;

/* ---------- storage (try/catch) ---------- */
const store={
  get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};
let cart=store.get('ryn_cart_v1',[]);
if(!Array.isArray(cart)) cart=[];
function saveCart(){store.set('ryn_cart_v1',cart);updateBadge()}
function lineKey(l){return [l.id,l.size,l.ded||'',l.sash||''].join('|')}
function addToCart(l){
  const k=lineKey(l); const ex=cart.find(x=>lineKey(x)===k);
  if(ex) ex.qty=Math.min(99,ex.qty+l.qty); else cart.push(l);
  saveCart();
}
function cartTotals(){
  let priced=0,count=0,made=0,engr=0;
  cart.forEach(l=>{const p=byId[l.id]; if(!p) return; count+=l.qty;
    if(p.price!=null) priced+=p.price*l.qty; else made+=l.qty;
    if(l.ded) engr+=engrChars(l.ded)*ENGR_GROSS*l.qty;});
  return {priced,count,made,engr};
}
function updateBadge(){
  const n=cartTotals().count, b=$('#cartN');
  b.textContent=n; b.classList.remove('bump'); void b.offsetWidth; if(n) b.classList.add('bump');
}

/* ---------- header ---------- */
function buildNav(){
  const cur=location.hash;
  const links=CATS.map(c=>`<a href="#/kategoria/${c.id}">${c.short}</a>`).join('')+`<a href="#/grawer">Grawer dedykacji</a><a href="#/info/hurt">Dla parafii i jednostek</a><a href="#/#pracownia">O pracowni</a>`;
  $('#cnav').innerHTML=links;
  $('#mnavIn').innerHTML=CATS.map(c=>`<a href="#/kategoria/${c.id}">${c.name}<span>${P.filter(p=>p.cat===c.id).length}</span></a>`).join('')+
   `<a href="#/sklep">Wszystkie produkty<span>${P.length}</span></a><a href="#/grawer">Grawer dedykacji</a><a href="#/info/hurt">Dla parafii i jednostek</a><a href="#/info/dostawa">Dostawa i płatność</a><a class="mphone" href="tel:+48509798144"><small>Zamówienia i pytania</small>509 798 144</a>`;
  $('#fcats').innerHTML=CATS.map(c=>`<li><a href="#/kategoria/${c.id}">${c.name}</a></li>`).join('');
}
function markNav(){
  const h=location.hash||'#/';
  $$('#cnav a,#mnavIn a').forEach(a=>{const href=a.getAttribute('href');
    const on=href!=='#/#pracownia'&&(h===href||(h.startsWith('#/produkt/')&&curProductCat&&href==='#/kategoria/'+curProductCat));
    if(on) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');});
}
let curProductCat=null;
const burger=$('#burger'), mnav=$('#mnav');
function setHdrVar(){const r=document.documentElement.style; r.setProperty('--hdr',($('.demo-bar').offsetHeight+$('#hdr').offsetHeight)+'px'); r.setProperty('--mtop',$('#hdr').getBoundingClientRect().bottom+'px')}
function closeMenu(){mnav.hidden=true;burger.setAttribute('aria-expanded','false');document.body.style.overflow=''}
burger.addEventListener('click',()=>{const open=mnav.hidden; setHdrVar(); mnav.hidden=!open; burger.setAttribute('aria-expanded',String(open)); document.body.style.overflow=open?'hidden':''});
mnav.addEventListener('click',e=>{if(e.target.closest('a')) closeMenu()});

/* search */
const hs=$('#hsearch'), q=$('#q'), sugg=$('#sugg');
function search(term){
  const t=norm(term).trim(); if(!t) return [];
  const words=t.split(/\s+/);
  return P.map(p=>{const hay=norm(p.search+' '+(catOf(p.cat)||{}).name);
    let s=0; for(const w of words){ if(!hay.includes(w)) return null; s+=norm(p.name).includes(w)?2:1; if(norm(p.sku)===w) s+=5;}
    return {p,s};}).filter(Boolean).sort((a,b)=>b.s-a.s).map(x=>x.p);
}
let sIdx=-1;
q.addEventListener('input',()=>{
  const r=search(q.value); sIdx=-1;
  if(!q.value.trim()){sugg.hidden=true;return}
  sugg.innerHTML=(r.length?r.slice(0,6).map(p=>`<a href="#/produkt/${p.id}" role="option"><img src="${p.imgs[0].src}" alt=""><div><b>${esc(p.name)}</b><span>${p.price!=null?fmt(p.price):'Na zamówienie'} · ${p.sku}</span></div></a>`).join('')+`<a class="all" href="#/szukaj/${encodeURIComponent(q.value.trim())}">Pokaż wszystkie wyniki (${r.length})</a>`
    :`<a class="all" href="#/szukaj/${encodeURIComponent(q.value.trim())}">Brak podpowiedzi. Szukaj „${esc(q.value.trim())}”</a>`);
  sugg.hidden=false;
});
q.addEventListener('keydown',e=>{
  const items=$$('a',sugg); if(sugg.hidden||!items.length) return;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault(); sIdx=(sIdx+(e.key==='ArrowDown'?1:-1)+items.length)%items.length; items.forEach((a,i)=>a.classList.toggle('on',i===sIdx));}
  else if(e.key==='Enter'&&sIdx>=0){e.preventDefault(); location.hash=items[sIdx].getAttribute('href'); closeSearch();}
  else if(e.key==='Escape'){closeSearch()}
});
hs.addEventListener('submit',e=>{e.preventDefault(); const v=q.value.trim(); if(v){location.hash='#/szukaj/'+encodeURIComponent(v); closeSearch();}});
sugg.addEventListener('click',e=>{if(e.target.closest('a')) closeSearch()});
document.addEventListener('click',e=>{if(!hs.contains(e.target)&&!e.target.closest('#sbtn')){sugg.hidden=true; hs.classList.remove('open')}});
$('#sbtn').addEventListener('click',()=>{hs.classList.toggle('open'); if(hs.classList.contains('open')) setTimeout(()=>q.focus(),30)});
function closeSearch(){sugg.hidden=true; hs.classList.remove('open'); q.blur()}

/* ---------- swipe gallery ---------- */
function swHTML(p,{count=true,nav=true,href=null}={}){
  const n=p.imgs.length;
  return `<div class="sw" data-i="0" data-n="${n}" ${href?`data-href="${href}"`:''} tabindex="-1">
   <div class="sw-track">${p.imgs.map((im,i)=>`<div class="sw-slide"><img src="${im.src}" alt="${esc(im.alt)}" ${i?'loading="lazy"':''} decoding="async" draggable="false"></div>`).join('')}</div>
   ${n>1&&nav?`<button class="sw-nav p" type="button" aria-label="Poprzednie zdjęcie">‹</button><button class="sw-nav n" type="button" aria-label="Następne zdjęcie">›</button>`:''}
   ${n>1&&count?`<span class="sw-count">1 / ${n}</span>`:''}</div>`;
}
function mountSwipers(root){
  $$('.sw',root).forEach(sw=>{
    if(sw._m) return; sw._m=1;
    const tr=$('.sw-track',sw), n=+sw.dataset.n; let i=0,x0=0,y0=0,dx=0,drag=false,down=false,moved=false;
    const go=k=>{i=Math.max(0,Math.min(n-1,k)); tr.style.transform=`translateX(${-i*100}%)`; sw.dataset.i=i;
      const c=$('.sw-count',sw); if(c) c.textContent=`${i+1} / ${n}`; sw.dispatchEvent(new CustomEvent('slide',{detail:i}));};
    sw._go=go;
    sw.addEventListener('pointerdown',e=>{ if(e.target.closest('.sw-nav')||n<2) {moved=false;return}
      down=true;drag=false;moved=false;x0=e.clientX;y0=e.clientY;dx=0;});
    sw.addEventListener('pointermove',e=>{ if(!down) return; const ddx=e.clientX-x0, ddy=e.clientY-y0;
      if(!drag){ if(Math.abs(ddx)>7&&Math.abs(ddx)>Math.abs(ddy)){drag=true; tr.classList.add('drag'); try{sw.setPointerCapture(e.pointerId)}catch(_){} } else if(Math.abs(ddy)>10){down=false;return} }
      if(drag){dx=ddx; if((i===0&&dx>0)||(i===n-1&&dx<0)) dx*=.35; tr.style.transform=`translateX(calc(${-i*100}% + ${dx}px))`; moved=true;}});
    const end=()=>{ if(!down) return; down=false; tr.classList.remove('drag');
      if(drag){const w=sw.clientWidth; if(dx<-w*.15) go(i+1); else if(dx>w*.15) go(i-1); else go(i);} drag=false;};
    sw.addEventListener('pointerup',end); sw.addEventListener('pointercancel',end); sw.addEventListener('lostpointercapture',end);
    sw.addEventListener('click',e=>{
      const nb=e.target.closest('.sw-nav'); if(nb){e.preventDefault();e.stopPropagation(); go(i+(nb.classList.contains('n')?1:-1)); return}
      if(moved){e.preventDefault();e.stopPropagation();moved=false;return}
      if(sw.dataset.href) location.hash=sw.dataset.href;
    },true);
    sw.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(i+1); if(e.key==='ArrowLeft')go(i-1)});
    $$('img',sw).forEach(im=>im.addEventListener('dragstart',e=>e.preventDefault()));
  });
}

/* ---------- product card ---------- */
function card(p){
  const href='#/produkt/'+p.id;
  const badge=p.engrave?'<span class="card-badge">Grawer dedykacji</span>':(p.price!=null&&p.cat==='strazacy'&&/Różaniec/.test(p.name)?'':'' );
  return `<article class="card">
   <div class="card-media" style="z-index:2">${badge}${swHTML(p,{href})}</div>
   <div class="card-body">
     <a class="card-title" href="${href}">${esc(p.name)}</a>
     <span class="card-meta">${esc(p.sizes.length>1?p.sizes.length+' rozmiary · '+p.sizes[0].label+' do '+p.sizes[p.sizes.length-1].label.replace(/ \(.*/,''):p.sizes[0].label)}</span>
     <div class="card-foot">${p.price!=null?`<span class="price">${fmt(p.price)}</span><button class="card-add" data-add="${p.id}" type="button">Do koszyka</button>`:`<span class="price q">Na zamówienie, wycena</span>`}</div>
   </div></article>`;
}
app.addEventListener('click',e=>{
  const b=e.target.closest('[data-add]'); if(!b) return;
  const p=byId[b.dataset.add]; addToCart({id:p.id,size:p.sizes[0].code,qty:1}); openDrawer(p.name);
});

/* ---------- pages ---------- */
function home(){
  const feat=['r002','ryn4','r027','f004','j010','pl3','f001','ryn2','r011','f003'].map(id=>byId[id]).filter(Boolean);
  app.innerHTML=`
  <section class="hero" aria-label="Ryngrafy z pracowni w Częstochowie">
    <div class="hero-fig"><img src="img/hero-ryngraf.webp" alt="Ryngraf z orłem i Matką Bożą Częstochowską, „Bóg Honor Ojczyzna”" fetchpriority="high"></div>
    <div class="hero-in"><div class="hero-txt">
      <p class="hero-meta">Rodzinna pracownia u stóp Jasnej Góry, w Częstochowie</p>
      <h1>Historia i tożsamość narodu ryngrafem znaczona</h1>
      <p class="lead">Ryngrafy z mosiądzu, grawerowane i malowane ręcznie farbami olejnymi. Na rewersie wygrawerujemy Twoją dedykację.</p>
      <a class="btn" href="#/kategoria/patriotyczne">Wybierz ryngraf</a>
    </div></div>
  </section>
  <section class="sec">
    <div class="wrap">
      <div class="sec-hd"><div><h2>Kategorie</h2><p>Każdy ryngraf z naszej oferty powstaje w pracowni, nie w masowej produkcji.</p></div><a class="lnk" href="#/sklep">Wszystkie produkty (${P.length})</a></div>
      <div class="cats">${CATS.map(c=>`<a class="cat" href="#/kategoria/${c.id}"><div class="cat-fig"><img src="${c.img}" alt="" loading="lazy"></div><h3>${c.name}</h3><span>${P.filter(p=>p.cat===c.id).length} produktów</span></a>`).join('')}</div>
      <div class="occ"><strong>Prezent na okazję:</strong>${OCC.map(o=>`<a href="#/okazja/${o.id}">${o.name}</a>`).join('')}</div>
    </div>
  </section>
  <section class="sec grey">
    <div class="wrap">
      <div class="sec-hd"><div><h2>Najczęściej wybierane wzory</h2><p>Przesuń zdjęcia w karcie, żeby zobaczyć opakowanie i przykład graweru.</p></div><a class="lnk" href="#/sklep">Zobacz wszystkie</a></div>
      <div class="rail">${feat.map(card).join('')}</div>
    </div>
  </section>
  <section class="sec">
    <div class="wrap engr">
      <div class="engr-fig"><img src="img/p/rewers-dark.webp" alt="Rewers ryngrafu z wygrawerowanym napisem" loading="lazy"></div>
      <div>
        <h2>Dedykacja wygrawerowana na rewersie</h2>
        <p>Imię dziecka i data chrztu, życzenia dla młodej pary, podziękowanie dla księdza w rocznicę święceń. Tekst wpisujesz na karcie produktu i od razu widzisz, jak ułoży się na tarczy.</p>
        <ul>
          <li>1,50 zł netto za znak, według cennika pracowni</li>
          <li>Na ryngrafie możemy też umieścić dowolny kościół, klasztor lub wizerunek patrona</li>
          <li>Produkty z grawerem wykonujemy indywidualnie, dlatego nie podlegają zwrotowi</li>
        </ul>
        <a class="btn dark" href="#/grawer">Jak zamówić grawer</a>
      </div>
    </div>
  </section>
  <section class="sec dark" id="pracownia">
    <div class="wrap story">
      <div class="story-fig"><img src="img/p/naglowek-archiwum.webp" alt="Archiwalne zdjęcie wytwórni wyrobów dewocyjnych W. Ciszewski" loading="lazy"></div>
      <div>
        <h2>Rzemiosło z Częstochowy od czterech pokoleń</h2>
        <p>Zaczęło się od wytwórni wyrobów dewocyjnych, którą pradziad Walenty zbudował w centrum Częstochowy, przy Alei NMP 69. Dziś ryngrafy projektują i malują Andrzej i Piotr.</p>
        <div class="tl">
          <div><b>Lata 20. XX wieku</b><span>Pradziad Walenty zakłada wytwórnię wyrobów dewocyjnych.</span></div>
          <div><b>Czasy PRL</b><span>Dziadkowie Władysława i Marian prowadzą pracę dalej, mimo braku surowców.</span></div>
          <div><b>Lata 70.</b><span>Pracownię przejmują Maria i Piotr; tata należy do Cechu Rzemiosł w Częstochowie.</span></div>
          <div><b>Dziś</b><span>Ryngrafy grawerowane i malowane ręcznie, z certyfikatem ręcznego wykonania.</span></div>
        </div>
      </div>
    </div>
  </section>
  <section class="sec grey">
    <div class="wrap inst">
      <div>
        <h2>Ryngrafy dla parafii, urzędów i jednostek OSP</h2>
        <p>Projektujemy ryngrafy z herbem miasta, wizerunkiem patrona, nazwą sanktuarium albo jubileuszową sentencją. Wykonaliśmy je m.in. dla Urzędu Miasta Częstochowy, Parafii Wojskowej w Świnoujściu i Kurii Biskupiej w Siedlcach.</p>
        <a class="btn" href="#/info/hurt">Zapytaj o wycenę hurtową</a>
      </div>
      <div class="inst-rail">
        <figure><div class="ph"><img src="img/p/inst-um-czestochowa.webp" alt="" loading="lazy"></div><figcaption>Z herbem miasta, dla Urzędu Miasta Częstochowy</figcaption></figure>
        <figure><div class="ph"><img src="img/p/inst-parafia-wojskowa.webp" alt="" loading="lazy"></div><figcaption>Dla Parafii Wojskowej w Świnoujściu</figcaption></figure>
        <figure><div class="ph"><img src="img/p/inst-kuria-siedlce.webp" alt="" loading="lazy"></div><figcaption>XXX Piesza Pielgrzymka Podlaska, Kuria w Siedlcach</figcaption></figure>
        <figure><div class="ph"><img src="img/p/inst-kalwaria.webp" alt="" loading="lazy"></div><figcaption>Dla sanktuarium w Kalwarii Zebrzydowskiej</figcaption></figure>
        <figure><div class="ph"><img src="img/p/inst-pilsudski.webp" alt="" loading="lazy"></div><figcaption>Z Marszałkiem Piłsudskim, dla szkół i stowarzyszeń</figcaption></figure>
      </div>
    </div>
  </section>
  <section class="sec">
    <div class="wrap">
      <div class="divider"><i></i></div>
      <div class="ben">
        <div><b>Malowane ręcznie</b><span>Farby olejne na grawerowanym mosiądzu, certyfikat ręcznego wykonania.</span></div>
        <div><b>Gotowe do wręczenia</b><span>Ryngrafy pakujemy w opakowanie prezentowe.</span></div>
        <div><b>Wysyłka w 1-2 dni robocze</b><span>Produkty z grawerem i na zamówienie przygotowujemy dłużej, termin podajemy w potwierdzeniu.</span></div>
        <div><b>BLIK, Przelewy24, przelew</b><span>14 dni na zwrot produktu bez graweru.</span></div>
      </div>
    </div>
  </section>`;
  mountSwipers(app);
}

function listing({title,desc,items,crumbs,showCat=false,key}){
  const st=listing.state[key]||(listing.state[key]={sort:'pop',f:{}});
  app.innerHTML=`<div class="wrap">
    <nav class="crumbs" aria-label="Okruszki"><a href="#/">Sklep</a>${crumbs.map(c=>`<i>/</i>${c.href?`<a href="${c.href}">${esc(c.t)}</a>`:`<span>${esc(c.t)}</span>`}`).join('')}</nav>
    <header class="phd"><h1>${esc(title)}</h1>${desc?`<p>${esc(desc)}</p>`:''}</header>
    <div class="listing">
      <aside class="filters" id="filters" aria-label="Filtry">
        <div class="sheet-hd"><h2>Filtry</h2><button class="x" type="button" data-fclose aria-label="Zamknij filtry">×</button></div>
        <div id="fgroups"></div>
        <div class="sheet-ft"><button class="btn block" type="button" data-fclose id="fshow">Pokaż produkty</button></div>
      </aside>
      <div>
        <div class="toolbar"><span class="cnt" id="cnt"></span>
          <div style="display:flex;gap:8px;align-items:center"><button class="btn ghost fbtn" type="button" id="fopen">Filtry</button>
          <label class="sr" for="sort">Sortuj</label><select id="sort"><option value="pop">Polecane</option><option value="pa">Cena: od najniższej</option><option value="pd">Cena: od najwyższej</option><option value="name">Nazwa A-Z</option></select></div></div>
        <div class="chips" id="chips"></div>
        <div class="grid" id="grid"></div>
      </div>
    </div></div>`;
  const groups=[];
  if(showCat) groups.push({k:'cat',t:'Kategoria',opts:CATS.map(c=>({v:c.id,t:c.short,fn:p=>p.cat===c.id}))});
  groups.push({k:'buy',t:'Sposób zakupu',opts:[{v:'price',t:'Cena w sklepie, od ręki',fn:p=>p.price!=null},{v:'made',t:'Na zamówienie, z wyceną',fn:p=>p.price==null}]});
  groups.push({k:'fin',t:'Wykończenie',opts:[{v:'pat',t:'Mosiądz patynowany',fn:p=>/patynowan/.test(p.material)&&!/ciemna/.test(p.material)},{v:'dark',t:'Ciemna patyna',fn:p=>/ciemna patyna/.test(p.material)},{v:'silver',t:'Srebrne, posrebrzane',fn:p=>/posrebrz|srebr/.test(p.material)},{v:'gold',t:'Złote',fn:p=>/złot/.test(p.material)}]});
  groups.push({k:'eng',t:'Personalizacja',opts:[{v:'y',t:'Możliwy grawer dedykacji',fn:p=>p.engrave},{v:'sw',t:'Kamienie Swarovskiego',fn:p=>/Swarovsk/.test(p.name)}]});
  groups.forEach(g=>g.opts=g.opts.filter(o=>items.some(o.fn)));
  const vis=groups.filter(g=>g.opts.length>1||g.k==='eng'&&g.opts.length);
  function apply(){
    let r=items.filter(p=>vis.every(g=>{const sel=st.f[g.k]||[]; return !sel.length||g.opts.some(o=>sel.includes(o.v)&&o.fn(p))}));
    const s=st.sort;
    if(s==='pa') r=r.slice().sort((a,b)=>(a.price??1e9)-(b.price??1e9));
    if(s==='pd') r=r.slice().sort((a,b)=>(b.price??-1)-(a.price??-1));
    if(s==='name') r=r.slice().sort((a,b)=>a.name.localeCompare(b.name,'pl'));
    $('#grid').innerHTML=r.length?r.map(card).join(''):`<div class="empty" style="grid-column:1/-1"><h2>Brak produktów dla tych filtrów</h2><p>Usuń któryś z filtrów albo zadzwoń: pomożemy dobrać wzór.</p><button class="btn ghost" type="button" id="clr">Wyczyść filtry</button></div>`;
    $('#cnt').textContent=r.length+' '+(r.length===1?'produkt':(r.length%10>=2&&r.length%10<=4&&(r.length%100<10||r.length%100>=20)?'produkty':'produktów'));
    $('#fshow').textContent='Pokaż produkty ('+r.length+')';
    const chips=[]; vis.forEach(g=>(st.f[g.k]||[]).forEach(v=>{const o=g.opts.find(o=>o.v===v); if(o) chips.push(`<button class="chip" type="button" data-chip="${g.k}:${v}">${esc(o.t)} <b>×</b></button>`)}));
    $('#chips').innerHTML=chips.join('')+(chips.length>1?`<button class="chip" type="button" data-chip="*">Wyczyść wszystko</button>`:'');
    mountSwipers($('#grid'));
  }
  $('#fgroups').innerHTML=vis.map(g=>`<div class="fgroup"><h3>${g.t}</h3>${g.opts.map(o=>`<label><input type="checkbox" data-g="${g.k}" value="${o.v}" ${(st.f[g.k]||[]).includes(o.v)?'checked':''}>${esc(o.t)}<small>${items.filter(o.fn).length}</small></label>`).join('')}</div>`).join('');
  $('#sort').value=st.sort;
  $('#sort').addEventListener('change',e=>{st.sort=e.target.value;apply()});
  $('#fgroups').addEventListener('change',e=>{const c=e.target; if(!c.dataset.g) return; const a=st.f[c.dataset.g]||(st.f[c.dataset.g]=[]); if(c.checked) a.push(c.value); else a.splice(a.indexOf(c.value),1); apply()});
  app.querySelector('.listing').addEventListener('click',e=>{
    const ch=e.target.closest('[data-chip]');
    if(ch){ if(ch.dataset.chip==='*') st.f={}; else {const [g,v]=ch.dataset.chip.split(':'); st.f[g]=(st.f[g]||[]).filter(x=>x!==v);} $$('#fgroups input').forEach(i=>i.checked=(st.f[i.dataset.g]||[]).includes(i.value)); apply();}
    if(e.target.id==='clr'){st.f={}; $$('#fgroups input').forEach(i=>i.checked=false); apply();}
  });
  const fl=$('#filters');
  $('#fopen').addEventListener('click',()=>{fl.classList.add('on'); showScrim(()=>fl.classList.remove('on'))});
  $$('[data-fclose]').forEach(b=>b.addEventListener('click',()=>{fl.classList.remove('on'); hideScrim()}));
  apply();
}
listing.state={};

function product(id){
  const p=byId[id]; if(!p) return notFound();
  curProductCat=p.cat;
  const c=catOf(p.cat);
  const related=P.filter(x=>x.cat===p.cat&&x.id!==p.id).slice(0,8);
  const maxLen=160;
  app.innerHTML=`<div class="wrap">
   <nav class="crumbs" aria-label="Okruszki"><a href="#/">Sklep</a><i>/</i><a href="#/kategoria/${c.id}">${c.name}</a><i>/</i><span>${esc(p.sku)}</span></nav>
   <div class="pdp">
    <div class="gal">
      <div class="thumbs" ${p.imgs.length<2?'hidden':''}>${p.imgs.map((im,i)=>`<button type="button" data-t="${i}" aria-label="Zdjęcie ${i+1}" ${i?'':'aria-current="true"'}><img src="${im.src}" alt="" loading="lazy"></button>`).join('')}</div>
      <div class="gal-main">${swHTML(p)}</div>
      <p class="gal-cap" id="galcap">${esc(p.imgs[0].alt)}</p>
    </div>
    <div class="buy">
      <h1>${esc(p.name)}</h1>
      <p class="sku">Kod produktu: ${esc(p.sku)} · ${esc(c.name)}</p>
      <div class="pp">${p.price!=null?`<span class="price" id="pprice">${fmt(p.price)}</span><small>cena brutto</small>`:`<span class="price q">Cena ustalana przy zamówieniu</span>`}</div>
      ${p.price!=null?`<p class="avail">Wysyłka w 1-2 dni robocze</p>`:`<p class="avail made">Wykonanie na zamówienie w pracowni</p>`}
      <form id="buyform" novalidate>
      <div class="opt"><div class="opt-l">${p.sizes.length>1?'Rozmiar':'Wymiary'} <span id="szl">${esc(p.sizes[0].label)}</span></div>
        <div class="sizes" role="radiogroup" aria-label="Rozmiar">${p.sizes.map((s,i)=>`<label><input type="radio" name="size" value="${s.code}" ${i?'':'checked'}><span>${esc(s.label.replace(/ \(.*/,''))}${/\(/.test(s.label)?`<small>${esc(s.label.match(/\((.*)\)/)[1])}</small>`:''}</span></label>`).join('')}</div></div>
      ${p.sash?`<div class="opt"><div class="opt-l"><label for="sash">Tekst na szarfach</label><span>wliczony w cenę</span></div><div class="fld"><input id="sash" maxlength="60" placeholder="np. nazwa i miejscowość jednostki OSP"><span class="err">Wpisz tekst, który mamy umieścić na szarfach.</span></div></div>`:''}
      ${p.engrave?`<div class="perso">
        <label class="perso-tg"><input type="checkbox" id="engOn"> Dodaj grawer dedykacji na rewersie <small>1,50 zł netto<br>za znak</small></label>
        <div class="perso-bd" id="engBd" hidden>
          <div class="fld"><label for="ded">Treść dedykacji</label>
            <textarea id="ded" rows="4" maxlength="${maxLen}" placeholder="np. imię, data i okazja"></textarea>
            <span class="err">Wpisz treść dedykacji albo odznacz grawer.</span>
            <p class="hint"><span id="dedN">0</span>/${maxLen} znaków. Enter przenosi tekst do nowej linii. Przed wykonaniem potwierdzimy z Tobą układ napisu.</p>
            <p class="cost" id="dedCost"></p>
          </div>
          <div class="preview-wrap"><div class="preview" aria-hidden="true"><p id="prev">Twoja dedykacja</p></div><p class="preview-cap">Podgląd rewersu</p></div>
        </div></div>`:''}
      <div class="qtyrow">
        <div class="qty"><button type="button" data-q="-1" aria-label="Mniej">−</button><input id="qty" type="number" inputmode="numeric" min="1" max="99" value="1" aria-label="Ilość"><button type="button" data-q="1" aria-label="Więcej">+</button></div>
        <button class="btn" id="addbtn" type="submit">${p.price!=null?'Dodaj do koszyka':'Dodaj do zamówienia'}</button>
      </div>
      ${p.price==null?`<p class="made-note">Ten wzór wykonujemy na zamówienie. Złożysz zamówienie jak zwykle, a cenę i termin wykonania potwierdzimy mailowo przed realizacją. Płacisz dopiero po akceptacji wyceny.</p>`:''}
      </form>
      <div class="facts">
        <div><b>Dostawa</b><span>InPost Paczkomat 24/7 albo kurier. Koszt zobaczysz w koszyku przed złożeniem zamówienia.</span></div>
        <div><b>Płatność</b><span>BLIK, szybki przelew Przelewy24, karta lub przelew tradycyjny.</span></div>
        <div><b>Zwrot</b><span>14 dni na odstąpienie od umowy. Nie dotyczy produktów z grawerem i wykonanych na zamówienie.</span></div>
      </div>
      <div class="desc"><h2>Opis</h2><p>${esc(p.desc)}</p>
        <table class="spec"><tr><th>Kod</th><td>${esc(p.sku)}</td></tr><tr><th>Materiał i wykonanie</th><td>${esc(p.material)}</td></tr><tr><th>Wymiary</th><td>${p.sizes.map(s=>esc(s.code+': '+s.label)).join('<br>')}</td></tr>${p.engrave?'<tr><th>Grawer dedykacji</th><td>Na rewersie, 1,50 zł netto za znak</td></tr>':''}</table>
      </div>
    </div>
   </div>
   ${related.length?`<section class="sec" style="padding-top:20px"><div class="sec-hd"><h2>Z tej samej kategorii</h2><a class="lnk" href="#/kategoria/${c.id}">Cała kategoria</a></div><div class="rail">${related.map(card).join('')}</div></section>`:''}
  </div>
  <div class="stickybuy" id="stickybuy"><div class="t"><b>${esc(p.name)}</b><span>${p.price!=null?fmt(p.price):'Wycena przy zamówieniu'}</span></div><button class="btn" type="button" id="stickyadd">${p.price!=null?'Do koszyka':'Zamów'}</button></div>`;
  mountSwipers(app);
  const sw=$('.gal-main .sw'), thumbs=$$('.thumbs button');
  sw.addEventListener('slide',e=>{thumbs.forEach((t,i)=>t.setAttribute('aria-current',String(i===e.detail))); $('#galcap').textContent=p.imgs[e.detail].alt});
  thumbs.forEach(t=>t.addEventListener('click',()=>sw._go(+t.dataset.t)));
  $$('input[name=size]').forEach(r=>r.addEventListener('change',()=>{$('#szl').textContent=p.sizes.find(s=>s.code===r.value).label}));
  const qty=$('#qty');
  $$('[data-q]').forEach(b=>b.addEventListener('click',()=>{qty.value=Math.max(1,Math.min(99,(+qty.value||1)+ +b.dataset.q))}));
  if(p.engrave){
    const on=$('#engOn'), bd=$('#engBd'), ded=$('#ded');
    on.addEventListener('change',()=>{bd.hidden=!on.checked; if(on.checked) ded.focus(); ded.closest('.fld').classList.remove('bad')});
    const upd=()=>{const t=ded.value; $('#dedN').textContent=t.length; $('#prev').textContent=t.trim()?t:'Twoja dedykacja';
      const n=engrChars(t); $('#dedCost').innerHTML=n?`Grawer: ${n} znaków × 1,50 zł netto = <b>${fmt(n*ENGR_GROSS)}</b> brutto (orientacyjnie, ostateczną kwotę potwierdzimy)`:''; ded.closest('.fld').classList.remove('bad');};
    ded.addEventListener('input',upd);
  }
  $('#buyform').addEventListener('submit',e=>{e.preventDefault();
    const size=($('input[name=size]:checked')||{}).value; let ok=true; const l={id:p.id,size,qty:Math.max(1,Math.min(99,+qty.value||1))};
    if(p.sash){const s=$('#sash'); if(!s.value.trim()){s.closest('.fld').classList.add('bad'); ok=false; s.focus();} else {l.sash=s.value.trim(); s.closest('.fld').classList.remove('bad')}}
    if(p.engrave&&$('#engOn').checked){const d=$('#ded'); if(!d.value.trim()){d.closest('.fld').classList.add('bad'); if(ok) d.focus(); ok=false;} else l.ded=d.value.trim();}
    if(!ok){toast('Uzupełnij zaznaczone pola'); return}
    addToCart(l); openDrawer(p.name);
  });
  $('#stickyadd').addEventListener('click',()=>{ if(p.sash||p.engrave&&$('#engOn').checked){ $('#buyform').requestSubmit(); } else $('#buyform').requestSubmit(); });
  const sb=$('#stickybuy');
  const ab=$('#addbtn'); let raf=0;
  const chk=()=>{raf=0; const r=ab.getBoundingClientRect(); sb.classList.toggle('show',r.bottom<0)};
  const onS=()=>{if(!raf) raf=requestAnimationFrame(chk)};
  window.addEventListener('scroll',onS,{passive:true}); cleanup.push(()=>window.removeEventListener('scroll',onS));
}

/* drawer */
const drawer=$('#drawer'), scrim=$('#scrim'); let scrimClose=null;
function showScrim(fn){scrim.hidden=false; requestAnimationFrame(()=>scrim.classList.add('on')); scrimClose=fn; document.body.style.overflow='hidden'}
function hideScrim(){scrim.classList.remove('on'); setTimeout(()=>{scrim.hidden=true},250); scrimClose=null; document.body.style.overflow=''}
scrim.addEventListener('click',()=>{if(scrimClose) scrimClose(); hideScrim(); closeDrawer(true)});
function lineHTML(l,i,{controls=true,price='cart'}={}){
  const p=byId[l.id]; if(!p) return ''; const s=p.sizes.find(x=>x.code===l.size)||p.sizes[0];
  const lp=p.price!=null?fmt(p.price*l.qty):'Wycena';
  return `<div class="line" data-i="${i}">
    <a class="line-img" href="#/produkt/${p.id}"><img src="${p.imgs[0].src}" alt=""></a>
    <div><h3><a href="#/produkt/${p.id}">${esc(p.name)}</a></h3>
      <p class="v">${esc(s.code)} · ${esc(s.label)}${p.price!=null?' · '+fmt(p.price)+' / szt.':' · na zamówienie'}</p>
      ${l.sash?`<p class="ded">Szarfy: ${esc(l.sash)}</p>`:''}
      ${l.ded?`<p class="ded">Grawer: ${esc(l.ded)}</p>`:''}
      ${controls?`<div class="line-act"><div class="qty sm"><button type="button" data-lq="-1" aria-label="Mniej">−</button><input type="number" min="1" max="99" value="${l.qty}" aria-label="Ilość" data-lqi><button type="button" data-lq="1" aria-label="Więcej">+</button></div>${price==='drawer'?`<b>${lp}</b>`:''}<button class="rm" type="button" data-rm>Usuń</button></div>`:`<p class="v">Ilość: ${l.qty}</p>`}
    </div>
    ${price==='cart'||price==='co'?`<div class="lp">${lp}${l.ded?`<small>+ grawer ok. ${fmt(engrChars(l.ded)*ENGR_GROSS*l.qty)}</small>`:''}</div>`:''}
  </div>`;
}
function totalsHTML(t,{ship=null}={}){
  return `<div class="sum-row"><span>Produkty z ceną</span><span>${fmt(t.priced)}</span></div>
   ${t.made?`<div class="sum-row"><span>Na zamówienie (${t.made} szt.)</span><span>wycena mailem</span></div>`:''}
   ${t.engr?`<div class="sum-row"><span>Grawer, doliczany do wyceny</span><span>ok. ${fmt(t.engr)}</span></div>`:''}
   <div class="sum-row"><span>Dostawa</span><span>${ship||'w następnym kroku'}</span></div>`;
}
function renderDrawer(addedName){
  const t=cartTotals();
  $('#drawerBd').innerHTML=(addedName?`<div class="added">Dodano: ${esc(addedName.length>48?addedName.slice(0,46)+'…':addedName)}</div>`:'')+
    (cart.length?cart.map((l,i)=>lineHTML(l,i,{price:'drawer'})).join(''):`<div class="empty"><h2>Koszyk jest pusty</h2><p>Zacznij od ryngrafów patriotycznych albo maryjnych.</p></div>`);
  $('#drawerFt').innerHTML=cart.length?`${totalsHTML(t)}<div class="sum-row big"><span>Do zapłaty teraz</span><span>${t.priced?fmt(t.priced):'po wycenie'}</span></div>${t.made?'<p class="sum-note">Pozycje na zamówienie wycenimy mailowo. Zapłacisz za nie po akceptacji ceny.</p>':''}<a class="btn" href="#/zamowienie" data-close>Przejdź do kasy</a><a class="btn ghost" href="#/koszyk" data-close>Zobacz koszyk</a>`
   :`<a class="btn" href="#/kategoria/patriotyczne" data-close>Wybierz ryngraf</a>`;
}
function openDrawer(addedName){renderDrawer(addedName); drawer.setAttribute('aria-hidden','false'); drawer.classList.add('on'); showScrim(()=>closeDrawer(true)); setTimeout(()=>$('#drawerX').focus(),50)}
function closeDrawer(skipScrim){ if(!drawer.classList.contains('on')) return; drawer.classList.remove('on'); drawer.setAttribute('aria-hidden','true'); if(!skipScrim) hideScrim()}
$('#drawerX').addEventListener('click',()=>closeDrawer());
$('#cartbtn').addEventListener('click',()=>openDrawer());
drawer.addEventListener('click',e=>{ if(e.target.closest('[data-close]')) closeDrawer(); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ if(drawer.classList.contains('on')) closeDrawer(); if(!mnav.hidden) closeMenu(); const f=$('#filters'); if(f&&f.classList.contains('on')){f.classList.remove('on');hideScrim()} }});
function lineEvents(root,rerender){
  root.addEventListener('click',e=>{
    const ln=e.target.closest('.line'); if(!ln) return; const i=+ln.dataset.i;
    if(e.target.closest('[data-lq]')){cart[i].qty=Math.max(1,Math.min(99,cart[i].qty+ +e.target.closest('[data-lq]').dataset.lq)); saveCart(); rerender();}
    if(e.target.closest('[data-rm]')){const n=byId[cart[i].id].name; cart.splice(i,1); saveCart(); rerender(); toast('Usunięto z koszyka: '+(n.length>40?n.slice(0,38)+'…':n));}
  });
  root.addEventListener('change',e=>{ if(!e.target.matches('[data-lqi]')) return; const i=+e.target.closest('.line').dataset.i; cart[i].qty=Math.max(1,Math.min(99,+e.target.value||1)); saveCart(); rerender();});
}
lineEvents($('#drawerBd'),()=>renderDrawer());

function cartPage(){
  const t=cartTotals();
  if(!cart.length){app.innerHTML=`<div class="wrap"><nav class="crumbs"><a href="#/">Sklep</a><i>/</i><span>Koszyk</span></nav><div class="empty"><h2>Twój koszyk jest pusty</h2><p>Zobacz ryngrafy patriotyczne, maryjne albo upominki dla strażaków.</p><a class="btn" href="#/kategoria/patriotyczne">Przejdź do sklepu</a></div></div>`;return}
  app.innerHTML=`<div class="wrap"><nav class="crumbs"><a href="#/">Sklep</a><i>/</i><span>Koszyk</span></nav>
   <header class="phd"><h1>Koszyk</h1></header>
   <div class="cartpage"><div id="cartLines">${cart.map((l,i)=>lineHTML(l,i)).join('')}<p style="margin-top:20px"><a class="lnk" href="#/sklep">Kontynuuj zakupy</a></p></div>
   <aside class="summary"><h2>Podsumowanie</h2>${totalsHTML(t)}<hr><div class="sum-row big"><span>Do zapłaty teraz</span><span>${t.priced?fmt(t.priced):'po wycenie'}</span></div>
   ${t.made?'<p class="sum-note">Masz w koszyku wzory wykonywane na zamówienie. Ich cenę i termin potwierdzimy mailowo, płatność po akceptacji wyceny.</p>':''}
   <a class="btn block" href="#/zamowienie">Przejdź do kasy</a>
   <ul class="ticks"><li>Zakup bez zakładania konta</li><li>BLIK, Przelewy24, karta, przelew</li><li>InPost Paczkomat lub kurier</li></ul></aside></div></div>`;
  lineEvents($('#cartLines'),cartPage);
}

function checkout(){
  if(!cart.length){location.replace('#/koszyk');return}
  const t=cartTotals(); const payNow=t.priced;
  app.innerHTML=`<div class="wrap"><nav class="crumbs"><a href="#/">Sklep</a><i>/</i><a href="#/koszyk">Koszyk</a><i>/</i><span>Zamówienie</span></nav>
  <header class="phd"><h1>Zamówienie</h1></header>
  <div class="demo-warn" role="note"><b>Wersja demonstracyjna</b>Możesz przejść cały proces zakupu, ale zamówienie nie zostanie wysłane, a płatność nie zostanie pobrana. Nie wpisuj prawdziwych danych.</div>
  <form class="co" id="co" novalidate>
   <div>
    <section class="co-step"><h2><span>1</span>Dane do wysyłki</h2>
     <div class="fgrid">
      ${fld('email','E-mail','email','email','Podaj poprawny adres e-mail.','full')}
      ${fld('fn','Imię','text','given-name','Podaj imię.')}
      ${fld('ln','Nazwisko','text','family-name','Podaj nazwisko.')}
      ${fld('tel','Telefon','tel','tel','Podaj 9-cyfrowy numer telefonu.')}
      ${fld('street','Ulica i numer','text','street-address','Podaj ulicę i numer.')}
      ${fld('zip','Kod pocztowy','text','postal-code','Kod w formacie 00-000.')}
      ${fld('city','Miejscowość','text','address-level2','Podaj miejscowość.')}
      <label class="chk full" style="grid-column:1/-1"><input type="checkbox" id="inv"> Chcę fakturę na firmę</label>
      <div class="fgrid full" id="invBox" style="grid-column:1/-1" hidden>${fld('nip','NIP','text','off','Podaj 10-cyfrowy NIP.')}${fld('co','Nazwa firmy','text','organization','Podaj nazwę firmy.')}</div>
     </div></section>
    <section class="co-step"><h2><span>2</span>Dostawa</h2>
     <div class="opts" id="ship">
      <label class="optc"><input type="radio" name="ship" value="inpost"><div><b>InPost Paczkomat 24/7</b><small>Odbiór w wybranym Paczkomacie, kod przyjdzie SMS-em.</small>
        <div class="optx" hidden id="lockerBox"><div class="locker"><input class="fld-i" id="lockerQ" placeholder="Miasto, ulica lub kod Paczkomatu" style="border:1px solid var(--line-2);border-radius:var(--r);padding:0 12px;height:46px;font-size:16px"><button class="btn ghost" type="button" id="lockerBtn" style="min-height:46px;padding:0 16px">Wybierz</button></div><p class="locker-res" id="lockerRes" hidden></p><p class="sum-note" style="margin-top:6px">W sklepie: mapa Paczkomatów InPost. W wersji demonstracyjnej zapisujemy wpisaną lokalizację.</p></div></div><span class="tag">wg cennika</span></label>
      <label class="optc"><input type="radio" name="ship" value="kurier"><div><b>Kurier</b><small>Dostawa pod adres podany powyżej, zwykle 1-2 dni od nadania.</small></div><span class="tag">wg cennika</span></label>
     </div><p class="fld bad" id="shipErr" hidden><span class="err" style="display:block">Wybierz sposób dostawy.</span></p></section>
    <section class="co-step"><h2><span>3</span>Płatność</h2>
     ${payNow>0?`<div class="opts" id="pay">
      <label class="optc"><input type="radio" name="pay" value="blik"><div><b>BLIK</b><small>Wpisz kod z aplikacji banku i potwierdź płatność w telefonie.</small>
        <div class="optx" hidden id="blikBox"><div class="blik"><label class="sr" for="blik">Kod BLIK</label><input id="blik" inputmode="numeric" maxlength="7" placeholder="000 000" autocomplete="off"><span class="sum-note">Demo: wpisz dowolne 6 cyfr</span></div><p class="err" id="blikErr" style="display:none;color:var(--red);font-size:13px;margin-top:6px">Kod BLIK ma 6 cyfr.</p></div></div><span class="tag">Przelewy24</span></label>
      <label class="optc"><input type="radio" name="pay" value="p24"><div><b>Szybki przelew</b><small>Przelewy24 lub PayU, przekierowanie do Twojego banku.</small>
        <div class="optx" hidden id="bankBox"><div class="banks">${['PKO BP','mBank','Pekao','Santander','ING','Millennium','Alior','Credit Agricole','Inny bank'].map(b=>`<label><input type="radio" name="bank" value="${b}"><span>${b}</span></label>`).join('')}</div><p class="err" id="bankErr" style="display:none;color:var(--red);font-size:13px;margin-top:6px">Wybierz bank.</p></div></div><span class="tag">Przelewy24 / PayU</span></label>
      <label class="optc"><input type="radio" name="pay" value="card"><div><b>Karta płatnicza</b><small>Visa, Mastercard. Dane karty podasz na stronie operatora płatności, sklep ich nie widzi.</small></div><span class="tag">Przelewy24</span></label>
      <label class="optc"><input type="radio" name="pay" value="przelew"><div><b>Przelew tradycyjny</b><small>Dane do przelewu wyślemy w mailu z potwierdzeniem zamówienia. Wysyłka po zaksięgowaniu wpłaty.</small></div></label>
     </div><p class="fld bad" id="payErr" hidden><span class="err" style="display:block">Wybierz metodę płatności.</span></p>`
     :`<p class="made-note" style="margin-top:0">Wszystkie pozycje w koszyku wykonujemy na zamówienie. Po złożeniu zamówienia wyślemy wycenę i termin, a link do płatności dopiero po Twojej akceptacji.</p>`}
    </section>
    <section class="co-step"><h2><span>4</span>Uwagi i zgody</h2>
     <div class="fld full"><label for="note">Uwagi do zamówienia (opcjonalnie)</label><textarea id="note" rows="3" placeholder="np. termin uroczystości, na który ryngraf ma być gotowy"></textarea></div>
     <label class="chk" id="termsL" style="margin-top:16px"><input type="checkbox" id="terms"> Akceptuję regulamin sklepu i politykę prywatności. Rozumiem, że produkty z grawerem i wykonane na zamówienie nie podlegają zwrotowi.</label>
    </section>
   </div>
   <aside class="summary co-sum"><h2>Twoje zamówienie</h2>
     <div>${cart.map((l,i)=>lineHTML(l,i,{controls:false,price:'co'})).join('')}</div><hr>
     <div id="coTot">${totalsHTML(t,{ship:'wybierz sposób'})}</div><hr>
     <div class="sum-row big"><span>Do zapłaty teraz</span><span>${fmt(payNow)}</span></div>
     ${t.made?'<p class="sum-note">Pozycje na zamówienie: cenę i termin potwierdzimy mailowo, płatność po akceptacji.</p>':''}
     <button class="btn block" type="submit" id="orderBtn">${payNow>0?'Zamawiam i płacę '+fmt(payNow):'Wysyłam zamówienie do wyceny'}</button>
     <p class="sum-note" style="text-align:center">Wersja demonstracyjna: płatność nie zostanie pobrana.</p>
   </aside>
  </form></div>`;
  const form=$('#co');
  $('#inv').addEventListener('change',e=>{$('#invBox').hidden=!e.target.checked});
  function syncOpts(name){$$(`input[name=${name}]`).forEach(r=>r.closest('.optc').classList.toggle('on',r.checked))}
  form.addEventListener('change',e=>{
    if(e.target.name==='ship'){syncOpts('ship'); $('#lockerBox').hidden=e.target.value!=='inpost'; $('#shipErr').hidden=true;
      $('#coTot').innerHTML=totalsHTML(t,{ship:e.target.value==='inpost'?'Paczkomat, wg cennika':'Kurier, wg cennika'});}
    if(e.target.name==='pay'){syncOpts('pay'); $('#blikBox').hidden=e.target.value!=='blik'; $('#bankBox').hidden=e.target.value!=='p24'; $('#payErr').hidden=true; if(e.target.value==='blik') setTimeout(()=>$('#blik').focus(),30);}
    if(e.target.name==='bank'){$('#bankErr').style.display='none'}
    if(e.target.id==='terms'){$('#termsL').classList.remove('bad')}
  });
  const blik=$('#blik');
  if(blik) blik.addEventListener('input',()=>{const d=blik.value.replace(/\D/g,'').slice(0,6); blik.value=d.length>3?d.slice(0,3)+' '+d.slice(3):d; $('#blikErr').style.display='none'});
  $('#lockerBtn').addEventListener('click',()=>{const v=$('#lockerQ').value.trim(); const r=$('#lockerRes'); if(v.length<2){r.hidden=false; r.style.color='var(--red)'; r.textContent='Wpisz miasto, ulicę lub kod Paczkomatu.'; return}
    r.hidden=false; r.style.color=''; r.textContent='Wybrany punkt: Paczkomat, '+v+' (demo)'; form.dataset.locker=v;});
  $$('.fld input',form).forEach(i=>i.addEventListener('input',()=>i.closest('.fld').classList.remove('bad')));
  form.addEventListener('submit',e=>{e.preventDefault();
    const bad=[]; const v=id=>($('#'+id)||{}).value?.trim()||'';
    const chk=(id,ok)=>{const f=$('#'+id).closest('.fld'); f.classList.toggle('bad',!ok); if(!ok) bad.push(f);};
    chk('email',/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email')));
    chk('fn',v('fn').length>1); chk('ln',v('ln').length>1);
    chk('tel',v('tel').replace(/\D/g,'').replace(/^48/,'').length===9);
    chk('street',v('street').length>2); chk('zip',/^\d{2}-\d{3}$/.test(v('zip'))); chk('city',v('city').length>1);
    if($('#inv').checked){chk('nip',v('nip').replace(/\D/g,'').length===10); chk('co',v('co').length>1)}
    const ship=($('input[name=ship]:checked')||{}).value;
    if(!ship){$('#shipErr').hidden=false; bad.push($('#ship'))}
    else if(ship==='inpost'&&!form.dataset.locker){const r=$('#lockerRes'); r.hidden=false; r.style.color='var(--red)'; r.textContent='Wybierz Paczkomat.'; bad.push($('#lockerBox'))}
    let pay='wycena';
    if(payNow>0){pay=($('input[name=pay]:checked')||{}).value;
      if(!pay){$('#payErr').hidden=false; bad.push($('#pay'))}
      else if(pay==='blik'&&$('#blik').value.replace(/\D/g,'').length!==6){$('#blikErr').style.display='block'; bad.push($('#blikBox'))}
      else if(pay==='p24'&&!$('input[name=bank]:checked')){$('#bankErr').style.display='block'; bad.push($('#bankBox'))}}
    if(!$('#terms').checked){$('#termsL').classList.add('bad'); bad.push($('#termsL'))}
    if(bad.length){bad[0].scrollIntoView({behavior:'smooth',block:'center'}); toast('Uzupełnij zaznaczone pola'); return}
    const btn=$('#orderBtn'); btn.disabled=true; btn.textContent=pay==='blik'?'Potwierdź płatność w aplikacji banku…':'Przetwarzanie…';
    setTimeout(()=>{
      const order={no:'DEMO-'+Math.floor(100000+Math.random()*900000),lines:cart.slice(),payNow,pay,ship,locker:form.dataset.locker||'',email:v('email'),made:t.made};
      try{sessionStorage.setItem('ryn_last_order',JSON.stringify(order))}catch(_){}
      cart=[]; saveCart(); location.hash='#/dziekujemy';
    },pay==='blik'?1400:700);
  });
}
function fld(id,label,type,ac,err,cls=''){return `<div class="fld ${cls}"><label for="${id}">${label}</label><input id="${id}" type="${type}" autocomplete="${ac}" ${type==='tel'?'inputmode="tel"':''}${id==='zip'?' inputmode="numeric" maxlength="6" placeholder="00-000"':''}><span class="err">${err}</span></div>`}

function thanks(){
  let o=null; try{o=JSON.parse(sessionStorage.getItem('ryn_last_order')||'null')}catch(_){}
  const payName={blik:'BLIK',p24:'Szybki przelew',card:'Karta płatnicza',przelew:'Przelew tradycyjny',wycena:'Po akceptacji wyceny'};
  app.innerHTML=`<div class="wrap thx">
   <svg class="thx-mark" viewBox="0 0 100 120" aria-hidden="true"><path d="M6 10Q50 20 94 10L95 62Q95 98 50 117Q5 98 5 62Z" fill="currentColor"/><path d="M30 62l14 14 27-30" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>
   <h1>Dziękujemy za zamówienie (demo)</h1>
   <p>To była wersja demonstracyjna sklepu: zamówienie nie zostało wysłane, a płatność nie została pobrana. W gotowym sklepie potwierdzenie przyjdzie na podany adres e-mail.</p>
   ${o?`<div class="box"><div class="sum-row"><span>Numer zamówienia</span><b>${esc(o.no)}</b></div><div class="sum-row"><span>Produkty</span><span>${o.lines.reduce((a,l)=>a+l.qty,0)} szt.</span></div><div class="sum-row"><span>Dostawa</span><span>${o.ship==='inpost'?'InPost Paczkomat'+(o.locker?', '+esc(o.locker):''):'Kurier'}</span></div><div class="sum-row"><span>Płatność</span><span>${payName[o.pay]||''}</span></div><div class="sum-row big"><span>Kwota (demo)</span><span>${fmt(o.payNow)}</span></div>${o.made?'<p class="sum-note">Pozycje na zamówienie: pracownia wyśle wycenę i termin wykonania mailem.</p>':''}</div>`:''}
   <a class="btn" href="#/">Wróć do sklepu</a></div>`;
}

function grawer(){
  const items=P.filter(p=>p.engrave);
  app.innerHTML=`<div class="wrap"><nav class="crumbs"><a href="#/">Sklep</a><i>/</i><span>Grawer dedykacji</span></nav>
  <div class="engr" style="padding:20px 0 56px">
   <div class="engr-fig"><img src="img/p/rewers-dark.webp" alt="Przykład graweru na rewersie ryngrafu"></div>
   <div class="info" style="padding:0"><h1 style="font-size:clamp(30px,3vw,44px)">Grawer dedykacji na rewersie</h1>
    <p style="margin-top:14px">Na rewersie ryngrafu może znaleźć się dowolna sentencja, dedykacja, tekst albo data. Na życzenie umieścimy na ryngrafie także opactwo, klasztor, kościół, wybrany wizerunek Matki Bożej lub patrona, np. na mszę prymicyjną czy rocznicę święceń kapłańskich.</p>
    <h2>Jak zamówić</h2><ul><li>Wybierz ryngraf i rozmiar.</li><li>Zaznacz „Dodaj grawer dedykacji” i wpisz treść. Podgląd pokaże, jak tekst ułoży się na tarczy.</li><li>Przed wykonaniem potwierdzimy z Tobą układ napisu.</li></ul>
    <h2>Cena</h2><p>1,50 zł netto za znak, zgodnie z obecnym cennikiem pracowni. Produkty z grawerem wykonujemy indywidualnie, dlatego nie podlegają zwrotowi.</p></div>
  </div>
  <div class="sec-hd"><h2>Ryngrafy z możliwością graweru</h2></div><div class="grid" style="padding-bottom:80px">${items.map(card).join('')}</div></div>`;
  mountSwipers(app);
}
const INFO={
 dostawa:{t:'Dostawa i płatność',h:`<h2>Czas realizacji</h2><p>Standardowo przygotowujemy zamówienie w 1-2 dni robocze. Produkty grawerowane i wykonywane na zamówienie wymagają więcej czasu, termin podajemy indywidualnie.</p><h2>Dostawa</h2><ul><li>InPost Paczkomat 24/7</li><li>Kurier pod wskazany adres</li><li>Wysyłka zagraniczna po kontakcie mailowym</li></ul><p>Aktualny koszt dostawy widać w koszyku przed złożeniem zamówienia.</p><h2>Płatność</h2><ul><li>BLIK i szybki przelew przez Przelewy24</li><li>Karta płatnicza</li><li>Przelew tradycyjny</li></ul><p>Zamówienie opłacane z góry warto opłacić w ciągu 24 godzin.</p>`},
 zwroty:{t:'Zwroty i reklamacje',h:`<h2>Zwrot</h2><p>Konsument ma 14 dni na odstąpienie od umowy bez podania przyczyny. Zwracamy pieniądze w ciągu 14 dni.</p><p>Prawo do zwrotu nie obejmuje produktów wykonanych według specyfikacji klienta, np. z grawerem.</p><h2>Reklamacja</h2><p>Na reklamację odpowiadamy w ciągu 14 dni. Napisz do nas albo zadzwoń.</p>`},
 hurt:{t:'Zamówienia hurtowe i projekty na zamówienie',h:`<p>Realizujemy zamówienia dla jednostek OSP i PSP, parafii, sanktuariów, kurii, urzędów, szkół i stowarzyszeń. Możemy wykonać całkowicie nowy ryngraf z dowolną grafiką: wizerunkiem, herbem, symbolem, sentencją, dedykacją lub podziękowaniem.</p><h2>Jak zapytać o wycenę</h2><ul><li>symbol produktu lub opis nowego projektu,</li><li>liczba sztuk i rozmiar,</li><li>tekst graweru,</li><li>termin uroczystości.</li></ul><p style="margin-top:22px"><a class="btn" href="mailto:sklep@und24.pl?subject=Zapytanie%20hurtowe%20ryngrafy">Napisz: sklep@und24.pl</a></p><p style="margin-top:14px">Telefon: <a href="tel:+48509798144">+48 509 798 144</a></p>`}
};
function info(k){const x=INFO[k]; if(!x) return notFound();
  app.innerHTML=`<div class="wrap"><nav class="crumbs"><a href="#/">Sklep</a><i>/</i><span>${x.t}</span></nav><header class="phd"><h1>${x.t}</h1></header><div class="info">${x.h}</div></div>`;}
function notFound(){app.innerHTML=`<div class="wrap empty"><h2>Nie znaleźliśmy tej strony</h2><a class="btn" href="#/">Wróć do sklepu</a></div>`}

/* ---------- router ---------- */
let cleanup=[];
function route(){
  cleanup.forEach(f=>f()); cleanup=[]; curProductCat=null;
  closeMenu(); if(drawer.classList.contains('on')) closeDrawer();
  const h=location.hash.replace(/^#\/?/,''); const [a,b]=h.split('/');
  let scrollTo=null;
  if(!a||a.startsWith('#')){ home(); if(h.includes('#pracownia')) scrollTo='pracownia'; }
  else if(a==='kategoria'&&catOf(b)){const c=catOf(b); listing({title:c.name,desc:c.desc,items:P.filter(p=>p.cat===c.id),crumbs:[{t:c.name}],key:'c-'+b});}
  else if(a==='sklep') listing({title:'Wszystkie produkty',desc:'Ryngrafy, płaskorzeźby, odznaki i przypinki z pracowni w Częstochowie.',items:P,crumbs:[{t:'Wszystkie produkty'}],showCat:true,key:'all'});
  else if(a==='szukaj'){const t=decodeURIComponent(b||''); q.value=t; listing({title:`Wyniki dla „${t}”`,desc:'',items:search(t),crumbs:[{t:'Wyszukiwanie'}],showCat:true,key:'s-'+t});}
  else if(a==='okazja'){const o=OCC.find(x=>x.id===b); if(!o) notFound(); else {
      let items,desc;
      if(b==='osp'){items=P.filter(p=>p.cat==='strazacy');desc='Ryngrafy, odznaki i różańce ze św. Florianem.'}
      else if(b==='wojsko'){items=P.filter(p=>p.cat==='patriotyczne'||p.cat==='miniatury');desc='Ryngrafy z orłem i hasłem „Bóg Honor Ojczyzna” oraz orzełki i przypinki.'}
      else {items=P.filter(p=>p.engrave&&p.cat!=='strazacy');desc='Każdy z tych ryngrafów możemy uzupełnić dedykacją wygrawerowaną na rewersie.'}
      listing({title:'Prezent: '+o.name.toLowerCase(),desc,items,crumbs:[{t:o.name}],showCat:true,key:'o-'+b});}}
  else if(a==='produkt') product(b);
  else if(a==='koszyk') cartPage();
  else if(a==='zamowienie') checkout();
  else if(a==='dziekujemy') thanks();
  else if(a==='grawer') grawer();
  else if(a==='info') info(b);
  else notFound();
  markNav();
  if(scrollTo){requestAnimationFrame(()=>{const el=document.getElementById(scrollTo); if(el) el.scrollIntoView()})} else window.scrollTo(0,0);
  const h1=$('h1',app); document.title=(h1&&a?h1.textContent+' | ':'')+'ryngrafy.com.pl'+(a?'':', ryngrafy malowane ręcznie z Częstochowy');
}
let tT; function toast(m){const t=$('#toast'); t.textContent=m; t.classList.add('on'); clearTimeout(tT); tT=setTimeout(()=>t.classList.remove('on'),2600)}

$('#yr').textContent=new Date().getFullYear();
fetch('products.json').then(r=>r.json()).then(d=>{P=d; P.forEach(p=>byId[p.id]=p); cart=cart.filter(l=>byId[l.id]&&l.qty>0); buildNav(); updateBadge(); route(); setHdrVar();})
 .catch(()=>{app.innerHTML='<div class="wrap empty"><h2>Nie udało się wczytać produktów</h2></div>'});
window.addEventListener('hashchange',route);
window.addEventListener('resize',setHdrVar);
})();
