

let LintErrorNum = 0; // Current error selected
let errorList = []; // List of errors currently present


// Word Object
function Word(string, pos) {
    this.wordString = string;
    this.wordPosition = pos;
}

// Error Object
function ErrorP(string, e, pos) {
    this.BadString = string;
    this.ErrorString = e;
    this.ErrorPosition = pos;
}

// Splits a string by spaces and removed empty elements or elements composed of whitespace
// Also applies whitespace trimming to each word and makes all uppercase
function ConvertString2Words(s) {
    s = s.toUpperCase(); // Ensure the all characters are the same case
    let words = [];

    let tempStr = "";
    for (let i = 0; i < s.length; i++) {
        if (s.charAt(i).trim() == "") {
            // Char is whitespace
            words.push(new Word(tempStr, i - tempStr.length)); // Add Word object to array
            tempStr = "";
        }
        else {
            tempStr += s.charAt(i);
        }
    }
    words.push(new Word(tempStr, s.length - tempStr.length)); // Push last Word object to array
    
    return words;
}

// Lints a string and returns a list of error objects
function LintCodeForErrors(codeString) {
    let words = ConvertString2Words(codeString);

    let errors = []; // List of errors
    for (let i in words) {
        // Check to see if word contains invalid characters
        if (words[i].wordString.search(/[^OK.!?]/) !== -1) {
            // word is comment, skip word
            continue;
        }
        if (words[i].wordString.length == 0) {
            // word is empty, skip word
            continue;
        }

        // Check for invalid punctuation
        if (words[i].wordString.match(/[.!?]{2,}/) !== null) {
            // More than one valid punctuation found. Bleh
            errors.push(new ErrorP(words[i].wordString, "Too much punctuation, invalid Ook", words[i].wordPosition));
        }
        else if (words[i].wordString.startsWith("OOK")) {
            if (words[i].wordString.search(/[.!?]/gi) == -1) {
                // No punctuation found, invalid Ook
                errors.push(new ErrorP(words[i].wordString, "No punctuation found, invalid Ook", words[i].wordPosition));
            }
        }
        else if (words[i].wordString.replace(/[OK!?.]/gi,"").trim() == "") {
            // Contains all the right characters.

            if (words[i].wordString.length > 4) { // word too long, most likely missing a space
                errors.push(new ErrorP(words[i].wordString, "Word too long, most likely missing a space", words[i].wordPosition));
            }
            else {
                // Must be misspelled
                switch (words[i].wordString.match(/[.!?]/)) {
                    case ".":
                        // Word is most likely supposed to be Ook.
                        errors.push(new ErrorP(words[i].wordString, "Word is most likely supposed to be Ook.", words[i].wordPosition));
                        break;
                    case "!":
                        // Word is most likely supposed to be Ook!
                        errors.push(new ErrorP(words[i].wordString, "Word is most likely supposed to be Ook!", words[i].wordPosition));
                        break;
                    case "?":
                        // Word is most likely supposed to be Ook?
                        errors.push(new ErrorP(words[i].wordString, "Word is most likely supposed to be Ook?", words[i].wordPosition));
                        break;
                    default:
                        // Word is just misspelled
                        errors.push(new ErrorP(words[i].wordString, "Ook is just misspelled", words[i].wordPosition));
                }
            }
        }
    }

    return errors;
}

function SelectTextInWordpad(pos, len) {
    let pad = document.getElementById("WordPad");
    pad.setSelectionRange(pos, pos + len);
    pad.focus();
    console.log(pos + " " + len);
}

function GenerateErrorList() {
    let s = document.getElementById("WordPad").value;
    errorList = LintCodeForErrors(s);
}

function SelectNextError() {
    GenerateErrorList();
    if (errorList.length == 0) {
        // List empty
        document.getElementById("ErrorOutput").innerHTML = "No Errors";
        return;
    }

    if (LintErrorNum == (errorList.length-1)) {
        LintErrorNum = 0;
    }
    else {
        LintErrorNum++;
    }
    SelectTextInWordpad(errorList[LintErrorNum].ErrorPosition, errorList[LintErrorNum].BadString.length);
    if (errorList.length != 0) {
        document.getElementById("ErrorOutput").innerHTML = errorList[LintErrorNum].ErrorString;
    }
}

function SelectPrevError() {
    GenerateErrorList();
    if (errorList.length == 0) {
        // List empty
        document.getElementById("ErrorOutput").innerHTML = "No Errors";
        return;
    }

    if (LintErrorNum == 0) {
        LintErrorNum = errorList.length - 1;
    }
    else {
        LintErrorNum--;
    }
    SelectTextInWordpad(errorList[LintErrorNum].ErrorPosition, errorList[LintErrorNum].BadString.length);
    if (errorList.length != 0) {
        document.getElementById("ErrorOutput").innerHTML = errorList[LintErrorNum].ErrorString;
    }
}




