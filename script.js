// Set this value to your personal API key in order to make requests to the YouTube API.
let API_KEY = "";

/**
 * {boolean} Describes, whether the current game uses the classic ruleset.
 */
var usesClassicRules;

/**
 * {array} Holds all video IDs of the loaded playlist.
 */
var videoIds;

/**
 * {number} The index of {@link videoIds} for the currently active video.
 */
var currentVideoIndex;

/**
 * {number} The current score for player 1.
 */
var player1Score;

/**
 * {number} The current score for player 2.
 */
var player2Score;

// jQuery variables
let $newGame = $('#newGame');
let $videoPlayer = $('#videoPlayer');
let $previousVideo = $("#previousVideo");
let $nextVideo = $("#nextVideo");
let $showResult = $('#showResult');
let $logger = $('#logger');
let $germanBonus = $('#germanBonus');
let $phoneBonus = $('#phoneBonus');
let $timecodeBonus = $('#timecodeBonus');
let $player1Fish = $('#player1Fish');
let $player2Fish = $('#player2Fish');
let $player1Input = $('#player1Input');
let $player2Input = $('#player2Input');
let $player1Score = $('#player1Score');
let $player2Score = $('#player2Score');

// button click behavior
$newGame.click(newGamePopup);
$previousVideo.click(previousVideo);
$nextVideo.click(nextVideo);
$showResult.click(showResult);
$player1Fish.click(toggleFish);
$player2Fish.click(toggleFish);

/**
 * Creates a popup for the user to set parameters for a new game.
 */
function newGamePopup() {
    if (API_KEY === "") {
        bootbox.alert("No YouTube API key provided. Please navigate to the 'script.js' and insert your key into the 'API_KEY' variable. If you don't have a key yet, follow the instructions at https://www.slickremix.com/docs/get-api-key-for-youtube/");
        return;
    }

    bootbox.confirm({
        message: "<form id='newGameForm' action=''>\
    Playlist ID: <input type='text' name='playlistID' size='35' value='PL3XavGDgTyT2jiNySCwNBh6Xl04ZvPqfV'/><br/>\
    Classic ruleset: <input type='checkbox' name='classicRules'/>\
    </form>",
        callback: function (result) {
            if (result) {
                let newGameParams = $('#newGameForm').serializeArray().reduce(function (obj, item) {
                    obj[item.name] = item.value;
                    return obj;
                }, {});
                initGame(newGameParams);
            }
        }
    });
}

/**
 * Resets all variables and starts a new game.
 *
 * @param {json} newGameParams Contains all new game options that users can specify.
 */
function initGame(newGameParams) {
    logInfo("Initializing a new game...")

    // reset dynamic variables
    videoIds = [];
    currentVideoIndex = 0;
    player1Score = 0;
    player2Score = 0;
    $player1Input.val('');
    $player2Input.val('');
    $player1Score.text(0);
    $player2Score.text(0);
    usesClassicRules = false;

    // reset buttons
    $previousVideo.prop("disabled", false);
    $showResult.prop("disabled", false);
    $nextVideo.prop("disabled", false);
    $timecodeBonus.prop("disabled", false);
    $germanBonus.prop("disabled", false);
    $phoneBonus.prop("disabled", false);
    $player1Fish.prop("disabled", false);
    $player2Fish.prop("disabled", false);
    $player1Input.prop("disabled", false);
    $player2Input.prop("disabled", false);

    loadPlaylist(newGameParams['playlistID'], null);
    if (videoIds.length === 0) {
        logInfo("Unable to start a new game: The given playlist ID is invalid.");
        return;
    }

    logInfo("Playlist found! Game ready with " + videoIds.length + " available videos.");
    embedVideo(videoIds[0]);

    if (newGameParams['classicRules'] === 'on') {
        usesClassicRules = true;
    }
}

/**
 * Sends a GET request to the YouTube playlist API. If successful, the video IDs contained in the response will be
 * added to {@link videoIds}. If the response has a {@code nextPageToken}, it will be used in a recursive call
 * in order to load the IDs of every other page of the playlist.
 *
 * @param playlistId A string that is a YouTube playlist ID.
 * @param pageToken  An integer that defines which page will be requested. If null, page 1 will be requested.
 */
function loadPlaylist(playlistId, pageToken) {
    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/playlistItems',
        dataType: 'json',
        async: false,
        data: {
            part: 'snippet',
            playlistId: playlistId,
            key: API_KEY,
            pageToken: pageToken,
            maxResults: 50
        },
        success: function (data) {
            $.each(data.items, function (i, item) {
                videoIds.push(item.snippet.resourceId.videoId);
            });

            let nextPageToken = data.nextPageToken;
            if (nextPageToken != null) {
                loadPlaylist(playlistId, nextPageToken);
            }
        }
    });
}

/**
 * Loads the previous playlist video into the embedded player.
 */
function previousVideo() {
    if (currentVideoIndex === 0) {
        logInfo("Can't load previous video: Already playing the first video.");
        return;
    }

    embedVideo(videoIds[--currentVideoIndex]);
    $showResult.prop("disabled", false);
    $timecodeBonus.prop('checked', false);
    $germanBonus.prop('checked', false);
    $phoneBonus.prop('checked', false);
    $player1Input.val('');
    $player2Input.val('');
}

/**
 * Loads the next playlist video into the embedded player.
 */
function nextVideo() {
    if (currentVideoIndex === videoIds.length - 1) {
        logInfo("Can't load next video: Already playing the last video.");
        return;
    }

    embedVideo(videoIds[++currentVideoIndex]);
    $showResult.prop('disabled', false);
    $timecodeBonus.prop('checked', false);
    $germanBonus.prop('checked', false);
    $phoneBonus.prop('checked', false);
    $player1Input.val('');
    $player2Input.val('');
}

/**
 * Shows the result for the current round and calculates points for the winner.
 */
function showResult() {
    let player1InputVal = parseInt($player1Input.val());
    let player2InputVal = parseInt($player2Input.val());

    if (isNaN(player1InputVal)) {
        logInfo("Guess of Player 1 is not a number.");
        return;
    }

    if (isNaN(player2InputVal)) {
        logInfo("Guess of Player 2 is not a number.");
        return;
    }

    if (player1InputVal === player2InputVal) {
        logInfo("Players mustn't make the same guess!");
        return;
    }

    let currentId = videoIds[currentVideoIndex];

    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/videos',
        dataType: 'json',
        async: false,
        data: {
            part: 'statistics',
            id: currentId,
            key: API_KEY,
        },
        success: function (data) {
            let viewCount = parseFloat(data.items[0].statistics.viewCount);
            var viewCountLocaled = viewCount.toLocaleString('en');
            logInfo("Video with ID '" + currentId + "' has " + viewCountLocaled + " Views.");

            let player1Diff = Math.abs(player1InputVal - viewCount);
            let player2Diff = Math.abs(player2InputVal - viewCount);

            if (player1Diff === 0 || player2Diff === 0) {
                logInfo("Direct hit!!!");
                if (player1Diff === 0) {
                    scorePlayer1(viewCount);
                } else {
                    scorePlayer2(viewCount);
                }
            } else if (player1Diff < player2Diff) {
                scorePlayer1(calculatePoints(player1InputVal, viewCount));
            } else if (player1Diff > player2Diff) {
                scorePlayer2(calculatePoints(player2InputVal, viewCount));
            } else {
                logInfo("It's a draw! No points awarded.");
            }

            $showResult.prop('disabled', true);
            if ($player1Fish.hasClass('fishActive')) {
                $player1Fish.removeClass('fishActive');
                $player1Fish.prop('disabled', true);
            }

            if ($player2Fish.hasClass('fishActive')) {
                $player2Fish.removeClass('fishActive');
                $player2Fish.prop('disabled', true);
            }
        }
    });
}

/**
 * Increases the score of player 1.
 *
 * @param pointsToAdd An integer that is the score to be added. Will be doubled, if FISHCARD is active.
 */
function scorePlayer1(pointsToAdd) {
    if ($player1Fish.hasClass("fishActive")) {
        pointsToAdd *= 2;
    }

    logInfo("Player 1 scores " + pointsToAdd + " point(s)!")
    player1Score += pointsToAdd
    $player1Score.text(player1Score);
}

/**
 * Increases the score of player 2.
 *
 * @param pointsToAdd A number that is the score to be added. Will be doubled, if FISHCARD is active.
 */

function scorePlayer2(pointsToAdd) {
    if ($player2Fish.hasClass("fishActive")) {
        pointsToAdd *= 2;
    }

    logInfo("Player 2 scores " + pointsToAdd + " point(s)!")
    player2Score += pointsToAdd
    $player2Score.text(player2Score);
}

/**
 * Calculates, how many points the video is worth.
 *
 * @param {number} playerGuess How far the scoring player was away from the actual view count.
 * @param {number} viewCount The view count of the current video.
 * @returns {number} The calculated score.
 */
function calculatePoints(playerGuess, viewCount) {
    if (usesClassicRules) {
        return calculateClassic();
    }

    return calculateRedux(playerGuess, viewCount);
}

/**
 * Calculates points based on the classic ruleset.
 *
 * @return {number} The points to add.
 */
function calculateClassic() {
    var points = 1;

    if ($timecodeBonus.prop("checked")) {
        points += 1;
    }
    if ($germanBonus.prop("checked")) {
        points += 2;
    }
    if ($phoneBonus.prop("checked")) {
        points *= 2;
    }

    return points;
}

/**
 * Calculates points based on the new ruleset.
 *
 * @param {number} playerGuess The guessing distance to the actual view count.
 * @param {number} viewCount The actual view count.
 * @return {number} The points to add.
 */
function calculateRedux(playerGuess, viewCount) {
    var guessToViewsRatio = playerGuess / viewCount;
    if (guessToViewsRatio > 1) {
        guessToViewsRatio = viewCount / playerGuess;
    }

    var pointsToAdd = guessToViewsRatio * 10;
    pointsToAdd = Math.round(pointsToAdd);
    pointsToAdd = Math.max(pointsToAdd, 1)

    return pointsToAdd;
}

/**
 * Toggles, whether the target inside the given event holds the class 'fishActive'.
 * The class 'fishActive' has a custom background color to highlight clicked elements.
 *
 * @param clickEvent A jQuery click event that holds a FISHCARD button as its target.
 */
function toggleFish(clickEvent) {
    var fishButton = clickEvent.target;
    if (fishButton.classList.contains("fishActive")) {
        fishButton.classList.remove("fishActive");
    } else {
        fishButton.classList.add("fishActive")
    }
}

/**
 * Embeds the given video ID into the video player iframe.
 *
 * @param videoId A string that is a YouTube video ID.
 */
function embedVideo(videoId) {
    $videoPlayer.attr("src", "https://www.youtube.com/embed/" + videoId);
    logInfo("Video " + (currentVideoIndex + 1) + " loaded successfully.");
}

/**
 * Adds 'toBeLogged' at the top of the info-log.
 *
 * @param toBeLogged A string message that is useful for the players.
 */
function logInfo(toBeLogged) {
    $logger.text(toBeLogged + " \n" + $logger.text());
}
