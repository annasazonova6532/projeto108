// Dados do nível: que vasos existem, como se chamam e qual é a ordem certa.
// Para fazer outro nível, basta copiar este ficheiro e mudar estes dados.
// Os desenhos são provisórios. Quando a ubbu enviar as imagens, trocam-se aqui.

export const NIVEL = {
    id: 'tema-1-planta',

    // "nome" é o que o leitor de ecrã diz. "desenho" diz que figura desenhar.
    // Os nomes descrevem o que se vê no desenho (a fase da planta), para quem não vê
    // ter a mesma informação, mas sem dizer a ordem.
    itens: [
        { id: 'semente', nome: 'vaso com uma semente na terra', desenho: 'semente' },
        { id: 'rebento', nome: 'vaso com uma plantinha a nascer', desenho: 'rebento' },
        { id: 'flor', nome: 'vaso com a flor já aberta', desenho: 'flor' }
    ],

    // Ordem certa dos passos
    ordemCerta: ['semente', 'rebento', 'flor'],

    // O que aparece no ecrã do robô (o objetivo)
    objetivo: 'flor'
};
