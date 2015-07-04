(function() {
  'use strict';

  function countWords(text) {
      return text.split(/\s+/).filter(function(w) { return 0 < w.length; }).length;
  }

  function finalize(text) {
    return text.replace(/\{.*?\}/g, '').replace(/\[\??|\]/g, '');
  }

  function corrections(text) {
    var m = text.match(/\[.*?\]/g);
    if (!m)
      return [];
    return m.map(function(i) { return i.replace(/\[|\]/g, ''); })
  }

  function sentences(text) {
    return text.split(/\s*[\?\.\:;]\s*/).filter(function(i) { return 0 < i.length; });
  }

  function slashed(sentences) {
      return sentences.filter(function(s) { return 0 <= s.indexOf('/'); });
  }

  function foreignWords(wordsOrPhrases) {
    var p = /^\?/;
    return wordsOrPhrases.filter(function (w) { return w.match(p); }).map(function(i) { return i.replace(p, ''); });
  }

  function stats(numbers) {
    if (!numbers.length) {
      return {
        size: numbers.length
      };
    }

    // XXX: Side effect :-(
    numbers.sort(function(x, y) { return x - y; });
    var sum = numbers.reduce(function(a, i) { return a + i; }, 0);
    var avg = sum/numbers.length;
    var median = numbers[Math.floor(numbers.length/2)];
    return {
      size: numbers.length,
      sum: sum,
      avg: avg,
      median: median
    };
  }

  function compute(text) {
    var finalized = finalize(text);
    var corrs = corrections(text);
    var finalizedWc = countWords(finalized);
    var correctionWc = countWords(corrs.join(' '));
    var precision = (finalizedWc - correctionWc)/finalizedWc;
    var foreigns = foreignWords(corrs);
    var foreignCount = foreigns.length;
    var foreignRatio = foreignCount/(finalizedWc || 0);
    var finalizedSentences = sentences(finalized);
    var finalizedSentenceLengths = finalizedSentences.map(function(s) { return countWords(s); });
    var slashedSentences = slashed(finalizedSentences);
    var slashedSentenceLengths = slashedSentences.map(function(s) { return countWords(s); });
    var beforeSlashes = slashedSentences.map(function(s) { return s.substr(0, s.indexOf('/')); })
    var beforeSlashLengths = beforeSlashes.map(function(s) { return countWords(s); });

    return {
      precision: precision,
      wordCount: finalizedWc,
      foreignWords: foreigns,

      foreignCount: foreignCount,
      foreignRatio: foreignRatio,
      sentenceStats: stats(finalizedSentenceLengths),
      slashStats: stats(slashedSentenceLengths),
      beforeSlashStats: stats(beforeSlashLengths),

      // These are for debugging.
      sentences: finalizedSentences,
      corrections: corrs,
    };
  }

  function percentize(ratio) {
    return Math.floor(100 * ratio);
  }

  function round1000(ratio) {
    return Math.floor(1000 * ratio)/1000;
  }

  function populateAndCompute() {
    var result = compute($('#toscore').val());
    console.log(result);
    $('#precision').text(percentize(result.precision) + '%');
    $('#word-count').text(result.wordCount + ' words');
    $('#sentence-count').text(result.sentenceStats.size);
    $('#med-sentence-length').text(result.sentenceStats.median + ' words');

    $('#slash-count').text(result.slashStats.size);
    $('#med-slashed-sentence-length').text(result.slashStats.median + ' words');
    $('#med-before-slash-length').text(result.beforeSlashStats.median + ' words');
    $('#foreign-words').text(result.foreignWords.join(' '));
    $('#foreign-count').text(result.foreignCount + ' words');
    $('#foreign-ratio').text(round1000(result.foreignRatio));

    $('.score-table').removeClass("unresolved");
  }

  function selectTable() {
    var table = document.querySelector('.score-table');
    window.getSelection().selectAllChildren(table);
  }

  function init() {
    $('#score-button').on('click', populateAndCompute);
    $('#select-button').on('click', selectTable);
  }

  $(document).ready(init);
})();
