/**
 * @name Study Items
 *
 * @param {array} stimuli - Each element of the array is either another array of strings or a string which is a word or a path to an image.
 * @param {number} [isi=0] - If greater than 0, then a gap will be shown between each item/items in the sequence. This parameter specifies the length of the gap.
 * @param {boolean=} horizontal - If true, items will be displayed horizontally.
 * @param {array} choices - Array of keys that can be pressed to continue to the next item. If set it will not automatically continue to the next item.
 * @param {string=Continue} button_text - Text that will appear on the 'continue' button.
 * @param {boolean=false} display_button - If set to true, the continue button will have to be pressed to continue to the next
 * @param {number} minimum_time - Minimum amount of milliseconds allowed for the user to continue.
 * @param {number} maximum_time - Maximum amount of milliseconds allowed for the user to continue.
 */

jsPsych.plugins["pcllab-study-items"] = (function () {

    var plugin = {};

    jsPsych.pluginAPI.registerPreload('pcllab-study-items', 'stimuli', 'image');

    plugin.trial = function (display_element, trial) {

        // set default values for parameter
        trial.isi = trial.isi || 0;
        trial.button_text = trial.button_text || "Continue";
        trial.display_button = trial.display_button || false;

        var autoContinue = !(trial.display_button || trial.choices);

        trial = jsPsych. pluginAPI.evaluateFunctionParameters(trial);

        var index = -1;

        var startTime = (new Date()).getTime();

        var timerInterval;

        if (trial.horizontal === true) {
            var containerView = $('<div>', {
                class: 'pcllab-container-center pcllab-study-items-container-horz'
            });
        } else {
            var containerView = $('<div>', {
                class: 'pcllab-container-center pcllab-study-items-container'
            });
        }

        display_element.html('');
        display_element.append(containerView);

        var animationData = [];
        var animateInterval = null;

        next();

        if (autoContinue) {
            animateInterval = setInterval(next, intervalTime);
        }

        function next() {
            clearInterval(timerInterval);
            index++;
            if (index == trial.stimuli.length) {
                clearInterval(animateInterval);

                var trialData = {
                "stimuli": JSON.stringify(animationData)
                };

                // kill keyboard listeners
                if (typeof keyboardListener !== 'undefined') {
                    jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
                }

                display_element.html('');
                jsPsych.finishTrial(trialData);
            } else {
                if (trial.isi > 0 && index > 0) {
                        containerView.hide();
                        animationData.push({
                            stimuli: "blank",
                            time: (new Date()).getTime() - startTime
                        });
                    setTimeout(function () {
                        showNextFrame();
                    }, trial.isi);
                } else {
                    showNextFrame();
                }
            }
        }

        function showNextFrame() {
            var current = trial.stimuli[index];

            // start the response listener
            if (JSON.stringify(trial.choices) != JSON.stringify(["none"])) {
                var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: next,
                    valid_responses: trial.choices,
                    rt_method: 'date',
                    persist: false,
                    allow_held_key: false
                });
            }

            animationData.push({
                stimuli: current,
                time: (new Date()).getTime() - startTime
            });
            showEntity(current);
        }

        function showEntity(current) {
          containerView.html("");
          containerView.show();

          if (!Array.isArray(current)) {
              current = Array(current);
          }

          for (var i = 0; i < current.length; i++) {
              var item = current[i];

              if (isImage(item)) {
                  var imageContainer = $('<div>', {class: 'pcllab-study-item-container'});
                  imageContainer.append($('<img>', {
                      class: 'pcllab-study-item',
                      src: item
                  }));
                  containerView.append(imageContainer);
                  containerView.append($('<br>'));
              } else {
                  var textContainer = $('<div>', {class: 'pcllab-study-item-container'});

                  if(item.split(" ").length === 1) {
                      textContainer.addClass("pcllab-study-item-word");
                  }

                  textContainer.append(item);

                  containerView.append(textContainer);
              }
          }

          if (trial.display_button) {
              // Button
              var buttonContainer = $('<div>', {
                  class: "pcllab-button-container"
              });

              var button = $('<button>', {
                  id: "continue-button",
                  class: "btn btn-primary btn-lg",
                  text: trial.button_text
              });

              buttonContainer.append(button.on('click', function() {
                  next();
              }));

              // Progress Bar
              var progressBarContainer = $('<div>', {
                  class: 'progress pcllab-default-progress'
              });

              var progressBar = $('<div>', {
                  class: 'progress-bar pcllab-default-progressbar',
                  role: 'progressbar',
                  'aria-valuemin': 0,
                  'aria-valuemax': 100,
                  'aria-valuenow': 100
              });

              progressBarContainer.append(progressBar);

              if(trial.minimum_time) {
                  button.prop('disabled', true);
              } else if (trial.maximum_time) {
                  button.hide(); // Just hide the button, since we are automatically progressing.
              }

              var timeLeft = (trial.maximum_time || trial.minimum_time);

              timerInterval = setInterval(function() {
                  timeLeft -= 100;

                  if (timeLeft <= 0) {
                      if (!trial.maximum_time) {
                          progressBar.hide();
                          clearInterval(timerInterval);
                          button.prop('disabled', false);
                      } else {
                          next();
                      }

                      return;
                  }

                  // Enable the continue button if we are past the min time.
                  if (trial.maximum_time && timeLeft <= (trial.maximum_time - trial.minimum_time)) {
                      button.prop('disabled', false);
                  }

                  var newValue = (timeLeft / (trial.maximum_time || trial.minimum_time)) * 100;
                  progressBar.css('width', newValue + '%');
                  progressBar.prop('aria-valuenow', newValue);
              }, 100);

              if (trial.maximum_time || trial.minimum_time) {
                  containerView.append(progressBarContainer);
              }

              containerView.append(buttonContainer);
          }

          $(".pcllab-study-item-container").css("flex-basis", (100/current.length) + "%");
        }

        function isImage(input) {
          var comps = input.split('.');

          if (comps.length == 1) {
              return false;
          }

          var extension = comps[comps.length - 1].toLowerCase();

          return extension == "jpg" || extension == "png" || extension == "jpeg" || extension == "gif";
        }
    };

    return plugin;
})();
