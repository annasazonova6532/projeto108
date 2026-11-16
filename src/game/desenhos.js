// Desenhos provisórios do jogo, feitos com formas simples (retângulos, círculos...).
//
// Não é preciso perceber este ficheiro para perceber o jogo: aqui só se desenha.
// Quando a ubbu enviar as imagens, cada função passa a ser um cena.add.image(...).

// Onde fica cada coisa no ecrã (o jogo tem 1024 x 768). x e y são o centro.
// O Game.js usa estes mesmos sítios para pôr os botões invisíveis por cima dos desenhos.
export const SITIOS = {
    passos: [
        { x: 330, y: 95, largura: 110, altura: 110 },
        { x: 470, y: 95, largura: 110, altura: 110 },
        { x: 610, y: 95, largura: 110, altura: 110 }
    ],
    tapete: [
        { x: 300, y: 670, largura: 120, altura: 120 },
        { x: 512, y: 670, largura: 120, altura: 120 },
        { x: 724, y: 670, largura: 120, altura: 120 }
    ],
    musica: { x: 70, y: 95, largura: 84, altura: 84 },
    apagar: { x: 760, y: 95, largura: 90, altura: 90 },
    executar: { x: 875, y: 95, largura: 110, altura: 90 },
    robo: { x: 400, y: 420 },
    ecra: { x: 800, y: 330, largura: 240, altura: 170 },
    ouvir: { x: 890, y: 385, largura: 60, altura: 60 },
    recomecar: { x: 800, y: 480, largura: 220, altura: 70 }
};

const VERDE = 0x1f9d57;
const VERMELHO = 0xd13438;
const AZUL = 0x4fc3ff;
const COR_DO_OLHO = 0x3b1030;

// Fundo, espaços dos passos e ecrã do robô (com o objetivo lá dentro)
export function cenario (cena, objetivo) {
    const g = cena.add.graphics();
    g.fillStyle(0xbfe9f2); g.fillRect(0, 0, 1024, 768);
    g.fillStyle(0x3a8fb0); g.fillRect(0, 0, 1024, 175);
    g.fillStyle(0x2f6f8a); g.fillRoundedRect(250, 25, 440, 140, 22);
    g.fillStyle(0x2b5e73); g.fillRect(0, 590, 1024, 178);

    // espaços dos passos, com uma seta entre eles
    SITIOS.passos.forEach((s, i) => {
        g.fillStyle(0x1f4d61);
        g.fillRoundedRect(s.x - 55, s.y - 55, 110, 110, 16);
        if (i > 0) {
            g.fillStyle(0xffffff);
            g.fillTriangle(s.x - 78, s.y - 10, s.x - 78, s.y + 10, s.x - 62, s.y);
        }
    });

    // ecrã do robô
    const e = SITIOS.ecra;
    g.fillStyle(0x2f6f8a);
    g.fillRect(e.x - 6, 175, 12, e.y - 85 - 175);
    g.fillRoundedRect(e.x - 130, e.y - 95, 260, 190, 20);
    g.fillStyle(0xffffff);
    g.fillRoundedRect(e.x - 120, e.y - 85, 240, 170, 14);
    const planta = cena.add.graphics();
    desenharPlanta(planta, objetivo, 1.2);
    planta.setPosition(e.x - 20, e.y + 5);
}

// O robô. Devolve o corpo (para o abanar) e os três olhos (para mudar a cor).
export function robo (cena) {
    const g = cena.add.graphics();
    g.lineStyle(16, 0x7d6b8a);
    g.beginPath(); g.moveTo(-105, 10); g.lineTo(-140, 30); g.lineTo(-140, 110); g.strokePath();
    g.beginPath(); g.moveTo(105, 10); g.lineTo(140, 30); g.lineTo(140, 110); g.strokePath();
    g.fillStyle(0xb0285f); g.fillCircle(0, -60, 100);
    g.fillStyle(0x3b1030); g.fillRect(-110, -45, 220, 14);
    g.fillStyle(0xb0285f); g.fillRoundedRect(-110, -30, 220, 140, 24);
    g.fillStyle(0xc2336d); g.fillRoundedRect(-65, 5, 130, 90, 10);
    g.fillStyle(0x3b1030); g.fillRect(-90, 110, 180, 22);
    const olhos = [-30, 0, 30].map((x) => cena.add.circle(x, -100, 10, COR_DO_OLHO));
    const corpo = cena.add.container(SITIOS.robo.x, SITIOS.robo.y, [g, ...olhos]);
    return { corpo, olhos };
}

// Cor dos olhos do robô: 'normal', 'a pensar', 'certo' ou 'errado'
export function olhosDoRobo (robo, estado) {
    const cores = { 'normal': COR_DO_OLHO, 'a pensar': AZUL, 'certo': VERDE, 'errado': VERMELHO };
    robo.olhos.forEach((olho) => olho.setFillStyle(cores[estado]));
}

// Um vaso (cartão branco com a planta lá dentro)
export function vaso (cena, tipo) {
    const cartao = cena.add.graphics();
    cartao.fillStyle(0xffffff);
    cartao.fillRoundedRect(-60, -60, 120, 120, 18);
    cartao.lineStyle(4, 0x9fe3f5);
    cartao.strokeRoundedRect(-60, -60, 120, 120, 18);
    const planta = cena.add.graphics();
    desenharPlanta(planta, tipo, 1);
    planta.y = 8;
    return cena.add.container(0, 0, [cartao, planta]).setDepth(5);
}

// Imagens dos botões: música, apagar, executar, ouvir e jogar outra vez
export function botoes (cena) {
    const seta = { fontFamily: 'Arial', fontSize: 40, color: '#ffffff' };

    const m = cena.add.graphics();
    m.fillStyle(0x3cc3c9); m.fillCircle(0, 0, 38);
    const nota = cena.add.text(0, 2, '♪', { ...seta, fontSize: 44 }).setOrigin(0.5);
    const risco = cena.add.graphics().setVisible(false);
    risco.lineStyle(6, VERMELHO); risco.lineBetween(-26, 26, 26, -26);
    cena.add.container(SITIOS.musica.x, SITIOS.musica.y, [m, nota, risco]);

    const a = cena.add.graphics();
    a.fillStyle(0x3cc3c9); a.fillRoundedRect(-45, -45, 90, 90, 18);
    a.fillStyle(0xffffff);
    a.fillRect(-15, -10, 30, 34); a.fillRect(-20, -18, 40, 6); a.fillRect(-6, -24, 12, 6);
    a.setPosition(SITIOS.apagar.x, SITIOS.apagar.y);

    const e = cena.add.graphics();
    e.fillStyle(0x3d9cf0); e.fillRoundedRect(-55, -45, 110, 90, 18);
    e.fillStyle(0xffffff); e.fillTriangle(-15, -22, -15, 22, 22, 0);
    e.setPosition(SITIOS.executar.x, SITIOS.executar.y);

    // ouvir: um altifalante
    const o = cena.add.graphics();
    o.fillStyle(0x3cc3c9); o.fillCircle(0, 0, 27);
    o.fillStyle(0xffffff);
    o.fillRect(-14, -6, 8, 12);
    o.fillTriangle(-6, -6, -6, 6, 6, 14);
    o.fillTriangle(-6, -6, 6, -14, 6, 14);
    o.lineStyle(3, 0xffffff);
    o.beginPath(); o.arc(6, 0, 9, -0.9, 0.9); o.strokePath();
    o.setPosition(SITIOS.ouvir.x, SITIOS.ouvir.y);

    const r = cena.add.graphics();
    r.fillStyle(0x2fbf71); r.fillRoundedRect(-110, -35, 220, 70, 18);
    const outraVez = cena.add.text(0, 0, '↻', seta).setOrigin(0.5);
    const recomecar = cena.add.container(SITIOS.recomecar.x, SITIOS.recomecar.y, [r, outraVez]).setVisible(false);

    return { apagar: a, executar: e, riscoDaMusica: risco, recomecar };
}

// Marca de certo ou errado num passo: visto verde ou "?" vermelho.
// Usa cor e também símbolo, para quem não distingue as cores.
export function criarMarca (cena, sitio) {
    const moldura = cena.add.graphics().setDepth(10);
    const letra = { fontFamily: 'Arial Black, Arial', fontSize: 28, color: '#ffffff' };
    const sinal = cena.add.text(sitio.x + 38, sitio.y - 38, '', letra).setOrigin(0.5).setDepth(11);
    return { moldura, sinal, x: sitio.x, y: sitio.y };
}

export function mostrarMarca (marca, certo) {
    const cor = certo ? VERDE : VERMELHO;
    const g = marca.moldura;
    g.clear();
    g.lineStyle(6, cor);
    g.strokeRoundedRect(marca.x - 55, marca.y - 55, 110, 110, 16);
    g.fillStyle(cor);
    g.fillCircle(marca.x + 38, marca.y - 38, 20);
    if (certo) {
        g.lineStyle(6, 0xffffff);
        g.beginPath();
        g.moveTo(marca.x + 28, marca.y - 38);
        g.lineTo(marca.x + 36, marca.y - 29);
        g.lineTo(marca.x + 49, marca.y - 47);
        g.strokePath();
    }
    marca.sinal.setText(certo ? '' : '?');
}

export function esconderMarca (marca) {
    marca.moldura.clear();
    marca.sinal.setText('');
}

// O objetivo em grande, no meio do ecrã (começa escondido)
export function objetivoEmGrande (cena, objetivo) {
    const escuro = cena.add.rectangle(512, 384, 1024, 768, 0x000000, 0.55);
    const painel = cena.add.graphics();
    painel.fillStyle(0xffffff);
    painel.fillRoundedRect(342, 214, 340, 340, 30);
    const planta = cena.add.graphics();
    desenharPlanta(planta, objetivo, 2.4);
    planta.setPosition(512, 404);
    return cena.add.container(0, 0, [escuro, painel, planta]).setDepth(50).setVisible(false);
}

// A planta dentro do vaso: 'semente', 'rebento' ou 'flor'
function desenharPlanta (g, tipo, s) {
    g.fillStyle(0xe8873a);
    g.fillPoints([
        { x: -25 * s, y: 8 * s }, { x: 25 * s, y: 8 * s },
        { x: 17 * s, y: 42 * s }, { x: -17 * s, y: 42 * s }
    ], true);
    g.fillStyle(0xcf6f22);
    g.fillRoundedRect(-29 * s, 0, 58 * s, 11 * s, 3 * s);
    g.fillStyle(0x6b4423);
    g.fillEllipse(0, 2 * s, 48 * s, 9 * s);

    if (tipo === 'semente') {
        g.fillStyle(0xc89b5a);
        g.fillEllipse(0, -3 * s, 18 * s, 11 * s);
    }
    if (tipo === 'rebento' || tipo === 'flor') {
        const altura = tipo === 'flor' ? 40 : 26;
        g.lineStyle(4 * s, 0x3fa34d);
        g.lineBetween(0, 0, 0, -altura * s);
        g.fillStyle(0x56c25f);
        g.fillEllipse(-9 * s, -altura * 0.5 * s, 18 * s, 9 * s);
        g.fillEllipse(9 * s, -altura * 0.75 * s, 18 * s, 9 * s);
    }
    if (tipo === 'flor') {
        g.fillStyle(0xf0609a);
        for (let k = 0; k < 5; k++) {
            const a = k * 2 * Math.PI / 5 - Math.PI / 2;
            g.fillCircle(Math.cos(a) * 9 * s, -46 * s + Math.sin(a) * 9 * s, 7 * s);
        }
        g.fillStyle(0xffd23f);
        g.fillCircle(0, -46 * s, 6 * s);
    }
}
