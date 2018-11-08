let commandList = [0];

let instructionNumber = 0; // Number of command currently loaded in buffer
let cells = [0]; // Array to store cell values
let cellIndex = 0;
let cellIndexOffset = 0; // Offset for cell index (To allow for negative cell values)

let isRunning = false; // flag
let expectingInput = false; // flag

// Converts Ook! in a string to a numeric array. Invalid commands are removed
function ParseToCommandArray(codeString) {
    codeString = codeString.toUpperCase();
    let s = codeString.split(/[\n ]+/); // Split by spaces
    let words = [];

    for (let i in s) {
        switch (s[i].trim().substr(0,4)) { // Use a base 3 system to interprate Ooks
            case "OOK.":
                words.push(0);
                break;
            case "OOK!":
                words.push(1);
                break;
            case "OOK?":
                words.push(2);
                break;
            default:
                console.log(s[i]);
        }
    }
    console.log(s);
    console.log(words);
    if (words.length%2 != 0) {
        // Odd number of words, kill the last one
        words.pop();
    }
    let commands = [];

    for (let i = 0; i < words.length; i += 2){
        commands.push(3*words[i] + words[i+1]); // LSB on the right
    }
    return commands;
}

// Executes current command from command list as specified by index i
function ExecuteCommand(commands, i) {
    let s = document.getElementById("Console").value;
    let index = i;
    let z_index = 0;

    switch(commands[i]) {
        case 0: // Increment cell
            if (cells[cellIndex + cellIndexOffset] == 255) {
                cells[cellIndex + cellIndexOffset] = 0;
            }
            else {
                cells[cellIndex + cellIndexOffset]++;
            }
            break;
        case 1: // Input to cell
            // let s = document.getElementById("Console").value;
            console.log("Requesting Input");
            s += ">>";
            document.getElementById("Console").value = s;

            let ConsoleInput = document.getElementById("ConsoleInput");

            if (ConsoleInput.value.length > 0) { // Get 

                cells[cellIndex + cellIndexOffset] = ConsoleInput.value.charCodeAt(0); // Get the first char code
                ConsoleInput.value = ConsoleInput.value.substr(1,ConsoleInput.value.length-1); // remove first character
                document.getElementById("Console").value += cells[cellIndex + cellIndexOffset] + "\n";
                expectingInput = false;

            }
            else {
                isRunning = false;
                expectingInput = true;
            }

            break;
        case 2: // Increment cell pointer
            if ((cellIndex + cellIndexOffset + 1) == cells.length) {
                cellIndex++;
                cells.push(0);
            }
            else {
                cellIndex++;
            }
            break;
        case 3: // Output from cell
            // let s = document.getElementById("Console").value;
            console.log("Output >> " + cells[cellIndex + cellIndexOffset]);
            s += String.fromCharCode(cells[cellIndex + cellIndexOffset]);
            document.getElementById("Console").value = s;
            break;
        case 4: // Decrement cell
            if (cells[cellIndex + cellIndexOffset] == 0) {
                cells[cellIndex + cellIndexOffset] = 255;
            }
            else {
                cells[cellIndex + cellIndexOffset]--;
            }
            break;
        case 5: // [ Jump forward past matching ] if cell is 0
            // let index = i;
            // let z_index = 0;
            if (cells[cellIndex + cellIndexOffset] != 0) break;

            index ++;
            console.log("Looking for ]");
            while (true) {
                if (index >= commands.length) { // Out of bounds
                    alert("Ook! Ook? missing matching Ook? Ook!");
                    return false;
                }

                if (commands[index] == 7 && z_index == 0) {
                    break;
                }
                else if (commands[index] == 7) {
                    z_index--;
                }
                else if (commands[index] == 5) {
                    z_index++;
                }
                index++;
                console.log(index + " z:" + z_index);
            }
            instructionNumber = index; // Jump to matching ]
            break;
        case 6: // Decrement cell pointer
            if ((cellIndex + cellIndexOffset - 1) < 0) { // Ensures that we don't enter an invalid array index
                cellIndexOffset++;
                cellIndex--;
                cells.unshift(0);
            }
            else {
                cellIndex--;
            }
            break;
        case 7: // ] Jump back to matching [ if cell is non-zero
            // let index = i;
            // let z_index = 0;
            if (cells[cellIndex + cellIndexOffset] == 0) break;
            
            index--;
            console.log("Looking for [")
            while (true) {
                if (index < 0) {
                    alert("Ook? Ook! missing matching Ook! Ook?");
                    return false;
                }

                if (commands[index] == 5 && z_index == 0) {
                    break;
                }
                else if (commands[index] == 5) {
                    z_index--;
                }
                else if (commands[index] == 7) {
                    z_index++;
                }
                index--;
                console.log(index + " z:" + z_index);
            }
            instructionNumber = index; // Jump to matching [
            break;
        case 8: // Set cell to random uint8_t
            cells[cellIndex + cellIndexOffset] = Math.floor(Math.random() * 2);
            break;
        default:
            // Warning, command invalid for some reason...
            alert("Somehow there was an invalid command\nError at command " + i + "Bleh");
            return false;
    }
    return true;
}

// Call this when starting the program again
function ResetProgram() {
    isRunning = false;
    instructionNumber = 0;
    cells = [0];
    cellIndex = 0;
    cellIndexOffset = 0;
    document.getElementById("Console").value = "";
}

// Call this to compile and run
function InitializeProgram() {
    let pad = document.getElementById("WordPad");

    ResetProgram();
    commandList = ParseToCommandArray(pad.value);
    console.log(commandList);

    isRunning = true;
    RunProgram();
}

// Call this to run the program if it stops
function RunProgram() {
    while (isRunning) {
        if (instructionNumber >= commandList.length) { // Program end
            isRunning = false;
            let s = document.getElementById("Console").value;
            s += "\n...Program Terminated";
            document.getElementById("Console").value = s;
        }
        else {
            console.log(instructionNumber);
            if (!ExecuteCommand(commandList, instructionNumber)) {
                isRunning = false;
            }
            instructionNumber++;
        }
    }
}

// Event function to recieve console input 'enter' key presses
var InputKeyPressed = function(event) { // Event called when key pressed on console input
    if (event.keyCode === 13) {

        if (ConsoleInput.value.length > 0 && expectingInput) {
            cells[cellIndex + cellIndexOffset] = ConsoleInput.value.charCodeAt(0); // Get the first char code
            ConsoleInput.value = ConsoleInput.value.substr(1,ConsoleInput.value.length-1); // remove first character
            document.getElementById("Console").value += cells[cellIndex + cellIndexOffset] + "\n";
            isRunning = true;
            expectingInput = false;

            RunProgram();
        }
    }
}