/**
 * @name Multiple Choice
 *
 * @param {string} title - This title will appear above the plugin.
 * @param {number} isi_time - The time to wait before presenting the next stimulus
 * @param {string=Continue} button_text - Text that will appear on the 'continue' button.
 * @param {string|string[]} stimulus - Text stimulus that is displayed.
 * @param {string=} stimulus_file - File name of a JSON file containing stimulus in an array.
 * @param {string[]} options - Options for the multiple choice.
 * @param {boolean=false} auto_advance - Advance to the next stimulus once an option is selected if true
 * @param {boolean=false} multiple_choices - Allow for multiple options to be selected.
 * @param {boolean=false} horizontal - Display choices horizontally if true.
 * @param {boolean=false} required - If true, a response is required before the user can continue.
 * @param {number} minimum_time - Minimum amount of milliseconds allowed for the user to continue.
 * @param {number} maximum_time - Maximum amount of milliseconds allowed for the user to continue.
 * @param {string=} output - The answers given are stored in the variable provided here.
 *
 * @author Garrick Buckley
 */

jsPsych.plugins["pcllab-multiple-choice"] = (function () {

    var plugin = {};

    plugin.trial = function (display_element, trial) {
        var startTime = (new Date()).getTime();
        var firstInteractionTime;
        var data = [];

        // Default trial parameters
        trial.title = trial.title || "";
        trial.button_text = trial.button_text || "Continue"
        trial.required = trial.required || false;
        trial.options = trial.options || [];
        trial.auto_advance = trial.auto_advance || false;
        trial.isi_time = typeof trial.isi_time !== undefined ? trial.isi_time : 0;
        var canContinue = trial.required;
        var scoreSelections = !!trial.scores_file;

        // Load instructions from params
        var stimulusFromFile = !!trial.stimulus_file;
        var stimulusArr;
        var stimulusIndex = 0;
        var timerInterval;
        var totalScore = 0;
        var scoreMap;

        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

        if (stimulusFromFile) { // load instructions from JSON file
            $.getJSON(trial.stimulus_file, function (data) {
                stimulusArr = data;

                getScoreMap(trial.scores_file, loadQuestion);
            });
        } else {
            if (typeof trial.stimulus === "string") {  // load instructions as string
                stimulusArr = [trial.stimulus];
            } else if (Array.isArray(trial.stimulus)) {  // load instructions as array
                stimulusArr = trial.stimulus;
            }

            getScoreMap(trial.scores_file, loadQuestion);
        }

        function loadQuestion() {
            var currStimulus = stimulusArr[stimulusIndex];

            var template = $('<div>', {
                class: "pcllab-mc"
            });

            // Stimulus.
            var stimulus = $('<h3 class="text-center mb-2 mt-2">' + currStimulus + '</h3>');

            var optionsContainer = $('<div>', { class: "row justify-content-center" })

            var options = $('<div>', {
                class: "pcllab-mc-options d-inline-block"
            });
            options.appendTo(optionsContainer)

            for (var i = 0; i < trial.options.length; i++) {
                var option;

                if (trial.multiple_choices) {
                    option = $("<div class='checkbox md-checkbox'><input name='mc' id='mc-" + i + "' type='checkbox'><label for='mc-" + i + "'>" + trial.options[i] + "</label></div>");
                } else {
                    option = $("<div class='checkbox md-radio'><input name='mc' id='mc-" + i + "' type='radio'><label for='mc-" + i + "'>" + trial.options[i] + "</label></div>");
                }

                options.append(option);

                if (trial.horizontal) {
                    options.append($("<span class='pcllab-mc-spacing'></span>"));
                } else {
                    options.append($("</br>"));
                }
            }

            if (trial.multiple_choices && trial.none_of_the_above) {
                noneOfTheAbove = $("<div class='checkbox md-checkbox pcllab-mc-noneoftheabove'><input name='mc' id='cb-nota' type='checkbox'><label for='cb-nota'>" + (trial.none_of_the_above || "None of the above") + "</label></div>");
                options.append(noneOfTheAbove);
            }

            // Button
            var buttonContainer = $('<div>', {
                class: "pcllab-button-container"
            });

            var button = $('<button>', {
                id: "continue-button",
                class: "btn btn-primary btn-lg waves-effect",
                text: trial.button_text
            });

            buttonContainer.append(button.on('click', function () {
                nextQuestion();
            }));

            // If auto advance is true, we don't need a button
            if (trial.auto_advance) button.hide()

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

            if (trial.minimum_time) {
                button.prop('disabled', true);
            } else if (trial.maximum_time) {
                button.hide(); // Just hide the button, since we are automatically progressing.
            }

            var timeLeft = (trial.maximum_time || trial.minimum_time);

            timerInterval = setInterval(function () {
                timeLeft -= 100;

                if (timeLeft <= 0) {
                    if (!trial.maximum_time) {
                        progressBar.hide();
                        clearInterval(timerInterval);

                        if (!trial.required) {
                            canContinue = true;
                            button.prop('disabled', false);
                        } else {
                            var selection = getSelection();

                            if ((trial.multiple_choices && selection[0] === undefined) ||
                                selection === undefined) {
                                canContinue = false;
                                button.prop('disabled', true);
                            } else {
                                canContinue = true;
                                button.prop('disabled', false);
                            }
                        }
                    } else {
                        nextQuestion();
                    }

                    return;
                }

                // Enable the continue button if we are past the min time.
                if (trial.maximum_time && timeLeft <= (trial.maximum_time - trial.minimum_time)) {
                    var selection = getSelection();

                    if (trial.required) {
                        if ((trial.multiple_choices && selection[0] === undefined) ||
                            selection === undefined) {
                            canContinue = false;
                            button.prop('disabled', true);
                        } else {
                            canContinue = true;
                            button.prop('disabled', false);
                        }
                    } else {
                        canContinue = true;
                        button.prop('disabled', false);
                    }
                }

                var newValue = (timeLeft / (trial.maximum_time || trial.minimum_time)) * 100;
                progressBar.css('width', newValue + '%');
                progressBar.prop('aria-valuenow', newValue);
            }, 100);

            template.append("<h1 style='text-align: center; padding-bottom: 12px;'>" + trial.title + "</h1>");
            template.append(stimulus);
            template.append(optionsContainer);

            if (trial.maximum_time || trial.minimum_time) {
                template.append(progressBarContainer);
            }

            template.append(buttonContainer);

            display_element.append(template);

            //None of the above
            if (trial.multiple_choices && trial.none_of_the_above) {
                $(".pcllab-mc-options input:not(:last)").click(function () {
                    $(".pcllab-mc-noneoftheabove input").attr('checked', false)
                });

                $(".pcllab-mc-noneoftheabove input").click(function () {
                    if (this.checked) {
                        $(".pcllab-mc-options input:not(:last)").attr('checked', false);
                    }
                });
            }

            if (trial.required) {
                button.prop('disabled', true);
            }

            $("input").on('click', function () {
                if (!firstInteractionTime) {
                    firstInteractionTime = (new Date()).getTime() - startTime;
                }

                if (trial.required) {
                    if ((timeLeft <= 0 && !trial.maximum_time) ||
                        (trial.maximum_time && timeLeft <= (trial.maximum_time - trial.minimum_time))) {

                        var selection = getSelection();

                        if ((trial.multiple_choices && selection[0] === undefined) ||
                            selection === undefined) {
                            canContinue = false;
                            button.prop('disabled', true);
                        } else {
                            canContinue = true;
                            button.prop('disabled', false);
                        }
                    }
                }

                // Go to the next question if auto advance is true
                if (trial.auto_advance) nextQuestion();
            });
        }

        function nextQuestion() {
            clearInterval(timerInterval);

            //Update total score if scoring is enabled
            if (scoreSelections) {
                var scores = scoreSelection();
                if (scores.constructor === Array) {
                    scores.forEach(function (num) {
                        totalScore += num;
                    })
                } else {
                    totalScore += scores;
                }
            }

            writeData();
            stimulusIndex++;

            setTimeout(() => {
                display_element.empty()

                setTimeout(function () {
                    if (stimulusIndex >= stimulusArr.length) {
                        end_trial();
                    } else {
                        display_element.html('');
                        startTime = (new Date()).getTime();
                        firstInteractionTime = null;

                        loadQuestion();
                    }
                }, trial.isi_time);
            }, 300)

        }

        function getSelection() {
            var selected = [];

            var checkboxes = $(".checkbox");
            $(checkboxes).each(function (option) {
                if ($(checkboxes[option]).find("input")[0].checked) {
                    selected.push($(checkboxes[option]).find("label").text());
                }
            });

            if (trial.multiple_choices) {
                return selected;
            } else {
                return selected[0];
            }
        }

        function scoreSelection() {
            var scores = []

            var checkboxes = $(".checkbox");
            $(checkboxes).each(function (option) {
                if ($(checkboxes[option]).find("input")[0].checked) {
                    scores.push(scoreMap[stimulusIndex][option]);
                }
            });

            if (trial.multiple_choices) {
                return scores;
            } else {
                return scores[0];
            }
        }

        function getScoreMap(url, callback) {
            if (scoreSelections) {
                $.getJSON(url, function (data) {
                    scoreMap = data;
                    callback();
                });
            } else {
                callback();
            }
        }

        function writeData() {
            var questionData = {};

            questionData.stimulus = stimulusArr[stimulusIndex];
            questionData.selection = getSelection();
            questionData.total_time = (new Date()).getTime() - startTime;
            questionData.first_interaction_time = firstInteractionTime || -1;
            if (scoreSelections) {
                questionData.scores = scoreSelection();
                questionData.total_score = 0;

                if (questionData.scores.constructor === Array) {
                    questionData.scores.forEach(function (num) {
                        questionData.total_score += num;
                    })
                } else {
                    questionData.total_score = questionData.scores;
                }
            }

            data.push(questionData);
            if (stimulusArr.length !== 1) jsPsych.data.write(questionData);
        }

        function end_trial() {
            display_element.html('');

            if (trial.output) {
                window[trial.output] = data;
            }

            if (stimulusArr.length === 1) {
                jsPsych.finishTrial(data[0]);
            } else {
                var scoredata = {};
                if (scoreMap) scoredata.total_score = totalScore;

                jsPsych.finishTrial(scoredata);
            }
        }
    };

    return plugin;
})();