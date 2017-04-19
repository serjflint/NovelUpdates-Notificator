// set status message with delayed fading
function set_status(text, time=3000) {
  var status = $('#status');
  status.text(text);
  setTimeout(function() {
    status.text('');
  }, time);
}

// Saves options to chrome.storage.sync.
function save_options() {
  // get and validate the input
  var UID = parseInt($('#UID').val(), 10);
  var timeout = parseInt($('#timeout').val(), 10);
  var URL = 'http://www.novelupdates.com/readlist/?uid=';
  
  if (isNaN(UID) || UID <= 0){
    set_status('UID should be a positive integer!');
    $('#UID').val('').focus();
    return;
  }

  if (isNaN(timeout) || timeout <= 0){
    set_status('Timeout should be a positive integer!');
    $('#timeout').val(3).focus();
    return;
  }

  // $.ajax({
  //   url : URL + UID,
  //   success : function(result){
  //     if($('table', result).length) {
  //       // save in syncable storage
  //       chrome.storage.sync.set({
  //         UID: UID,
  //         timeout: timeout
  //       }, function() {
  //         set_status('Options saved.');
  //         // start periodical alarm
  //         chrome.alarms.create("update_alarm", {periodInMinutes: timeout});
  //       });
  //     } 
  //     else {
  //       set_status('List is not public or wrong UID.');
  //       console.log("Couldn't retrieve the series table.");
  //       $('#UID').val('').focus();
  //       return;
  //     }      
  //   },
  //   error : function(e) {
  //     set_status('Network problem.');
  //     console.log("Couldn't retrieve the HTML.");
  //     $('#UID').val('').focus();
  //     return;
  //   }
  // });

  chrome.storage.sync.set({
    UID: UID,
    timeout: timeout
  }, function() {
    set_status('Options saved.');
    // start periodical alarm
    chrome.alarms.create("update_alarm", {periodInMinutes: timeout});
  });


}



// Restores the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    UID: '',
    timeout: 3
  }, function(items) {
    $('#UID').val(items.UID);
    $('#timeout').val(items.timeout);
  });
}

// add event listeners
$(restore_options);
$('#save').click(save_options);
