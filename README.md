## YouTube Guessing Game (Verflixxte Klixx)

### Basic rules
+ Two players guess the view count of YouTube videos
+ The player with the more accurate guess will score points
+ Input fields allow players to add flat points and/or a multiplier in each round
+ Players may apply these bonuses randomly or stick to self-enforced rules
(i.e. videos containing animals score four extra points)
+ Flat bonus and a multiplier can both be used in a single round (flat bonus applies first)
+ Each player can use their _fishcard_ once per game. If they manages to score with an active _fishcard_,
they will double the points he would have normally gotten that round
+ The _fishcard_ also stacks with flat bonus and multiplier
+ The player who obtained the most points wins the game

### Point distribution
#### 1) Classic mode
+ Each video grants a single point by default
+ If a player guesses the exact view count of a video, he will instead gain that view count as points
+ Exact guesses can also be improved through flat bonus, multiplier and _fishcard_

#### 2) Redux mode
+ Each video grants between 1 to 10 points based on the accuracy of a player's guess
+ As oppose to the classic mode, exact guesses do not yield additional points

### About This Implementation
In order to play you need a YouTube playlist containing the videos for which
the view count shall be guessed. A future release will include the option to fetch
random YouTube videos to guess as an alternative to using a pre-made playlist.

Additionally, a YouTube API key is required. This key is used to fetch videos
and their view counts. Please insert your personal API key at the top of the
__script.js__ file. If you don't have a key yet, follow [these instructions](https://www.slickremix.com/docs/get-api-key-for-youtube/) to
generate it.

### Known Issues

When starting a new game, the popup used to define playlist ID and game mode
cannot be committed with the _ENTER_ key. Use the designated _OK_ button instead.