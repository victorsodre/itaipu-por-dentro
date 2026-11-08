# Validação — 07/11/2026

Desenvolvimento concluído para o escopo local. **7 testes e 93 verificações de navegador aprovados.** Sem publicação do aplicativo ou dos posts.

## Ambiente e comandos

Mac de Victor; Node 26.7.0, npm 11.19.0; Chrome com sessão Playwright isolada `ovl-dev`. Instalação pelo lockfile, `npm test`, `npm run check`, `npm run build`. Vite local e produção estática sob `/itaipu-por-dentro/`, incluindo recarga direta. Sem uso da 5090 ou pipeline de vídeos.

## Evidências

- 7 testes: independência de vazões; relógio, pausa, limite temporal e entradas inválidas; ausência de RPM proporcional à vazão; continuidade e separação geométrica dos caminhos; sincronização turbina/eixo/rotor com estator fixo; corte/reset/catálogo reversíveis; enquadramento de seis grupos e cena em quatro proporções. São sete casos agrupando essas afirmações.
- 61 checks de interação: fluxo de geração e vertedouro, zero independente/ambos, percurso por etapas/slider, comparar, abrir/fechar; seleção e isolamento dos seis grupos, busca/tour, zoom/malha, órbita e clique reais, fontes, movimento reduzido, PNG e larguras 360/390/844 px.
- 28 checks de produção: subpasta/recarga; visibilidade simulada suspendendo relógio e renderização; retomada; teclado; cinco licenças locais; recursos locais; PNG; fallback WebGL/perda de contexto; sem erros JS/HTTP no fluxo.
- 4 checks após ajuste das bobinas: corte, duas exportações finais e câmera preservada. Teste de regressão falhou antes da correção e passou depois; build e TypeScript refeitos. Não foi necessário repetir fluxos sem relação com a geometria corrigida.
- Imagens reais inspecionadas: desktop inicial/revisado, turbina, gerador isolado, mobile e PNG horizontal/vertical. Ajustes: volume de água do reservatório, extensão da fundação, enquadramento e bobinas traseiras no corte.

Evidência local ignorada pelo Git: `output/tests.log`, `check.log`, `build.log`, `browser-qa.log`, `production-qa.log`, `export-qa.log`, `coil-regression-before.log`. Capturas `desktop-final.png`, `mobile-final.png`, `generator-final.png`, `final-landscape.png`, `final-portrait.png`. Scripts transitórios em `/private/tmp/itaipu-*-qa.js`; roteiro durável em MANUTENCAO.md.

## Medidas observadas

| Medida | Resultado |
|---|---|
| JavaScript final | 833.785 bytes, aproximadamente 226 kB gzip |
| CSS | 23.918 bytes |
| `dist/` inteiro | 1.096.927 bytes, incluindo fontes/licenças |
| Cena inicial final | 196 draw calls, 85.492 triângulos; contador do renderizador inclui passes |
| Controle disponível | 495 ms em observação local com cache, não benchmark de rede |
| Exportação | 1920×1080 e 1080×1920, com marca e aviso de esquema sem escala |
| Repouso | Contador estabiliza; renderização suspensa na aba oculta |

Aviso de chunk Vite acima de 500 kB permanece, dominado pelo Three.js. Total inferior à meta inicial de 10 MB. Limite de 30 Hz evita trabalho excessivo; não é alegação de 30 fps em aparelhos não ensaiados.

## Limites do aceite

Celular emulado no Chrome do Mac; sem telefone físico ou Safari. Diorama educativo sem escala, sem homologação hidráulica, cálculo de potência ou operação da usina. Cortes e arquitetura conferidos em fontes oficiais, mas perfil das pás, trajetos exatos e implantação continuam simplificados. Os dois caminhos foram aproximados para comparação. Fontes e limites em APURACAO.md. Sem avaliação de uso público ou crescimento nas redes.

## Revisão para publicação — 08/11/2026

Testes automatizados do projeto, TypeScript/build e `check:pages` aprovados. O último verifica assets relativos em subpasta, canonical, prévia social, 404, sitemap e fallback sem JavaScript. O conjunto mantém 76 testes dos mecanismos.

Chrome real em janela dedicada: build servido sob a subpasta do projeto, canvas e catálogo carregados, seleção, ação principal quando presente no dock, diálogo da coleção com dez destinos corretos, indicação da página atual, fechamento por Escape, foco devolvido e seleção preservada. Viewports 1440×1000 e 390×844, sem transbordamento horizontal, erros de JavaScript ou respostas HTTP de erro durante o fluxo. Capturas reais em `output/publish-local-*.png` (ignoradas pelo Git).

A publicação usa o procedimento em [PUBLICACAO.md](PUBLICACAO.md). Verificação local não substitui conferir a URL após o deploy. Celular físico e Safari permanecem fora da amostra; o modelo mantém os limites educativos descritos acima.
