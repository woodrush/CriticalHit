$('#side0nametext').typeahead({
    source: function(query, process) {
      var list = [];
      var partList = [];
      var term = r2h(query).toHiraganaCase().toZenkakuCase().toUpperCase();
      var compSource;
      for (var i=1; i<pokemonNamesSorted.length; i++) {
        compSource = pokemonNames[pokemonNamesSorted[i]].toHiraganaCase();
        switch (compSource.indexOf(term)) {
          case -1:
            break;
          case 0:
            list.push(pokemonNames[pokemonNamesSorted[i]]);
            break;
          default:
            if(list.length == 0){ partList.push(pokemonNames[pokemonNamesSorted[i]]); }
            break;
        }
      }
      return (list.length > 0 ? list : partList);
    },
    updater: function (item) {
      $('#side0nametext').val(item);
      submitForm();
      return item;
    },
    matcher: function (item) {
      return true;
    },
});
$('#side1nametext').typeahead({
    source: function(query, process) {
      var list = [];
      var partList = [];
      var term = r2h(query).toHiraganaCase().toZenkakuCase().toUpperCase();
      var compSource;
      for (var i=1; i<pokemonNamesSorted.length; i++) {
        compSource = pokemonNames[pokemonNamesSorted[i]].toHiraganaCase();
        switch (compSource.indexOf(term)) {
          case -1:
            break;
          case 0:
            list.push(pokemonNames[pokemonNamesSorted[i]]);
            break;
          default:
            if(list.length == 0){ partList.push(pokemonNames[pokemonNamesSorted[i]]); }
            break;
        }
      }
      return (list.length > 0 ? list : partList);
    },
    updater: function (item) {
      $('#side1nametext').val(item);
      submitForm();
      return item;
    },
    matcher: function (item) {
      return true;
    },
});
$('#move0text').typeahead({
    source: function(query, process) {
      var list = [];
      var partList = [];
      var term = r2h(query).toHiraganaCase().toZenkakuCase().toUpperCase();
      var compSource;
      for (var i=1; i<moveNamesSorted.length; i++) {
        compSource = moveNames[moveNamesSorted[i]].toHiraganaCase();
        switch (compSource.indexOf(term)) {
          case -1:
            break;
          case 0:
            list.push(moveNames[moveNamesSorted[i]]);
            break;
          default:
            if(list.length == 0){ partList.push(moveNames[moveNamesSorted[i]]); }
            break;
        }
      }
      return (list.length > 0 ? list : partList);
    },
    updater: function (item) {
      $('#move0text').val(item);
      submitForm();
      return item;
    },
    matcher: function (item) {
      return true;
    },
});
$('#move1text').typeahead({
    source: function(query, process) {
      var list = [];
      var partList = [];
      var term = r2h(query).toHiraganaCase().toZenkakuCase().toUpperCase();
      var compSource;
      for (var i=1; i<moveNamesSorted.length; i++) {
        compSource = moveNames[moveNamesSorted[i]].toHiraganaCase();
        switch (compSource.indexOf(term)) {
          case -1:
            break;
          case 0:
            list.push(moveNames[moveNamesSorted[i]]);
            break;
          default:
            if(list.length == 0){ partList.push(moveNames[moveNamesSorted[i]]); }
            break;
        }
      }
      return (list.length > 0 ? list : partList);
    },
    updater: function (item) {
      $('#move1text').val(item);
      submitForm();
      return item;
    },
    matcher: function (item) {
      return true;
    },
});
$('#move2text').typeahead({
    source: function(query, process) {
      var list = [];
      var partList = [];
      var term = r2h(query).toHiraganaCase().toZenkakuCase().toUpperCase();
      var compSource;
      for (var i=1; i<moveNamesSorted.length; i++) {
        compSource = moveNames[moveNamesSorted[i]].toHiraganaCase();
        switch (compSource.indexOf(term)) {
          case -1:
            break;
          case 0:
            list.push(moveNames[moveNamesSorted[i]]);
            break;
          default:
            if(list.length == 0){ partList.push(moveNames[moveNamesSorted[i]]); }
            break;
        }
      }
      return (list.length > 0 ? list : partList);
    },
    updater: function (item) {
      $('#move2text').val(item);
      submitForm();
      return item;
    },
    matcher: function (item) {
      return true;
    },
});
$('#move3text').typeahead({
    source: function(query, process) {
      var list = [];
      var partList = [];
      var term = r2h(query).toHiraganaCase().toZenkakuCase().toUpperCase();
      var compSource;
      for (var i=1; i<moveNamesSorted.length; i++) {
        compSource = moveNames[moveNamesSorted[i]].toHiraganaCase();
        switch (compSource.indexOf(term)) {
          case -1:
            break;
          case 0:
            list.push(moveNames[moveNamesSorted[i]]);
            break;
          default:
            if(list.length == 0){ partList.push(moveNames[moveNamesSorted[i]]); }
            break;
        }
      }
      return (list.length > 0 ? list : partList);
    },
    updater: function (item) {
      $('#move3text').val(item);
      submitForm();
      return item;
    },
    matcher: function (item) {
      return true;
    },
});