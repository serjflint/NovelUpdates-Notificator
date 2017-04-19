var count = 0;
var new_count = 0;
var table = [];
var URL = "http://www.novelupdates.com/readlist/?uid=";
var UID = "";
var timeout = 0;

function getCountUrl() {
  console.log('Retrieve page.');
  console.log(URL+UID);
  if (isNaN(parseInt(UID, 10))) {
    return;
  }
  $.ajax({
    url : URL + UID,
    success : function(result){
      if($('table', result).length) {
        var new_table = [];
        // parse new table
        $('table tbody tr', result).each(function(i, row) {
          $status = $('td:nth-child(3)', row);
          if ($status.length) {
            var arr = $status.text().slice(1,-1).split('/');
            arr[0] = arr[0].trim();
            arr[1] = arr[1].trim();
            if (arr[0] != arr[1]) {            
              var new_row = [];
              $link = $('td:nth-child(2)', row).html();
              new_row.push($link);
              new_row.push(arr[0]);
              new_row.push(arr[1]);
              new_table.push(new_row);
            }
          }
        });

        // calc difference between two matrices in linear time
        new_count = diff = 0;
        if (table.length === 0) {
          new_count = diff = new_table.length;
        }
        else {
          var i = 0, j = 0;
          while (i < new_table.length && j < table.length) {
            if (new_table[i][0].localeCompare(table[j][0]) === -1) {
              console.log(i, j, new_table[i][0], table[j][0]);
              console.log('Update', new_table[i]);
              new_count++;
              diff++;
              i++;
            }
            else {
              if (new_table[i][0].localeCompare(table[j][0]) === 0) {
                console.log(i, j, new_table[i][0], table[j][0]);
                if (new_table[i][1] !== table[j][1]) { // check chapters counts for the same title
                  console.log('Update', new_table[i]);
                  new_count++;
                  diff++;
                }
                i++;
                j++;
              }
              else {
                console.log(i, j, new_table[i][0], table[j][0]);
                diff++;
                j++;
              }
            }
          }
          new_count += new_table.length - i;
          diff += (new_table.length - i) + (table.length - j);
        }

        if (diff) {
          // clone 2-dim array
          table = [];
          for (var i = 0; i < new_table.length; i++)
            table[i] = new_table[i].slice();
          count = table.length;

          saveChanges({
            'table': table,
            'count': count
          });

          chrome.browserAction.setBadgeText({text: count.toString()});

          if (new_count) {            
            var opt = {
              type: "basic",
              title: "New Updates!",
              message: "You have " + diff + " new update(s).",
              iconUrl: "images/icon48.png"
            };
            chrome.notifications.create(opt, function() {
              console.log("New updates:" + diff);
            });
          }
        }
        else {
          console.log('No updates.');
        }
      } 
      else {        
        var opt = {
          type: "basic",
          title: "Error!",
          message: "Couldn\'t retrieve the series table. Check permissions of reading list in Global Settings.",
          iconUrl: "images/icon48.png"
        };
        chrome.notifications.create(opt, function() {
          console.log("Couldn't retrieve the series table.");
        });

        chrome.alarms.clear("update_alarm", function() {
          console.log('Update alarm stopped.')
        });
      }      
    },
    error : function(e) {
      console.log("Couldn't retrieve the HTML.");
      return;
    }
  });
}

function restore_options() {
  console.log('Retrieve options.')
  chrome.storage.sync.get({
    UID: '',
    timeout: 3
  }, function(items) {
    UID = items.UID;
    timeout = items.timeout;
    getCountUrl();
  });
}

function saveChanges(data) {
  chrome.storage.local.set(data, function() {
    console.log('Changes saved');
  });
}

chrome.runtime.onInstalled.addListener(function() {
  console.log("Installed.");
  chrome.tabs.create({ 'url': 'chrome://extensions/?options=' + chrome.runtime.id });
});

chrome.alarms.onAlarm.addListener(function() {
  console.log("Timeout Event.");
  getCountUrl();
});

chrome.notifications.onClicked.addListener(function(notificationId) {
  chrome.tabs.create({url: "http://www.novelupdates.com/reading-list/"});
});



$(function() {
  restore_options();
  chrome.browserAction.setBadgeText({text: "0"});
})



console.log("Loaded.");
