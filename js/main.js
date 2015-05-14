//██████╗  █████╗ ████████╗████████╗██╗     ███████╗███████╗██╗  ██╗██╗██████╗ ███████╗
//██╔══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██║     ██╔════╝██╔════╝██║  ██║██║██╔══██╗██╔════╝
//██████╔╝███████║   ██║      ██║   ██║     █████╗  ███████╗███████║██║██████╔╝███████╗
//██╔══██╗██╔══██║   ██║      ██║   ██║     ██╔══╝  ╚════██║██╔══██║██║██╔═══╝ ╚════██║
//██████╔╝██║  ██║   ██║      ██║   ███████╗███████╗███████║██║  ██║██║██║     ███████║
//╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚══════╝
//
// v1.0 Please see http://www.github.com/Scoutski/mystery/ for information about this release.

$(document).ready(function() {

  var myPlayerNumber = undefined;
  var enemyPlayerNumber = undefined;
  var name = prompt('What is your User ID?', 'guest');
  var letters = "abcdefgh".split('');
  var boardArray = [];
  var enemyArray = [];
  var myShips = [];
  var currentShipLength = 5;
  var tempLocation;
  var tempFirebase;
  var firebaseData;
  var enemyShips;
  var enemyName;
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
    }, 3000);
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
    $('<div/>').text(text).prepend($('<strong/>').text(time + ' - ' + name + ': ')).appendTo($('#messagesDiv'));
    $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
  };

  var clearChat = function() {
    var quickRemove = new Firebase('https://shining-torch-1753.firebaseio.com/chat/');
    quickRemove.remove();
    $('#messagesDiv').html('');
  };
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
        var $cell = $('<div></div>').attr('id', (letters[i] + j)).addClass('myBoardSquare').addClass('grow').appendTo('#boardDiv');
        $cell.text(($cell.attr('id').toUpperCase()));
        tempArray.push(letters[i] + j);
      }
      boardArray.push(tempArray);
    }
  }

  var createEnemyBoard = function() {
    for (var i = 0; i < 8; i++) {
      var tempArray = [];
      for (var j = 1; j < 9; j++) {
        var $cell = $('<div></div>').attr('id', 'e' + (letters[i] + j)).addClass('enemyBoardSquare').addClass('grow').appendTo('#boardDiv');
        $cell.text(($cell.attr('id').slice(1).toUpperCase()));
        tempArray.push(letters[i] + j);
      }
      enemyArray.push(tempArray);
    }
  }

  createEnemyBoard();
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
    //Function purpose:
    //This function handles clicks at the start of the game while ships are being placed on the board. It determines the outer array index and inner array index so they can be passed to the required functions for ship placement.
    $("<div>Welcome to the game <strong>" + name + "</strong>, select the tiles to place your ships!</div>").appendTo('#statusLog')
    var tempHeight = $('#statusLog')[0].scrollHeight;
    $('#statusLog').scrollTop(tempHeight);
    $('.myBoardSquare').on('click', function() {
      var $boardID = $(this).attr('id').split('');
      var rowIndex = letters.indexOf($boardID[0]);
      var columnIndex = (parseInt($boardID[1]) - 1);
      var shipLength = currentShipLength;
      if (shipLength === 0) {
        return;
      }
      if ($("#checkboxActual").is(':checked')) {
        verticalPlace(shipLength, rowIndex, columnIndex);
      } else {
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
      $("<div>All of your ships have been placed!</div>").appendTo('#statusLog')
      var tempHeight = $('#statusLog')[0].scrollHeight;
      $('#statusLog').scrollTop(tempHeight);
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
      tempLocation = 'https://shining-torch-1753.firebaseio.com/player_data/' + myPlayerNumber + '/';
      tempFirebase = new Firebase(tempLocation);
      var tempSyncArray = getSynchronizedArray(tempFirebase);
      tempSyncArray.$set('Ships', myShips);
      tempSyncArray.$set('ready', true);
    }, 5000);
  }

  var horizontalPlace = function(currentShip, rIndex, cIndex) {
    //Function purpose:
    //This function is wholly responsible for drawing the markers on the board to show the location of the ships that have been placed horizontally and for passing the #id's of the ship locations into the myShips array. 
    if (horizontalCollisionCheck(currentShip, rIndex, cIndex) &&
      legalHorizontalMove(currentShip, cIndex)) {
      var tempShip = [];
      for (var i = 0; i < currentShip; i++) {
        $('#' + boardArray[rIndex][cIndex + i]).text('O');
        $('#' + boardArray[rIndex][cIndex + i]).css('background-color', 'grey');
        tempShip.push(boardArray[rIndex][cIndex + i]);
      }
      myShips.push(tempShip);
      currentShipLength--;
      checkForCompleteSetup();
      return;
    } else {
      return;
    }
  }

  var verticalPlace = function(currentShip, rIndex, cIndex) {
    //Function purpose:
    //This function is wholly responsible for drawing the markers on the board to show the location of the ships that have been placed vertically and for passing the #id's of the ship locations into the myShips array.
    if (verticalCollisionCheck(currentShip, rIndex, cIndex) &&
      legalVerticalMove(currentShip, rIndex)) {
      var tempShip = [];
      for (var i = 0; i < currentShip; i++) {
        $('#' + boardArray[rIndex + i][cIndex]).text('O');
        $('#' + boardArray[rIndex + i][cIndex]).css('background-color', 'grey');
        tempShip.push(boardArray[rIndex + i][cIndex]);
      }
      myShips.push(tempShip);
      currentShipLength--;
      checkForCompleteSetup();
      return;
    } else {
      return;
    }
  }

  var horizontalCollisionCheck = function(shipLength, rIndex, sIndex) {
    //Function purpose:
    //Should ensure that no other ships are on any of the squares that this ship plans to occupy on the board horizontally.
    for (var i = 0; i < shipLength; i++) {
      if ($('#' + (boardArray[rIndex][sIndex + i])).text() === 'O') {
        $('<div>There is a ship in the way! Try somewhere else.</div>').appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
        return false;
      }
    }
    return true;
  }

  var verticalCollisionCheck = function(shipLength, rIndex, cIndex) {
    //Function purpose:
    //Should ensure that no other ships are on any of the squares that this ship plans to occupy on the board vertically.
    for (var i = 0; i < shipLength; i++) {
      if ($('#' + (boardArray[rIndex + i][cIndex])).text() === 'O') {
        $('<div>There is a ship in the way! Try somewhere else.</div>').appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
        return false;
      }
    }
    return true;
  }

  var legalHorizontalMove = function(shipLength, cIndex) {
    //Function purpose:
    //Checks that placing the ship horizontally will not exceed the length of the board.
    if (cIndex + shipLength <= 8) {
      return true;
    } else {
      $("<div>The ship won't fit here!.</div>").appendTo('#statusLog')
      var tempHeight = $('#statusLog')[0].scrollHeight;
      $('#statusLog').scrollTop(tempHeight);
      return false;
    }
  }

  var legalVerticalMove = function(shipLength, rIndex) {
    //Function purpose:
    //Checks that placing the ship horizontally will not exceed the length of the board.
    if (rIndex + shipLength <= 8) {
      return true;
    } else {
      $("<div>The ship won't fit here!.</div>").appendTo('#statusLog')
      var tempHeight = $('#statusLog')[0].scrollHeight;
      $('#statusLog').scrollTop(tempHeight);
      return false;
    }
  }

  var checkForStart = function() {
    //Function Purpose:
    //This function checks the player_data folder for the opposite player to determine if their board has ben placed and if their ships can be downloaded. If they are ready, it downloads the ships locally.
    var startTimer = setInterval(function() {
      tempLocation = 'https://shining-torch-1753.firebaseio.com/player_data/' + enemyPlayerNumber + '/';
      tempFirebase = new Firebase(tempLocation);
      var tempSyncArray = getSynchronizedArray(tempFirebase);
      if (tempSyncArray[2] === true) {
        clearInterval(startTimer);
        enemyShips = tempSyncArray[0];
        enemyName = tempSyncArray[1];
        $("<div>Good luck " + name + ", your opponent is " + tempSyncArray[1] + ".</div>").appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
        shipAssignment();
        startGame();
        return;
      } else {
        $("<div>Still waiting on your opponent to get ready...</div>").appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
      }
    }, 3000);
  }

  var shipAssignment = function() {
      //Function Purpose:
      //This function just exists to reassign the arrays so we have arrays for each individual enemy battleship (so we can notify the local player that they have sunk an enemy battleship) and then a full array for the win condition, it's a long slow way to do it, but it's very useful to have the data in both forms and not do it on the Firebase server.
      enemyFive = enemyShips[0];
      enemyFour = enemyShips[1];
      enemyThree = enemyShips[2];
      enemyTwo = enemyShips[3];
      enemyShips = [];
      for (var i = 0; i < enemyFive.length; i++) {
        enemyShips.push(enemyFive[i]);
      }
      for (var i = 0; i < enemyFour.length; i++) {
        enemyShips.push(enemyFour[i]);
      }
      for (var i = 0; i < enemyThree.length; i++) {
        enemyShips.push(enemyThree[i]);
      }
      for (var i = 0; i < enemyTwo.length; i++) {
        enemyShips.push(enemyTwo[i]);
      }
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
    //This function serves to set the initial values of true and false for who's turn it is and start the actual game through the turnCheck() function.
    $('#moveInput').prop('readonly', false);
    $("<div>Your opponent is ready! Starting game!</div>").appendTo('#statusLog')
    var tempHeight = $('#statusLog')[0].scrollHeight;
    $('#statusLog').scrollTop(tempHeight);
    tempLocation = 'https://shining-torch-1753.firebaseio.com/player_data/';
    tempFirebase = new Firebase(tempLocation);
    firebaseData = getSynchronizedArray(tempFirebase);
    firebaseData.$set('Turn', '0');
    turnCheck();
  }

  var turnCheck = function() {
    //Function Purpose:
    //This function checks every few seconds if it is now the local players turn based on 
    var isItMyTurn = setInterval(function() {
      syncArray();
      checkLoss();
      if (parseInt(firebaseData[3]) === 2) {
        clearInterval(isItMyTurn);
        return;
      }
      if (parseInt(firebaseData[2]) === myPlayerNumber) {
        clearInterval(isItMyTurn);
        if (firebaseData[3]) {
          registerEnemyTurn();
        }
        $("<div><strong>It's your turn!</strong></div>").appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
        registerTurn();
      } else {
        $("<div>Waiting for your opponents turn</div>").appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
      }
    }, 3000)
  }

  var syncArray = function() {
    //Function Purpose:
    //This function exists just to update the "synced" array, this has resolved a lot of the firebase issues for me.
    tempLocation = 'https://shining-torch-1753.firebaseio.com/player_data/';
    tempFirebase = new Firebase(tempLocation);
    firebaseData = getSynchronizedArray(tempFirebase);
  }

  var registerEnemyTurn = function() {
    var tempPos = '#' + firebaseData[3];
    if (firebaseData[4] === 'hit') {
      $(tempPos).text('H');
      $(tempPos).css('background-color', 'red');
      $(tempPos).css('font-weight', 'bold');
    } else {
      $(tempPos).text('M');
      $(tempPos).css('background-color', 'lightslategrey');
    }

  }

  var registerTurn = function() {
    $('.enemyBoardSquare').on('click', function() {
      //Function Purpose:
      //This is a controller function to process the players input, it checks the turn is valid and then if it registered a successful hit before setting the other player's turn up.
      var $turn = $(this).attr('id').slice(1);
      if (validTurn($turn)) {
        if (checkHit($turn)) {
          myTurns.push($turn);
          myHits.push($turn);
          checkSink($turn);
          checkVictory();
        } else {
          myTurns.push($turn);
        }
        $('.enemyBoardSquare').off();
        firebaseData.$set('Turn', enemyPlayerNumber.toString());
        setTimeout(function() {
          turnCheck();
        }, 3000);
        //}
        return;
      } else {
        return;
      }
    });
  };

  var checkHit = function(playerInput) {
    //Function Purpose:
    //This function checks the players move against the array that contains all the positions of the enemy players ships and will return true/false depending on if it hits.
    firebaseData.$set('pos', playerInput);
    for (var i = 0; i < enemyShips.length; i++) {
      if (enemyShips[i] === playerInput) {
        firebaseData.$set('status', 'hit')
        var audioBg = new Audio('media/Hit.mp3');
        audioBg.play();
        $("<div><strong>Shooting at " + playerInput + ", Hit! </strong></div>").appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
        var tempID = '#e' + playerInput;
        $(tempID).text('H');
        $(tempID).css('background-color', 'red');
        $(tempID).css('font-weight', 'bold');
        return true;
      }
    }
    firebaseData.$set('status', 'miss')
    $("<div>Shooting at " + playerInput + ", Miss...</div>").appendTo('#statusLog')
    var tempHeight = $('#statusLog')[0].scrollHeight;
    $('#statusLog').scrollTop(tempHeight);
    var tempID = '#e' + playerInput;
    $(tempID).text('M');
    $(tempID).css('background-color', 'white');
    return false;
  }

  var checkSink = function(playerInput) {
    //Function Purpose
    //This function determines if an enemy battleship has been sunk, it's only real purpose is to alert the player and let me play a funny sound. It start by checking which ship was hit first, then checks to see if that ship has been sunk and plays a funny sound.
    var sinkCount = 0;
    var currentShip;
    if (enemyFive.indexOf(playerInput) >= 0) {
      currentShip = enemyFive;
    } else if (enemyFour.indexOf(playerInput) >= 0) {
      currentShip = enemyFour;
    } else if (enemyThree.indexOf(playerInput) >= 0) {
      currentShip = enemyThree;
    } else if (enemyTwo.indexOf(playerInput) >= 0) {
      currentShip = enemyTwo;
    }
    if (currentShip) {
      for (var i = 0; i < currentShip.length; i++) {
        if (myHits.indexOf(currentShip[i]) >= 0) {
          sinkCount++;
        }
      }
      if (sinkCount === currentShip.length) {
        var audioBg = new Audio('media/sunkBattleship.mp3');
        sinkShipMessage();
        // $("<div><strong>You sunk a battleship!</strong></div>").appendTo('#statusLog')
        // var tempHeight = $('#statusLog')[0].scrollHeight;
        // $('#statusLog').scrollTop(tempHeight);
        setTimeout(function() {
          audioBg.play();
        }, 3000);
        currentShip = undefined;
      }
    }
  };

  var sinkShipMessage = function(shipLength) {
    //Function Purpose:
    //This function's only purpose is to determine which ship was sunk and append a message to the status log with the correct ship name.
    switch (shipLength) {
      case 5:
        $("<div><strong>You sunk " + enemyName + "'s Aircraft carrier!</strong></div>").appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
        break;
      case 4:
        $("<div><strong>You sunk " + enemyName + "'s Battleship!</strong></div>").appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
        break;
      case 3:
        $("<div><strong>You sunk " + enemyName + "'s Destroyer!</strong></div>").appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
        break;
      case 2:
        $("<div><strong>You sunk " + enemyName + "'s Patrol Boat!</strong></div>").appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
        break;
      default:
        $("<div><strong>You sunk a battleship!</strong></div>").appendTo('#statusLog')
        var tempHeight = $('#statusLog')[0].scrollHeight;
        $('#statusLog').scrollTop(tempHeight);
        break;
    }
  }

  var checkVictory = function() {
    //Function Purpose
    //This function determines if the local player has sunk all the enemy battleships and thus won the game!
    var myHitsSort = myHits.sort();
    var enemyShipsSort = enemyShips.sort();
    if (myHitsSort.join('') === enemyShipsSort.join('')) {
      firebaseData.$set('Turn', '2');
      var audioBg = new Audio('media/WinningCharlie.mp3');
      audioBg.play();
      $("<div><strong>CONGRATULATIONS! YOU WIN THE GAME!</strong></div>").appendTo('#statusLog')
      var tempHeight = $('#statusLog')[0].scrollHeight;
      $('#statusLog').scrollTop(tempHeight);
      //include something here to end the game
    } else {}
  }

  var checkLoss = function() {
    //Functino Purpose:
    //This function checks to see if the turn property has been set to 2 in the database. This variable can only be set to 2 if the other player has won the game.
    if (parseInt(firebaseData[2]) === 2) {
      $("<div><strong>Unfortunately, your opponent has sunk all your battleships... Thank you for playing!</strong></div>").appendTo('#statusLog')
      var tempHeight = $('#statusLog')[0].scrollHeight;
      $('#statusLog').scrollTop(tempHeight);
      return;
    } else {
      return;
    }
  };

  var validTurn = function(playerInput) {
    //Function Purpose:
    //This function checks to ensure that the move entered by the player is a valid move and that they aren't penalised for an invalid turn. It first loops through all the turns the player has taken so far, if it hasn't been taken yet, then it loops through all the squares on the board to ensure that they are shooting at a valid target.
    for (var l = 0; l < myTurns.length; l++) {
      if (myTurns[l] === playerInput) {
        return false;
      }
    }
    for (var i = 0; i < boardArray.length; i++) {
      for (var j = 0; j < boardArray.length; j++) {
        if (boardArray[i][j] === playerInput);
        return true;
      }
    }
    return false;
  };
  //This is the end of the actual game section.
  //

  //
  //===============
  // SECTION BREAK
  //===============
  //

  //
  //This is the event handler for the button to swap between your own board and the enemy board.
  $('#swapBoard').on('click', function() {
    $('.myBoardSquare, .enemyBoardSquare').toggle();
  });
  //Event handler section end.
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
