import {FORCE,SPILL} from './project.ts';
export const catalog=[
 {id:'reservoir',label:'Reservatório e barragem',detail:'A água fica represada a montante. O desnível permite transformar energia da água em movimento na turbina.',note:'Recorte sem escala. O nível permanece fixo: não há simulação do reservatório.',source:'https://www.itaipu.gov.br/energia/barragem'},
 {id:'intake',label:'Tomada d’água',detail:'A tomada capta a água para o conduto. Grades retêm detritos; comportas permitem interromper esse acesso.',note:'O controle desta experiência é didático e não representa operação de comportas reais.',source:FORCE},
 {id:'penstock',label:'Conduto forçado',detail:'O conduto leva a água da tomada até a caixa espiral ao redor da turbina.',note:'Geometria esquemática. Em Itaipu, parte do conduto fica visível e a maior parte segue por dentro da casa de força.',source:FORCE},
 {id:'turbine',label:'Turbina Francis',detail:'A caixa espiral distribui água ao redor do rotor. A água atravessa as pás, move a turbina e segue para baixo.',note:'Pás, distribuidor e velocidade ilustrativos. O eixo transmite rotação ao gerador acima.',source:FORCE},
 {id:'generator',label:'Gerador e eixo',detail:'O rotor gira com a turbina dentro de um estator fixo. É aqui que o movimento se transforma em energia elétrica.',note:'A água não passa pelo gerador. A animação não calcula tensão, frequência ou potência.',source:FORCE},
 {id:'discharge',label:'Saídas e vertedouro',detail:'Após a turbina, a água retorna pelo tubo de sucção e canal de fuga. O vertedouro tem comporta e calha próprias: sua água não atravessa a turbina.',note:'As saídas foram aproximadas no diorama. A usina real mantém o vertedouro afastado das unidades geradoras.',source:SPILL},
] as const;
export type PartId=typeof catalog[number]['id'];
