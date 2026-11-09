# Manutenção e validação

## Antes de cada entrega

- Conferir fonte/data das explicações e a distinção entre ilustração e medição.
- Validar assets, créditos e termos, incluindo autorização para servir arquivos extraíveis no navegador.
- Executar `npm ci`, `npm test`, `npm run check`, `npm run build`; registrar comandos e resultado. O roteiro atual passou em VALIDACAO.md.
- Revisar diff, evitar segredos e incluir apenas mudanças da tarefa. Não adicionar diretórios de configuração pessoal, tokens ou snapshots de sessão.
- Testar URL de vídeo, acesso às fontes, carregamento, fallback e navegação por teclado.
- Conferir visualmente 1440×900, 390×844 e orientação horizontal; usar ao menos um navegador desktop e um celular real quando disponível. Registrar dispositivo e limitações.
- Exercitar selecionar → isolar → reenquadrar → abrir/fechar unidade → retornar → reset. Câmera deve conservar o objeto visível.
- Testar mecanismo no início, meio, fim, pausa, retomada, reset e alternância de aba. Ausência de NaN e poses acumuladas é critério funcional.
- Comparar captura inicial, seleção e corte com o guia visual. Validar movimento reduzido; esta versão não tem som.

## Testes proporcionais

Unitários para o estado do mecanismo, limites e transforms quando mudarem. Integração para catálogo/nós do asset e retorno ao estado inicial. Fluxo de navegador para carregar, interagir e resetar. Não criar testes que apenas repitam o texto destes guias.

## Rotina após lançamento

- A cada mudança de modelo: revisar IDs, pivôs, nomes, enquadramento, memória e créditos.
- A cada mudança de dependência: repetir build e fluxos essenciais; comparar imagens antes/depois.
- A cada mudança factual: atualizar a fonte e textos, incluindo capturas/posts ainda não publicados.
- Em revisão periódica: conferir links, disponibilidade de vídeos e situação das fontes. Datas dinâmicas, especialmente Voyager, exigem reconsulta explícita.
- Registrar bug com dispositivo, navegador, ação, resultado esperado/observado e evidência sem dados pessoais.

## Publicação e reversão

A publicação foi autorizada por Victor em 08/11/2026. O procedimento vigente, os checks, a URL e a reversão estão em [PUBLICACAO.md](PUBLICACAO.md). Pushes em `main` passam a publicar pelo workflow após validação.

## Medição do piloto

Se a medição for implementada e autorizada, observar em 7 e 28 dias: visitas à experiência, primeira interação, uso da ação principal e cliques para o vídeo. Evitar coletar placas, imagens pessoais ou identificadores desnecessários. Views dos vídeos não medem uso do aplicativo.

Usar a combinação de qualidade, uso e custo de manutenção para ajustar o próximo projeto. Não prometer crescimento ou patrocínio com base no alcance histórico.

## Regressões específicas

1. Zerar geração: eixo/turbina param, vertedouro continua. Zerar vertedouro: comporta fecha, calha e jato somem, marcador para antes da comporta; geração continua. Zerar ambos: reprodução pausa e o botão fica indisponível, com aviso no painel.
2. Vertedouro: percorrer as marcas (1.500, 10.700, 12.600 e 62.200 m³/s); a comporta sobe, a lâmina e o jato crescem e o texto da marca mostra data e fonte. Geração: marcadores mudam em quantidade; não criar relação falsa entre vazão e RPM.
3. Percorrer início/meio/fim de cada caminho. Confirmar que vertedouro não atravessa turbina e água não atravessa gerador.
4. Abrir/fechar várias vezes: rotor/eixo sincronizados, estator fixo e bobinas traseiras preservadas no corte; reset sem deriva.
5. Selecionar sete grupos, isolar, voltar; busca com acentos; tour; toque 3D (arrastar ou tocar no vazio não pausa nem desmarca); teclado e Escape.
8. Girar, depois redimensionar a janela, entrar em tela cheia e abrir/fechar a unidade: a direção da órbita se mantém. No celular, deslizar na vertical sobre o 3D rola a página; deslizar para o lado gira.
6. Exportar PNGs horizontal/vertical, verificar marca, aviso sem escala, objeto inteiro e preservação da câmera.
7. Servir `dist/` sob `/itaipu-por-dentro/`; verificar recarga, fontes locais, licenças e erros. Simular WebGL indisponível e perda de contexto.

Atualizar APURACAO.md antes de acrescentar cotas, potência ou novas afirmações sobre operação. Números novos de vazão entram em `src/content/spillway.ts` com data e fonte. Preservar separação entre demonstração educativa e comando real.
