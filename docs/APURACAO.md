# Apuração — Itaipu por dentro

Consulta em 07/11/2026. **Uma unidade geradora e um trecho do vertedouro**, aproximados espacialmente para comparação. Diorama autoral sem escala, sem planta as-built ou identificação de uma unidade operacional específica.

| Fonte oficial | Sustenta | Limite |
|---|---|---|
| [Itaipu — Casa de força](https://www.itaipu.gov.br/energia/geracao/casa-de-forca) | Turbina Francis, eixo acoplado ao gerador; tomada, conduto, caixa espiral, turbina, tubo de sucção e canal de fuga. Água move a turbina; o gerador recebe movimento pelo eixo. | Não levar água ao gerador. Números zerados dos contadores animados da página não foram tratados como medidas. Sem cálculo de potência no app. |
| [Itaipu — Geração, equipamentos e cotas](https://www.itaipu.gov.br/energia/geracao) | Posição relativa da tomada, conduto e unidade geradora no corte oficial. | A geometria do app é uma interpretação educativa; não copia todas as galerias nem a escala do desenho. |
| [Itaipu — Barragem](https://www.itaipu.gov.br/energia/barragem) | Tomadas na parte superior; condutos levam à caixa espiral. Esquema identifica casa de máquinas e vertedouro em estruturas distintas. | O diorama não retrata a extensão completa nem coordenadas geográficas. |
| [Itaipu — Vertedouro](https://www.itaipu.gov.br/energia/vertedouro) | Descarrega água que não é usada na geração; três calhas; estrutura na margem direita, afastada das unidades geradoras. | Uma calha representativa, com distância comprimida para permitir comparação. Não é uma rota que sai da turbina. |

## Esquema de funcionamento

Geração: reservatório → tomada → conduto → caixa espiral → turbina Francis → tubo de sucção → canal de fuga/rio. Energia: água → rotação da turbina → eixo → rotor do gerador, com estator fixo. A água não sobe ao gerador.

Vertedouro: reservatório → comporta própria → calha → rio. Não atravessa a turbina. Os caminhos podem ser vistos juntos, mas possuem animação e vazão ilustrativa independentes.

## Contrato didático

Dois trajetos autorais em coordenadas sem unidade física. Um marcador acompanha cada percurso e pequenas marcas mostram sentido; não são partículas de uma CFD. Baixa/média/alta alteram densidade visual do fluxo. **Não alteram a velocidade de rotação da turbina**: uma animação de eixo tem velocidade didática fixa enquanto há geração, sem alegar RPM real ou comportamento dinâmico da rede. Vazão zero interrompe fluxo e rotação instantaneamente, uma simplificação explícita.

Controles são demonstração, nunca operação de barragem. Sem simulação de nível, balanço de reservatório, pressão, enchente ou potência. A água é representada apenas até o canal de fuga; o sistema elétrico após o gerador está fora do escopo. Pás Francis ilustrativas, sem perfil hidráulico ou contagem vinculada ao equipamento real. Sem áudio; sem modelos, imagens oficiais ou PDFs distribuídos no app.

## Evidência visual consultada

Cortes acessíveis na [Casa de Máquinas da Itaipu, versão paraguaia](https://www.itaipu.gov.py/energia/generacion/casa-de-maquinas). Conferidos visualmente: `Group-56.png` (seção vertical, conduto descendente e unidade a jusante), `Corte-Turbina-inteira_agua-min-1536x1019.png` (apesar do nome, mostra o gerador em corte) e `Gerador-1-Itaipu-Binacional-e1733180955980.png` (mostra caixa espiral e rotor hidráulico). Nomes dos arquivos não foram usados para identificar as peças; prevaleceu o conteúdo visível e o texto oficial. Referências temporárias em `/private/tmp/itaipu-*.png`; não distribuídas no app.
