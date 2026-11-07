# Escopo — Itaipu por dentro

## Pergunta e resultado esperado

Por onde a água passa para gerar energia? O visitante deve conseguir explicar o mecanismo depois de explorar a cena e acionar seus controles.

Um corte educativo localizado, com caminho da água, uma unidade geradora simplificada e um caminho separado para o vertedouro. Nomear como esquema quando não houver geometria as-built.

## Conjuntos da primeira versão

- Reservatório ilustrativo
- Tomada de água
- Conduto
- Turbina
- Gerador
- Saída de água e vertedouro separado

Esses grupos são uma proposta semântica; validar sua correspondência com a geometria e as fontes antes de nomear peças como reais.

## Ações principais

| Controle | Comportamento planejado |
|---|---|
| Seguir a água | Destaca o trajeto e os conjuntos relacionados. |
| Controlar vazão ilustrativa | Altera uma animação qualitativa, sem prometer cálculo real de potência. |
| Separar caminhos | Compara geração e vertedouro com trajetos independentes. |

Base de exploração: órbita, zoom, seleção por lista ou clique, isolamento, reenquadrar e reset. Desmontagem e corte só se aplicam aos conjuntos para os quais forem úteis e tecnicamente coerentes. Som, malha e captura são complementos, posteriores à clareza do mecanismo.

## Estado do mecanismo

`idle ↔ generation; spillwayView é um percurso explicativo separado; flowVisual não representa comando real de barragem.`

## Critérios específicos de conclusão

- A água do vertedouro não atravessa a turbina no esquema.
- Tipo de turbina, caminho e dimensões só são associados a Itaipu após confirmação em fonte oficial.
- Potência numérica só entra com equação, hipóteses e dados rastreáveis; MVP permanece qualitativo.

- A pergunta inicial é respondida por uma interação observável, com texto curto e fontes acessíveis.
- O modelo funciona no desktop e no celular de referência, com reset e fallback conferidos.
- Nenhum botão visível é apenas decorativo ou promete função pendente.

## Fora da primeira versão

- Gêmeo digital operacional, previsão de enchentes e controles reais de segurança.
- Toda a usina, simulação de fluidos e geração calculada com números inventados.

Ampliações entram no backlog após o piloto, com evidência de uso e esforço. Não incluir funcionalidades só para repetir todas as opções do Fusquinha.
