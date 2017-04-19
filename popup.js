function renderCount(count) {
  $('#count').text(count.toString());
}

function renderTable(table) {
  if (table.length === 0) {
    $('table').hide();
  }
  else {
    var newHTML = [];
    $.each(table, function(index, value) {
      var row = "<tr>";
      row += '<td class="col1">' + (index+1) + '</td>';
      row += '<td class="col2">' + value[0] + '</td>';
      row += '<td class="col3">[ ' + value[1] + ' / ' + value[2] + ']</td>';
      row += "</tr>";
      newHTML.push(row);
    });
    $('#series tbody').html(newHTML.join(""));
    console.log($('#series tbody').html());
    $('table').show();
  }
}



chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
    if (key == 'table') {      
      renderTable(storageChange.newValue);
    }

    if (key == 'count') {
      renderCount(storageChange.newValue);
    }
  }
});



$(function() {
  $('body').on('click', 'a', function(){
    chrome.tabs.create({url: $(this).attr('href')});
    return false;
  });

  chrome.storage.local.get({
    'table': [],
    'count': 0
  }, function(items) {
    renderCount(items['count']);
    renderTable(items['table']);
  });
});


