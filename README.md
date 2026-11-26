# Shark Reels
Estúdio pessoal para Windows, macOS e Linux. Requer Python 3.9 ou superior. Usa apenas a biblioteca padrão.

## Abrir pelo navegador na Vercel
Importe o repositório com diretório raiz padrão e configurações do vercel.json. O calendário e a demonstração imobiliária abrem sem configurar serviços.
Para gerar conteúdo novo, conecte um Postgres dedicado ao projeto (DATABASE_URL ou POSTGRES_URL), adicione OPENAI_API_KEY e defina STUDIO_ACCESS_CODE com um código privado para autorizar o seu cadastro. Faça Redeploy e use esse código em Criar conta. O app cria suas tabelas no esquema shark_reels. Configure os segredos nas variáveis do projeto, nunca no repositório.

## Abrir no Windows
1. Baixe e extraia o projeto ou clone este repositório. Abra a pasta do projeto.
2. Clique duas vezes em Iniciar-Windows.bat. Se o Windows não encontrar Python, instale Python 3 e reabra o arquivo.
3. Para experimentar, pressione Enter no pedido de chave. Para ativar a IA, insira sua própria chave da API OpenAI nessa janela. A entrada fica oculta e a chave dura somente durante a execução. A API requer saldo ou faturamento na sua conta do provedor.
4. O navegador abre em http://127.0.0.1:8765. Mantenha a janela do servidor aberta durante o uso.

No macOS ou Linux, abra o terminal na pasta extraída e execute `python3 iniciar.py`. Para execução sem perguntas, use `python3 server.py`. As variáveis opcionais são OPENAI_API_KEY, OPENAI_MODEL, PORT e NO_BROWSER=1. O modelo padrão é gpt-4o-mini.

## Produzir um Reel
Escolha o dia ou combine busca e filtro. Abra o cartão e consulte a referência quando disponível. O exemplo imobiliário abre sem cadastro e oferece três ganchos fixos. Ele funciona como uma amostra do formato de saída em qualquer dia.

Para usar IA, crie uma conta local, informe o nicho e clique em “Gerar 3 ganchos”. O servidor recebe apenas a ideia e os dados de conteúdo necessários para a geração. Uma rodada bem-sucedida custa um crédito interno. Cada nova conta começa com 100 créditos de demonstração, independentes do saldo da API. Selecione um gancho e clique em “Abrir as duas versões”. A IA produz o roteiro narrado e a frase com descrição na mesma chamada. Abrir cada gancho pela primeira vez usa a API. Reabrir uma versão salva reutiliza o texto. As chamadas do provedor podem gerar custos mesmo quando o app não debita créditos internos.

## Dados e referências
O calendário contém 72 dias e 13 formatos, com títulos reescritos e instruções próprias. Os vídeos disponíveis abrem no Instagram ou pelo player incorporado e dependem da disponibilidade do post. Os dados de conta, o saldo e as gerações ficam em studio.sqlite, criado ao executar. Nicho, progresso e a última seleção por dia ficam no navegador, separados por conta. Para preservar dados locais, mantenha a pasta e utilize o mesmo navegador e endereço. O servidor escuta apenas no seu computador. A versão local usa SQLite. A hospedagem na Vercel usa Postgres.
