// Cena do jogo: o robô e a planta a crescer (primeiro nível temático).
//
// Como funciona:
// 1. O Phaser desenha tudo (robô, vasos, espaços, botões) no canvas.
// 2. A CamadaAcessivel põe botões HTML invisíveis por cima de cada coisa em que se pode carregar.
// 3. Rato, toque, teclado e leitor de ecrã passam todos por esses botões.
// 4. Depois de cada ação, o jogo escreve uma frase na zona de mensagens (o leitor de ecrã lê-a)
//    e toca um som.

import { Scene } from 'phaser';
import { NIVEL } from '../nivel';
import { TEXTOS } from '../textos';
import { CamadaAcessivel } from '../acessibilidade';
import { Sons } from '../sons';

// Posições no ecrã (o jogo tem 1024 x 768)
const TAM_ITEM = 120;
const TAM_ESPACO = 110;
const Y_ESPACOS = 95;
const X_PRIMEIRO_ESPACO = 330;
const DISTANCIA_ESPACOS = 140;
const Y_TAPETE = 670;
const X_TAPETE = [300, 512, 724];
const ROBO = { x: 400, y: 420 };
const ECRA = { x: 800, y: 330, w: 240, h: 170 };
const POS = {
    musica: { x: 70, y: 95, w: 84, h: 84 },
    apagar: { x: 760, y: 95, w: 90, h: 90 },
    executar: { x: 875, y: 95, w: 110, h: 90 },
    objetivo: { x: ECRA.x + 95, y: ECRA.y + 60, w: 56, h: 56 },
    recomecar: { x: ECRA.x, y: 480, w: 220, h: 70 }
};

// Cores
const COR_OLHO = 0x3b1030;
const COR_A_VERIFICAR = 0x4fc3ff;
const COR_CERTO = 0x1f9d57;
const COR_ERRADO = 0xd13438;

// "Menos movimento": se o aparelho tiver esta opção ligada, as animações ficam quase paradas
const MENOS_MOVIMENTO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dur = (ms) => (MENOS_MOVIMENTO ? 1 : ms);

export class Game extends Scene {
    constructor () {
        super('Game');
    }

    create () {
        this.total = NIVEL.ordemCerta.length;
        this.estado = { sequencia: [], falhas: 0, bloqueado: false, ganhou: false };
        this.sons = new Sons();
        this.camada = new CamadaAcessivel(this.game, TEXTOS);

        this.desenharFundo();
        this.desenharEspacos();
        this.desenharRobo();
        this.desenharEcra();
        this.desenharBotoes();
        this.criarItens();
        this.criarPreVisualizacao();

        this.criarCamadaAcessivel();
        this.baralhar();
        this.atualizarBotoes();

        // Ao abrir: mostra o objetivo e diz-o ao leitor de ecrã
        this.mostrarObjetivo(false);
        this.time.delayedCall(1200, () => this.camada.anunciar(TEXTOS.objetivo, false));
    }

    // ---------- Desenho ----------

    desenharFundo () {
        const g = this.add.graphics();
        g.fillStyle(0xbfe9f2); g.fillRect(0, 0, 1024, 768);
        g.fillStyle(0x3a8fb0); g.fillRect(0, 0, 1024, 175);
        g.fillStyle(0x2f6f8a); g.fillRoundedRect(250, 25, 440, 140, 22);
        g.fillStyle(0x2b5e73); g.fillRect(0, 590, 1024, 178);
        g.fillStyle(0x245063); g.fillRect(0, 590, 1024, 8);
    }

    espacoX (i) {
        return X_PRIMEIRO_ESPACO + i * DISTANCIA_ESPACOS;
    }

    desenharEspacos () {
        const g = this.add.graphics();
        this.marcas = [];
        this.interrogacoes = [];
        for (let i = 0; i < this.total; i++) {
            const x = this.espacoX(i);
            g.fillStyle(0x1f4d61);
            g.fillRoundedRect(x - TAM_ESPACO / 2, Y_ESPACOS - TAM_ESPACO / 2, TAM_ESPACO, TAM_ESPACO, 16);
            if (i < this.total - 1) {
                // seta entre espaços
                g.fillStyle(0xffffff);
                const xs = x + DISTANCIA_ESPACOS / 2;
                g.fillTriangle(xs - 8, Y_ESPACOS - 10, xs - 8, Y_ESPACOS + 10, xs + 8, Y_ESPACOS);
            }
            this.marcas.push(this.add.graphics().setDepth(10));
            this.interrogacoes.push(
                this.add.text(x + 38, Y_ESPACOS - 38, '?', {
                    fontFamily: 'Arial Black, Arial', fontSize: 28, color: '#ffffff'
                }).setOrigin(0.5).setDepth(11).setVisible(false)
            );
        }
    }

    desenharRobo () {
        this.robo = this.add.container(ROBO.x, ROBO.y);
        const g = this.add.graphics();
        // braços
        g.lineStyle(16, 0x7d6b8a);
        g.beginPath(); g.moveTo(-105, 10); g.lineTo(-140, 30); g.lineTo(-140, 110); g.strokePath();
        g.beginPath(); g.moveTo(105, 10); g.lineTo(140, 30); g.lineTo(140, 110); g.strokePath();
        // cabeça e corpo
        g.fillStyle(0xb0285f); g.fillCircle(0, -60, 100);
        g.fillStyle(0x3b1030); g.fillRect(-110, -45, 220, 14);
        g.fillStyle(0xb0285f); g.fillRoundedRect(-110, -30, 220, 140, 24);
        g.fillStyle(0xc2336d); g.fillRoundedRect(-65, 5, 130, 90, 10);
        g.fillStyle(0x9aa7b0); g.fillRect(25, -15, 18, 6); g.fillRect(65, -15, 18, 6);
        g.fillStyle(0x4fc3ff); g.fillRect(45, -15, 18, 6);
        g.fillStyle(0x3b1030); g.fillRect(-90, 110, 180, 22);
        this.robo.add(g);
        // três olhos (mostram a verificação: azul, verde, vermelho)
        this.olhosRobo = [-30, 0, 30].map((x) => this.add.circle(x, -100, 10, COR_OLHO));
        this.robo.add(this.olhosRobo);
    }

    desenharEcra () {
        const g = this.add.graphics();
        g.fillStyle(0x2f6f8a); g.fillRect(ECRA.x - 6, 175, 12, ECRA.y - ECRA.h / 2 - 175);
        g.fillStyle(0x2f6f8a);
        g.fillRoundedRect(ECRA.x - ECRA.w / 2 - 10, ECRA.y - ECRA.h / 2 - 10, ECRA.w + 20, ECRA.h + 20, 20);
        g.fillStyle(0xffffff);
        g.fillRoundedRect(ECRA.x - ECRA.w / 2, ECRA.y - ECRA.h / 2, ECRA.w, ECRA.h, 14);
        // o objetivo no ecrã do robô
        const gf = this.add.graphics();
        desenharVaso(gf, NIVEL.objetivo, 1.2);
        this.florEcra = this.add.container(ECRA.x - 20, ECRA.y + 5, [gf]);
        // botão para ver o objetivo outra vez
        this.visObjetivo = this.add.container(POS.objetivo.x, POS.objetivo.y, [
            this.add.circle(0, 0, 24, 0x3cc3c9),
            this.add.text(0, 0, '↻', { fontFamily: 'Arial', fontSize: 30, color: '#ffffff' }).setOrigin(0.5)
        ]);
    }

    desenharBotoes () {
        // Música
        const gm = this.add.graphics();
        this.barraMusica = this.add.graphics();
        gm.fillStyle(0x3cc3c9); gm.fillCircle(0, 0, 38);
        this.visMusica = this.add.container(POS.musica.x, POS.musica.y, [
            gm,
            this.add.text(0, 2, '♪', { fontFamily: 'Arial', fontSize: 44, color: '#ffffff' }).setOrigin(0.5),
            this.barraMusica
        ]);

        // Apagar o último passo (caixote do lixo)
        const ga = this.add.graphics();
        ga.fillStyle(0x3cc3c9); ga.fillRoundedRect(-45, -45, 90, 90, 18);
        ga.fillStyle(0xffffff);
        ga.fillRect(-15, -10, 30, 34);
        ga.fillRect(-20, -18, 40, 6);
        ga.fillRect(-6, -24, 12, 6);
        this.visApagar = this.add.container(POS.apagar.x, POS.apagar.y, [ga]);

        // Executar
        const ge = this.add.graphics();
        ge.fillStyle(0x3d9cf0); ge.fillRoundedRect(-55, -45, 110, 90, 18);
        ge.fillStyle(0xffffff); ge.fillTriangle(-15, -22, -15, 22, 22, 0);
        this.visExecutar = this.add.container(POS.executar.x, POS.executar.y, [ge]);

        // Jogar outra vez (só aparece no fim)
        const gr = this.add.graphics();
        gr.fillStyle(0x2fbf71); gr.fillRoundedRect(-110, -35, 220, 70, 18);
        this.visRecomecar = this.add.container(POS.recomecar.x, POS.recomecar.y, [
            gr,
            this.add.text(0, 0, '↻', { fontFamily: 'Arial', fontSize: 40, color: '#ffffff' }).setOrigin(0.5)
        ]).setVisible(false);
    }

    criarItens () {
        this.itens = NIVEL.itens.map((dados) => {
            const fundo = this.add.graphics();
            desenharCartao(fundo, false);
            const g = this.add.graphics();
            desenharVaso(g, dados.desenho, 1);
            g.y = 8;
            const c = this.add.container(0, 0, [fundo, g]).setDepth(5);
            return { ...dados, c, fundo, x0: 0, y0: 0, noTapete: true, botao: null };
        });
    }

    criarPreVisualizacao () {
        const escuro = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.55);
        const painel = this.add.graphics();
        painel.fillStyle(0xffffff); painel.fillRoundedRect(-170, -170, 340, 340, 30);
        const g = this.add.graphics();
        desenharVaso(g, NIVEL.objetivo, 2.4);
        g.y = 20;
        this.preVisualizacao = this.add.container(0, 0, [
            escuro,
            this.add.container(512, 384, [painel, g])
        ]).setDepth(50).setVisible(false);
    }

    // ---------- Camada acessível ----------

    criarCamadaAcessivel () {
        const c = this.camada;
        c.grupo('objetivo', TEXTOS.grupos.objetivo);
        c.grupo('passos', TEXTOS.grupos.passos);
        c.grupo('tapete', TEXTOS.grupos.tapete);
        c.grupo('controlos', TEXTOS.grupos.controlos);

        this.botoes = {};

        this.botoes.objetivo = c.botao({
            grupo: 'objetivo', rotulo: TEXTOS.botoes.objetivo, ...POS.objetivo,
            aoCarregar: () => { this.sons.preparar(); this.mostrarObjetivo(true); }
        });

        this.botoesPassos = [];
        for (let i = 0; i < this.total; i++) {
            this.botoesPassos.push(c.botao({
                grupo: 'passos', rotulo: TEXTOS.passoVazio(i + 1),
                x: this.espacoX(i), y: Y_ESPACOS, w: TAM_ESPACO, h: TAM_ESPACO,
                aoCarregar: () => { this.sons.preparar(); this.tirar(i); }
            }));
        }

        this.itens.forEach((item) => {
            item.botao = c.botao({
                grupo: 'tapete', rotulo: item.nome, x: 0, y: 0, w: TAM_ITEM, h: TAM_ITEM,
                aoCarregar: () => { this.sons.preparar(); this.escolher(item); },
                aoPassar: () => this.realcar(item, true),
                aoSair: () => this.realcar(item, false)
            });
        });

        this.botoes.apagar = c.botao({
            grupo: 'controlos', rotulo: TEXTOS.botoes.apagar, ...POS.apagar,
            aoCarregar: () => { this.sons.preparar(); this.apagarUltimo(); }
        });
        this.botoes.executar = c.botao({
            grupo: 'controlos', rotulo: TEXTOS.botoes.executar, ...POS.executar,
            aoCarregar: () => { this.sons.preparar(); this.executar(); }
        });
        this.botoes.musica = c.botao({
            grupo: 'controlos', rotulo: TEXTOS.botoes.musica, ...POS.musica,
            aoCarregar: () => this.alternarMusica()
        });
        this.botoes.musica.setAttribute('aria-pressed', 'true');
        this.botoes.recomecar = c.botao({
            grupo: 'controlos', rotulo: TEXTOS.botoes.recomecar, ...POS.recomecar,
            aoCarregar: () => this.recomecar()
        });
        c.esconder(this.botoes.recomecar, true);
    }

    // ---------- Ações ----------

    escolher (item) {
        const e = this.estado;
        if (e.bloqueado || e.ganhou || !item.noTapete) return;
        if (e.sequencia.length >= this.total) {
            this.camada.anunciar(TEXTOS.sequenciaCompleta(this.listaNomes()));
            return;
        }
        this.limparMarcas();
        e.sequencia.push(item.id);
        const n = e.sequencia.length;
        item.noTapete = false;
        this.realcar(item, false);
        this.camada.esconder(item.botao, true);
        this.tweens.add({
            targets: item.c, x: this.espacoX(n - 1), y: Y_ESPACOS, scale: 0.85,
            duration: dur(250), ease: 'Cubic.easeOut'
        });
        this.sons.colocar();

        this.atualizarBotoes();

        // O botão deste vaso desapareceu, por isso o foco vai para o próximo vaso
        // ou, se já estão todos escolhidos, para Executar.
        const proximo = this.itensPelaOrdemDoEcra().find((i) => i.noTapete);
        const destino = proximo ? proximo.botao : this.botoes.executar;
        this.camada.focar(destino);

        // A mensagem diz o que se escolheu e também onde ficou o foco,
        // porque o leitor de ecrã interrompe a leitura do novo botão para a dizer.
        let mensagem = TEXTOS.escolheste(item.nome, n, this.total);
        if (n === this.total) mensagem += ' ' + TEXTOS.sequenciaCompleta(this.listaNomes());
        mensagem += TEXTOS.agoraEstasEm(destino.getAttribute('aria-label'));
        this.camada.anunciar(mensagem, true, 350);
    }

    tirar (i) {
        const e = this.estado;
        if (e.bloqueado || e.ganhou) return;
        if (i >= e.sequencia.length) {
            this.camada.anunciar(TEXTOS.passoVazioAoCarregar(i + 1));
            return;
        }
        this.limparMarcas();
        const [id] = e.sequencia.splice(i, 1);
        const item = this.item(id);
        item.noTapete = true;
        this.camada.esconder(item.botao, false);
        this.tweens.add({
            targets: item.c, x: item.x0, y: item.y0, scale: 1,
            duration: dur(200), ease: 'Sine.easeInOut'
        });
        // os passos seguintes andam uma casa para a esquerda
        e.sequencia.forEach((outroId, k) => {
            this.tweens.add({ targets: this.item(outroId).c, x: this.espacoX(k), duration: dur(200) });
        });
        this.sons.remover();
        this.camada.anunciar(TEXTOS.tiraste(item.nome, i + 1));
        this.atualizarBotoes();
    }

    apagarUltimo () {
        const e = this.estado;
        if (e.bloqueado || e.ganhou) return;
        if (e.sequencia.length === 0) {
            this.camada.anunciar(TEXTOS.nadaParaApagar);
            return;
        }
        this.tirar(e.sequencia.length - 1);
    }

    executar () {
        const e = this.estado;
        if (e.bloqueado || e.ganhou) return;
        const faltam = this.total - e.sequencia.length;
        if (faltam > 0) {
            this.camada.anunciar(TEXTOS.faltamPassos(faltam));
            return;
        }
        e.bloqueado = true;
        this.atualizarBotoes();
        this.limparMarcas();
        this.camada.anunciar(TEXTOS.aVerificar);

        // O robô verifica passo a passo e para no primeiro errado
        let primeiroErrado = -1;
        for (let i = 0; i < this.total; i++) {
            if (e.sequencia[i] !== NIVEL.ordemCerta[i]) { primeiroErrado = i; break; }
        }
        const ultimo = primeiroErrado === -1 ? this.total - 1 : primeiroErrado;
        for (let i = 0; i <= ultimo; i++) {
            this.time.delayedCall(400 + i * 300, () => {
                this.olhosRobo[i].setFillStyle(COR_A_VERIFICAR);
                this.sons.verificar();
                const certo = i !== primeiroErrado;
                this.time.delayedCall(150, () => {
                    this.marcar(i, certo);
                    if (certo) this.sons.passoCerto(); else this.sons.passoErrado();
                });
            });
        }
        this.time.delayedCall(400 + ultimo * 300 + 500, () => {
            if (primeiroErrado === -1) this.ganhar();
            else this.falhar(primeiroErrado);
        });
    }

    falhar (i) {
        const e = this.estado;
        e.falhas++;
        this.corOlhos(COR_ERRADO);
        if (!MENOS_MOVIMENTO) {
            this.tweens.add({
                targets: this.robo, angle: { from: -6, to: 6 }, duration: 100, yoyo: true, repeat: 1,
                onComplete: () => this.robo.setAngle(0)
            });
        }
        let mensagem = TEXTOS.errado(i + 1) + TEXTOS.antesCertos(i + 1);

        // Pistas: à 2.ª falha mostra outra vez o objetivo; a partir da 4.ª diz qual é o passo certo
        if (e.falhas === 2) {
            mensagem += ' ' + TEXTOS.verObjetivoOutraVez + ' ' + TEXTOS.objetivo;
            this.mostrarObjetivo(false);
        }
        if (e.falhas >= 4) {
            const certo = this.item(NIVEL.ordemCerta[i]);
            mensagem += ' ' + TEXTOS.pista(i + 1, certo.nome);
            this.pulsar(certo);
        }
        this.camada.anunciar(mensagem, true);
        e.bloqueado = false;
        this.atualizarBotoes();
        this.time.delayedCall(1200, () => this.corOlhos(COR_OLHO));
    }

    ganhar () {
        const e = this.estado;
        e.ganhou = true;
        e.bloqueado = false;
        this.corOlhos(COR_CERTO);
        this.sons.sucesso();
        if (!MENOS_MOVIMENTO) {
            this.tweens.add({ targets: this.florEcra, scale: 1.25, duration: 300, yoyo: true, repeat: 1 });
            this.particulas();
        }
        this.visRecomecar.setVisible(true);
        this.camada.esconder(this.botoes.recomecar, false);
        this.atualizarBotoes();
        this.camada.focar(this.botoes.recomecar);
        this.time.delayedCall(700, () => this.camada.anunciar(TEXTOS.certo, true));
    }

    recomecar () {
        const e = this.estado;
        e.sequencia = [];
        e.falhas = 0;
        e.ganhou = false;
        e.bloqueado = false;
        this.limparMarcas();
        this.corOlhos(COR_OLHO);
        this.visRecomecar.setVisible(false);
        this.camada.esconder(this.botoes.recomecar, true);
        this.baralhar();
        this.atualizarBotoes();
        const primeiro = this.itensPelaOrdemDoEcra()[0].botao;
        this.camada.focar(primeiro);
        this.mostrarObjetivo(false);
        this.camada.anunciar(
            TEXTOS.novoJogo + TEXTOS.objetivo + TEXTOS.agoraEstasEm(primeiro.getAttribute('aria-label')),
            true, 350
        );
    }

    alternarMusica () {
        this.sons.preparar();
        const agora = this.sons.alternarMusica();
        this.botoes.musica.setAttribute('aria-pressed', agora ? 'true' : 'false');
        this.barraMusica.clear();
        if (!agora) {
            this.barraMusica.lineStyle(6, COR_ERRADO);
            this.barraMusica.lineBetween(-26, 26, 26, -26);
        }
        this.camada.anunciar(agora ? TEXTOS.musicaLigada : TEXTOS.musicaDesligada);
    }

    // ---------- Ajudas ----------

    item (id) {
        return this.itens.find((i) => i.id === id);
    }

    listaNomes () {
        return this.estado.sequencia.map((id) => this.item(id).nome).join(', ');
    }

    itensPelaOrdemDoEcra () {
        return [...this.itens].sort((a, b) => a.x0 - b.x0);
    }

    // Põe os vasos no tapete por uma ordem nova (nunca já na ordem certa)
    baralhar () {
        let xs;
        do {
            xs = [...X_TAPETE].sort(() => Math.random() - 0.5);
        } while (NIVEL.ordemCerta.every((id, k) => xs[this.itens.findIndex((i) => i.id === id)] === X_TAPETE[k]));

        this.itens.forEach((item, k) => {
            item.x0 = xs[k] + Math.round(Math.random() * 24 - 12);
            item.y0 = Y_TAPETE + Math.round(Math.random() * 16 - 8);
            item.noTapete = true;
            item.c.setPosition(item.x0, item.y0).setScale(1);
            this.camada.posicionar(item.botao, item.x0, item.y0, TAM_ITEM, TAM_ITEM);
            this.camada.esconder(item.botao, false);
        });
        // O Tab segue a ordem do ecrã, da esquerda para a direita
        this.camada.ordenar('tapete', this.itensPelaOrdemDoEcra().map((i) => i.botao));
    }

    atualizarBotoes () {
        const e = this.estado;
        const n = e.sequencia.length;
        this.botoesPassos.forEach((b, i) => {
            const id = e.sequencia[i];
            this.camada.mudarNome(b, id ? TEXTOS.passoCheio(i + 1, this.item(id).nome) : TEXTOS.passoVazio(i + 1));
        });
        // Durante a verificação o estado dos botões não muda: se mudasse, o leitor de ecrã
        // voltava a ler o botão e tapava a mensagem do resultado.
        const podeApagar = n > 0 && !e.ganhou;
        const podeExecutar = n === this.total && !e.ganhou;
        this.camada.indisponivel(this.botoes.apagar, !podeApagar);
        this.camada.indisponivel(this.botoes.executar, !podeExecutar);
        this.visApagar.setAlpha(podeApagar ? 1 : 0.45);
        this.visExecutar.setAlpha(podeExecutar ? 1 : 0.45);
    }

    // Certo e errado com símbolo e cor (não só cor): visto verde ou "?" vermelho
    marcar (i, certo) {
        const m = this.marcas[i];
        const x = this.espacoX(i);
        const y = Y_ESPACOS;
        const cor = certo ? COR_CERTO : COR_ERRADO;
        m.clear();
        m.lineStyle(6, cor);
        m.strokeRoundedRect(x - TAM_ESPACO / 2, y - TAM_ESPACO / 2, TAM_ESPACO, TAM_ESPACO, 16);
        m.fillStyle(cor);
        m.fillCircle(x + 38, y - 38, 20);
        if (certo) {
            m.lineStyle(6, 0xffffff);
            m.beginPath();
            m.moveTo(x + 28, y - 38);
            m.lineTo(x + 36, y - 29);
            m.lineTo(x + 49, y - 47);
            m.strokePath();
        }
        this.interrogacoes[i].setVisible(!certo);
    }

    limparMarcas () {
        this.marcas.forEach((m) => m.clear());
        this.interrogacoes.forEach((t) => t.setVisible(false));
    }

    corOlhos (cor) {
        this.olhosRobo.forEach((o) => o.setFillStyle(cor));
    }

    realcar (item, sim) {
        if (!item.noTapete && sim) return;
        desenharCartao(item.fundo, sim);
        if (!MENOS_MOVIMENTO && item.noTapete) item.c.setScale(sim ? 1.05 : 1);
    }

    pulsar (item) {
        if (MENOS_MOVIMENTO) {
            desenharCartao(item.fundo, true);
            this.time.delayedCall(2500, () => desenharCartao(item.fundo, false));
            return;
        }
        const base = item.c.scale;
        this.tweens.add({ targets: item.c, scale: base * 1.15, duration: 250, yoyo: true, repeat: 3 });
    }

    mostrarObjetivo (anunciar) {
        if (anunciar) this.camada.anunciar(TEXTOS.objetivo);
        const p = this.preVisualizacao;
        this.tweens.killTweensOf(p);
        if (this._esconderObjetivo) this._esconderObjetivo.remove();
        p.setVisible(true).setAlpha(0);
        this.tweens.add({ targets: p, alpha: 1, duration: dur(250) });
        this._esconderObjetivo = this.time.delayedCall(2700, () => {
            this.tweens.add({
                targets: p, alpha: 0, duration: dur(250),
                onComplete: () => p.setVisible(false)
            });
        });
    }

    particulas () {
        for (let k = 0; k < 20; k++) {
            const p = this.add.circle(ROBO.x, ROBO.y - 80, 6 + Math.random() * 5, 0xffd23f).setDepth(40);
            const a = Math.random() * Math.PI * 2;
            const d = 80 + Math.random() * 120;
            this.tweens.add({
                targets: p, x: ROBO.x + Math.cos(a) * d, y: ROBO.y - 80 + Math.sin(a) * d, alpha: 0,
                duration: 1000, ease: 'Cubic.easeOut', onComplete: () => p.destroy()
            });
        }
    }
}

// ---------- Desenhos provisórios (trocar pelas imagens da ubbu) ----------

function desenharCartao (g, realce) {
    g.clear();
    g.fillStyle(0xffffff);
    g.fillRoundedRect(-TAM_ITEM / 2, -TAM_ITEM / 2, TAM_ITEM, TAM_ITEM, 18);
    g.lineStyle(realce ? 7 : 4, realce ? 0x4fd1ff : 0x9fe3f5);
    g.strokeRoundedRect(-TAM_ITEM / 2, -TAM_ITEM / 2, TAM_ITEM, TAM_ITEM, 18);
}

function desenharVaso (g, tipo, s = 1) {
    // vaso
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
