$(document).ready(function() {

  var createBoard = function() {
    var letters = "abcdefgh".split('');
    for (var i = 0; i < 8; i++) {
      for (var j = 1; j < 9; j++) {
      $('<div></div>').attr('id', (letters[i] + j)).addClass('boardSquare').appendTo('#content');
    }
    }
  }

  createBoard();

  var name = prompt('What is your User ID?', 'guest');

function go() {
  // Consider adding '/<unique id>' if you have multiple games.
  var gameRef = new Firebase(GAME_LOCATION);
  assignPlayerNumberAndPlayGame(name, gameRef);
};
 
// The maximum number of players.  If there are already 
// NUM_PLAYERS assigned, users won't be able to join the game.
var NUM_PLAYERS = 4;
 
// The root of your game data.
var GAME_LOCATION = 'https://bnmdmxr1f4u.firebaseio-demo.com/';
 
// A location under GAME_LOCATION that will store the list of 
// players who have joined the game (up to MAX_PLAYERS).
var PLAYERS_LOCATION = 'player_list';
 
// A location under GAME_LOCATION that you will use to store data 
// for each player (their game state, etc.)
var PLAYER_DATA_LOCATION = 'player_data';
 
 
// Called after player assignment completes.
function playGame(myPlayerNumber, name, justJoinedGame, gameRef) {
  var playerDataRef = gameRef.child(PLAYER_DATA_LOCATION).child(myPlayerNumber);
  alert('You are player number ' + myPlayerNumber + 
      '.  Your data will be located at ' + playerDataRef.toString());
 
  if (justJoinedGame) {
    alert('Doing first-time initialization of data.');
    playerDataRef.set({name: name, state: 'game state'});
  }
}
 
// Use transaction() to assign a player number, then call playGame().
function assignPlayerNumberAndPlayGame(name, gameRef) {
  var playerListRef = gameRef.child(PLAYERS_LOCATION);
  var myPlayerNumber, alreadyInGame = false;
 
  playerListRef.transaction(function(playerList) {
    // Attempt to (re)join the given game. Notes:
    //
    // 1. Upon very first call, playerList will likely appear null (even if the
    // list isn't empty), since Firebase runs the update function optimistically
    // before it receives any data.
    // 2. The list is assumed not to have any gaps (once a player joins, they 
    // don't leave).
    // 3. Our update function sets some external variables but doesn't act on
    // them until the completion callback, since the update function may be
    // called multiple times with different data.
    if (playerList === null) {
      playerList = [];
    }
 
    for (var i = 0; i < playerList.length; i++) {
      if (playerList[i] === name) {
        // Already seated so abort transaction to not unnecessarily update playerList.
        alreadyInGame = true;
        myPlayerNumber = i; // Tell completion callback which seat we have.
        return;
      }
    }
 
    if (i < NUM_PLAYERS) {
      // Empty seat is available so grab it and attempt to commit modified playerList.
      playerList[i] = name;  // Reserve our seat.
      myPlayerNumber = i; // Tell completion callback which seat we reserved.
      return playerList;
    }
 
    // Abort transaction and tell completion callback we failed to join.
    myPlayerNumber = null;
  }, function (error, committed) {
    // Transaction has completed.  Check if it succeeded or we were already in
    // the game and so it was aborted.
    if (committed || alreadyInGame) {
      playGame(myPlayerNumber, name, !alreadyInGame, gameRef);
    } else {
      alert('Game is full.  Can\'t join. :-(');
    }
  });
}

go();

  //Firebase chat code
  

  var myDataRef = new Firebase('https://apzklqnbrhc.firebaseio-demo.com/');

  var sendMessage = function() {
    // if ($('#nameInput').val() === '' || $('#messageInput').val() === '') {
    //   $('<div/>').text('.').prepend($('<em/>').text('Please ensure you enter a name and message').appendTo($('#messagesDiv')));
    //   $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
    // } else {

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


  $('#clear').on('click', clearChat);

  $('.boardSquare').on('mouseover', function() {
    $(this).css('background-color', '#e7e7e7');
  });
  $('.boardSquare').on('mouseout', function() {
    $(this).css('background-color', '#ffffff');
  })
});



var clearChat = function() {
  myDataRef.remove();
  $('#messagesDiv').html('');
};
