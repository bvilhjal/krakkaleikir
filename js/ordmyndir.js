/* Orð og myndir / Ord og billeder: match a written word to a picture (animals and things),
   or a picture to its word. IDs bind artwork, translation and recorded speech;
   a round has ten different targets and exactly one matching choice per target. */
(function () {
  'use strict';

  function promptKey(q) { return q.mode === 'pictures' ? 'ordmyndir.picture_q' : 'ordmyndir.word_q'; }

  KL.register('ordmyndir', {
    levels: [{ id: 'pictures', labelKey: 'ordmyndir.pictures' }, { id: 'words', labelKey: 'ordmyndir.words' }],
    start: function (ctx) {
      KL.runGame({
        ctx: ctx,
        gameId: 'ordmyndir',
        levels: this.levels,
        makeQuestions: function (mode) {
          var targets = KL.shuffle(KL.sample(KL_ART.ANIMALS, 5).concat(KL.sample(KL_ART.THINGS, 5)));
          return targets.map(function (id) {
            return { mode: mode, target: id, choices: KL.pickDistinct(KL_ART.PICTURES, id, 4) };
          });
        },
        promptText: function (q) { return KL.t(promptKey(q)); },
        // the word is never read out: reading it is the game. A tapped
        // picture says its own name, so a wrong pick teaches a word too.
        promptSpeech: function (q) { return [promptKey(q)]; },
        retrySpeech: function (q) { return [promptKey(q)]; },
        wrongSpeech: function (q, lv, tapped) { return q.mode === 'pictures' ? [KL_ART.nameKey(tapped.id), 'try_again'] : ['try_again', promptKey(q)]; },
        onCorrect: function (q, answer, promptEl) {
          var label = document.createElement('p');
          label.className = 'word-reveal';
          label.textContent = KL.t(KL_ART.nameKey(q.target));
          (q.mode === 'pictures' ? answer.el : promptEl).appendChild(label);
        },
        build: function (q, promptEl, answersEl) {
          var word = KL.t(KL_ART.nameKey(q.target));
          var prompt;
          if (q.mode === 'pictures') {
            // a word card to read, not a button: it does not speak
            prompt = document.createElement('div');
            prompt.className = 'animal-prompt match-word';
            var text = document.createElement('strong');
            text.className = 'match-word-text';
            text.textContent = word;
            prompt.appendChild(text);
          } else {
            prompt = document.createElement('button');
            prompt.type = 'button';
            prompt.className = 'animal-prompt';
            prompt.setAttribute('aria-label', word + ': ' + KL.t('speak.aria'));
            prompt.innerHTML = KL_ART.picture(q.target, 128);
            prompt.addEventListener('click', function () {
              KL.replay(prompt, 'pulse-once');
              KL.say([KL_ART.nameKey(q.target)]);
            });
          }
          promptEl.appendChild(prompt);
          return q.choices.map(function (id) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'answer ' + (q.mode === 'pictures' ? 'match-choice' : 'match-text');
            if (q.mode === 'pictures') {
              btn.setAttribute('aria-label', KL.t(KL_ART.nameKey(id)));
              btn.innerHTML = KL_ART.picture(id, 104);
            } else btn.textContent = KL.t(KL_ART.nameKey(id));
            answersEl.appendChild(btn);
            return { el: btn, id: id, isCorrect: id === q.target, speechParts: [KL_ART.nameKey(id)] };
          });
        }
      });
    }
  });
})();
