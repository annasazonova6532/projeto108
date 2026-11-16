# Protótipo acessível: o robô e a planta a crescer

Projeto 108, Iscte-Sintra, com a ubbu. Anna Sazonova e Tomás Bastos.

Um nível do jogo do robô da ubbu, feito em Phaser 4, a que juntámos acessibilidade:
nomes para o leitor de ecrã, teclado, mensagens depois de cada ação, sons diferentes para certo e errado,
certo e errado com símbolo (não só cor), botão para desligar a música e menos movimento.

## Como abrir

1. Na pasta do projeto, no terminal: `npm install` (só na primeira vez)
2. `npm run dev`
3. Abrir no browser o endereço que aparece (normalmente http://localhost:8080)

## Ficheiros

| Ficheiro | O que faz |
|---|---|
| `src/game/textos.js` | Todas as frases que o leitor de ecrã diz. Para mudar uma frase, muda-se aqui. |
| `src/game/nivel.js` | Os vasos, os nomes e a ordem certa. Para outro nível, muda-se aqui. |
| `src/game/acessibilidade.js` | A camada de botões HTML invisíveis por cima do jogo e a zona de mensagens. |
| `src/game/sons.js` | Sons provisórios (feitos no browser) e a música. |
| `src/game/scenes/Game.js` | O jogo: desenhos, escolher, tirar, executar, verificar, pistas. |
| `src/game/main.js` | Configuração do Phaser (o teclado do Phaser está desligado de propósito). |
| `public/style.css` | Aspeto da camada acessível e da moldura de foco. |

## Como jogar

- Rato ou toque: carregar nos vasos do tapete pela ordem certa e depois no ▶.
- Teclado: Tab para passar de botão em botão, Espaço ou Enter para escolher.
- Carregar num passo já escolhido tira-o. O caixote apaga o último passo.
- Ordem certa: semente → plantinha → flor.

## Para testar com leitor de ecrã

- Mac: VoiceOver (Cmd + F5), no Safari.
- Windows: NVDA, no Chrome ou no Edge.
- Verificar: o leitor diz o nome de cada vaso e botão? Diz o que acontece depois de escolher, tirar e executar?
  Consegue-se acabar o nível sem ver o ecrã?

## Ainda provisório

- Desenhos: trocar pelas imagens da ubbu quando o Francisco as enviar (função `desenharVaso` em `Game.js`).
- Sons e música: trocar por ficheiros de som.
- Frases: o Tomás pode rever as frases em `textos.js`.
- Voz gravada para o objetivo: ainda não tem.
