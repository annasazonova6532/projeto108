// Frases que o jogo diz ao leitor de ecrã (VoiceOver, NVDA).
// No ecrã não aparece texto. Para mudar uma frase, muda-se só aqui.
// (O título e as instruções iniciais estão no index.html.)

export const TEXTOS = {
    objetivo: 'Objetivo: o robô tem de fazer crescer uma flor cor-de-rosa num vaso.',

    // Nomes dos botões
    botoes: {
        ouvir: 'Ouvir o objetivo e as instruções',
        executar: 'Executar',
        apagar: 'Apagar o último passo',
        musica: 'Música',
        recomecar: 'Jogar outra vez'
    },

    // Os três espaços de cima
    passoVazio: (n) => `Passo ${n}: vazio.`,
    passoCheio: (n, vaso) => `Passo ${n}: ${vaso}. Carrega para tirar.`,
    passoVazioAoCarregar: (n) => `O passo ${n} está vazio. Escolhe um vaso no tapete.`,

    // Depois de cada ação
    escolheste: (vaso, n, total) => `Escolheste ${vaso}. Passo ${n} de ${total}.`,
    todosEscolhidos: (lista) => `Os passos estão todos escolhidos: ${lista}. Carrega em Executar para experimentar.`,
    tiraste: (vaso, n) => `Tiraste ${vaso} do passo ${n}.`,
    nadaParaApagar: 'Ainda não há passos para apagar.',
    faltamPassos: (n) => (n === 1 ? 'Ainda falta 1 passo.' : `Ainda faltam ${n} passos.`),
    agoraEstasEm: (botao) => `Agora estás em: ${botao}.`,

    // Resultado (dito depois da voz gravada)
    errado: (n) => {
        if (n === 1) return 'O passo 1 não está certo.';
        if (n === 2) return 'O passo 1 está certo. O passo 2 não está certo.';
        if (n === 3) return 'Os passos 1 e 2 estão certos. O passo 3 não está certo.';
        return `Os passos 1 a ${n - 1} estão certos. O passo ${n} não está certo.`;
    },
    pista: (n, vaso) => `Pista: o passo ${n} é ${vaso}.`,
    certo: 'Conseguiste! Primeiro a semente, depois a plantinha e no fim a flor.',
    novoJogo: 'Novo jogo.',

    // Música
    musicaLigada: 'Música ligada.',
    musicaDesligada: 'Música desligada.'
};
