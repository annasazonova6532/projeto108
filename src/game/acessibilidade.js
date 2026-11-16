// Camada acessível por cima do jogo.
//
// O Phaser desenha tudo num canvas, que para o leitor de ecrã é só uma imagem.
// Por isso pomos por cima botões HTML invisíveis, um para cada objeto e cada botão do jogo.
// - O leitor de ecrã lê o nome de cada botão (aria-label).
// - O Tab e o Espaço/Enter funcionam sozinhos, porque são botões HTML normais.
// - O rato e o toque também passam por estes botões, por isso há um só caminho para tudo.
// - As mensagens depois de cada ação vão para uma zona "aria-live", que o leitor de ecrã lê.

const LARGURA = 1024;
const ALTURA = 768;

export class CamadaAcessivel {
    constructor (game, textos) {
        this.game = game;
        this.canvas = game.canvas;
        this.contentor = this.canvas.parentElement;

        // O canvas fica escondido do leitor de ecrã: quem fala são os botões.
        this.canvas.setAttribute('aria-hidden', 'true');

        this.raiz = document.createElement('div');
        this.raiz.id = 'camada';
        this.contentor.appendChild(this.raiz);

        // Título e instruções, só para o leitor de ecrã
        const titulo = document.createElement('h1');
        titulo.className = 'so-leitor';
        titulo.textContent = textos.titulo;
        this.raiz.appendChild(titulo);

        const instrucoes = document.createElement('p');
        instrucoes.className = 'so-leitor';
        instrucoes.textContent = textos.instrucoes;
        this.raiz.appendChild(instrucoes);

        // Zona de mensagens que o leitor de ecrã lê sozinho
        this.mensagens = document.createElement('div');
        this.mensagens.className = 'so-leitor';
        this.mensagens.setAttribute('role', 'status');
        this.mensagens.setAttribute('aria-live', 'polite');
        this.mensagens.setAttribute('aria-atomic', 'true');
        this.raiz.appendChild(this.mensagens);

        // Zona para mensagens importantes (certo/errado): interrompe o que o leitor está a dizer
        this.alertas = document.createElement('div');
        this.alertas.className = 'so-leitor';
        this.alertas.setAttribute('role', 'alert');
        this.alertas.setAttribute('aria-live', 'assertive');
        this.alertas.setAttribute('aria-atomic', 'true');
        this.raiz.appendChild(this.alertas);

        this.grupos = {};

        // Manter a camada sempre em cima do canvas, mesmo quando a janela muda de tamanho
        this.sincronizar = this.sincronizar.bind(this);
        window.addEventListener('resize', this.sincronizar);
        this.game.scale.on('resize', this.sincronizar);
        if (window.ResizeObserver) {
            new ResizeObserver(this.sincronizar).observe(this.canvas);
        }
        requestAnimationFrame(this.sincronizar);
    }

    sincronizar () {
        const rc = this.canvas.getBoundingClientRect();
        const rp = this.contentor.getBoundingClientRect();
        this.raiz.style.left = (rc.left - rp.left) + 'px';
        this.raiz.style.top = (rc.top - rp.top) + 'px';
        this.raiz.style.width = rc.width + 'px';
        this.raiz.style.height = rc.height + 'px';
    }

    // Grupo de botões com nome (o leitor de ecrã diz o nome do grupo ao entrar)
    grupo (id, rotulo) {
        const div = document.createElement('div');
        div.setAttribute('role', 'group');
        div.setAttribute('aria-label', rotulo);
        this.raiz.appendChild(div);
        this.grupos[id] = div;
        return div;
    }

    // Cria um botão invisível no sítio (x, y) do jogo, com largura w e altura h.
    botao ({ grupo, rotulo, x, y, w, h, aoCarregar, aoPassar, aoSair }) {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', rotulo);
        this.posicionar(b, x, y, w, h);
        b.addEventListener('click', () => aoCarregar && aoCarregar());
        if (aoPassar) {
            b.addEventListener('pointerenter', aoPassar);
            b.addEventListener('focus', aoPassar);
        }
        if (aoSair) {
            b.addEventListener('pointerleave', aoSair);
            b.addEventListener('blur', aoSair);
        }
        (this.grupos[grupo] || this.raiz).appendChild(b);
        return b;
    }

    // Coordenadas do jogo -> percentagens, para o botão acompanhar o tamanho do canvas
    posicionar (el, x, y, w, h) {
        el.style.left = ((x - w / 2) / LARGURA * 100) + '%';
        el.style.top = ((y - h / 2) / ALTURA * 100) + '%';
        el.style.width = (w / LARGURA * 100) + '%';
        el.style.height = (h / ALTURA * 100) + '%';
    }

    mudarNome (el, rotulo) {
        el.setAttribute('aria-label', rotulo);
    }

    // Botão indisponível: continua no Tab, mas o leitor de ecrã diz que está indisponível
    indisponivel (el, sim) {
        el.setAttribute('aria-disabled', sim ? 'true' : 'false');
    }

    // Esconder e mostrar (um vaso que saiu do tapete deixa de estar no Tab)
    esconder (el, sim) {
        el.hidden = sim;
    }

    // Pôr os botões de um grupo pela ordem da lista (para o Tab seguir o ecrã)
    ordenar (grupo, elementos) {
        const g = this.grupos[grupo];
        elementos.forEach((el) => g.appendChild(el));
    }

    // Mensagem para o leitor de ecrã. Limpa primeiro, para a mesma frase ser lida duas vezes.
    // urgente = true para o resultado (certo/errado): o leitor lê logo, sem esperar.
    anunciar (texto, urgente = false) {
        const zona = urgente ? this.alertas : this.mensagens;
        const outra = urgente ? this.mensagens : this.alertas;
        outra.textContent = '';
        zona.textContent = '';
        clearTimeout(this._t);
        this._t = setTimeout(() => {
            zona.textContent = texto;
        }, 80);
    }

    focar (el) {
        if (el && !el.hidden) el.focus();
    }
}
