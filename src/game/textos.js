// Todos os textos que o leitor de ecrã diz.
// Para mudar uma frase, muda-se só aqui. O resto do código não precisa de mudar.
// No ecrã não aparece texto: estas frases são só para o leitor de ecrã (VoiceOver, NVDA).

export const TEXTOS = {
    titulo: 'Jogo do robô: a planta a crescer',

    instrucoes:
        'Ajuda o robô a fazer crescer uma flor. ' +
        'Cada vaso do tapete é um passo. ' +
        'Escolhe os três passos pela ordem certa e depois carrega em Executar. ' +
        'Usa a tecla Tab para passar de um botão para outro, e Espaço ou Enter para escolher.',

    objetivo: 'Objetivo: o robô tem de fazer crescer uma flor cor-de-rosa num vaso.',

    // Nomes dos grupos de botões
    grupos: {
        objetivo: 'Objetivo',
        passos: 'Passos escolhidos',
        tapete: 'Vasos no tapete',
        controlos: 'Controlos'
    },

    // Nomes dos botões
    botoes: {
        objetivo: 'Ver o objetivo outra vez',
        executar: 'Executar',
        apagar: 'Apagar o último passo',
        musica: 'Música',
        recomecar: 'Jogar outra vez'
    },

    // Espaços dos passos (em cima)
    passoVazio: (n) => `Passo ${n}: vazio.`,
    passoCheio: (n, item) => `Passo ${n}: ${item}. Carrega para tirar.`,
    passoVazioAoCarregar: (n) => `O passo ${n} está vazio. Escolhe um vaso no tapete.`,

    // Mensagens depois de cada ação
    escolheste: (item, n, total) => `Escolheste ${item}. Passo ${n} de ${total}.`,
    sequenciaCompleta: (lista) =>
        `Os passos estão todos escolhidos: ${lista}. Carrega em Executar para experimentar.`,
    tiraste: (item, n) => `Tiraste ${item} do passo ${n}.`,
    nadaParaApagar: 'Ainda não há passos para apagar.',
    faltamPassos: (faltam) =>
        faltam === 1 ? 'Ainda falta escolher 1 passo.' : `Ainda faltam escolher ${faltam} passos.`,
    aVerificar: 'O robô está a verificar.',
    errado: (n) => `O passo ${n} não está certo.`,
    antesCertos: (n) => {
        if (n <= 1) return '';
        if (n === 2) return ' O passo 1 está certo.';
        if (n === 3) return ' Os passos 1 e 2 estão certos.';
        return ` Os passos 1 a ${n - 1} estão certos.`;
    },
    certo: 'Muito bem! Primeiro a semente, depois a plantinha e no fim a flor. A flor cresceu. Conseguiste!',

    // Pistas
    verObjetivoOutraVez: 'Vê outra vez o objetivo.',
    pista: (n, item) => `Pista: o passo ${n} é ${item}.`,

    // Música
    musicaLigada: 'Música ligada.',
    musicaDesligada: 'Música desligada.',

    novoJogo: 'Novo jogo. ',
    agoraEstasEm: (nome) => ` Agora estás em: ${nome}.`
};
