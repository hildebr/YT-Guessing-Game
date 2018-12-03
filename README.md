## YouTube Guessing Game (Verflixxte Klixx)

##### Disclaimer
The UI of this game uses hard-coded sizes that look best in 1080p resolution. If you run any other resolution,
feel free to edit __index.html__ for a better experience.

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

### Requirements

+ A YouTube API key is required in order to fetch videos and their view counts. If you don't have a key yet, 
follow [these instructions](https://www.slickremix.com/docs/get-api-key-for-youtube/) to
generate a new one.
+ If you are not using a preexisting YouTube playlist to guess view counts, an API key for https://randomyoutube.net/ 
is required to generate random video IDs. Follow the instructions on that page to generate a key.
+ Please insert API keys into the appropriate variables at the top of the __script.js__ file.
+ Additionally, you need to enable CORS on your server in order to run certain API requests. If you are simply running this project in Chrome,
add [this extension](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi/related?hl=en) to your browser.