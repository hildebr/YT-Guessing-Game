/**
 * This key is required.
 */
let YOUTUBE_API = '';

/**
 * This key is required, if you aren't using a preexisting playlist.
 */
let RANDOM_API = '';

/**
 * {boolean} A flag that determines how many points are awarded.
 */
var useReduxRules;

/**
 * {array} Holds YouTube video IDs. They will be used to load their corresponding videos to guess their view counts.
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

// jQuery references
let $newGame = $('#newGame');
let $videoPlayer = $('#videoPlayer');
let $nextVideo = $("#nextVideo");
let $skipVideo = $("#skipVideo");
let $showResult = $('#showResult');
let $logger = $('#logger');
let $flat = $('#flat');
let $multi = $('#multi');
let $player1Fish = $('#player1Fish');
let $player2Fish = $('#player2Fish');
let $player1Input = $('#player1Input');
let $player2Input = $('#player2Input');
let $player1Score = $('#player1Score');
let $player2Score = $('#player2Score');

// button click behavior
$newGame.click(newGamePopup);
$nextVideo.click(nextVideo);
$skipVideo.click(nextVideo);
$showResult.click(showResult);
$player1Fish.click(toggleFish);
$player2Fish.click(toggleFish);

/**
 * Creates a popup for the user to set parameters for a new game. These parameters will be given to {@link initGame}
 * to initialize a new game.
 */
function newGamePopup() {
    if (YOUTUBE_API === "") {
        alert("<b>Unable to start a new game:</b> No YouTube API key provided. Please follow the instructions in the README file.");
        return;
    }

    bootbox.confirm({
        message: "Playlist ID (leave this field empty to fetch random videos): <br> \
                  <input type='text' id='playlistID' size='35'/><br>\
                  Ruleset: <br>\
                  <input type='radio' id='rules' name='rules' value='classic' checked> Classic \
                  <input type='radio' id='rules' name='rules' value='redux'> Redux",
        callback: function (okPressed) {
            if (okPressed) {
                initGame($('#playlistID').val(), $('#rules').val() === 'redux');
            }
        }
    });
}

/**
 * Resets all variables and starts a new game with the given parameters.
 *
 * @param {string} playlistID Specifies which playlist will be loaded.
 * @param {boolean} isRedux   Specifies, whether the redux game mode was chosen.
 */
function initGame(playlistID, isRedux) {
    // reset dynamic variables
    $logger.text('');
    videoIds = [];
    currentVideoIndex = 0;
    player1Score = 0;
    player2Score = 0;
    $player1Score.text(0);
    $player2Score.text(0);
    $player1Input.val('');
    $player2Input.val('');
    useReduxRules = isRedux;

    // reset buttons to default state
    $showResult.prop("disabled", false);
    $skipVideo.prop("disabled", false);
    $flat.prop("disabled", false);
    $multi.prop("disabled", false);
    $player1Fish.prop("disabled", false);
    $player2Fish.prop("disabled", false);
    $player1Input.prop("disabled", false);
    $player2Input.prop("disabled", false);

    logInfo("Initializing a new game...");
    if (playlistID === '') {
        loadRandomVideos();
    } else {
        loadPlaylist(playlistID, null);
    }
    // If no videos were loaded, the GET request failed.
    if (videoIds.length === 0) {
        // Error handling should be done in the #loadPlaylist function, so we just return at this point.
        return;
    }

    logInfo("Playlist found! Game ready with " + videoIds.length + " available videos.");
    embedVideo(videoIds[0]);
}

/**
 * Sends a GET request to the YouTube playlist API. If the given playlist ID is valid, its contained videos will be
 * stored in {@link videoIds}.
 *
 * If the API response has a {@code nextPageToken}, it will be used in a recursive call in order to load the IDs of
 * every other page of the playlist.
 *
 * @param {string} playlistId A string that should be a valid YouTube playlist ID.
 * @param {number} pageToken  An integer that defines which page will be requested. If null, page 1 will be requested.
 */
function loadPlaylist(playlistId, pageToken) {
    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/playlistItems',
        dataType: 'json',
        async: false,
        data: {
            part: 'snippet',
            playlistId: playlistId,
            key: YOUTUBE_API,
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
        },
        error: function (data) {
            let statusCode = data.status;
            var errorMessage = "Error: YouTube API request returned status code <b>" + statusCode + "</b>.<br>";

            switch (statusCode) {
                case 400:
                    errorMessage += "Make sure your YouTube API key is valid.";
                    break;
                case 404:
                    errorMessage += "Make sure your playlist ID is valid.";
                    break;
                default:
                    errorMessage += "I haven't encountered this code in my testing, please submit a bug report.";
            }

            alert(errorMessage);
        }
    });
}

/**
 * Sends 10 GET requests to the random youtube API to fetch random video IDs and insert them into {@link videoIds}.
 */
function loadRandomVideos() {
    for (let i = 0; i < 10; i++) {
        $.ajax({
            method: 'GET',
            url: 'https://randomyoutube.net/api/getvid',
            dataType: 'json',
            async: false,
            crossDomain: true,
            data: {
                api_token: RANDOM_API,
            },
            success: function (data) {
                videoIds.push(data['vid']);
            }
        });
    }
}

/**
 * Loads the next video into the embedded player.
 */
function nextVideo() {
    if (currentVideoIndex === videoIds.length - 1) {
        alert("You've reached the last video. Thanks for playing!");
        return;
    }

    embedVideo(videoIds[++currentVideoIndex]);

    // reset UI for a new round
    $showResult.prop('disabled', false);
    $nextVideo.prop('disabled', true);
    $flat.val('');
    $multi.val('');
    $player1Input.val('');
    $player2Input.val('');
}

/**
 * Shows the result for the current round and calculates points for the winner.
 */
function showResult() {
    var flatValue = $flat.val();
    if (flatValue !== "" && isNaN(parseInt(flatValue))) {
        alert("The flat bonus input field does not contain a valid number.");
        return;
    }
    var multiValue = $multi.val();
    if (multiValue !== "" && isNaN(parseInt(multiValue))) {
        alert("The multiplier input field does not contain a valid number.");
        return;
    }

    let player1InputVal = parseInt($player1Input.val());
    if (isNaN(player1InputVal)) {
        alert("Guess of Player 1 is not a valid number.");
        return;
    }

    let player2InputVal = parseInt($player2Input.val());
    if (isNaN(player2InputVal)) {
        alert("Guess of Player 2 is not a valid number.");
        return;
    }

    if (player1InputVal === player2InputVal) {
        alert("Players mustn't make the same guess!");
        return;
    }

    $.ajax({
        url: 'https://www.googleapis.com/youtube/v3/videos',
        dataType: 'json',
        async: false,
        data: {
            part: 'statistics',
            id: videoIds[currentVideoIndex],
            key: YOUTUBE_API,
        },
        success: function (data) {
            let viewCount = parseFloat(data.items[0].statistics.viewCount);
            logInfo("The current video has <b>" + viewCount.toLocaleString('en') + "</b> views.");

            let player1Diff = Math.abs(player1InputVal - viewCount);
            let player2Diff = Math.abs(player2InputVal - viewCount);

            if (player1Diff <= player2Diff) {
                scorePlayer1(player1InputVal, viewCount);
            }
            if (player2Diff <= player1Diff) {
                scorePlayer2(player2InputVal, viewCount);
            }

            $showResult.prop('disabled', true);
            $nextVideo.prop('disabled', false);
        }
    });
}

/**
 * Increases the score of player 1.
 *
 *  @param {number} inputVal  The guess of player 1.
 *  @param {number} viewCount The view count of the current video.
 */
function scorePlayer1(inputVal, viewCount) {
    var pointsToAdd = calculatePoints(inputVal, viewCount);

    if ($player1Fish.hasClass("fishActive")) {
        pointsToAdd *= 2;
        $player1Fish.removeClass('fishActive');
        $player1Fish.prop('disabled', true);
    }

    logInfo("Player 1 scores <b>" + pointsToAdd + "</b> point(s)!");
    player1Score += pointsToAdd;
    $player1Score.text(player1Score);
}

/**
 * Increases the score of player 2.
 *
 *  @param {number} inputVal  The guess of player 2.
 *  @param {number} viewCount The view count of the current video.
 */
function scorePlayer2(inputVal, viewCount) {
    var pointsToAdd = calculatePoints(inputVal, viewCount);

    if ($player2Fish.hasClass("fishActive")) {
        pointsToAdd *= 2;
        $player2Fish.removeClass('fishActive');
        $player2Fish.prop('disabled', true);
    }

    logInfo("Player 2 scores <b>" + pointsToAdd + "</b> point(s)!");
    player2Score += pointsToAdd;
    $player2Score.text(player2Score);
}

/**
 * Calculates how many points the current video will grant.
 *
 *  @param {number} inputVal  The guess of a player.
 *  @param {number} viewCount The view count of the current video.
 *  @return {number} The calculated score.
 */
function calculatePoints(inputVal, viewCount) {
    var pointsToAdd;
    if (useReduxRules) {
        pointsToAdd = calculateReduxValue(inputVal, viewCount);
    } else if (inputVal === viewCount) {
        pointsToAdd = viewCount;
    } else {
        pointsToAdd = 1;
    }

    var flatBonus = $flat.val();
    if (flatBonus !== "") {
        pointsToAdd += parseInt(flatBonus);
    }
    var multiBonus = $multi.val();
    if (multiBonus !== "") {
        pointsToAdd *= parseInt(multiBonus);
    }

    return pointsToAdd;
}

/**
 * Calculates the worth of a video based on the accuracy of the player.
 *
 *  @param {number} inputVal  The guess of a player.
 *  @param {number} viewCount The view count of the current video.
 *  @return {number} The calculated worth.
 */
function calculateReduxValue(inputVal, viewCount) {
    let accuracy;
    if (inputVal <= viewCount) {
        accuracy = inputVal / viewCount;
    } else {
        accuracy = viewCount / inputVal;
    }

    // multiply the accuracy with the maximum amount of points for the worth of the video
    var pointsToAdd = accuracy * 10;
    // make sure the value is a natural number
    pointsToAdd = Math.round(pointsToAdd);
    // make sure at least one point is awarded
    pointsToAdd = Math.max(pointsToAdd, 1);

    return pointsToAdd;
}

/**
 * Toggles, whether the target inside the given event holds the class 'fishActive'.
 * The class 'fishActive' has a custom background color to highlight clicked elements.
 *
 * @param clickEvent A jQuery click event that holds a player's fishcard button as its target.
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
 * @param {string} videoId The video ID to embed.
 */
function embedVideo(videoId) {
    $videoPlayer.attr("src", "https://www.youtube.com/embed/" + videoId);
    logInfo("Video " + (currentVideoIndex + 1) + " loaded successfully.");
}

/**
 * Adds the given string at the top of the logger div.
 *
 * @param {string} toBeLogged The string to be displayed in the logger area.
 */
function logInfo(toBeLogged) {
    $logger.html(toBeLogged + " \n" + $logger.html());
}

/**
 * Alerts the user with the given string.
 *
 * @param {string} message The message to display as an alert.
 */
function alert(message) {
    bootbox.alert(message);
}