const POINTS_PER_QUESTION = 100;
const NUM_BUTTONS = 5;
const STARTING_LIVES = 3;
const TEXT_MIN = 50;
const TEXT_MAX = 500;
const LANGS = getJSONFile("https://api.myjson.com/bins/162ebs");
const WIKIPEDIA_URL = "https://en.wikipedia.org";
const EASY_LANGS = ["zh", "es", "en", "hi", "ar", "pt", "fr", "ru", "ja", "de"];
const MED_LANGS = ["bn", "pa", "jv", "id", "te", "vi", "ko", "tr", "it", "th", "nl", "pl", "tl", "ga", "da", "el", "he", "fi"].concat(EASY_LANGS);
const HARD_LANGS = ["mr", "ta", "ur", "gu", "fa", "ps", "kn", "ml", "su", "ha", "or", "my", "uk", "bh",
                    "yo", "mai", "uz", "sd", "am", "ff", "ro", "om", "ig", "az", "ceb", "no", "sw", "eo", "la", "et", "lv", "lt"].concat(MED_LANGS);
const VERY_HARD_LANGS = ["ku", "sh", "mg", "ne", "si", "zh", "km", "tk", "as", "so", "hu", "ny", "ak",
                        "kk", "zu", "cs", "rw", "ht", "ilo", "qu", "rn", "sn", "ug", "xh", "be", "bal", "gom", "eu", "haw", "cy"].concat(HARD_LANGS);
const DIFFICULTY_BUTTON_TEXT = ["Easy", "Medium", "Hard", "Very Hard", "Master"];
const BAD_LANGS = ["bal", "khw", "bgn"]; // Languages that don't work.

const LANGUAGE_POOLS = [EASY_LANGS, MED_LANGS, HARD_LANGS, VERY_HARD_LANGS, Object.keys(LANGS)];

var screen = {
    MENU: 1,
    QUESTION: 2,
    ANSWER: 3,
    END: 4
};

var score = 0;
var highScore = score;
var lives = STARTING_LIVES;
var currScreen = screen.MENU;
var currLangPool = EASY_LANGS;

String.prototype.trunc =
    function( n, useWordBoundary ){
        if (this.length <= n) { return this; }
            var subString = this.substr(0, n-1);
            if(useWordBoundary) {
                if(subString.lastIndexOf(' ') != -1) {
                    return subString.substr(0, subString.lastIndexOf(' ')) + "&hellip;";
                }
            }
        return substring + "&hellip;";
    };

$( document ).ready(function() {
    if(localStorage.getItem("highScore") === null) {
        localStorage.setItem("highScore", "0");
    }
    else {
        highScore = parseInt(localStorage.getItem("highScore"));
        $( '#high-score' ).html('High Score: ' + highScore);
    }

    var randLang;
    var answerText;
    initMenu();

    $( '#text-panic' ).click(function() {
        if(currScreen == screen.QUESTION) {
            if($( '#text' ).text().length < TEXT_MIN) {
                resetQuestion(randLang);
            }
            else {
                alert("The question is already a fair length. Please do not abuse this button.");
            }
        }
    });

    $( '#next' ).click(function() {
        if(lives === 0) {
            if(currScreen == screen.ANSWER) {
                $( this ).html("New Game");
                var message = 'You ran out of lives! Your score was ' + score + ". ";
                if(score > highScore) {
                    highScore = score;
                    setHighScore();
                    message += "This is a new high score for you! "
                }
                message += "Would you like to play again?"
                $( '#text' ).css("text-align", "center");
                $( '#text' ).html(message);
                currScreen = screen.END;
            }
            else {
                initMenu();
            }
        }
        else {
            $( this ).hide();
            randLang = newQuestion();
            answerText = setAnswerText(randLang);
        }
    });

    for(var i = 0; i < NUM_BUTTONS; i++) {
        $( '#option' + i ).click(function() {
            switch(currScreen) {
                case screen.MENU:
                    currLangPool = getLangPool(this);
                    $( '#next' ).html("Next Question →");
                    $( '#next' ).hide();
                    $( '#next' ).css("text-align", "left");
                    randLang = newQuestion();
                    answerText = setAnswerText(randLang);
                    break;
                case screen.QUESTION:
                    hideButtons();
                    $( '#text-panic' ).hide();
                    if($( this ).text() == LANGS[randLang]['name']) {
                        score += POINTS_PER_QUESTION;
                        setScore();
                        $( '#text' ).html("<p id='answer'>Correct, " + answerText + '.</p>');
                    }
                    else {
                        lives--;
                        setLives();
                        $( '#text' ).html("<p id='answer'>Incorrect, " + answerText + '.</p>');
                    }
                    currScreen = screen.ANSWER;
                    $( '#next' ).show();
                    break;
                case screen.ANSWER:
                    // Option buttons should not be visible here.
                    break;
                case screen.END:
                    // Option buttons should not be visible here.
                    break;
            }
        });
    }
});

function getLangPool(button) {
    return LANGUAGE_POOLS[parseInt($(button).attr("id").substr(-1))];
}

function initMenu() {
    $( '#text-panic' ).hide();
    $( '#next' ).hide();
    $( '#text' ).css('text-align', 'center');
    $( '#text' ).text("Welcome to The Great Language (Text) Game! Select a difficulty to begin.");
    lives = STARTING_LIVES;
    score = 0;
    setLives();
    setScore();
    for(var i = 0; i < NUM_BUTTONS; i++) {
        $( '#option' + i ).html("<p>" + DIFFICULTY_BUTTON_TEXT[i] + "<br>(" + LANGUAGE_POOLS[i].length + " languages)</p>");
    }
    showButtons();
    currScreen = screen.MENU;
}

function setScore() {
    $( '#score' ).html('Score: ' + score);
}

function setLives() {
    $( '#lives' ).html('Lives: ' + lives);
}

function setHighScore() {
    localStorage.setItem('highScore', highScore,toString());
    $( '#high-score' ).html('High Score: ' + highScore);
}

function setAnswerText(randLang) {
    try {
        var randLangName = LANGS[randLang]['name'];
        var langURL = WIKIPEDIA_URL + LANGS[randLang]['link'];
        return 'language was <a href=' + langURL + ">" + randLangName + "</a>";
    }
    catch(err) {
        console.log(randLang);
        return randLang;
    }
}

function hideButtons() {
    for(var i = 0; i < NUM_BUTTONS; i++) {
        $( "#option" + i ).hide();
    }
}

function showButtons() {
    for(var i = 0; i < NUM_BUTTONS; i++) {
        $( "#option" + i ).show();
    }
}

function setButtons(answerLang) {
    var buttonLangs = getButtonLangs(answerLang, NUM_BUTTONS);
    buttonLangs = shuffle(buttonLangs);
    for(var i = 0; i < NUM_BUTTONS; i++) {
        $( "#option" + i ).text(LANGS[buttonLangs[i]]['name']);
    }
}

function getButtonLangs(answerLang, len) {
    var buttonTexts = [answerLang];
    while(buttonTexts.length < len) {
        var randLang = getRandLang();
        if(!buttonTexts.includes(randLang)) {
            buttonTexts.push(randLang);
        }
    }
    return buttonTexts;
}

// Implementation of Fisher-Yates shuffle by 
// https://github.com/Daplie/knuth-shuffle
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
         // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

function newQuestion() {
    $( '#text' ).hide();
    $( '#text' ).css('text-align', 'left');
    currScreen = screen.QUESTION;
    var randLang = getRandLang();
    getWikiText(randLang, 5);
    $( '#text' ).show();
    $( '#text-panic' ).show();
    return randLang;
}

function resetQuestion(randLang) {
    $( '#text' ).hide();
    $( '#text' ).css('text-align', 'left');
    currScreen = screen.QUESTION;
    getWikiText(randLang, 5);
    $( '#text' ).show();
    return randLang;
}

function getRandLang() {
    do {
        var randLang = currLangPool[Math.floor(Math.random() * currLangPool.length)];
    }
    while(BAD_LANGS.includes(randLang));
    return randLang;
}

function getWikiText(language, sentences) {
    var url = "https://" + language + ".wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exsentences=" + sentences + "&format=json&callback=?";
    $.ajax({
        type: "GET",
        url: url,
        contentType: "application/json; charset=utf-16",
        async: false,
        dataType: "json",
        success: function(data) {
            var pages = data.query.pages;
            var article = pages[ Object.keys(pages)[0] ].extract;
            $( '#text' ).html(article.trunc(TEXT_MAX, true));
            setButtons(language);
            showButtons();
            $( '#text' ).show();
            
        }
    });
}

function getJSONFile(url) {
    var returnedData;
    $.ajax({
        type: "GET",
        url: url,
        contentType: "application/json; charset=utf-16",
        async: false,
        dataType: "json",
        success: function(data) {
            console.log("From " + url + ": " + data);
        }
    }).done(function(data) {
        returnedData = data;
    });
    return returnedData;
}

// TODO re-add night mode.
function toggleNightMode() {
    localStorage.setItem('mode', (localStorage.getItem('mode') || 'dark') === 'dark' ? 'light' : 'dark');
    localStorage.getItem('mode') === 'dark' ? document.querySelector('body').classList.add('dark') : document.querySelector('body').classList.remove('dark');
}