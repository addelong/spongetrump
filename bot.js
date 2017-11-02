var Twit = require('twit');
var memecanvas = require('memecanvas-prebuilt');
var fs = require('fs');

memecanvas.init('./', '-meme');

var T = new Twit({
 consumer_key: process.env.BOT_CONSUMER_KEY,
 consumer_secret: process.env.BOT_CONSUMER_SECRET,
 access_token: process.env.BOT_ACCESS_TOKEN,
 access_token_secret: process.env.BOT_ACCESS_TOKEN_SECRET
});

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

var stream = T.stream('statuses/filter', {follow: 25073877 });
stream.on('tweet', function(tweet) {
	var tweetText = tweet.text.toLowerCase();
	var tweetWords = tweetText.split(' ');
	var midpoint = Math.ceil(tweetWords.length / 2);
	var topWords = tweetWords.slice(0, midpoint);
	var bottomWords = tweetWords.slice(midpoint);

	topWords = spongeify(topWords).trim();
	bottomWords = spongeify(bottomWords).trim();

	memecanvas.generate('./sb.jpg', topWords, bottomWords, function(error, memefilename){
		if(error){
			console.log(error);
		}
		else{
			var b64content = fs.readFileSync('./sb-meme.jpg', {encoding: 'base64'});
			T.post('media/upload', { media_data: b64content }, function (err, data, response) {
    		if (err){
      		console.log('ERROR:');
      		console.log(err);
					fs.unlinkSync('./sb-meme.jpg');
    		}
    		else {
      		T.post('statuses/update', {
        		media_ids: new Array(data.media_id_string)
      		},
        	function(err, data, response) {
          	if (err){
            	console.log('ERROR:');
            	console.log(err);
          	}

						fs.unlinkSync('./sb-meme.jpg');
        	});
    		}
  		});
		}
	});
});
