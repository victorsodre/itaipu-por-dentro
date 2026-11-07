# Assets e fontes — Itaipu por dentro

**Situação atual:** geometria autoral em Three.js, marca oficial e fontes locais licenciadas. Apuração técnica concluída em APURACAO.md; sem foto, PDF ou modelo de terceiros distribuído.

## Conteúdo que originou a proposta

- [Itaipu — Instagram](https://www.instagram.com/reel/DezrzmZHauw/)
- [Itaipu — YouTube](https://www.youtube.com/watch?v=C5yMvA3G82w)

O Reel sobre o vertedouro registrou 4.397 visualizações; o Short correspondente tinha 1.131 no YouTube. O projeto amplia o tema para distinguir vertedouro e geração.

Leitura em 07/11/2026. A análise consultou as APIs oficiais do Instagram/YouTube e relatórios existentes do canal. Vídeos do próprio canal orientam a pauta; fatos científicos/operacionais precisam retornar a fontes primárias antes de serem usados no modelo.

## Apuração concluída

- Itaipu Binacional: casa de força, barragem, vertedouro e cortes da unidade no site paraguaio. Links e imagens consultadas em APURACAO.md.
- Francis, eixo/gerador e dois trajetos confirmados; dimensões, perfil das pás e implantação apresentados como esquema.

Para cada afirmação, registrar: texto, fonte primária, URL/página, data de consulta, trecho ou figura de suporte, unidades, limites e onde aparece na experiência. Não listar uma instituição como se um documento específico já tivesse sido conferido.

## Necessidade de geometria

Diorama em corte com uma unidade geradora; água representada por trajetórias e volumes simples, sem partículas em excesso.

## Registro de aquisição

Registro dos arquivos entregues ao navegador:

| Arquivo/asset | Autor e URL | Licença/termos e data | Uso web permitido | Alterações | Hash/créditos |
|---|---|---|---|---|---|
| Geometria `src/scene/model.ts` | Victor Sodré / ovictorlab | Autoral, 07/11/2026 | Sim, neste projeto | Diorama sem escala | Créditos na interface |
| `icon.svg` e `Brand.tsx` | Código oficial ovictorlab.com | Marca do usuário | Uso autorizado | Transposição fiel | IDENTIDADE-VISUAL.md |
| Fontes Fontsource | Anton, Archivo, Archivo Black, JetBrains Mono | SIL OFL, `public/licenses/` | Sim | Subconjuntos latinos locais | Licenças no diálogo |
| Câmera e UI base | Coleção do mesmo usuário | Reuso dentro do pedido | Sim | Hidrelétrica e seis grupos | Sem GLB/áudio do Fusquinha |

Confirmar permissão para servir o arquivo no navegador: GLB e áudio enviados ao visitante são extraíveis. A licença do código não substitui a licença dos assets. Não baixar pacote executável, rodar scripts embutidos ou publicar interiores não verificados como engenharia fiel.

## Referências da coleção

- Marca e tipografia: fontes oficiais apontadas em IDENTIDADE-VISUAL.md.
- Interação: [Fusquinha](https://github.com/victorsodre/fusquinha), especialmente README e documentação de assets.
- Som: escolher fontes com licença explícita, início por gesto e mute. Evitar sons que sugiram mecanismo diferente do representado.

Bibliotecas React/Three/Lucide: `public/licenses/bibliotecas.txt`. Referências oficiais foram consultadas; suas imagens não são servidas pela aplicação. Sem aquisição paga ou áudio.
