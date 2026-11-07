# Escopo — Itaipu por dentro

**Estado:** escopo implementado; evidência em [VALIDACAO.md](VALIDACAO.md).

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

Seis grupos semânticos implementados. O diorama é autoral e sem escala; arquitetura Francis confirmada nas fontes oficiais, geometria detalhada ilustrativa.

## Ações principais

| Controle | Comportamento implementado |
|---|---|
| Seguir a água | Destaca o trajeto e os conjuntos relacionados. |
| Controlar vazão ilustrativa | Altera uma animação qualitativa, sem prometer cálculo real de potência. |
| Separar caminhos | Compara geração e vertedouro com trajetos independentes. |

Base de exploração: órbita, zoom, seleção por lista ou clique, isolamento, reenquadrar e reset. Desmontagem e corte só se aplicam aos conjuntos para os quais forem úteis e tecnicamente coerentes. Som, malha e captura são complementos, posteriores à clareza do mecanismo.

## Estado do mecanismo

`paused ↔ playing`, com vazões e percursos independentes; `generation / spillway / compare` define destaque. O controle não representa comando real de barragem.

## Critérios específicos de conclusão

- A água do vertedouro não atravessa a turbina no esquema.
- Tipo de turbina, caminho e dimensões só são associados a Itaipu após confirmação em fonte oficial.
- Potência numérica só entra com equação, hipóteses e dados rastreáveis; MVP permanece qualitativo.

- A pergunta inicial é respondida por uma interação observável, com texto curto e fontes acessíveis.
- O modelo foi validado no desktop e em viewport móvel emulada, com reset e fallback conferidos; telefone físico permanece fora da evidência disponível.
- Nenhum botão visível é apenas decorativo ou promete função pendente.

## Fora da primeira versão

- Gêmeo digital operacional, previsão de enchentes e controles reais de segurança.
- Toda a usina, simulação de fluidos e geração calculada com números inventados.

Ampliações entram no backlog após o piloto, com evidência de uso e esforço. Não incluir funcionalidades só para repetir todas as opções do Fusquinha.
