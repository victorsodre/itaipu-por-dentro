# Arquitetura implementada

React 19.2.6 + TypeScript 5.9.3 + Three.js 0.187.0 + Vite 8.3.6. Aplicação estática, `base: './'`; lockfile versionado. Node ≥22.18. Sem backend, LLM, analytics, modelos remotos ou GPU de produção.

## Responsabilidades

- `App.tsx`: relógio, seleção, isolamento, busca, tour, reset, visibilidade e movimento reduzido.
- `simulation/hydro.ts`: estado serializável, sanitização, evolução limitada a 100 ms, curvas de geração/vertedouro e posição do marcador.
- `scene/model.ts`: diorama autoral, sete grupos, recorte, rotor Francis ilustrativo, gerador, volume de água e vertedouro com comporta de segmento, calha e trampolim. Lógica pura em `simulation/hydro.ts` (rotas, comporta, etapas), toque em `scene/pointer.ts`, órbita em `scene/camera.ts`.
- `scene/rig.ts`: sincroniza turbina, eixo e rotor; mantém estator fixo; aplica visibilidade e instâncias dos marcadores.
- `scene/runtime.ts`: iluminação, órbita, picking com recorte, seleção, enquadramento, modo malha, pausa de renderização e perda de contexto.
- `scene/camera.ts` e `capture.ts`: enquadramento por limites e exportação 16:9/9:16 com marca, sem alterar permanentemente a câmera.
- `content/`: catálogo estável, textos, fontes e vídeos. `ui/`: controles HTML, marca e diálogo de créditos. `styles.css`: tokens/layout responsivo.

## Estado e invariantes

`HydroState = {generationFlow, spillwayFlow, generationProgress, spillwayProgress, rotorAngle}`. Vazões 0–1, percursos 0–1, ângulo circular. Estado inicial pausado, geração 0,65 e vertedouro 0,5, corte aberto e comparação dos dois percursos.

Geração nula para seu trajeto e eixo, sem parar vertedouro. Vertedouro nulo para somente seu trajeto. Ambos nulos suspendem reprodução. Vazão altera quantidade de marcadores, não a velocidade do gerador. Velocidade constante é ilustrativa; ausência de inércia está declarada. O slider permite inspecionar o fim do percurso; reprodução seguinte retorna ao circuito.

Água da geração percorre tomada → conduto → caixa espiral → rotor Francis → tubo de sucção → rio. Vertedouro usa outra curva e não toca a turbina. Testes com amostras verificam separação geométrica da turbina e do rotor do gerador. O esquema não calcula energia, frequência, pressão, nível ou enchentes.

IDs: `reservoir`, `intake`, `penstock`, `turbine`, `generator`, `discharge`. Peças com visibilidade independente não entram em fusão de geometria. O corte preserva bobinas traseiras e remove as frontais; não é uma desmontagem acumulativa.

## Renderização e entrega

DPR máximo 1,5, sombra 1024², limite de 30 Hz durante mudanças. Renderiza sob demanda; suspende em repouso/aba oculta. Marcadores instanciados, até 24 por percurso. Fontes e licenças locais. Recursos e medidas em VALIDACAO.md; 30 Hz é limite de trabalho, não promessa de FPS em celulares.

PNG 1920×1080 /1080×1920, identifica esquema sem escala e fluxos ilustrativos. Falha de WebGL mantém catálogo e fontes. Perda de contexto interrompe cena com ação de recarregar. Sem deploy automático; site principal e Fusquinha são referências preservadas.
