import { Game as MainGame } from './scenes/Game';
import { AUTO, Scale, Game } from 'phaser';

// Configuração do Phaser. Mais informação:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#bfe9f2',
    scale: {
        mode: Scale.FIT          // o jogo estica até encher o #game-container
    },
    // O teclado do Phaser fica desligado. O teclado funciona pelos botões HTML invisíveis,
    // e assim o Phaser não "rouba" teclas ao VoiceOver nem ao NVDA.
    input: {
        keyboard: false
    },
    scene: [
        MainGame
    ]
};

const StartGame = (parent) => {
    return new Game({ ...config, parent });
}

export default StartGame;
