String.prototype.trunc = function(n, useWordBoundary) {
    if (this.length <= n) {
        return this;
    }
    var subString = this.substr(0, n-1);
    if(useWordBoundary) {
        if(subString.lastIndexOf(' ') != -1) {
            return subString.substr(0, subString.lastIndexOf(' ')) + "&hellip;";
        }
    }
    return substring + "&hellip;";
};

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

const main = async function() {
    const consts = await getConsts();
    var score = 0;
    var highScore = score;
    var lives = consts.STARTING_LIVES;
    var currScreen = screen.MENU;
    var currLangPool = consts.EASY_LANGS;

    function initMenu() {
        $('#next').hide();
        $('#text').css('text-align', 'center');
        $('#text').text("Welcome to The Great Language (Text) Game! Select a difficulty to begin.");
        lives = consts.STARTING_LIVES;
        score = 0;
        setLives();
        setScore();
        for(var i = 0; i < consts.NUM_BUTTONS; i++) {
            $(`#option${i}`).html(`
                <p>
                    ${consts.DIFFICULTY_BUTTON_TEXT[i]}
                    <br>
                    (${consts.LANGUAGE_POOLS[i].length} languages)
                </p>`
            );
        }
        showButtons();
        currScreen = screen.MENU;
    }

    /* UI functions */

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

    /* Button functions */

    function hideButtons() {
        for(var i = 0; i < consts.NUM_BUTTONS; i++) {
            $("#option" + i).hide();
        }
    }

    function showButtons() {
        for(var i = 0; i < consts.NUM_BUTTONS; i++) {
            $("#option" + i).show();
        }
    }

    function setButtons(answerLang) {
        var buttonLangs = getButtonLangs(answerLang, consts.NUM_BUTTONS);
        buttonLangs = shuffle(buttonLangs);
        for(var i = 0; i < consts.NUM_BUTTONS; i++) {
            $("#option" + i).text(consts.LANGS[buttonLangs[i]]['name']);
        }
    }

    /* Question functions */

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

    function getLangPool(button) {
        return consts.LANGUAGE_POOLS[parseInt($(button).attr("id").substr(-1))];
    }

    function getRandLang() {
        do {
            var randLang = currLangPool[Math.floor(Math.random() * currLangPool.length)];
        } while(consts.BAD_LANGS.includes(randLang));
        return randLang;
    }

    async function getWikiText(language, sentences) {
        let url = `https://${language}.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&exsentences=${sentences}&format=json&callback=?`;
        while(true) {
            let data = await $.getJSON(url);
            let pages = data.query.pages;
            let article = pages[Object.keys(pages)[0]].extract;
            if(article.length < consts.TEXT_MIN) {
                continue;
            }
            $('#text').html(article.trunc(consts.TEXT_MAX, true));
            setButtons(language);
            showButtons();
            $('#text').show();
            break;
        }
    }

    function newQuestion() {
        $( '#text' ).hide();
        $( '#text' ).css('text-align', 'left');
        currScreen = screen.QUESTION;
        var randLang = getRandLang();
        getWikiText(randLang, 5);
        $( '#text' ).show();
        return randLang;
    }

    function setAnswerText(randLang) {
        try {
            var randLangName = consts.LANGS[randLang]['name'];
            var langURL = consts.WIKIPEDIA_URL + consts.LANGS[randLang]['link'];
            return `language was <a href=${langURL}>${randLangName}</a>`;
        }
        catch(err) {
            console.log(randLang);
            return randLang;
        }
    }

    $(document).ready(function() {
        if(localStorage.getItem("highScore") === null) {
            localStorage.setItem("highScore", "0");
        } else {
            highScore = parseInt(localStorage.getItem("highScore"));
            $('#high-score').html(`High Score: ${highScore}`);
        }

        var randLang;
        var answerText;
        initMenu();

        $('#next').click(function() {
            if(lives === 0) {
                if(currScreen === screen.ANSWER) {
                    $(this).html("New Game");
                    var message = `You ran out of lives! Your score was ${score}. `;
                    if(score > highScore) {
                        highScore = score;
                        setHighScore();
                        message += "This is a new high score for you! "
                    }
                    message += "Would you like to play again?"
                    $('#text').css("text-align", "center");
                    $('#text').html(message);
                    currScreen = screen.END;
                }
                else {
                    initMenu();
                }
            }
            else {
                $(this).hide();
                randLang = newQuestion();
                answerText = setAnswerText(randLang);
            }
        });

        for(let i = 0; i < consts.NUM_BUTTONS; i++) {
            $('#option' + i).click(function() {
                switch(currScreen) {
                    case screen.MENU:
                        currLangPool = getLangPool(this);
                        $('#next').html("Next Question →");
                        $('#next').hide();
                        $('#next').css("text-align", "left");
                        randLang = newQuestion();
                        answerText = setAnswerText(randLang);
                        break;
                    case screen.QUESTION:
                        hideButtons();
                        if($(this).text() === consts.LANGS[randLang]['name']) {
                            score += consts.POINTS_PER_QUESTION;
                            setScore();
                            $('#text').html(`
                                <p id='answer'>
                                    Correct, ${answerText}.
                                </p>
                            `);
                        }
                        else {
                            lives--;
                            setLives();
                            $('#text').html(`
                                <p id='answer'>
                                    Incorrect, ${answerText}.
                                </p>
                            `);
                        }
                        currScreen = screen.ANSWER;
                        $('#next').show();
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
}

main();