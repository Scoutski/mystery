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
    if( i > -1 ) {
      list.splice(i, 1);
    }
  });
  ref.on('child_changed', function _change(snap) {
    var i = positionFor(list, snap.key());
    if( i > -1 ) {
      list[i] = snap.val();
      list[i].$id = snap.key(); // assumes data is always an object
    }
  });
  ref.on('child_moved', function _move(snap, prevChild) {
    var curPos = positionFor(list, snap.key());
    if( curPos > -1 ) {
      var data = list.splice(curPos, 1)[0];
      var newPos = positionAfter(list, prevChild);
      list.splice(newPos, 0, data);
    }
  });
}

function positionFor(list, key) {
  for(var i = 0, len = list.length; i < len; i++) {
    if( list[i].$id === key ) {
      return i;
    }
  }
  return -1;
}

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
     if( newData.hasOwnProperty('$id') ) { delete newData.$id; }
     firebaseRef.child(key).set(newData);
   };
   list.$indexOf = function(key) {
     return positionFor(list, key); // positionFor in examples above
   }
}
//MAGIC ABOVE, DO NOT TOUCH

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
//Above is setting up the board, nothing to see here. >_>    <_<    >_>    ._.

var gameRef = new Firebase('https://shining-torch-1753.firebaseio.com');
var syncedArray = getSynchronizedArray(gameRef);

function assignPlayer(name) { 

  if (syncedArray)

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