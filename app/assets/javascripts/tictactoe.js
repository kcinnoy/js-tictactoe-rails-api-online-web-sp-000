// Code your JavaScript / jQuery solution here
$(document).ready(attachListeners());

var turn = 0;
var currentGame = 0;

const WINNING_COMBOS = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
];

var player = () => turn % 2 ? 'O' : 'X';

  
function setMessage(msg) {
    $("#message").text(msg);
  }

function checkWinner() {
    var board = {};
    var winner = false;
  
    $("td").text((index, square) => (board[index] = square));
  
    WINNING_COMBOS.some(function(combo) {
      if (
        board[combo[0]] !== "" &&
        board[combo[0]] === board[combo[1]] &&
        board[combo[1]] === board[combo[2]]
      ) {
        setMessage(`Player ${board[combo[0]]} Won!`);
        return (winner = true);
      }
    });
    return winner;
  }

function updateState(square) {
    $(square).text(player());
}

function doTurn(square) {
    updateState(square);
    turn++;
    if (checkWinner()) {
      saveGame();
      clearBoard();
    } else if (turn === 9) {
      setMessage("Tie game.");
      saveGame();
      clearBoard();
    }
  }
  
  function clearBoard() {
    $('td').empty();
    turn = 0;
    currentGame = 0;
  }

  function attachListeners() {
    $("td").on("click", function() {
      if (!$.text(this) && !checkWinner()) {
        doTurn(this);
      }
    });
  
    $("#save").on("click", () => saveGame());
    $("#previous").on("click", () => previousGames());
    $("#clear").on("click", () => clearBoard());
  }

  function previousGames() {
    $("div#games").empty();
    $.get("/games", games => {
      if (games.data.length > 0) {
        games.data.forEach(function(game) {
          var id = game["id"];
          var button = '<button id="game-' + id + '">' + id + "</button>";
          $("div#games").append(button);
          $(`#game-${id}`).on("click", () => loadGame(id));
        });
      }
    });
  }

  function loadGame(id) {
    $.get(`/games/${id}`, function(game) {
      state = game.data.attributes.state;
      squares = document.querySelectorAll("td");
      currentGame = id;
      turn = state.join("").length;
      var i = 0;
      squares.forEach(function(square) {
        square.innerHTML = state[i];
        i++;
      });
    });
  }
  
  function saveGame() {
    var state = [];
    var gameData;
  
    $('td').text((index, square) => {
      state.push(square);
    });
  
    gameData = { state: state };
  
    if (currentGame) {
      $.ajax({
        type: 'PATCH',
        url: `/games/${currentGame}`,
        data: gameData
      });
    } else {
      $.post('/games', gameData, function(game) {
        currentGame = game.data.id;
        $('#games').append(`<button id="gameid-${game.data.id}">${game.data.id}</button><br>`);
        $("#gameid-" + game.data.id).on('click', () => reloadGame(game.data.id));
      });
    }
  }

  
  