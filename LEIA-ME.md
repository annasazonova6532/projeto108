# Protótipo acessível: o robô e a planta a crescer

Projeto 108, Iscte-Sintra, com a ubbu. Anna Sazonova e Tomás Bastos.

Um nível do jogo do robô da ubbu, feito em Phaser 4, a que juntámos acessibilidade.
Online: https://annasazonova6532.github.io/projeto108/

## A ideia

O Phaser desenha o jogo num canvas. Para um leitor de ecrã, um canvas é só uma imagem.
Por isso pusemos por cima do jogo **botões HTML invisíveis**, um para cada vaso e cada botão.
O rato, o toque, o teclado e o leitor de ecrã usam todos esses botões.
Depois de cada ação, o jogo escreve uma frase numa **zona de mensagens**, que o leitor de ecrã lê.

## Ficheiros

| Ficheiro | O que tem |
|---|---|
| `index.html` | O título e as instruções para o leitor de ecrã, a zona de mensagens e os grupos de botões. |
| `public/style.css` | O tamanho do jogo, os botões invisíveis e a moldura amarela do foco. |
| `src/game/nivel.js` | Os vasos, os nomes e a ordem certa. Para outro nível, muda-se aqui. |
| `src/game/textos.js` | As frases que o leitor de ecrã diz. |
| `src/game/sons.js` | A lista dos sons. |
| `src/game/acessibilidade.js` | Criar um botão invisível e dizer uma frase ao leitor de ecrã. |
| `src/game/desenhos.js` | Os desenhos provisórios e o sítio de cada coisa. |
| `src/game/scenes/Game.js` | A lógica do jogo: escolher, tirar, executar, falhar, ganhar. |
| `src/game/main.js` | A configuração do Phaser. |
| `public/assets/audio/` | Os sons (.mp3). |

## O que o protótipo faz

1. Cada vaso e cada botão tem um nome que o leitor de ecrã diz.
2. Joga-se só com o teclado: Tab para mudar, Espaço ou Enter para escolher. O foco vê-se bem.
3. Depois de cada ação, o leitor de ecrã diz o que aconteceu.
4. O objetivo é dito em palavras: em texto para o leitor de ecrã e em voz gravada (botão do altifalante).
5. A música pode desligar-se.
6. As pistas também são ditas (à 2.ª falha repete o objetivo, à 4.ª diz o vaso certo).
7. Com a opção «menos movimento» do aparelho ligada, nada desliza nem abana.
8. Certo e errado têm símbolo (visto e «?») e som, não só cor.

A voz gravada fala primeiro. Quando acaba, a frase vai para o leitor de ecrã, para não falarem os dois ao mesmo tempo.

## Como abrir no computador

1. `npm install` (só na primeira vez)
2. `npm run dev`
3. Abrir http://localhost:8080

Para publicar: fazer Commit e Sync no VS Code. O site atualiza sozinho em 1 a 2 minutos.

## Como testar com leitor de ecrã

- Mac: VoiceOver (Cmd + F5), no Safari.
- Windows: NVDA, no Chrome ou no Edge.
- Ordem certa: semente, plantinha, flor.

## Sons

- Voz (`objetivo`, `instrucoes`, `certo`, `errado`, `ver_objetivo`): ficheiros enviados pelo Tomás. Só acertámos o volume. Falta escrever aqui como foram feitos (ferramenta e licença).
- Sons curtos e música (`som_...`, `musica`): provisórios, feitos por nós. Para os trocar, põe-se na pasta um ficheiro com o mesmo nome.

## Ainda provisório

- Desenhos: trocar pelas imagens da ubbu.
- Sons curtos e música.
- Ainda não foi testado com crianças nem com NVDA.
