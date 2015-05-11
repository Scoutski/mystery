$(document).ready(function() {

  var createBoard = function() {
    for (var i = 0; i < 64; i++) {
      $('<div></div>').attr('id', i).addClass('boardSquare').appendTo('#content');
    }
  }

  createBoard();

var clearChat = function() {
  myDataRef.remove();
  $('#messagesDiv').html('');
};


  //Firebase chat code
  var myDataRef = new Firebase('https://apzklqnbrhc.firebaseio-demo.com/');
  var name = prompt("Your name?", "Guest");
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

// Firebase Presence
  
  var currentStatus = "★ online";

  // Get a reference to the presence data in Firebase.
  var userListRef = new Firebase("https://bnmdmxr1f4u.firebaseio-demo.com/");

  // Generate a reference to a new location for my user with push.
  var myUserRef = userListRef.push();

  // Get a reference to my own presence status.
  var connectedRef = new Firebase("https://bnmdmxr1f4u.firebaseio-demo.com//.info/connected");

  connectedRef.on("value", function(isOnline) {
    if (isOnline.val()) {
      // If we lose our internet connection, we want ourselves removed from the list.
      myUserRef.onDisconnect().remove();

      // Set our initial online status.
      setUserStatus("★ online");
    }
    else {

      // We need to catch anytime we are marked as offline and then set the correct status. We
      // could be marked as offline 1) on page load or 2) when we lose our internet connection
      // temporarily.
      setUserStatus(currentStatus);
    }
  });

  // A helper function to let us set our own state.
  function setUserStatus(status) {
    // Set our status in the list of online users.
    currentStatus = status;
    myUserRef.set({ name: name, status: status });
  }

  function getMessageId(snapshot) {
    return snapshot.key().replace(/[^a-z0-9\-\_]/gi,'');
  }

  // Update our GUI to show someone"s online status.
  userListRef.on("child_added", function(snapshot) {
    var user = snapshot.val();

    $("<div/>")
      .attr("id", getMessageId(snapshot))
      .text(user.name + " is currently " + user.status)
      .prependTo("#messagesDiv");
  });

  // Update our GUI to remove the status of a user who has left.
  userListRef.on("child_removed", function(snapshot) {
    $("#messageDiv").children("#" + getMessageId(snapshot))
      .remove();
  });

  // Update our GUI to change a user"s status.
  userListRef.on("child_changed", function(snapshot) {
    var user = snapshot.val();
    $("#messagesDiv").children("#" + getMessageId(snapshot))
      .text(user.name + " is currently " + user.status);
  });

  // Use idle/away/back events created by idle.js to update our status information.
  document.onIdle = function () {
    setUserStatus("☆ idle");
  }
  document.onAway = function () {
    setUserStatus("☄ away");
  }
  document.onBack = function (isIdle, isAway) {
    setUserStatus("★ online");
  }

  setIdleTimeout(5000);
  setAwayTimeout(10000);

});



