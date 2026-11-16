// Lista dos sons do jogo. Cada nome é um ficheiro .mp3 em public/assets/audio.
// Para trocar um som, basta pôr outro ficheiro com o mesmo nome nessa pasta.

export const SONS = [
    // Voz gravada (para quem ainda não lê)
    'objetivo',           // "Ajuda o robô a fazer crescer uma flor num vaso."
    'instrucoes',         // "Carrega nos vasos pela ordem certa. Depois carrega no botão azul..."
    'certo',              // "Muito bem! A flor cresceu!"
    'errado',             // "Ainda não está certo. Tenta outra vez."
    'ver_objetivo',       // "Vê outra vez o que o robô tem de fazer."

    // Sons curtos e música (provisórios, feitos por nós)
    'som_colocar',        // ao escolher um vaso
    'som_remover',        // ao tirar um vaso
    'som_passo_certo',    // o robô verifica um passo e está certo
    'som_passo_errado',   // o robô verifica um passo e está errado
    'som_sucesso',        // no fim, quando está tudo certo
    'musica'
];
