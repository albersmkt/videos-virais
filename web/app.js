'use strict';
const $=id=>document.getElementById(id);
const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let catalog,state,local,filter='Todos',query='',authMode='',busy=false;
const demos=[
 {hook:'Cinco testes que eu faria antes de escolher um apartamento',items:[['Apague a luz','Repare se a luz da janela chega até onde você colocaria sua mesa.'],['Ouça o quarto','Abra e feche a janela para comparar o barulho da rua.'],['Ligue a torneira','Peça autorização e observe a vazão da água.'],['Abra duas janelas','Perceba se o ar circula entre a sala e os quartos.'],['Meça a passagem','Marque o espaço da cama e veja se as portas ainda abrem.']],take:'Entre na sala e caminhe até a janela, com o celular na vertical.'},
 {hook:'A cama cabe. Mas será que a porta do armário abre?',items:[['Leve as medidas','Anote largura e comprimento da sua cama antes da visita.'],['Marque no chão','Use uma trena para marcar onde terminaria a lateral da cama.'],['Teste a abertura','Abra a porta do armário e simule o caminho até a janela.']],take:'Mostre a trena no chão e a abertura da porta do armário.'},
 {hook:'Dois quartos na mesma rua podem soar bem diferentes',items:[['Escute perto da janela','Pare alguns segundos no primeiro quarto com a janela aberta.'],['Repita no outro quarto','Observe se a posição em relação à rua muda o som que chega.'],['Confira em outro horário','Pergunte sobre o movimento da rua na hora em que você costuma descansar.']],take:'Caminhe da janela voltada para a rua até o quarto dos fundos.'}
];
async function api(path,body){const r=await fetch('/api/'+path,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const v=await r.json();if(!r.ok)throw Error(v.error||'Falha na conexão.');return v}
function storageKey(){return 'shark-studio-'+(state.user?.id||'visitante')}
function persist(){localStorage.setItem(storageKey(),JSON.stringify(local))}
async function sync(){state=await api('state');try{local=JSON.parse(localStorage.getItem(storageKey()))}catch{}local=local||{};local.done??=[];local.jobs??={};local.niche??='';$('account').innerHTML=state.user?.id===-1?'':state.user?'<span class="badge">'+state.user.credits+' créditos</span><button data-auth="password">Alterar senha</button><button id="logout">Sair</button>':'<button data-auth="login">Entrar</button><button data-auth="register" class="primary">Criar conta</button>';if($('logout'))$('logout').onclick=async()=>{await api('logout',{});local=null;await sync();draw()}}
function say(msg){$('notice').textContent=msg;clearTimeout(say.t);say.t=setTimeout(()=>$('notice').textContent='',5000)}
function dayId(){return Number(location.hash.match(/^#dia\/(\d+)$/)?.[1])}
const link=d=>'#dia/'+d;
const pad=n=>String(n).padStart(2,'0');
function draw(){const c=catalog[dayId()-1];if(c)detail(c);else home()}
function home() {
  const done=local.done.length;
  const balance=state.user?.credits ?? '—';
  $('app').innerHTML=`
    <section class="overview">
      <div><span class="meta">Arquivo prático de conteúdo</span>
        <h1>Ideias para gravar.</h1>
        <p>72 dias · 13 formatos · <strong>${pad(done)}/72 concluídos</strong></p>
      </div>
      <div class="dashboard">
        <div><span class="meta">Seu progresso</span><strong>${Math.round(done/72*100)}%</strong><div class="meter"><i style="width:${done/72*100}%"></i></div></div>
        <div><span class="meta">Créditos de IA</span><strong>${balance}</strong><small>1 por geração de ganchos</small></div>
        <div><label class="meta" for="niche">Qual seu nicho?</label><input id="niche" maxlength="140" placeholder="Ex.: corretor de imóveis" value="${esc(local.niche)}"><small>Salvo neste dispositivo</small></div>
      </div>
    </section>
    <section class="calendar"><div class="line"><div><span class="meta">Calendário</span><h2>Escolha um dia. <em>Grave com direção.</em></h2></div>
    <input type="search" id="search" aria-label="Buscar ideia ou formato" placeholder="Buscar ideia, formato..." value="${esc(query)}"></div>
    <div class="filters" id="filters"></div><div class="grid" id="grid"></div></section>`;
  $('niche').oninput=e=>{local.niche=e.target.value;persist()};
  $('search').oninput=e=>{query=e.target.value;cards()};
  cards();
}
function cards() {
  const formats=['Todos',...new Set(catalog.map(c=>c.format))];
  $('filters').innerHTML=formats.map(f=>`<button aria-pressed="${filter===f}" class="${filter===f?'active':''}" data-filter="${esc(f)}">${esc(f)}</button>`).join('');
  $('filters').onclick=e=>{if(e.target.dataset.filter){filter=e.target.dataset.filter;cards()}};
  const matches=catalog.filter(c=>(filter==='Todos'||filter===c.format)&&norm([c.title,c.format,pad(c.day)].join(' ')).includes(norm(query)));
  $('grid').innerHTML=matches.map(c=>`<a class="card" href="${link(c.day)}"><div class="line"><span class="meta">Dia ${pad(c.day)}</span><span class="badge">${esc(c.format)}</span></div>
  <div class="num">${pad(c.day)}</div><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><footer>${local.done.includes(c.day)?'✓ Concluído':'Abrir dia'}<span aria-hidden="true">↗</span></footer></a>`).join('')||'<p>Nenhuma ideia encontrada com esses filtros.</p>';
}
function detail(c) {
  const job=local.jobs[c.day],done=local.done.includes(c.day);
  const related=catalog.filter(k=>k.title===c.title && k.day!==c.day);
  const useAI=!!(state.ai && state.user);
  const balance=state.user?.credits ?? '—';
  $('app').innerHTML=`<a class="back" href="#inicio">‹ &nbsp; Calendário</a><div class="studio day">
  <article><span class="meta">Dia ${pad(c.day)}</span> · <span class="badge">${esc(c.format)}</span>
  <h1>${esc(c.title)}</h1><p class="muted">${esc(c.summary)}</p><button id="done">${done?'✓ Concluído · desfazer':'Marcar como concluído'}</button>
  <section class="reference"><span class="meta">Vídeo de referência · ${esc(c.format)}</span><h2>O modelo original</h2>
  ${c.ref?`<div class="line"><span class="badge">Instagram</span><a target="_blank" rel="noopener" href="https://www.instagram.com/reel/${c.ref}/">Ver original ↗</a></div><iframe loading="lazy" title="Reel de referência do dia ${c.day}" src="https://www.instagram.com/reel/${c.ref}/embed/"></iframe>`:'<p class="muted">Este dia está sem vídeo de referência.</p>'}
  </section></article><section>
  <span class="meta">Exemplos prontos</span>${c.examples.map(v=>`<p class="example">${esc(v)}</p>`).join('')}
  <div class="generator"><div class="line"><span class="badge">Gerar para o meu nicho</span><span class="badge">${balance} créditos</span></div>
  <h2>Crie três ganchos para seu nicho.</h2><p class="muted">${!state.ai ? 'Geração indisponível. '+(state.setup || 'Verifique a configuração da OpenAI.') : useAI ? 'OpenAI · 1 crédito por rodada.' : 'Entre na sua conta para gerar com a OpenAI.'}</p>
  <label for="niche">Seu nicho</label><input id="niche" maxlength="140" value="${esc(local.niche)}" placeholder="Ex.: corretor de imóveis">
  <p><button id="generate" class="primary" ${state.ai ? '' : 'disabled'}>${state.ai && !state.user ? 'Entrar para gerar' : 'Gerar 3 ganchos com IA'}</button></p>
  <div id="hooks"></div></div></section></div><div id="output"></div>
  <section class="daynav">${related.length?'<h3>Outros formatos desta ideia</h3>'+related.map(k=>`<a class="btn" href="${link(k.day)}">Dia ${k.day} · ${esc(k.format)}</a>`).join(' '):''}
  <div class="line">${c.day>1?`<a href="${link(c.day-1)}">Dia anterior</a>`:''}${c.day<72?`<a href="${link(c.day+1)}">Próximo dia</a>`:''}</div></section>`;
  $('done').onclick=()=>{local.done=done?local.done.filter(x=>x!==c.day):[...local.done,c.day];persist();detail(c)};
  $('niche').oninput=e=>{local.niche=e.target.value;persist()};
  $('generate').onclick=async()=>{
    if(!state.user)return openAuth('login');
    const niche=local.niche.trim();
    if(niche.length<2){$('niche').focus();return say('Informe seu nicho primeiro.')}
    await run($('generate'),'Gerando exemplos…',async()=>{
      {
        const key=c.day+'|'+niche; local.pending??={};
        const id=local.pending[key]??=crypto.randomUUID();persist();
        const previous=Object.values(local.jobs).filter(j=>norm(j.niche||'')===norm(niche)).flatMap(j=>j.hooks||[]);
        const history=[...new Set([...(Array.isArray(local.history?.[norm(niche)])?local.history[norm(niche)]:[]),...previous])].slice(-18);
        const data=await api('hooks',{job:id,day:c.day,niche,history});
        local.history??={};Object.defineProperty(local.history,norm(niche),{value:[...history,...data.hooks].slice(-18),enumerable:true,configurable:true,writable:true});
        local.jobs[c.day]={...data,id,niche,scripts:{}};delete local.pending[key];persist();await sync();
      }
      draw();
    });
  };
  if(job?.id)showHooks(c,job);
}
function legacyDemo(i){const d=demos[i];return {cenas:[{tempo:'0–4s',imagem:d.take,fala:d.hook+'.'},...d.items.map(([a,b],n)=>({tempo:(4+n*6)+'–'+(10+n*6)+'s',imagem:a,fala:b}))],legenda:'Leve esta ideia para a próxima visita. Qual desses detalhes você costuma observar?',frase:d.hook,take:d.take+' Mantenha a frase na tela por 8 segundos, sem narração.',descricao:d.hook+'\n\n'+d.items.map(([a,b],n)=>(n+1)+'. '+a+'. '+b).join('\n\n')+'\n\nSalve para consultar na próxima visita.'}}
async function run(button,label,fn){if(busy)return;busy=true;let prev=button.textContent;button.textContent=label;button.disabled=true;try{await fn()}catch(e){say(e.message)}finally{busy=false;button.disabled=false;button.textContent=prev}}
function showHooks(c,j){$('hooks').innerHTML='<h3>'+(j.demo?'Exemplo guiado':'Escolha um gancho')+'</h3><p class="muted">'+esc(j.niche)+(j.demo?' · conteúdo de demonstração':'')+'</p>'+j.hooks.map((v,i)=>'<div class="sample"><p>'+esc(v)+'</p><button data-pick="'+i+'" class="'+(j.idx===i?'selected':'')+'">Abrir as duas versões</button> <button data-copyhook="'+i+'">Copiar gancho</button></div>').join('');$('hooks').onclick=async e=>{if(e.target.dataset.copyhook!==undefined)return copy(j.hooks[Number(e.target.dataset.copyhook)]);if(e.target.dataset.pick===undefined)return;const i=Number(e.target.dataset.pick);await run(e.target,'Preparando versões…',async()=>{j.scripts[i]??=j.mode==='model'?modelScript(c,j,i):j.demo?legacyDemo(i):await api('script',{job:j.id,idx:i});j.idx=i;persist();if(dayId()===c.day){detail(c);$('output').scrollIntoView({behavior:'smooth'})}})};if(j.scripts[j.idx])output(j.scripts[j.idx])}
async function copy(v){try{await navigator.clipboard.writeText(v);say('Copiado.')}catch{say('Selecione o texto e copie manualmente.')}} 
function output(s){const parts=[s.cenas.map(c=>c.tempo+' · '+c.imagem+'\n'+c.fala).join('\n\n')+'\n\n'+s.legenda,s.frase,s.descricao,s.frase+'\n\n'+s.take+'\n\n'+s.descricao];$('output').innerHTML='<div class="result studio"><section class="panel"><span class="meta">Versão 1</span><h2>Vídeo narrado</h2>'+s.cenas.map(c=>'<div class="scene"><span class="badge">'+esc(c.tempo)+'</span><p><b>'+esc(c.imagem)+'</b></p><p>'+esc(c.fala)+'</p></div>').join('')+'<h3>Descrição</h3><p class="content">'+esc(s.legenda)+'</p><button data-part="0">Copiar roteiro e descrição</button></section><section class="panel"><span class="meta">Versão 2</span><h2>Frase na tela</h2><h3>'+esc(s.frase)+'</h3><button data-part="1">Copiar frase</button><h3>O que gravar</h3><p>'+esc(s.take)+'</p><h3>Descrição para publicar</h3><p class="content">'+esc(s.descricao)+'</p><button data-part="2">Copiar descrição</button> <button data-part="3">Copiar versão completa</button></section></div>';$('output').onclick=e=>{if(e.target.dataset.part!==undefined)copy(parts[e.target.dataset.part])}}
function openAuth(mode){authMode=mode;$('atitle').textContent={login:'Entrar',register:'Criar conta',password:'Alterar senha'}[mode];$('autherror').textContent='';$('fields').innerHTML=(mode==='password'?'<label>Senha atual<input type="password" name="old" autocomplete="current-password" required></label>':'<label>E-mail<input type="email" name="email" autocomplete="username" required></label>')+'<label>'+(mode==='password'?'Nova senha':'Senha')+'<input type="password" name="password" minlength="8" maxlength="256" autocomplete="'+(mode==='login'?'current-password':'new-password')+'" required></label>';if(state.hosted&&mode==='register')$('fields').insertAdjacentHTML('beforeend','<label>Código privado do estúdio<input type="password" name="invite" required></label>');$('dialog').showModal()}
document.addEventListener('click',e=>{if(e.target.dataset.auth)openAuth(e.target.dataset.auth)});$('close').onclick=()=>$('dialog').close();$('authform').onsubmit=async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));try{await api(authMode,authMode==='password'?{old:d.old,new:d.password}:d);$('dialog').close();local=null;await sync();draw()}catch(err){$('autherror').textContent=err.message}};
window.addEventListener('hashchange',()=>{
  if(new URLSearchParams(location.hash.slice(1)).has('acesso')){
    location.reload();
    return;
  }
  if(catalog && state) draw();
  window.scrollTo(0,0);
});(async()=>{const access=new URLSearchParams(location.hash.slice(1)).get('acesso');
if(access){
  await api('personal',{key:access});
  history.replaceState(null,'',location.pathname+location.search);
}
catalog=await(await fetch('/catalog.json')).json();await sync();draw()})().catch(()=>{$('app').textContent='Não foi possível carregar o estúdio. Atualize a página e tente novamente.'});
