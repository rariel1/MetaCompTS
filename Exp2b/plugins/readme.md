# Master list of parameters

## Input parameters

Parameter | Value Type | Description
--- | --- | ---
isi_time | number (ms) | Interstimulus interval (time between trials)
title | string | Title shown above items
type | string | Name of the plugin
cue | string | Propmpt given to the subject - could be a question, a word, etc.
target | string | Correct response to be compared with the subject's response
url | string | Path to trial data file
show_progress | boolean | Shows progress bar for the trial
button_text | string | Text that will appear on the 'continue' button
minimum_time | number (ms) | Minimum amount of time allowed for the user to continue
maximum_time | number (ms) | Maximum amount of time allowed for the user to continue
output | object | Variable in which data given is stored
persistentOutput | boolean | If set to true, the output will be added onto the existing output, and not cleared.
stimulus | string | The stimulus that is displayed
instructions | string | Text prompt that will appear in the trial

## Output data
Data | Value Type | Description
--- | --- | ---
index | number | Index position of trial
first_interaction_time | number (ms) | Time taken for the first interaction of the trial
total_time | number (ms) | Time elapsed since the start of the trial
response_time | number (ms) | Time taken to provide a response
cue | string | Propmpt given to the subject
target | string | Correct response to be compared with the subject's response
response | string | Response given by the subject