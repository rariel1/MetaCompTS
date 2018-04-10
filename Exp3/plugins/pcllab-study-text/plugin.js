/**
 * @name Study Text
 *
 * @param {string} [url=texts.json] - Path to the file containing the json of all texts used in the experiment, the root
 * should be an object containing objects with properties title and text. For a sample see
 * https://github.com/PCLLAB/Framework/blob/master/tests/texts.json
 * @param {string} [label] - The label of the specific text from the json file.
 * @param {string=Continue} button_text - Text that will appear on the 'continue' button.
 * @param {number} minimum_time - Minimum amount of milliseconds allowed for the user to continue.
 * @param {number} maximum_time - Maximum amount of milliseconds allowed for the user to continue.
 */

jsPsych.plugins["pcllab-study-text"] = (function () {

    var plugin = {};

    plugin.trial = function (display_element, trial) {

        // set default values for parameters
        trial.minimum_time = trial.minimum_time || 1000 * 60;
        trial.url = trial.url || "texts.json";
        trial.button_text = trial.button_text || "Continue";

        var timerInterval;

        if (trial.auto_advance == undefined) {
            trial.auto_advance = false;
        }
        trial.showPB = trial.showPB || false;

        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

        if (!jsPsych.userInfo) {
            jsPsych.userInfo = {};
        }

        if (!jsPsych.userInfo.texts) {
            $.getJSON(trial.url, function (data) {
                jsPsych.userInfo.texts = data;
                show();
            });
        } else {
            show();
        }

        function show() {
            var startTime = (new Date()).getTime();
            var text = jsPsych.userInfo.texts[trial.label];

            var titleView = $('<h2>', {
              class: 'pcllab-text-center pcllab-default-bottom-margin-medium',
              text: text.title
            });

            var textView = $('<div>', {
              class: 'pcllab-default-bottom-margin-medium'
            });
            textView.html(text.text);

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
                end_trial();
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

                if (trial.maximum_time) {
                    button.hide(); // Just hide the button, since we are automatically progressing.
                }
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
                        end_trial();
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

            display_element.append(titleView);
            display_element.append(textView);

            if (trial.maximum_time || trial.minimum_time) {
                display_element.append(progressBarContainer);
            }

            display_element.append(buttonContainer);

            function end_trial() {
                display_element.html('');
                jsPsych.finishTrial({
                    study_text_time: (new Date()).getTime() - startTime,
                    study_text_title: text.title,
                    study_text_label: trial.label
                });
            }
        }
    };

    return plugin;
})();
