import React from "react";
import { useMachine } from "react-robot";
import styled from "styled-components";

import { gameMachine } from "./state";

const BoardWrapper = styled.div`
  background-color: #000;
  width: 320px;

  margin: 50px auto;
`;

const RowWrapper = styled.div`
  height: 100px;

  box-sizing: border-box;
  display: flex;

  margin-bottom: 10px;
  &:nth-child(3) {
    margin-bottom: 0;
  }
`;

const Box = styled.div`
  height: 100px;
  width: 100px;
  background-color: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  font-family: monospace;
  font-size: 50px;
  text-transform: uppercase;

  margin-right: 10px;
  &:nth-child(3) {
    margin-right: 0;
  }
`;

function Row({ row, handleMove }) {
  return (
    <RowWrapper>
      {row.map((v, idx) => (
        <Box key={`$0-${idx}`} onClick={() => handleMove(idx)}>
          {v !== "-" ? v : ""}
        </Box>
      ))}
    </RowWrapper>
  );
}

function Board({ board, handleMove }) {
  const [row1, row2, row3] = board;

  return (
    <BoardWrapper>
      <Row row={row1} handleMove={idx => handleMove(0, idx)} />
      <Row row={row2} handleMove={idx => handleMove(1, idx)} />
      <Row row={row3} handleMove={idx => handleMove(2, idx)} />
    </BoardWrapper>
  );
}

const Button = styled.button`
  padding: 8px 20px;
  margin: 5px;

  border: 1px solid #000;
  border-radius: 5px;
  background-color: #f8f8ff;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-around;
`;

const ChoosePlayerWrapper = styled.div`
  width: 170px;
  margin: 0 auto;

  text-align: center;
`;

function ChoosePlayer({ handleChoice }) {
  return (
    <ChoosePlayerWrapper>
      <h2>Choose player</h2>
      <ButtonGroup>
        <Button onClick={() => handleChoice("x")}>x</Button>
        <Button onClick={() => handleChoice("o")}>O</Button>
      </ButtonGroup>
    </ChoosePlayerWrapper>
  );
}

const MessageWrapper = styled.div`
  height: 50px;
`;

function Message({ state, human }) {
  return (
    <MessageWrapper>
      <div>Current state: {state}</div>
      {human && <div>You are: {human.toUpperCase()}</div>}
      {state === "generate_move" && <div>Thinking...</div>}
      {state === "turn_x" && <div>Player X turn</div>}
      {state === "turn_o" && <div>Player O turn</div>}
      {state === "x_wins" && <div>Player X wins!</div>}
      {state === "o_wins" && <div>Player O wins!</div>}
      {state === "game_over" && <div>It's A Draw!</div>}
    </MessageWrapper>
  );
}

const Wrapper = styled.div`
  width: 800px;
  margin: 50px auto 20px;
`;

function App() {
  const [current, send] = useMachine(gameMachine);
  const state = current.name;
  const { board, player, human } = current.context;
  console.log("state", state);
  console.log("context", current.context);
  return (
    <Wrapper>
      <header>
        <h1>Robot3 Demo</h1>
        <h2>Game Machine</h2>
      </header>
      <Message state={state} human={human} />
      <Board
        player={player}
        board={board}
        handleMove={(rowIdx, idx) =>
          send({ type: `play_${player}`, move: [rowIdx, idx] })
        }
      />

      {state === "idle" && (
        <ChoosePlayer handleChoice={player => send(`choose_${player}`)} />
      )}
    </Wrapper>
  );
}

export default App;
