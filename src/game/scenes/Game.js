// O jogo: ajudar o robô a fazer crescer uma planta (primeiro nível temático).
//
// Este ficheiro tem a lógica do jogo, por esta ordem:
//   preload            carrega os sons
//   create             desenha tudo, cria os botões invisíveis e começa
//   escolher / tirar   a criança põe ou tira um vaso
//   executar           o robô verifica os passos
//   falhar / ganhar    o que acontece depois da verificação
//   no fim             ajudas pequenas (ouvir, música, baralhar, ...)
//
// O resto está noutros ficheiros:
//   nivel.js           os vasos e a ordem certa
//   textos.js          as frases para o leitor de ecrã
//   sons.js            a lista dos sons
//   desenhos.js        as imagens (provisórias) e o sítio de cada coisa
//   acessibilidade.js  os botões invisíveis e as mensagens para o leitor de ecrã

import { Scene } from 'phaser';
import { NIVEL } from '../nivel';
import { TEXTOS } from '../textos';
import { SONS } from '../sons';
import { criarBotao, moverBotao, anunciar } from '../acessibilidade';
import * as desenhos from '../desenhos';

const SITIOS = desenhos.SITIOS;
const TOTAL = NIVEL.ordemCerta.length;     // quantos passos tem o nível
const VOLUME_DA_MUSICA = 0.08;             // baixinho, para não tapar as vozes

// "Menos movimento": se o aparelho tiver esta opção ligada, nada desliza nem abana.
const MENOS_MOVIMENTO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const tempo = (ms) => (MENOS_MOVIMENTO ? 1 : ms);

export class Game extends Scene {
    constructor () {
        super('Game');
    }

    preload () {
        this.load.setPath('assets/audio');
        SONS.forEach((nome) => this.load.audio(nome, nome + '.mp3'));
    }

    create () {
        // --- Estado do jogo ---
        this.passos = [];            // os vasos já escolhidos, pela ordem
        this.falhas = 0;             // quantas vezes a criança já errou
        this.aVerificar = false;     // fica true enquanto o robô verifica
        this.ganhou = false;
        this.musicaLigada = true;
        this.vozes = [];             // gravações de voz que estão a tocar

        // --- Desenhos ---
        desenhos.cenario(this, NIVEL.objetivo);
        this.robo = desenhos.robo(this);
        this.imagens = desenhos.botoes(this);
        this.marcas = SITIOS.passos.map((sitio) => desenhos.criarMarca(this, sitio));
        this.objetivoEmGrande = desenhos.objetivoEmGrande(this, NIVEL.objetivo);

        // --- Botões invisíveis (para o rato, o teclado e o leitor de ecrã) ---
        this.botaoOuvir = criarBotao('grupo-objetivo', TEXTOS.botoes.ouvir, SITIOS.ouvir, () => this.ouvir());

        this.botoesDosPassos = SITIOS.passos.map((sitio, i) =>
            criarBotao('grupo-passos', TEXTOS.passoVazio(i + 1), sitio, () => this.tirar(i)));

        // Cada vaso tem um desenho e um botão invisível por cima
        this.vasos = NIVEL.itens.map((dados) => {
            const vaso = { id: dados.id, nome: dados.nome, x: 0 };
            vaso.desenho = desenhos.vaso(this, dados.desenho);
            vaso.botao = criarBotao('grupo-tapete', vaso.nome, SITIOS.tapete[0], () => this.escolher(vaso));
            return vaso;
        });

        this.botaoApagar = criarBotao('grupo-controlos', TEXTOS.botoes.apagar, SITIOS.apagar, () => this.apagarUltimo());
        this.botaoExecutar = criarBotao('grupo-controlos', TEXTOS.botoes.executar, SITIOS.executar, () => this.executar());
        this.botaoMusica = criarBotao('grupo-controlos', TEXTOS.botoes.musica, SITIOS.musica, () => this.ligarOuDesligarMusica());
        this.botaoMusica.setAttribute('aria-pressed', 'true');
        this.botaoRecomecar = criarBotao('grupo-controlos', TEXTOS.botoes.recomecar, SITIOS.recomecar, () => this.recomecar());
        this.botaoRecomecar.hidden = true;

        // --- Som ---
        // Os browsers só deixam tocar som depois de a pessoa carregar em alguma coisa.
        // O Phaser trata disso; esta linha é uma segurança para os leitores de ecrã,
        // que às vezes só enviam um "click".
        document.body.addEventListener('click', () => this.sound.context?.resume());
        this.musica = this.sound.add('musica', { loop: true, volume: VOLUME_DA_MUSICA });
        this.musica.play();

        // --- Começar ---
        this.baralhar();
        this.atualizar();
        this.mostrarObjetivo();
        anunciar(TEXTOS.objetivo, 1500);
    }

    // ---------- A criança escolhe um vaso do tapete ----------

    escolher (vaso) {
        if (this.aVerificar || this.ganhou || this.passos.length === TOTAL) return;
        this.calar();
        this.limparMarcas();
        this.passos.push(vaso);
        const n = this.passos.length;

        // No ecrã: o vaso voa para o espaço do passo
        const sitio = SITIOS.passos[n - 1];
        this.tweens.add({ targets: vaso.desenho, x: sitio.x, y: sitio.y, scale: 0.85, duration: tempo(250) });
        this.sound.play('som_colocar');

        // Nos botões: o vaso sai do tapete e o foco passa para o vaso seguinte
        // (ou para Executar, se já estão todos escolhidos)
        vaso.botao.hidden = true;
        this.atualizar();
        const seguinte = this.vasos.find((v) => !v.botao.hidden);
        const botao = seguinte ? seguinte.botao : this.botaoExecutar;
        botao.focus();

        // Para o leitor de ecrã: o que foi escolhido e onde está agora o foco
        let frase = TEXTOS.escolheste(vaso.nome, n, TOTAL);
        if (n === TOTAL) frase += ' ' + TEXTOS.todosEscolhidos(this.passos.map((v) => v.nome).join(', '));
        anunciar(frase + ' ' + TEXTOS.agoraEstasEm(botao.getAttribute('aria-label')));
    }

    // ---------- A criança tira um vaso de um passo ----------

    tirar (i) {
        if (this.aVerificar || this.ganhou) return;
        const vaso = this.passos[i];
        if (!vaso) {
            anunciar(TEXTOS.passoVazioAoCarregar(i + 1));
            return;
        }
        this.calar();
        this.limparMarcas();
        this.passos.splice(i, 1);

        // No ecrã: o vaso volta para o tapete e os passos seguintes andam uma casa para trás
        this.tweens.add({ targets: vaso.desenho, x: vaso.x, y: SITIOS.tapete[0].y, scale: 1, duration: tempo(200) });
        this.passos.forEach((outro, k) => {
            this.tweens.add({ targets: outro.desenho, x: SITIOS.passos[k].x, duration: tempo(200) });
        });
        this.sound.play('som_remover');

        vaso.botao.hidden = false;
        this.atualizar();
        anunciar(TEXTOS.tiraste(vaso.nome, i + 1));
    }

    apagarUltimo () {
        if (this.passos.length === 0) {
            anunciar(TEXTOS.nadaParaApagar);
            return;
        }
        this.tirar(this.passos.length - 1);
    }

    // ---------- O robô verifica os passos ----------

    executar () {
        if (this.aVerificar || this.ganhou) return;
        const faltam = TOTAL - this.passos.length;
        if (faltam > 0) {
            anunciar(TEXTOS.faltamPassos(faltam));
            return;
        }

        this.aVerificar = true;
        this.calar();
        this.limparMarcas();
        desenhos.olhosDoRobo(this.robo, 'a pensar');

        // Qual é o primeiro passo errado? (-1 quer dizer que estão todos certos)
        const errado = this.passos.findIndex((vaso, i) => vaso.id !== NIVEL.ordemCerta[i]);
        const ultimo = (errado === -1) ? TOTAL - 1 : errado;

        // O robô verifica um passo de cada vez e para no primeiro errado
        for (let i = 0; i <= ultimo; i++) {
            this.time.delayedCall(500 + i * 400, () => {
                const certo = (i !== errado);
                desenhos.mostrarMarca(this.marcas[i], certo);
                this.sound.play(certo ? 'som_passo_certo' : 'som_passo_errado');
            });
        }

        // No fim da verificação
        this.time.delayedCall(500 + ultimo * 400 + 500, () => {
            this.aVerificar = false;
            if (errado === -1) this.ganhar();
            else this.falhar(errado + 1);
        });
    }

    // n = número do passo errado (1, 2, 3...)
    falhar (n) {
        this.falhas++;
        desenhos.olhosDoRobo(this.robo, 'errado');
        if (!MENOS_MOVIMENTO) {
            // o robô abana a cabeça
            this.tweens.add({
                targets: this.robo.corpo, angle: { from: -6, to: 6 }, duration: 100, yoyo: true, repeat: 1,
                onComplete: () => this.robo.corpo.setAngle(0)
            });
        }

        let frase = TEXTOS.errado(n);
        const vozes = ['errado'];

        // Pistas: à 2.ª falha mostra outra vez o objetivo; a partir da 4.ª diz qual é o vaso certo
        if (this.falhas === 2) {
            vozes.push('ver_objetivo');
            frase += ' ' + TEXTOS.objetivo;
            this.mostrarObjetivo();
        }
        if (this.falhas >= 4) {
            const vasoCerto = this.vasos.find((vaso) => vaso.id === NIVEL.ordemCerta[n - 1]);
            frase += ' ' + TEXTOS.pista(n, vasoCerto.nome);
            this.tweens.add({ targets: vasoCerto.desenho, scale: 1, duration: tempo(250), yoyo: true, repeat: 3 });
        }

        // Primeiro fala a voz gravada. Quando acaba, a frase vai para o leitor de ecrã.
        const duracao = this.falar(vozes);
        anunciar(frase, duracao);
    }

    ganhar () {
        this.ganhou = true;
        desenhos.olhosDoRobo(this.robo, 'certo');
        this.atualizar();

        const duracao = this.falar(['som_sucesso', 'certo']);
        this.time.delayedCall(duracao, () => {
            this.imagens.recomecar.setVisible(true);
            this.botaoRecomecar.hidden = false;
            this.botaoRecomecar.focus();
            anunciar(TEXTOS.certo + ' ' + TEXTOS.agoraEstasEm(TEXTOS.botoes.recomecar));
        });
    }

    recomecar () {
        this.passos = [];
        this.falhas = 0;
        this.ganhou = false;
        this.limparMarcas();
        this.imagens.recomecar.setVisible(false);
        this.botaoRecomecar.hidden = true;

        this.baralhar();
        this.atualizar();
        this.mostrarObjetivo();
        this.vasos[0].botao.focus();
        anunciar(TEXTOS.novoJogo + ' ' + TEXTOS.objetivo + ' ' + TEXTOS.agoraEstasEm(this.vasos[0].nome));
    }

    // ---------- Ajudas ----------

    // Botão do altifalante: mostra o objetivo e diz o objetivo e as instruções com voz gravada
    ouvir () {
        this.mostrarObjetivo();
        const duracao = this.falar(['objetivo', 'instrucoes']);
        anunciar(TEXTOS.objetivo, duracao);
    }

    // Toca gravações uma a seguir à outra (só uma "voz" de cada vez).
    // Devolve quanto tempo demoram, em milissegundos.
    falar (nomes) {
        this.calar();
        let espera = 0;                          // em segundos
        this.vozes = nomes.map((nome) => {
            const voz = this.sound.add(nome);
            voz.play({ delay: espera });
            espera += voz.duration;
            return voz;
        });
        return espera * 1000;
    }

    // Cala a voz gravada que estiver a tocar
    calar () {
        this.vozes.forEach((voz) => voz.destroy());
        this.vozes = [];
    }

    ligarOuDesligarMusica () {
        this.musicaLigada = !this.musicaLigada;
        this.musica.setVolume(this.musicaLigada ? VOLUME_DA_MUSICA : 0);
        this.imagens.riscoDaMusica.setVisible(!this.musicaLigada);
        this.botaoMusica.setAttribute('aria-pressed', this.musicaLigada);
        anunciar(this.musicaLigada ? TEXTOS.musicaLigada : TEXTOS.musicaDesligada);
    }

    // Mostra o objetivo em grande durante 4 segundos
    mostrarObjetivo () {
        this.objetivoEmGrande.setVisible(true);
        if (this.relogioDoObjetivo) this.relogioDoObjetivo.remove();
        this.relogioDoObjetivo = this.time.delayedCall(4000, () => this.objetivoEmGrande.setVisible(false));
    }

    // Põe os vasos no tapete por uma ordem nova
    baralhar () {
        // mistura até a ordem não ser logo a certa
        do {
            this.vasos.sort(() => Math.random() - 0.5);
        } while (this.vasos.every((vaso, i) => vaso.id === NIVEL.ordemCerta[i]));

        this.vasos.forEach((vaso, i) => {
            const sitio = SITIOS.tapete[i];
            vaso.x = sitio.x;
            vaso.desenho.setPosition(sitio.x, sitio.y).setScale(1);
            vaso.botao.hidden = false;
            moverBotao(vaso.botao, sitio);
            // voltar a pôr o botão no grupo, para o Tab seguir a ordem do ecrã (esquerda para a direita)
            vaso.botao.parentElement.appendChild(vaso.botao);
        });
    }

    // Depois de cada mudança: atualiza os nomes dos passos e o estado de Apagar e Executar
    atualizar () {
        this.botoesDosPassos.forEach((botao, i) => {
            const vaso = this.passos[i];
            botao.setAttribute('aria-label', vaso ? TEXTOS.passoCheio(i + 1, vaso.nome) : TEXTOS.passoVazio(i + 1));
        });

        // Um botão que não se pode usar fica mais apagado, e o leitor de ecrã diz "indisponível"
        const podeApagar = this.passos.length > 0 && !this.ganhou;
        const podeExecutar = this.passos.length === TOTAL && !this.ganhou;
        this.botaoApagar.setAttribute('aria-disabled', !podeApagar);
        this.botaoExecutar.setAttribute('aria-disabled', !podeExecutar);
        this.imagens.apagar.setAlpha(podeApagar ? 1 : 0.45);
        this.imagens.executar.setAlpha(podeExecutar ? 1 : 0.45);
    }

    // Tira as marcas de certo e errado e põe os olhos do robô normais
    limparMarcas () {
        this.marcas.forEach((marca) => desenhos.esconderMarca(marca));
        desenhos.olhosDoRobo(this.robo, 'normal');
    }
}
