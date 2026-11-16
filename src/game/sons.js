// Sons provisórios, feitos no próprio browser (Web Audio), sem ficheiros.
// Seguem a lista do documento do Francisco: colocar, remover, verificar, certo, errado e sucesso.
// Quando houver ficheiros de som da ubbu, trocam-se por this.sound.play(...) do Phaser.

export class Sons {
    constructor () {
        this.ctx = null;
        this.musicaLigada = true;
        this._musica = null;
    }

    // O browser só deixa tocar som depois de a pessoa carregar em alguma coisa
    preparar () {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
        if (this.musicaLigada && !this._musica) this.comecarMusica();
    }

    tom (freq, duracao, tipo = 'sine', volume = 0.2, atraso = 0) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime + atraso;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = tipo;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duracao);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + duracao + 0.02);
    }

    colocar () { this.tom(660, 0.12, 'sine', 0.18); }
    remover () { this.tom(392, 0.12, 'sine', 0.18); }
    verificar () { this.tom(880, 0.06, 'square', 0.05); }
    passoCerto () { this.tom(523, 0.1, 'triangle', 0.18); this.tom(784, 0.15, 'triangle', 0.18, 0.08); }
    passoErrado () { this.tom(196, 0.35, 'triangle', 0.22); }
    sucesso () { [523, 659, 784, 1047].forEach((f, i) => this.tom(f, 0.25, 'triangle', 0.2, i * 0.12)); }

    // Música calma em loop, bem mais baixa do que os efeitos
    comecarMusica () {
        if (!this.ctx || this._musica) return;
        const notas = [262, 330, 392, 330, 294, 349, 440, 349];
        let i = 0;
        const tocar = () => {
            this.tom(notas[i % notas.length], 0.7, 'sine', 0.035);
            i++;
        };
        tocar();
        this._musica = setInterval(tocar, 800);
    }

    pararMusica () {
        clearInterval(this._musica);
        this._musica = null;
    }

    alternarMusica () {
        this.musicaLigada = !this.musicaLigada;
        if (this.musicaLigada) this.comecarMusica();
        else this.pararMusica();
        return this.musicaLigada;
    }
}
