// Each subject has a hook premise and three observable actions for filming.
const subjectGroups = [
  [/im[oó]ve|imobili|apartamento|corretor|terreno/i, [
    ['a circulação no quarto','uma cama pode caber no quarto e ainda bloquear a porta do armário','Marque no chão a largura da cama com uma trena.','Abra a porta do armário até o fim.','Percorra o espaço que sobrou entre a cama e a parede.'],
    ['o ruído no quarto','dois quartos do mesmo imóvel podem receber ruídos diferentes','Fique em silêncio ao lado da janela aberta.','Feche a janela e escute novamente.','Repita no outro quarto e compare o que ouviu.'],
    ['a luz natural da sala','uma sala clara na foto pode precisar de luz acesa no seu canto de leitura','Apague as luminárias durante a visita.','Abra a cortina até o fim.','Leve um livro até o lugar onde pretende pôr o sofá.'],
    ['o espaço da garagem','a largura da vaga influencia até a abertura da porta do carro','Confira a posição das colunas.','Meça a largura disponível nos dois lados.','Simule a abertura da porta com a vaga vizinha ocupada.'],
    ['a disposição da cozinha','uma geladeira que cabe no nicho pode não abrir por completo','Anote a medida do seu eletrodoméstico.','Observe a parede ao lado da dobradiça.','Simule o espaço necessário para puxar as gavetas.']]],
  [/intelig[eê]ncia artificial|chatgpt|tecnologia|\bia\b/i, [
    ['o contexto do pedido','um exemplo muda o estilo da resposta da IA','Faça um pedido curto.','Repita com um exemplo do tom desejado.','Leia as duas primeiras frases lado a lado.'],
    ['a revisão do resumo','um resumo pode deixar de fora uma condição importante','Escolha um parágrafo com uma exceção.','Peça um resumo em uma frase.','Compare a exceção no texto e na resposta.'],
    ['o formato da resposta','a mesma informação pode virar uma tabela pronta para usar','Separe três tarefas com prazos.','Peça colunas para tarefa, data e responsável.','Confira se cada data ficou na linha certa.']]],
  [/foto|retratos|imagem/i,[
    ['a luz do rosto','virar um pouco o rosto muda o desenho da sombra','Fotografe de frente para a janela.','Gire o rosto para o lado mantendo a câmera parada.','Compare a sombra sob os olhos.'],
    ['o fundo do retrato','um passo para o lado pode limpar o fundo da foto','Procure algo que cruza a linha da cabeça.','Mude de posição sem aproximar a câmera.','Compare o contorno nos dois retratos.'],
    ['o corte da foto','o recorte quadrado pode esconder a parte mais importante do retrato','Abra a foto inteira.','Aplique o recorte de perfil.','Confira a leitura em tamanho pequeno.']]],
  [/cozinha|culin[aá]ria|gastronomia|confeit/i,[
    ['a organização da bancada','separar os ingredientes antes revela o que está faltando','Leia a receita até o fim.','Separe os ingredientes em pequenos recipientes.','Confira a lista antes de começar.'],
    ['o tamanho dos pedaços','cortes de tamanhos diferentes mudam o ponto dos legumes','Compare dois pedaços do mesmo legume.','Corte porções de espessura parecida.','Confira o ponto de cada porção.'],
    ['a apresentação do prato','mudar o prato altera o destaque da comida na foto','Sirva uma pequena porção.','Compare sobre dois fundos.','Fotografe do mesmo ângulo.']]]
];
function localSubjects(niche) {
  const match = subjectGroups.find(([pattern]) => pattern.test(niche));
  if (match) return match[1];
  return [
    ['a escolha inicial em '+niche,'comparar duas opções pelo mesmo critério ajuda na escolha','Escolha duas alternativas reais do seu trabalho.','Mostre o mesmo detalhe nas duas.','Explique qual atende melhor ao objetivo e por quê.'],
    ['a primeira tentativa em '+niche,'registrar a primeira tentativa facilita enxergar o que mudou','Mostre como o trabalho começa.','Altere apenas um detalhe e repita.','Coloque os dois resultados lado a lado.'],
    ['o pedido de quem procura '+niche,'um exemplo ajuda a esclarecer um pedido vago','Mostre um pedido comum sem identificar o cliente.','Apresente dois exemplos possíveis.','Explique a pergunta que diferencia as duas escolhas.']
  ];
}
function modelBatch(card,niche,round) {
  const subjects=localSubjects(niche);
  const selected=Array.from({length:3},(_,i)=>subjects[(round+card.day-1+i)%subjects.length]);
  return {mode:'model',niche,round,subjects:selected,scripts:{},hooks:selected.map(([topic,fact])=>card.pattern.replaceAll('{topic}',topic).replaceAll('{fact}',fact).replaceAll('{niche}',niche))};
}
function modelScript(card,job,index) {
  const [topic,,...actions]=job.subjects[index], hook=job.hooks[index];
  const points=card.title.startsWith('Top 5')?[
    'Primeiro erro: começar sem definir o que precisa descobrir sobre '+topic+'.',
    ...actions.map((a,i)=>['Segundo','Terceiro','Quarto'][i]+' erro: pular esta etapa. '+a),
    'Quinto erro: decidir sem comparar o que você observou com o que precisa no dia a dia.'
  ]:actions;
  const final='Salve para consultar quando for avaliar '+topic+'.';
  return {cenas:[{tempo:'0–5s',imagem:card.tip,fala:hook},...points.map((v,i)=>({tempo:(5+i*7)+'–'+(12+i*7)+'s',imagem:actions[Math.min(i,actions.length-1)],fala:v})),{tempo:(5+points.length*7)+'–'+(9+points.length*7)+'s',imagem:'Mostre o resultado em plano fechado.',fala:final}],legenda:hook+'\n\n'+points.join(' ')+' '+final,frase:hook,take:'Filme uma tomada vertical de 8 segundos. '+actions[0]+' Mantenha a frase visível durante o vídeo.',descricao:hook+'\n\n'+points.map((v,i)=>(i+1)+'. '+v).join('\n\n')+'\n\n'+final};
}
