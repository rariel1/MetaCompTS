# Multiple Choice

## Basic Configuration
|Name|Type|Default Value|Description|Note|
|----|----|-------------|-----------|----|
|title|String||This title will appear above the plugin.||
|button_text|String|"Continue"|Text that will appear in place of 'Continue' on the button.||
|stimulus|String **OR** String Array||Text stimulus/stimuli that is displayed.|Provide either this or stimulus_file.|
|stimulus_file|String||File name of a JSON file containing stimuli in an array.|Look below for an example of formatting.|
|options|String Array||Options for the multiple choice.||
|multiple_choices|Boolean|false|Allow for multiple options to be selected.||
|horizontal|Boolean|false|Display choices horizontally if true.||
|required|Boolean|false|If true, a response is required before the user can continue.||
|minimum_time|Number||Minimum number of milliseconds allowed for the user to continue.|If not used with `maximum_time`, then it will auto-advance without displaying the continue button.|
|maximum_time|Number||Maximum number of milliseconds allowed for the user to continue.|If not used with `minimum_time`, then it will auto-advance and display the continue button.|

### Example of `stimulus_file` contents
```
[
  "Question 1...",
  "Question 2...",
  "Question 3..."
]
```

## Example Output
### Single Stimuli
```
[
 {
  "stimulus": "Hello World",
  "selection": [
   "No"
  ],
  "total_time": 8002,
  "first_interaction_time": 1748,
  "trial_type": "pcllab-multiple-choice",
  "trial_index": 0,
  "time_elapsed": 8017,
  "internal_node_id": "0.0-0.0"
 }
]
```

### Multiple Stimulus
```
[
 {
  "stimulus": "Question 1",
  "selection": [
   "Yes",
   "No"
  ],
  "total_time": 56908,
  "first_interaction_time": 54466,
  "trial_type": "pcllab-multiple-choice",
  "trial_index": 0,
  "time_elapsed": 56913,
  "internal_node_id": "0.0-0.0"
 },
 {
  "stimulus": "Question 2",
  "selection": [
   "Maybe",
   "I don't know",
   "Can you repeat the question?"
  ],
  "total_time": 2833,
  "first_interaction_time": 1518,
  "trial_type": "pcllab-multiple-choice",
  "trial_index": 0,
  "time_elapsed": 59759,
  "internal_node_id": "0.0-0.0"
 },
 {
  "trial_type": "pcllab-multiple-choice",
  "trial_index": 0,
  "time_elapsed": 59765,
  "internal_node_id": "0.0-0.0"
 }
]
```
