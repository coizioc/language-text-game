const getConsts = async function() {
    let consts = {}

    consts.POINTS_PER_QUESTION = 100;
    consts.NUM_BUTTONS = 5;
    consts.STARTING_LIVES = 3;
    consts.TEXT_MIN = 50;
    consts.TEXT_MAX = 500;

    consts.LANGS = languages

    consts.WIKIPEDIA_URL = "https://en.wikipedia.org";
    consts.EASY_LANGS = ["zh", "es", "en", "hi", "ar", "pt", "fr", "ru", "ja", "de"];
    consts.MED_LANGS = ["bn", "pa", "jv", "id", "te", "vi", "ko", "tr", "it", "th", "nl", "pl", "tl", "ga", "da", "el", "he", "fi"].concat(consts.EASY_LANGS);
    consts.HARD_LANGS = ["mr", "ta", "ur", "gu", "fa", "ps", "kn", "ml", "su", "ha", "or", "my", "uk", "bh",
                        "yo", "mai", "uz", "sd", "am", "ff", "ro", "om", "ig", "az", "ceb", "no", "sw", "eo", "la", "et", "lv", "lt"].concat(consts.MED_LANGS);
    consts.VERY_HARD_LANGS = ["ku", "sh", "mg", "ne", "si", "zh", "km", "tk", "as", "so", "hu", "ny", "ak",
                            "kk", "zu", "cs", "rw", "ht", "ilo", "qu", "rn", "sn", "ug", "xh", "be", "bal", "gom", "eu", "haw", "cy"].concat(consts.HARD_LANGS);
    consts.DIFFICULTY_BUTTON_TEXT = ["Easy", "Medium", "Hard", "Very Hard", "Master"];
    consts.BAD_LANGS = ["bal", "khw", "bgn"]; // Languages that don't work.

    consts.LANGUAGE_POOLS = [
        consts.EASY_LANGS,
        consts.MED_LANGS,
        consts.HARD_LANGS,
        consts.VERY_HARD_LANGS,
        Object.keys(consts.LANGS)
    ];

    return consts;
}

const screen = {
    MENU: 1,
    QUESTION: 2,
    ANSWER: 3,
    END: 4
};
