var score = 0;
var highScore = score;
var lives = STARTING_LIVES;
var onRestartScreen = false;

$( document ).ready(function() {
    if(Cookies.get('highScore') === undefined) {
        Cookies.set('highScore', '0');
    }
    else {
        highScore = parseint(Cookies.get('highScore'));
        $( '#high-score' ).html('High Score: ' + highScore);
        alert(highScore);
    }
    $( '#next').hide();
    var randLang = newQuestion();
    $( '#next' ).click(function() {
        if(lives === 0) {
            if(!onRestartScreen) {
                $( this ).html("New Game");
                var message = 'You ran out of lives! Your score was ' + score + ". ";
                if(score > highScore) {
                    highScore = score;
                    setHighScore();
                    message += "This is a new high score for you! "
                }
                message += "Would you like to play again?"
                $( '#text' ).html(message);
                
                onRestartScreen = true;
            }
            else {
                $( this ).html("Next Question →");
                $( this ).hide();
                onRestartScreen = false;
                score = 0;
                lives = STARTING_LIVES;
                setLives();
                setScore();
                randLang = newQuestion();
            }
        }
        else {
            $( this ).hide();
            randLang = newQuestion();
        }
    });
    for(var i = 0; i < NUM_BUTTONS; i++) {
        $( '#option' + i ).click(function() {
            disableButtons();
            $( '#next' ).show();
            var randLangName = LANGS[randLang]['name']
            var answerText = 'language was ' + randLangName;
            if($( this ).text() == LANGS[randLang]['name']) {
                score += POINTS_PER_QUESTION;
                setScore();
                $( '#text' ).html("<p id='answer'>Correct, " + answerText + '.</p>');
            }
            else {
                lives -= 1;
                setLives();
                $( '#text' ).html("<p id='answer'>Incorrect, " + answerText + '.</p>');
            }
        });
    }
});

function setScore() {
    $( '#score' ).html('Score: ' + score);
}

function setLives() {
    $( '#lives' ).html('Lives: ' + lives);
}

function setHighScore() {
    Cookies.set('highScore', highScore.toString());
    $( '#high-score' ).html('High Score: ' + highScore);
}

function newQuestion() {
    var randLang = getRandLang();
    getWikiArticle(randLang, 2);
    setButtons(randLang);
    enableButtons();
    return randLang;
}

function setButtons(answerLang) {
    var buttonLangs = getButtonLangs(answerLang, NUM_BUTTONS);
    buttonLangs = shuffle(buttonLangs);
    for(var i = 0; i < NUM_BUTTONS; i++) {
        $( "#option" + i ).text(LANGS[buttonLangs[i]]['name']);
    }
}

function disableButtons() {
    for(var i = 0; i < NUM_BUTTONS; i++) {
        //$( "#option" + i ).prop("disabled", true);
        $( "#option" + i ).hide();
    }
}

function enableButtons() {
    for(var i = 0; i < NUM_BUTTONS; i++) {
        //$( "#option" + i ).prop("disabled", false);
        $( "#option" + i ).show();
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

function toggleNightMode() {
    localStorage.setItem('mode', (localStorage.getItem('mode') || 'dark') === 'dark' ? 'light' : 'dark');
    localStorage.getItem('mode') === 'dark' ? document.querySelector('body').classList.add('dark') : document.querySelector('body').classList.remove('dark');
}

function getRandLang() {
    var langCodes = Object.keys(LANGS);
    return langCodes[Math.floor(Math.random() * langCodes.length)];
}

function getWikiArticle(language, sentences) {
    var url = "https://" + language + ".wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exsentences=" + sentences + "&format=json&callback=?";
    $.ajax({
        type: "GET",
        url: url,
        contentType: "application/json; charset=utf-8",
        async: false,
        dataType: "json",
        success: function (data) {
            var pages = data.query.pages;
            var text = pages[ Object.keys(pages)[0] ].extract;
            $( '#text' ).html(text);
            //document.getElementById('text').innerHTML = "<p>" + text + "</p>";
        },
        error: function (errorMessage) {
        }
    });
}