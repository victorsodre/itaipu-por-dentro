# Apuração — Itaipu por dentro

Consulta em 07/11/2026. **Uma unidade geradora e um trecho do vertedouro**, aproximados espacialmente para comparação. Diorama autoral sem escala, sem planta as-built ou identificação de uma unidade operacional específica.

| Fonte oficial | Sustenta | Limite |
|---|---|---|
| [Itaipu — Casa de força](https://www.itaipu.gov.br/energia/geracao/casa-de-forca) | Turbina Francis, eixo acoplado ao gerador; tomada, conduto, caixa espiral, turbina, tubo de sucção e canal de fuga. Água move a turbina; o gerador recebe movimento pelo eixo. | Não levar água ao gerador. Números zerados dos contadores animados da página não foram tratados como medidas. Sem cálculo de potência no app. |
| [Itaipu — Geração, equipamentos e cotas](https://www.itaipu.gov.br/energia/geracao) | Posição relativa da tomada, conduto e unidade geradora no corte oficial. | A geometria do app é uma interpretação educativa; não copia todas as galerias nem a escala do desenho. |
| [Itaipu — Barragem](https://www.itaipu.gov.br/energia/barragem) | Tomadas na parte superior; condutos levam à caixa espiral. Esquema identifica casa de máquinas e vertedouro em estruturas distintas. | O diorama não retrata a extensão completa nem coordenadas geográficas. |
| [Itaipu — Vertedouro](https://www.itaipu.gov.br/energia/vertedouro) e [versão PY](https://www.itaipu.gov.py/energia/vertedero) (09/11/2026) | Descarrega água que não é usada na geração; capacidade máxima de 62.200 m³/s, 40 vezes a média das Cataratas; 14 comportas de segmento de 20 × 21,34 m; três calhas; margem direita, afastada das unidades; cheia máxima provável de projeto de 72.020 m³/s (não usada no app). | Uma comporta e uma calha representam o conjunto, com distância comprimida para comparação. Abertura proporcional à vazão é ilustrativa. |
| [Itaipu PY — Casa de máquinas](https://www.itaipu.gov.py/energia/generacion/casa-de-maquinas) (09/11/2026) | Cerca de 18 % do comprimento de cada conduto fica à vista (nível 144), o resto corre por dentro da casa de máquinas; cada conduto leva cerca de metade da vazão média das Cataratas; comportas de serviço abrem ou fecham a tomada; o tubo de sucção freia a água. | Os contadores numéricos da página aparecem zerados sem JavaScript; não foram usados. |
| Cheia de outubro de 2026: [O Presente 13/10](https://www.opresente.com.br/geral/apos-abrir-seis-comportas-vertedouro-de-itaipu-libera-volume-de-agua-sete-vezes-maior-que-vazao-media-das-cataratas-do-iguacu/), [O Presente 15/10](https://www.opresente.com.br/parana/segunda-calha-do-vertedouro-de-itaipu-e-aberta-novamente/), [Metrópoles 14/10](https://www.metropoles.com/brasil/vazao-das-cataratas-do-iguacu) | 13/10: 6 das 14 comportas, todas na calha esquerda, cerca de 10.700 m³/s; 15/10: calhas esquerda e central, 12.600 m³/s (maior valor noticiado); média das Cataratas de 1.500 m³/s. Lidas em 22/10/2026 na pesquisa do EP293. | O app não cita número de comportas fora da data (as fontes divergem entre 6 e 10) nem diz que a cheia bateu recorde. |

## Esquema de funcionamento

Geração: reservatório → tomada → conduto → caixa espiral → turbina Francis → tubo de sucção → canal de fuga/rio. Energia: água → rotação da turbina → eixo → rotor do gerador, com estator fixo. A água não sobe ao gerador.

Vertedouro: reservatório → comporta de segmento (a água passa por baixo do lábio) → calha → trampolim → rio. O trampolim vem do roteiro do EP293; a forma no diorama é ilustrativa. Não atravessa a turbina. Os caminhos podem ser vistos juntos, mas possuem animação e vazão ilustrativa independentes.

## Contrato didático

Dois trajetos autorais em coordenadas sem unidade física. Um marcador acompanha cada percurso e pequenas marcas mostram sentido; não são partículas de uma CFD. Na geração, baixa/média/alta alteram a densidade visual do fluxo. No vertedouro, a vazão em m³/s abre a comporta e engrossa lâmina e jato de forma ilustrativa, sem cálculo hidráulico. **Não alteram a velocidade de rotação da turbina**: uma animação de eixo tem velocidade didática fixa enquanto há geração, sem alegar RPM real ou comportamento dinâmico da rede. Vazão zero interrompe fluxo e rotação instantaneamente, uma simplificação explícita.

Controles são demonstração, nunca operação de barragem. Sem simulação de nível, balanço de reservatório, pressão, enchente ou potência. A água é representada apenas até o canal de fuga; o sistema elétrico após o gerador está fora do escopo. Pás Francis ilustrativas, sem perfil hidráulico ou contagem vinculada ao equipamento real. Sem áudio; sem modelos, imagens oficiais ou PDFs distribuídos no app.

## Evidência visual consultada

Cortes acessíveis na [Casa de Máquinas da Itaipu, versão paraguaia](https://www.itaipu.gov.py/energia/generacion/casa-de-maquinas). Conferidos visualmente: `Group-56.png` (seção vertical, conduto descendente e unidade a jusante), `Corte-Turbina-inteira_agua-min-1536x1019.png` (apesar do nome, mostra o gerador em corte) e `Gerador-1-Itaipu-Binacional-e1733180955980.png` (mostra caixa espiral e rotor hidráulico). Nomes dos arquivos não foram usados para identificar as peças; prevaleceu o conteúdo visível e o texto oficial. Referências temporárias em `/private/tmp/itaipu-*.png`; não distribuídas no app.
