// Acessibilidade: botões HTML invisíveis por cima do jogo e mensagens para o leitor de ecrã.
//
// Porquê? O Phaser desenha o jogo num canvas e, para um leitor de ecrã (VoiceOver, NVDA),
// um canvas é só uma imagem: não sabe o que está lá dentro.
// Por isso, por cima de cada coisa em que se pode carregar, pomos um botão HTML verdadeiro,
// invisível e com nome. Com botões verdadeiros:
//   - o leitor de ecrã diz o nome do botão;
//   - o Tab passa de botão em botão, e o Espaço e o Enter carregam nele;
//   - o rato e o toque também carregam nestes botões.

const LARGURA_DO_JOGO = 1024;
const ALTURA_DO_JOGO = 768;

// Cria um botão invisível dentro de um grupo (os grupos estão no index.html).
//   nome   = o que o leitor de ecrã diz
//   sitio  = { x, y, largura, altura }, com x e y no centro, em coordenadas do jogo
//   gemeo  = true para botões em que se carrega várias vezes seguidas (Apagar, Executar, passos).
//            Cria um segundo botão igual, escondido, no mesmo sítio. Ver focarComFrase.
export function criarBotao (grupo, nome, sitio, aoCarregar, gemeo = false) {
    const botao = novoBotao(grupo, nome, sitio, aoCarregar);
    if (gemeo) {
        const outro = novoBotao(grupo, nome, sitio, aoCarregar);
        outro.hidden = true;
        botao.gemeo = outro;
        outro.gemeo = botao;
    }
    return botao;
}

function novoBotao (grupo, nome, sitio, aoCarregar) {
    const botao = document.createElement('button');
    botao.type = 'button';
    mudarNome(botao, nome);
    botao.addEventListener('click', aoCarregar);
    moverBotao(botao, sitio);
    document.getElementById(grupo).appendChild(botao);
    return botao;
}

// Muda o nome de um botão. O nome fica guardado também em data-nome,
// para se poder voltar a ele depois de uma frase (ver focarComFrase).
export function mudarNome (botao, nome) {
    [botao, botao.gemeo].filter(Boolean).forEach((b) => {
        b.dataset.nome = nome;
        b.setAttribute('aria-label', nome);
    });
}

// Marca um botão (e o gémeo) como indisponível: o leitor de ecrã diz "indisponível".
export function indisponivel (botao, sim) {
    [botao, botao.gemeo].filter(Boolean).forEach((b) => b.setAttribute('aria-disabled', sim));
}

// O botão que está à vista: o próprio ou o gémeo.
export function visivel (botao) {
    return (botao.hidden && botao.gemeo && !botao.gemeo.hidden) ? botao.gemeo : botao;
}

// Põe o botão por cima do desenho. Usa percentagens para acompanhar o tamanho do jogo.
export function moverBotao (botao, sitio) {
    botao.style.left = (sitio.x - sitio.largura / 2) / LARGURA_DO_JOGO * 100 + '%';
    botao.style.top = (sitio.y - sitio.altura / 2) / ALTURA_DO_JOGO * 100 + '%';
    botao.style.width = sitio.largura / LARGURA_DO_JOGO * 100 + '%';
    botao.style.height = sitio.altura / ALTURA_DO_JOGO * 100 + '%';
}

// Diz uma frase ao leitor de ecrã: escreve-a na zona de mensagens do index.html.
//   daquiA = quanto tempo esperar antes de a dizer, em milissegundos
// Espera 1 segundo por defeito: nos testes com VoiceOver, as frases ditas logo a seguir
// a carregar num botão perdiam-se, porque o VoiceOver ainda estava a ler o botão.
// Limpa primeiro a zona, para o leitor de ecrã reparar na mudança mesmo que a frase seja igual.
// Só fica uma frase à espera de cada vez: se chegar outra, a anterior é esquecida.
let espera;
export function anunciar (texto, daquiA = 1000) {
    const zona = document.getElementById('mensagens');
    zona.textContent = '';
    clearTimeout(espera);
    espera = setTimeout(() => { zona.textContent = texto; }, daquiA);
}

// Esquece a frase que estiver à espera na zona de mensagens.
function esquecerMensagem () {
    clearTimeout(espera);
    document.getElementById('mensagens').textContent = '';
}

// Põe o foco num botão e faz o leitor de ecrã dizer uma frase antes do nome do botão.
// Porquê? Nos testes com VoiceOver (16/11 e 27/11), «Escolheste…» e «Tiraste…» perdiam-se:
// a frase da zona de mensagens chegava depois de o foco mudar, ou a criança carregava
// outra vez antes de passar 1 segundo e a frase era esquecida.
// O leitor de ecrã lê sempre o nome do botão que recebe o foco, por isso a frase vai no nome:
//   «Escolheste vaso com a flor já aberta. Passo 1 de 3. Vaso com uma semente na terra, botão»
// Quando o foco sai do botão, o nome volta ao normal.
//
// Se o foco já está nesse botão (ex.: Apagar), o VoiceOver não o lê outra vez (teste de 27/11).
// Por isso o botão troca de lugar com o gémeo: um botão igual, no mesmo sítio, que recebe o foco.
// Para a criança nada muda: o foco continua no mesmo sítio e pode carregar outra vez.
export function focarComFrase (botao, frase) {
    esquecerMensagem();
    botao = visivel(botao);
    if (document.activeElement === botao) {
        if (botao.gemeo) {
            const outro = botao.gemeo;
            outro.hidden = false;
            botao.hidden = true;
            botao = outro;
        } else {
            botao.blur();
        }
    }
    botao.setAttribute('aria-label', frase + ' ' + botao.dataset.nome);
    botao.focus();
    botao.addEventListener('blur', () => botao.setAttribute('aria-label', botao.dataset.nome), { once: true });
}

// Diz uma frase depois de uma ação.
// Se o foco está num botão do jogo (teclado, VoiceOver, NVDA), a frase vai no nome desse botão.
// Se não (por exemplo, com o rato no Safari, que não dá foco aos botões), usa a zona de mensagens.
export function dizer (frase) {
    const comFoco = document.activeElement;
    if (comFoco && comFoco.closest('#camada') && !comFoco.hidden) focarComFrase(comFoco, frase);
    else anunciar(frase);
}
