$(document).ready(function() {

var myPlayerNumber = undefined;
var enemyPlayerNumber = undefined;
var name = prompt('What is your User ID?', 'guest');
var letters = "abcdefgh".split('');
var boardArray = [];
var myShips = [];
var currentShipLength = 5;
var readyForData = false;
var firebaseData;
var enemyShips;
var enemyFive, enemyFour, enemyThree, enemyTwo;
var myHits = [];
var myTurns = [];
//
//===============
// SECTION BREAK
//===============
//

//
//These functions are responsible for pushing the first two users who log into the page on to the linked fireBase database and to set a local myPlayerNumber variable for use during the play phase of the game.
function assignPlayer() {
  //Function Purpose:
  //This function creates information for the player in the Firebase database so that their dataset reference can be accessed by the other player to determine a winner later. It also assigns the player number and enemy player number for use later in the program.
  var gameRef = new Firebase('https://shining-torch-1753.firebaseio.com/player_data');
  var gameTempArray = getSynchronizedArray(gameRef);
  setTimeout(function() {
    if (gameTempArray.length === 0) {
      var disconnectHandler = new Firebase('https://shining-torch-1753.firebaseio.com/player_data/');
      disconnectHandler.onDisconnect().remove();
      var playerZeroRef = gameRef.child('0');
      gameTempArray = getSynchronizedArray(playerZeroRef);
      gameTempArray.$set('name', name);
      myPlayerNumber = 0;
      enemyPlayerNumber = 1;
    } else if (gameTempArray.length === 1) {
      var disconnectHandler = new Firebase('https://shining-torch-1753.firebaseio.com/player_data/');
      disconnectHandler.onDisconnect().remove();
      var playerOneRef = gameRef.child('1');
      gameTempArray = getSynchronizedArray(playerOneRef);
      gameTempArray.$set('name', name);
      myPlayerNumber = 1;
      enemyPlayerNumber = 0;
    } else {
      console.log('game is full, sorry.')
    }
  }, 1000);
}

assignPlayer();
//End of the initial player/database setup section.

//
//===============
// SECTION BREAK
//===============
//

//
//From here down is the code for the Firebase chat.
var myDataRef = new Firebase('https://shining-torch-1753.firebaseio.com/chat/');
var sendMessage = function() {
  var currentTime = new Date();
  var hour = ((currentTime.getHours() > 9) ? currentTime.getHours() : '0' + currentTime.getHours());
  var minute = ((currentTime.getMinutes() > 9) ? currentTime.getMinutes() : '0' + currentTime.getMinutes());
  var second = ((currentTime.getSeconds() > 9) ? currentTime.getSeconds() : '0' + currentTime.getSeconds());
  var time = (hour + ":" + minute + ":" + second);
  var text = $('#messageInput').val();
  myDataRef.push({
    time: time,
    name: name,
    text: text
  });
  $('#messageInput').val('');
  // }
}

$('#messageInput').keypress(function(e) {
  if (e.keyCode == 13) {
    sendMessage();
  }
});

$('#send').on('click', sendMessage);

myDataRef.on('child_added', function(snapshot) {
  var message = snapshot.val();
  displayChatMessage(message.time, message.name, message.text);
});

function displayChatMessage(time, name, text) {
  $('<div/>').text(text).prepend($('<em/>').text(time + ' - ' + name + ': ')).appendTo($('#messagesDiv'));
  $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
};

var clearChat = function() {
  var quickRemove = new Firebase('https://shining-torch-1753.firebaseio.com/chat/');
  quickRemove.remove();
  $('#messagesDiv').html('');
};

$('#clear').on('click', clearChat);
// Firebase Chat Code above
//

//
//===============
// SECTION BREAK
//===============
//

//
//Sets up the board
var createBoard = function() {
  //Function Purpose:
  //This function is 2 for loops set up to be nested to create an 8x8 grid on the webpage.
  for (var i = 0; i < 8; i++) {
    var tempArray = [];
    for (var j = 1; j < 9; j++) {
      $('<div></div>').attr('id', (letters[i] + j)).addClass('myBoardSquare').appendTo('#boardDiv');
      tempArray.push(letters[i] + j);
    }
    boardArray.push(tempArray);
  }
}
createBoard();
//Board creation ended
//

//
//===============
// SECTION BREAK
//===============
//

//The functions in the section are responsible for setting up your own game.
var placementPhase = function() {
  $('.myBoardSquare').on('click', function() {
    //Function purpose:
    //This function handles clicks at the start of the game while ships are being placed on the board. It determines the outer array index and inner array index so they can be passed to the required functions for ship placement.
    var $boardID = $(this).attr('id').split('');
    var rowIndex = letters.indexOf($boardID[0]);
    var columnIndex = (parseInt($boardID[1]) - 1);
    var shipLength = currentShipLength;
    if (shipLength === 0) {
      return;
    }
    if ($("#checkboxActual").is(':checked')) {
      console.log('Attempting to place ship with length ' + shipLength + ' vertically at position ' + rowIndex + ',' + columnIndex);
      verticalPlace(shipLength, rowIndex, columnIndex);
    } else {
      console.log('Attempting to place ship with length ' + shipLength + ' horizontally at position ' + rowIndex + ',' + columnIndex);
      horizontalPlace(shipLength, rowIndex, columnIndex);
    }
  });
}

placementPhase();
//This just starts the game right now, might tie this to a start game button later where we check that there are two players first.

var checkForCompleteSetup = function() {
  //Function Purpose:
  //This function determines if all the ships have been placed and runs automatically 
  if (currentShipLength < 2) {
    console.log('all ships placed, cancelling initial event handler.')
    $('.myBoardSquare').off('click');
    pushShipsToFirebase();
    checkForStart();
    return;
  }
}

var pushShipsToFirebase = function() {
  //Function Purpose:
  //
  setTimeout(function() {
    var tempLocation = 'https://shining-torch-1753.firebaseio.com/player_data/' + myPlayerNumber + '/';
    var tempFirebase = new Firebase(tempLocation);
    var tempSyncArray = getSynchronizedArray(tempFirebase);
    tempSyncArray.$set('Ships', myShips);
    tempSyncArray.$set('ready', true);
    console.log(tempSyncArray[0][0]);
  }, 1000);
}

var horizontalPlace = function(currentShip, rIndex, cIndex) {
  //Function purpose:
  //This function is wholly responsible for drawing the markers on the board to show the location of the ships that have been placed horizontally and for passing the #id's of the ship locations into the myShips array. 
  if (horizontalCollisionCheck(currentShip, rIndex, cIndex) &&
    legalHorizontalMove(currentShip, cIndex)) {
    for (var i = 0; i < currentShip; i++) {
      $('#' + boardArray[rIndex][cIndex + i]).text('O');
      myShips.push(boardArray[rIndex][cIndex + i]);
    }
    currentShipLength--;
    checkForCompleteSetup();
    return;
  } else {
    console.log('Placement did not pass move checks.')
    return;
  }
}

var verticalPlace = function(currentShip, rIndex, cIndex) {
  //Function purpose:
  //This function is wholly responsible for drawing the markers on the board to show the location of the ships that have been placed vertically and for passing the #id's of the ship locations into the myShips array.
  if (verticalCollisionCheck(currentShip, rIndex, cIndex) &&
    legalVerticalMove(currentShip, rIndex)) {
    for (var i = 0; i < currentShip; i++) {
      $('#' + boardArray[rIndex + i][cIndex]).text('O');
      myShips.push(boardArray[rIndex + i][cIndex]);
    }
    currentShipLength--;
    checkForCompleteSetup();
    return;
  } else {
    console.log('Placement did not pass move checks.')
    return;
  }
}

var horizontalCollisionCheck = function(shipLength, rIndex, sIndex) {
  //Function purpose:
  //Should ensure that no other ships are on any of the squares that this ship plans to occupy on the board horizontally.
  for (var i = 0; i < shipLength; i++) {
    if ($('#' + (boardArray[rIndex][sIndex + i])).text() === 'O') {
      console.log('not a valid horizontal move, there is a ship in the way.')
      return false;
    }
  }
  console.log('valid placement, no horizontal collision')
  return true;
}

var verticalCollisionCheck = function(shipLength, rIndex, cIndex) {
  //Function purpose:
  //Should ensure that no other ships are on any of the squares that this ship plans to occupy on the board vertically.
  for (var i = 0; i < shipLength; i++) {
    if ($('#' + (boardArray[rIndex + i][cIndex])).text() === 'O') {
      console.log('not a valid vertical move, there is a ship in the way.')
      return false;
    }
  }
  console.log('valid placement, no vertical collision')
  return true;
}

var legalHorizontalMove = function(shipLength, cIndex) {
  //Function purpose:
  //Checks that placing the ship horizontally will not exceed the length of the board.
  if (cIndex + shipLength <= 8) {
    console.log('This is a legal horizontal move.');
    return true;
  } else {
    console.log('This is an illegal horizontal move.');
    return false;
  }
}

var legalVerticalMove = function(shipLength, rIndex) {
    //Function purpose:
    //Checks that placing the ship horizontally will not exceed the length of the board.
    if (rIndex + shipLength <= 8) {
      console.log('This is a legal vertical move.');
      return true;
    } else {
      console.log('This is an illegal vertical move.');
      return false;
    }
}

// var drawReadyButton = function() {
//   //Function Purpose:
//   //This function draws a button at the top of the page for both players to update the database to let it know that they have drawn their ships on the board and so the local version can download a copy of the enemies ship.
//   var $readyButton = $('<button id="readybutton">START!</button>');
//   $readyButton.appendTo($('#header'));
//   $('#readybutton').css('margin-bottom', '10px');
//   readyButtonHandler();
// }

// var readyButtonHandler = function() {
//   //Function Purpose:
//   //This function checks that the other player has set up all of their ships so that the game can begin, the game won't actually start until both players have hit their ready button.
//   $('#readybutton').on('click', function() {
//     var goTime = checkForStart();
//     if (goTime) {
//         var tempLocation = 'https://shining-torch-1753.firebaseio.com/player_data/' + enemyPlayerNumber + '/';
//         var tempFirebase = new Firebase(tempLocation);
//         var tempSyncArray = getSynchronizedArray(tempFirebase);
//         enemyShips = tempSyncArray[0];
//         console.log('Your opponent is ' + tempSyncArray[1] + ', good luck!')
//         $('#readybutton').off('click');
//         $('#readybutton').remove();
//         startGame();
//       return;
//     } else {
//       console.log('Opponent is not ready yet');
//     }
//   });
// }

var checkForStart = function() {
  //Function Purpose:
  //This function checks the player_data folder for the opposite player to determine if their board has ben placed and if their ships can be downloaded. If they are ready, it downloads the ships locally.
  var startTimer = setInterval(function() {
    var tempLocation = 'https://shining-torch-1753.firebaseio.com/player_data/' + enemyPlayerNumber + '/';
    var tempFirebase = new Firebase(tempLocation);
    var tempSyncArray = getSynchronizedArray(tempFirebase);
    if (tempSyncArray[2] === true) {
      clearInterval(startTimer);
      enemyShips = tempSyncArray[0];
      startGame();
      return;
    } else {
    console.log('Opponent still getting ready...')
    }
  }, 3000);
}
//End of game set up functions.
//

//
//===============
// SECTION BREAK
//===============
//

//
//This section has to do with the actual game being played!
var startGame = function() {
  //Function Purpose:
  //
  //Function Purpose:
  //This function serves to set the initial values of true and false for who's turn it is and start the actual game through the turnCheck() function.
  $('#moveInput').prop('readonly', false);
  console.log('The game is ready to start!');
  var tempLocation = 'https://shining-torch-1753.firebaseio.com/player_data/';
  var tempFirebase = new Firebase(tempLocation);
  firebaseData = getSynchronizedArray(tempFirebase);
  console.log(firebaseData);
  if (myPlayerNumber === 0) {
    firebaseData.$set('Turn', '0');
  } else if (myPlayerNumber === 1) {
    firebaseData.$set('Turn', '1');
  }
  turnCheck();
}

var turnCheck = function() {
  //Function Purpose:
  //This function checks every few seconds if it is now the local players turn based on 
  console.log(parseInt(firebaseData[2]) + ' ' + myPlayerNumber);
  var isItMyTurn = setInterval(function() {
    if (parseInt(firebaseData[2]) === myPlayerNumber) {
      clearInterval(isItMyTurn);
      console.log('It is now your turn!');
      enableMyTurnHandlers();
    } else {
      console.log('Waiting for opponents turn');
    }
  }, 3000)
}

var registerTurn = function() {
  //Function Purpose:
  //This is a controller function to process the players input, it checks the turn is valid and then if it registered a successful hit before setting the other player's turn up.
  var turn = ('#moveInput').val();
  turn = turn.toLowerCase();
  if (validTurn(turn)) {
    if (checkHit(turn)) {
      myHits.push(turn);
      checkVictory();
    } else {
      myTurns.push(turn);
    }
  } else {
    console.log('not a valid turn, please enter in the format of a-h + 1-8, e.g. b4 or h8');
    return;
  }
  
}

var checkHit = function(playerInput) {
  //Function Purpose:
  //This function checks the players move against the array that contains all the positions of the enemy players ships and will return true/false depending on if it hits.
  for (var i = 0; i < enemyShips.length; i++) {
    if (enemyShips[i] === playerInput) {
      console.log('Hit!');
      return true;
    }
  }
  console.log('Miss...');
  return false;
}

var checkSink = function() {
  //Function Purpose
  //This function determines if an enemy battleship has been sunk, it's only real purpose is to alert the player and let me play a funny sound.
  console.log('This is a nice to have for later');
}

var checkVictory = function() {
  //Function Purpose
  //This function determines if the local player has sunk all the enemy battleships and thus won the game!
  var myHitsSort = myHits.sort();
  var enemyShipsSort = enemyShips.sort();
  if (myHitSort.join('') === enemyShipsSort.join('')) {
    console.log('CONGRATULATIONS, YOU WIN!!!');
    //include something here to end the game
  } else {
    console.log('The enemy player still has live battleships...');
  }
}

var validTurn = function(playerInput) {
  //Function Purpose:
  //This function checks to ensure that the move entered by the player is a valid move and that they aren't penalised for an invalid turn.
  for (var i = 0; i < boardArray.length; i++) {
    for (var j = 0; j < boardArray.length; j++) {
      if (boardArray[i][j] === playerInput);
      return true;
    }
  }
  return false;
};

var enableMyTurnHandlers = function() {
  //Function Purpose:
  //This function is solely responsible for setting up the required event handlers so the current player can take their turn.
  $('#moveInput').keypress(function(e) {
  if (e.keyCode == 13) {
    registerTurn();
  }
  $('#attackButton').on('click', registerTurn);
});
}
//This is the end of the actual game section.
//

//
// these two event handlers are just to change the colour of the tile squares when you mouseover.
$('.myBoardSquare').on('mouseover', function() {
  $(this).css('background-color', '#e7e7e7');
});
$('.myBoardSquare').on('mouseout', function() {
  $(this).css('background-color', '#ffffff');
})
// Mousover effect event handles ends.
//

//
//===============
// SECTION BREAK
//===============
//

//
// The code below is responsible for creating a synchronous array so the players can exchange moves during the game. This code was actually ripped from this tutorial: https://www.firebase.com/blog/2014-05-06-synchronized-arrays.html which means that I have not written functional purpose comments inside of them, see the aforementioned article for an explanation about how these work.
function getSynchronizedArray(firebaseRef) {
  var list = [];
  syncChanges(list, firebaseRef);
  wrapLocalCrudOps(list, firebaseRef);
  return list;
}

function syncChanges(list, ref) {
  ref.on('child_added', function _add(snap, prevChild) {
    var data = snap.val();
    data.$id = snap.key(); // assumes data is always an object
    var pos = positionAfter(list, prevChild);
    list.splice(pos, 0, data);
  });
  ref.on('child_removed', function _remove(snap) {
    var i = positionFor(list, snap.key());
    if (i > -1) {
      list.splice(i, 1);
    }
  });
  ref.on('child_changed', function _change(snap) {
    var i = positionFor(list, snap.key());
    if (i > -1) {
      list[i] = snap.val();
      list[i].$id = snap.key(); // assumes data is always an object
    }
  });
  ref.on('child_moved', function _move(snap, prevChild) {
    var curPos = positionFor(list, snap.key());
    if (curPos > -1) {
      var data = list.splice(curPos, 1)[0];
      var newPos = positionAfter(list, prevChild);
      list.splice(newPos, 0, data);
    }
  });
}

function positionFor(list, key) {
  for (var i = 0, len = list.length; i < len; i++) {
    if (list[i].$id === key) {
      return i;
    }
  }
  return -1;
}

function positionAfter(list, prevChild) {
  if (prevChild === null) {
    return 0;
  } else {
    var i = positionFor(list, prevChild);
    if (i === -1) {
      return list.length;
    } else {
      return i + 1;
    }
  }
}

function wrapLocalCrudOps(list, firebaseRef) {
    // we can hack directly on the array to provide some convenience methods
    list.$add = function(data) {
      return firebaseRef.push(data);
    };
    list.$remove = function(key) {
      firebaseRef.child(key).remove();
    };
    list.$set = function(key, newData) {
      // make sure we don't accidentally push our $id prop
      if (newData.hasOwnProperty('$id')) {
        delete newData.$id;
      }
      firebaseRef.child(key).set(newData);
    };
    list.$indexOf = function(key) {
      return positionFor(list, key); // positionFor in examples above
    }
}
// Synchronous array section ends.
//

//
//===============
// SECTION BREAK
//===============
//

});