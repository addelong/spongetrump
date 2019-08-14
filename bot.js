var Twit = require('twit');
var memecanvas = require('memecanvas-prebuilt');
var fs = require('fs');

memecanvas.init('./', '-meme');

var trumpId = "25073877";
var MAX_TWEET_LENGTH = 50;
var spongeTrumpUsername = "@RealTrumpBob";
var generatingMemes = false;

var T = new Twit({
 consumer_key: process.env.BOT_CONSUMER_KEY,
 consumer_secret: process.env.BOT_CONSUMER_SECRET,
 access_token: process.env.BOT_ACCESS_TOKEN,
 access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET
});

console.log("memecanvas-prebuilt and twit inited");

function spongeify(words) {
	var caseFlipper = true;
	var res = "";
	for (var i = 0; i < words.length; i++){
		var word = words[i];
		var spongeWord = "";
		for (var j = 0; j < word.length; j++){
			if (caseFlipper){
				spongeWord += word[j].toUpperCase();
			}
			else {
				spongeWord += word[j].toLowerCase();
			}
			caseFlipper = !caseFlipper;
		}
		res = res + spongeWord + " ";
	}
	return res;
}

function sanitizeTweet(tweet){
  var tweetText = "";

  if (tweet.extended_tweet && tweet.extended_tweet.full_text){
    tweetText = tweet.extended_tweet.full_text;
  }
  else {
    tweetText = tweet.text;
  }

  tweetText = tweetText.toLowerCase();
  tweetText = tweetText.replace(/\n/g, " ");
  tweetText = tweetText.replace(/&amp;/g, "&");

  //strip any media link at the end of the tweet
  tweetText = tweetText.replace(/https:\/\/t\.co\/\w+$/g, "");

  return tweetText;
}

function splitLongTweetIfNecessary(tweetText) {
	if (tweetText.length > MAX_TWEET_LENGTH){
		var splitTweets = [];
		var allTweetWords = tweetText.split(' ');

		var separatedTweet = "";
		for (var i = 0; i < allTweetWords.length; i++){
			if (separatedTweet === ""){
				separatedTweet = allTweetWords[i];
			}
			else {
				separatedTweet = separatedTweet + " " + allTweetWords[i];
			}

			if (separatedTweet.length > MAX_TWEET_LENGTH){
				// if there are not enough words for a new tweet, shove em onto this one and return
				if (i > allTweetWords.length - 5){
					for (var y = i + 1; y < allTweetWords.length; y++){
						separatedTweet = separatedTweet + " " + allTweetWords[y];
					}
					splitTweets.push(separatedTweet);
					return splitTweets;
				}
				else {
					splitTweets.push(separatedTweet);
					separatedTweet = "";
				}
			}
		}

		if (separatedTweet.length > 0){
			splitTweets.push(separatedTweet);
		}

		return splitTweets;
	}
	else {
		return [tweetText];
	}
}

var stream = T.stream('statuses/filter', {follow: [trumpId] });

  stream.on('error', function(error) {
    console.log(JSON.stringify(error));
  });

	stream.on('connected', function(response) {
		console.log('connected to stream: ' + JSON.stringify(response));
	});

	stream.on('disconnect', function(response) {
		console.log('disconnected: ' + JSON.stringify(response));
	});

	stream.on('tweet', function(tweet) {
		if (tweet.user.id_str === trumpId){
			console.log('received tweet:');
			console.log(JSON.stringify(tweet));

			var tweetText = sanitizeTweet(tweet);
			var separatedTweets = splitLongTweetIfNecessary(tweetText);
			spinUntilReadyToGenerateForNewTweet(separatedTweets);
		}
});

function spinUntilReadyToGenerateForNewTweet(separatedTweets){
	setTimeout(function(){
		if (generatingMemes){
			spinUntilReadyToGenerateForNewTweet(separatedTweets);
		}
		else {
			generatingMemes = true;
			generateAndTweetSpongeTrump(null, separatedTweets);
		}
	}, 1000);
}

function generateAndTweetSpongeTrump(statusId, separatedTweets) {
	if (separatedTweets.length === 0){
		generatingMemes = false;
		return;
	}

	var tweetWords = separatedTweets.shift().split(' ');
	var midpoint = Math.ceil(tweetWords.length / 2);
	var topWords = tweetWords.slice(0, midpoint);
	var bottomWords = tweetWords.slice(midpoint);
	topWords = spongeify(topWords).trim();
	bottomWords = spongeify(bottomWords).trim();
	console.log("about to generate meme with topWords ");
	console.log(topWords);
	console.log("and bottom words ");
	console.log(bottomWords);
	memecanvas.generate('./sb.jpg', topWords, bottomWords, function (error, memefilename) {
		if (error) {
			console.log(error);
		}
		else {
			var b64content = fs.readFileSync('./sb-meme.png', { encoding: 'base64' });
			console.log('successfully generated meme');
			T.post('media/upload', { media_data: b64content }, function (err, data, response) {
				if (err) {
					console.log('ERROR:');
					console.log(err);
					fs.unlinkSync('./sb-meme.png');
				}
				else {
					var params = {
						media_ids: new Array(data.media_id_string)
					};

					if (statusId){
						params["status"] = spongeTrumpUsername;
						params["in_reply_to_status_id"] = statusId;
					}

					T.post('statuses/update', params, function (err, data, response) {
						if (err) {
							console.log('ERROR:');
							console.log(err);
						}
						fs.unlinkSync('./sb-meme.png');

						generateAndTweetSpongeTrump(data.id_str, separatedTweets);
					});
				}
			});
		}
	});
}

