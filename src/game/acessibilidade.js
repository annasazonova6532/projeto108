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
export function criarBotao (grupo, nome, sitio, aoCarregar) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.setAttribute('aria-label', nome);
    botao.addEventListener('click', aoCarregar);
    moverBotao(botao, sitio);
    document.getElementById(grupo).appendChild(botao);
    return botao;
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
