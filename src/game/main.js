import { Game as MainGame } from './scenes/Game';
import { AUTO, Scale, Game } from 'phaser';

// Configuração do jogo. Mais informação:
// https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#bfe9f2',
    scale: {
        mode: Scale.FIT,
        autoCenter: Scale.CENTER_BOTH
    },
    // O teclado do Phaser fica desligado: o teclado funciona pelos botões HTML da camada acessível.
    // Assim o Phaser não "rouba" teclas ao VoiceOver ou ao NVDA.
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
