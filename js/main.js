var gameLocation = 'https://shining-torch-1753.firebaseio.com/';
var playerDataLocation = 'player_data';
var myPlayerNumber = undefined;
var name = prompt('What is your User ID?', 'guest');
var letters = "abcdefgh".split('');
var boardArray = [];
var myShips = [];
var fiveShip, fourShip, threeShip, twoShip;
var rowIndex, startPoint;
var isSetup = false;
var readyForData = false;
var firebaseData;
var enemyData;

//Still need to assign the player number.

function assignPlayer(name) {
  var gameRef = new Firebase('https://shining-torch-1753.firebaseio.com');
  var playerDataRef = gameRef.child('player_data');

  playerDataRef.transaction(function(playerData) {

    if (!playerData) {
      playerData = [];
    }
    if (playerData.length < 2) {
      playerData.push({
        name: name,
        state: 'playing',
      });
      //Player joins game, Status Message
      var $div = $('<div/>').text($('#messageInput').val()).prepend($('<em/>').text('Welcome ' + name + ', you are playing')).appendTo($('#messagesDiv'));
      $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
    } else {
      //Nothing is created, Status message
      var $div = $('<div/>').text($('#messageInput').val()).prepend($('<em/>').text('Unfortunately ' + name + ', the game is full.')).appendTo($('#messagesDiv'));
      $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
    }

    playerDataRef.onDisconnect().remove();
    return playerData;
  });
}

assignPlayer(name);

//From here down is the code for the firebase chat.
var myDataRef = new Firebase('https://shining-torch-1753.firebaseio.com/chat/');
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

var clearChat = function() {
  var quickRemove = new Firebase('https://shining-torch-1753.firebaseio.com/chat/');
  quickRemove.remove();
  $('#messagesDiv').html('');
};

$('#clear').on('click', clearChat);
// THIS IS WHERE ALL THE FIREBASE SETUP STUFF STOPS, DO NOT TOUCH ANYTHING ABOVE HERE OR YOU WILL HATE YOURSELF FOR A LONG TIME (A REALLY LONG TIME!!).

//Sets up the board
var createBoard = function() {
  for (var i = 0; i < 8; i++) {
    var tempArray = [];
    for (var j = 1; j < 9; j++) {
      $('<div></div>').attr('id', (letters[i] + j)).addClass('boardSquare').appendTo('#boardDiv');
      tempArray.push(letters[i] + j);
    }
    boardArray.push(tempArray);
  }
}
createBoard();

var setupShips = function() {
  var id = $(this).attr('id');
  if ($("#checkboxActual").is(':checked')) {
    verticalSetup();
  } else {
    horizontalSetup();
  }
  if (fiveShip && fourShip && threeShip && twoShip) {
    firebaseData = new Firebase('https://shining-torch-1753.firebaseio.com/player_data/');
    firebaseData.child("" + myPlayerNumber).push({
        theShips: myShips
      });
    $('.boardSquare').off('click');
  }
  }

var horizontalSetup = function() {
  $('.boardSquare').on('click', function() {
    if ($(this).text() === '') {
      if (!fiveShip) {
        var id = $(this).attr('id');
        for (var i = 0; i < boardArray.length; i++) {
          if (boardArray[i].indexOf(id) >= 0 && (boardArray[i].indexOf(id) <= 3)) {
            rowIndex = i;
            startPoint = boardArray[i].indexOf(id);
            break;
          }
        }
        if (startPoint) {
          fiveShip = true;
          for (var i = 0; i < 5; i++) {
            $('#' + (boardArray[rowIndex][startPoint + i])).text('x');
            myShips.push(boardArray[rowIndex][startPoint + i]);
          }
          console.log('Five ship placed at ' + $(this).attr('id'));
          rowIndex = undefined;
          startPoint = undefined;
        }
      } else if (!fourShip) {
        var id = $(this).attr('id');
        for (var i = 0; i < boardArray.length; i++) {
          if (boardArray[i].indexOf(id) >= 0 && (boardArray[i].indexOf(id) <= 4)) {
            rowIndex = i;
            startPoint = boardArray[i].indexOf(id);
          }
        }
        if (startPoint) {
          fourShip = true;
          for (var i = 0; i < 4; i++) {
            $('#' + (boardArray[rowIndex][startPoint + i])).text('x');
            myShips.push(boardArray[rowIndex][startPoint + i]);
          }
          console.log('Four ship placed at ' + $(this).attr('id'));
          rowIndex = undefined;
          startPoint = undefined;
        }
      } else if (!threeShip) {
        var id = $(this).attr('id');
        for (var i = 0; i < boardArray.length; i++) {
          if (boardArray[i].indexOf(id) >= 0 && (boardArray[i].indexOf(id) <= 5)) {
            rowIndex = i;
            startPoint = boardArray[i].indexOf(id);
          }
        }
        if (startPoint) {
          threeShip = true;
          for (var i = 0; i < 3; i++) {
            $('#' + (boardArray[rowIndex][startPoint + i])).text('x');
            myShips.push(boardArray[rowIndex][startPoint + i]);
          }
          console.log('Three ship placed at ' + $(this).attr('id'));
          rowIndex = undefined;
          startPoint = undefined;
        }
      } else if (!twoShip) {
        var id = $(this).attr('id');
        for (var i = 0; i < boardArray.length; i++) {
          if (boardArray[i].indexOf(id) >= 0 && (boardArray[i].indexOf(id) <= 6)) {
            rowIndex = i;
            startPoint = boardArray[i].indexOf(id);
          }
        }
        if (startPoint) {
          twoShip = true;
          for (var i = 0; i < 2; i++) {
            $('#' + (boardArray[rowIndex][startPoint + i])).text('x');
            myShips.push(boardArray[rowIndex][startPoint + i]);
          }
          console.log('Two ship placed at ' + $(this).attr('id'));
          rowIndex = undefined;
          startPoint = undefined;
          readyToPlay();
        }
      }
    } else {
      console.log('ship at this position!');
    }
    $('.boardSquare').off('click');
    $('.boardSquare').on('click', setupShips);
  })
}

var verticalSetup = function() {
  $('.boardSquare').on('click', function() {
    if ($(this).text() === '') {
      var id = $(this).attr('id');
      if (!fiveShip) {
        for (var i = 0; i < boardArray.length; i++) {
          if (boardArray[i].indexOf(id) >= 0 && (i <= 3)) {
            rowIndex = i;
            startPoint = boardArray[i].indexOf(id);
            break;
          }
        }
        if (startPoint) {
          fiveShip = true;
          for (var i = 0; i < 5; i++) {
            $('#' + (boardArray[rowIndex + i][startPoint])).text('x');
            myShips.push(boardArray[rowIndex + i][startPoint]);
          }
          console.log('Five ship placed at ' + $(this).attr('id'));
          rowIndex = undefined;
          startPoint = undefined;
        }
      } else if (!fourShip) {
        for (var i = 0; i < boardArray.length; i++) {
          if (boardArray[i].indexOf(id) >= 0 && (i <= 4)) {
            rowIndex = i;
            startPoint = boardArray[i].indexOf(id);
            break;
          }
        }
        if (startPoint) {
          fourShip = true;
          for (var i = 0; i < 4; i++) {
            $('#' + (boardArray[rowIndex + i][startPoint])).text('x');
            myShips.push(boardArray[rowIndex + i][startPoint]);
          }
          console.log('Four ship placed at ' + $(this).attr('id'));
          rowIndex = undefined;
          startPoint = undefined;
        }
      } else if (!threeShip) {
        for (var i = 0; i < boardArray.length; i++) {
          if (boardArray[i].indexOf(id) >= 0 && (i <= 5)) {
            rowIndex = i;
            startPoint = boardArray[i].indexOf(id);
            break;
          }
        }
        if (startPoint) {
          threeShip = true;
          for (var i = 0; i < 3; i++) {
            $('#' + (boardArray[rowIndex + i][startPoint])).text('x');
            myShips.push(boardArray[rowIndex + i][startPoint]);
          }
          console.log('Three ship placed at ' + $(this).attr('id'));
          rowIndex = undefined;
          startPoint = undefined;
        }
      } else if (!twoShip) {
        for (var i = 0; i < boardArray.length; i++) {
          if (boardArray[i].indexOf(id) >= 0 && (i <= 6)) {
            rowIndex = i;
            startPoint = boardArray[i].indexOf(id);
            break;
          }
        }
        if (startPoint) {
          twoShip = true;
          for (var i = 0; i < 2; i++) {
            $('#' + (boardArray[rowIndex + i][startPoint])).text('x');
            myShips.push(boardArray[rowIndex + i][startPoint]);
          }
          console.log('Two ship placed at ' + $(this).attr('id'));
          rowIndex = undefined;
          startPoint = undefined;
          readyToPlay();
        }
      }
    } else {
      console.log('ship at this position!');
    }
    $('.boardSquare').off('click');
    $('.boardSquare').on('click', setupShips);
  })
}

var readyToPlay = function () {
  $('.boardSquare').off();
  console.log('ship setup complete!');
  isSetup = true;
}

//
//
// This secion is magic from https://www.firebase.com/blog/2014-05-06-synchronized-arrays.html
// Allows me to pull all the data down from the firebase, Although this talks about a Synchronized Array
// it is really just a static array.
//
//
function getSynchronizedArray(firebaseRef) {
  var list = [];
  syncChanges(list, firebaseRef);
  return list;
}
function syncChanges(list, ref) {
  ref.on('child_added', function _add(snap, prevChild) {
    var data = snap.val();
    data.$id = snap.key(); // assumes data is always an object
    var pos = positionAfter(list, prevChild);
    list.splice(pos, 0, data);
  });
}
// similar to indexOf, but uses id to find element
function positionFor(list, key) {
  for(var i = 0, len = list.length; i < len; i++) {
    if( list[i].$id === key ) {
      return i;
    }
  }
  return -1;
}
// using the Firebase API's prevChild behavior, we
// place each element in the list after it's prev
// sibling or, if prevChild is null, at the beginning
function positionAfter(list, prevChild) {
  if( prevChild === null ) {
    return 0;
  }
  else {
    var i = positionFor(list, prevChild);
    if( i === -1 ) {
      return list.length;
    }
    else {
      return i+1;
    }
  }
}
//
//
// Sorcery Above
//
//

$('.boardSquare').on('click', setupShips);

$('.boardSquare').on('mouseover', function() {
  $(this).css('background-color', '#e7e7e7');
});
$('.boardSquare').on('mouseout', function() {
  $(this).css('background-color', '#ffffff');
})

var readyToPlay = function() {
  if (!readyForData) {
    if (myPlayerNumber === 0) {
      var tempFire = new Firebase('https://shining-torch-1753.firebaseio.com/player_data/1/');
      enemyData = getSynchronizedArray(tempFire);
      enemyData = enemyData[0].theShips;
    } else if (myPlayerNumber === 1) {
      var tempFire = new Firebase('https://shining-torch-1753.firebaseio.com/player_data/0/');
      enemyData = getSynchronizedArray(tempFire);
      enemyData = enemyData[0].theShips;
    } else {
      console.log('You are not a valid player');
    }
  }
}

