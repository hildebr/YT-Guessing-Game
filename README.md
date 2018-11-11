## YouTube Guessing Game (Verflixxte Klixx)

### Basic rules
+ Two players guess the view count of random YouTube videos
+ The player with the more accurate guess will score points
+ Checkboxes allow players to apply multipliers and flat extra points in each round,
either randomly or based on self-enforced rules (i.e. videos with animals score an extra point)
+ Bonus rules can stack, applying the flat bonus points before multiplying
+ Each player can use the _fishcard_ once per game. If he manages to score with an active _fishcard_,
he will double the points he would have normally gotten that round
+ The _fishcard_ also stacks with bonus rules
+ The player who obtained the most points wins the game

### Point distribution
#### 1) Classic mode
+ Each video grants a single point by default for the correct guesser
+ A perfect guess will instead convert the current video's view count into points
+ The _fishcard_ can double perfect guesses as well, but no other flat or multiplicative bonuses will apply

#### 2) Redux mode
+ Varies the default point value of a video based on how good of a guess was made
+ The scoring player can earn up to 10 points per video depending on
how close their guess was to the actual view count
+ Bonus points and the _fishcard_ offer higher rewards than they do in classic mode

### About This Implementation
In order to play you need a YouTube playlist containing the videos for which
the view count shall be guessed. A future release will include the option to fetch
random YouTube videos to guess as an alternative to using a pre-made playlist.

Additionally, a YouTube API key is required. This key is used to fetch videos
and their view counts. Please insert your personal API key at the top of the
__script.js__ file. If you don't have a key yet, follow [these instructions](https://www.slickremix.com/docs/get-api-key-for-youtube/) to
generate it.