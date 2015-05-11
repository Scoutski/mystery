$(document).ready(function() {
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
    var name = $('#nameInput').val();
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
    myDataRef.remove();
    $('#messagesDiv').html('');
  };

  $('#clear').on('click', clearChat);
});
