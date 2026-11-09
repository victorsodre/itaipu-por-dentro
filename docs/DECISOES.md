# Decisões e estado

## 2026-11-07 — documentação inicial

- Victor solicitou salvar o plano no VicMind, criar uma pasta para cada projeto, preparar guias de desenvolvimento/identidade, enviar ao GitHub e escrever posts do X para uso posterior.
- Planejamento detalhado criado; prioridade recomendada **9/10**. A prioridade pode mudar após o piloto e a validação de assets.
- Identidade: ovictorlab.com / Laboratório noturno. Interações: referência Fusquinha, adaptadas à pergunta do projeto.
- Repositório inicialmente privado por escolha operacional conservadora nesta fase. O pedido autoriza o envio dos guias; não foi tratado como solicitação de implementar e publicar os aplicativos.
- Nenhuma postagem no X enviada. Textos de protótipo e lançamento têm condições explícitas de uso.

## 2026-11-07 — implementação autorizada e concluída

O pedido posterior de desenvolver todos os dez projetos autorizou a aplicação e envio dos commits aos repositórios privados. Substitui o estado inicial apenas documental; publicação web e posts continuam separados.

- Uma unidade geradora e uma calha independente, sem escala. Cortes e fontes oficiais em APURACAO.md, direção visual em DIRECAO-VISUAL.md.
- Francis, rotor e eixo sincronizados, estator fixo. Vazão controla marcadores qualitativos, sem inventar relação de RPM, potência ou resposta hidráulica.
- Sem dimensões numéricas, fluido físico, operação real, áudio ou backend. Trajetos aproximados no diorama, diferente da implantação real.
- Corte útil desde a abertura, seis grupos, seleção/isolamento, tour, reset e PNG. Base de câmera/UI reaproveitada da coleção autorizada, sem assets do Fusquinha.
- Revisão visual: volume de água visível, fundação prolongada até saídas e enquadramento maior. Regressão das bobinas corrigida: objetos com visibilidade individual não são fundidos.
- Sete testes e verificações Chrome documentados em VALIDACAO.md. Sem celular físico/Safari ou homologação de engenharia.
- Build estático local e textos para divulgação futura; nenhum deploy ou post automático.

## Como registrar mudanças

Acrescentar data, decisão, motivo, fonte/evidência, arquivos afetados e consequência para o escopo. Separar proposta, implementação, validação e publicação. Preservar decisões antigas com indicação de substituição quando necessário.

## 2026-11-08 — repositório público e GitHub Pages

Victor autorizou aprimorar e tornar públicos os dez projetos com HTML funcional e identidade oficial. Esta decisão substitui a restrição histórica de publicação acima. Incluídos navegação entre os dez sites, canonical/OG/X, prévia real, sitemap, página 404, verificação de caminhos e workflow com testes/build antes do deploy. URL: https://victorsodre.github.io/itaipu-por-dentro/. Conteúdo e modelo educativo preservados; nenhum post enviado ao X. Procedimento e reversão em PUBLICACAO.md.

## 2026-11-08 — vídeo do canal incorporado

Pedido de Victor: embed abaixo do experimento e thumbnail clicável no README. Vídeo `C5yMvA3G82w`, autoria ovictorlab confirmada pelo oEmbed público. O vídeo mostra o vertedouro de Itaipu. No experimento, compare esse trajeto com o caminho da água pela unidade geradora. Player `youtube-nocookie.com`, criado só por clique, `autoplay=0`, controles nativos, referrer de origem e link direto sempre disponível. Capa local para não carregar o YouTube na abertura; layout portrait. Cabeçalho leva à seção `#video`. Identidade preservada; nenhum upload ou alteração de vídeo no canal.

## 2026-11-09 — vertedouro do vídeo, números com fonte e correções da revisão

Pedido de Victor ("faça tudo") a partir da revisão dos dez labs. Substitui "Sem dimensões numéricas" (07/11) só para o vertedouro.

- Vertedouro em m³/s (0 a 62.200), com marcas de 1.500 (média das Cataratas, Metrópoles 14/10/2026), 10.700 (13/10, O Presente), 12.600 (15/10, O Presente, estado inicial) e 62.200 (capacidade, Itaipu). Percentual e "× Cataratas" são conta nossa. Fontes do EP293 (`pesquisa.md`) e página oficial PY do vertedouro, conferida em 09/11/2026.
- Comporta de segmento (setor de cilindro em torno do munhão) que abre com a vazão; a água passa por baixo do lábio. Com vazão zero a comporta fica fechada, a calha seca e o marcador para antes dela. Calha maciça em encosta com trampolim e jato em parábola, como no vídeo. Abertura, lâmina e jato são ilustrativos.
- Novo conjunto "Comporta e calha do vertedouro" (sete conjuntos). Calha passou para a frente do diorama: na vista inicial, comporta, calha, turbina e gerador ficam visíveis (teste por raio). Casa de força maciça no pé da barragem; tomada e rota da geração abaixo da superfície do lago.
- Nota do conduto: a revisão sugeria que a frase "a maior parte segue por dentro da casa de força" estava errada. A página oficial PY (Casa de máquinas, 09/11/2026) confirma a frase: cerca de 18 % do conduto fica à vista. A nota foi mantida, agora com o número e a fonte; o diorama mostra um trecho exposto.
- Play indisponível com as duas vazões em zero; o painel avisa quando o percurso acompanhado está parado.
- Câmera: resize, tela cheia e abrir/fechar unidade mantêm a órbita; só "Reenquadrar" e o reinício voltam à vista padrão. Toque só seleciona com um dedo, curto e parado; tocar no vazio ou selecionar não pausa. Rolagem do mouse rola a página (Ctrl/⌘ + rolagem aproxima); no celular, deslizar na vertical rola a página.
- Celular: tudo em fluxo (barra de ferramentas abaixo do 3D), textos ≥ 11 px, alvos ≥ 44 px, descrição da etapa visível. CSS reescrito sem as regras herdadas de outros labs.
- SEO: título com termo de busca, artigo estático no `index.html` e JSON-LD VideoObject do Short.
- Sem validação visual nesta rodada (o Chrome estava em uso por outro agente); testes geométricos, build e check:pages aprovados.
