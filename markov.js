//meat markov

var fs = require('fs');
var emojiRegex = require('emoji-regex');

var starts = [];
var chain = {};
var punctuation = /[.,\/#!$%\^&\*;:{}=\-_`~()]/g
var splitRegex = /[\w-']+|[^\w\s]+/g

  // process the corpuses
  function absorb(filename) {
    fs.readFile(filename, 'utf8', function(err, data) {
      if (err) throw err;
      makeThingsUp(data);
    });
  }

  // create the markov chain
  function learn(data) {
    var sentences = splitSentences(data);
    var numSentences = sentences.length;
    for (var i = 0; i < numSentences; i++) {
      var sentence = sentences[i];
      var tokenized = sentence.match(splitRegex);
      var sentenceLength = tokenized.length;



      // put the first word of the message in a separate array for random access
      if (sentenceLength > 1) {
        starts.push([tokenized[0], tokenized[1]]);

        for (var j = 0; j < sentenceLength - 1; j++) {
          var thisWord = tokenized[j];
          var nextWord = tokenized[j + 1];

          if (!nextWord) {
            continue;
          }

          var thirdWord = tokenized[j + 2];

          var currentBit = [thisWord, nextWord];

          if (thirdWord) {
            if (chain.hasOwnProperty(currentBit))  {
              chain[currentBit].push(thirdWord.trim());
            } else {
              chain[currentBit] = [thirdWord.trim()];
            }
          }
        }
      }
    }
  }

  function makeThingsUp(data) {
    learn(data);

    //pick a random sentence starter seed
    var thing = [];
    var bit = getRandomFromArray(starts);
    thing.push(joinWithPunctuation(bit));

    while (bit) {
      var possibilities = chain[bit];
      if (possibilities) {
        var nextWord = getRandomFromArray(possibilities);
        thing.push(nextWord);
        bit = [bit[1], nextWord];
      } else {
        bit = undefined;
      }
    }

    //console.log(thing)
    console.log(joinWithPunctuation(thing));
  }

  function splitSentences(text) {
    return text.match(/^.*([\n\r]+|$)/gm);
  }

  function getRandomFromArray(arr) {
    var len = arr.length;
    if (len > 1) {
      return arr[Math.floor(Math.random()*len)];
    } else {
      return arr[0];
    }
  }

  function joinWithPunctuation(arr) {
    var str = arr.reduce(function(acc, curr) {
      if (curr.match(punctuation)) {
        acc += curr;
      } else {
        acc = acc + ' ' + curr;
      }
      return acc;
    }, '')
    return str.trim();
  }
//};

//export default Markov;

absorb('okcupid_corpii.txt');
