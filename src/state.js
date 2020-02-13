import {
  createMachine,
  state,
  transition,
  reduce,
  immediate,
  guard,
  invoke
} from "robot3";
import * as R from "ramda";

const makeMove = R.curry((player, move, board) => {
  return R.assocPath(move, player, board);
});

function legalMove(move, board) {
  return R.pathEq(move, "-", board);
}

const isGameOver = R.pipe(R.flatten, R.none(R.equals("-")));

function hasPlayerWon(player, board) {
  const [[a, b, c], [d, e, f], [g, h, i]] = board;
  const lines = [
    [a, b, c],
    [d, e, f],
    [g, h, i],
    [a, d, g],
    [b, e, h],
    [c, f, i],
    [a, e, i],
    [c, e, g]
  ];

  return R.any(R.all(R.equals(player)), lines);
}

function isPlayerTurn(previousPlayer, player) {
  return player !== previousPlayer;
}

function isRobotMove(human, player) {
  return human !== player;
}

const gameContext = () => ({
  human: "",
  player: "",
  board: [
    ["-", "-", "-"],
    ["-", "-", "-"],
    ["-", "-", "-"]
  ]
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function delay(t, v) {
  return new Promise(function(resolve) {
    setTimeout(resolve.bind(null, v), t);
  });
}

function guessMove() {
  console.log("guessing!");

  return delay(500).then(() => [getRandomInt(0, 3), getRandomInt(0, 3)]);
}

export const gameMachine = createMachine(
  {
    idle: state(
      transition(
        "choose_x",
        "turn_x",
        reduce(R.pipe(R.assoc("player", "x"), R.assoc("human", "x")))
      ),
      transition(
        "choose_o",
        "turn_x",
        reduce(R.pipe(R.assoc("player", "x"), R.assoc("human", "o")))
      )
    ),
    turn_x: state(
      immediate(
        "generate_move",
        guard(({ human, player }) => isRobotMove(human, player))
      ),
      immediate("wait_x")
    ),
    wait_x: state(
      transition(
        "play_x",
        "validate",
        guard((ctx, event) => legalMove(event.move, ctx.board)),
        reduce(({ board, ...ctx }, event) => ({
          board: makeMove(ctx.player, event.move, board),
          ...ctx
        }))
      )
    ),
    turn_o: state(
      immediate(
        "generate_move",
        guard(({ human, player }) => isRobotMove(human, player))
      ),
      immediate("wait_o")
    ),
    wait_o: state(
      transition(
        "play_o",
        "validate",
        guard((ctx, event) => legalMove(event.move, ctx.board)),
        reduce(({ board, ...ctx }, event) => ({
          board: makeMove(ctx.player, event.move, board),
          ...ctx
        }))
      )
    ),
    switch_player: state(
      immediate(
        "turn_x",
        guard(({ player }) => isPlayerTurn(player, "x")),
        reduce(R.assoc("player", "x"))
      ),
      immediate(
        "turn_o",
        guard(({ player }) => isPlayerTurn(player, "o")),
        reduce(R.assoc("player", "o"))
      )
    ),
    validate: state(
      immediate(
        "x_wins",
        guard(({ board }) => hasPlayerWon("x", board))
      ),
      immediate(
        "o_wins",
        guard(({ board }) => hasPlayerWon("o", board))
      ),
      immediate(
        "game_over",
        guard(({ board }) => isGameOver(board))
      ),
      immediate("switch_player")
    ),
    generate_move: invoke(
      guessMove,
      transition(
        "done",
        "validate",
        guard((ctx, event) => legalMove(event.data, ctx.board)),
        reduce(({ board, ...ctx }, event) => ({
          board: makeMove(ctx.player, event.data, board),
          ...ctx
        }))
      ),
      transition("done", "generate_move")
    ),
    game_over: state(),
    x_wins: state(),
    o_wins: state()
  },
  gameContext
);
