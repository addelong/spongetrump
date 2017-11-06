var Twit = require('twit');
var memecanvas = require('memecanvas-prebuilt');
var fs = require('fs');

memecanvas.init('./', '-meme');

var trumpId = "25073877";

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

			var tweetText = tweet.text.toLowerCase();
			tweetText = tweetText.replace(/\n/g, " ");
      tweetText = tweetText.replace(/&amp;/g, "&");
			var tweetWords = tweetText.split(' ');
			var midpoint = Math.ceil(tweetWords.length / 2);
			var topWords = tweetWords.slice(0, midpoint);
			var bottomWords = tweetWords.slice(midpoint);

			topWords = spongeify(topWords).trim();
			bottomWords = spongeify(bottomWords).trim();

			console.log("about to generate meme with topWords ");
			console.log(topWords);
			console.log("and bottom words ");
			console.log(bottomWords);

			memecanvas.generate('./sb.jpg', topWords, bottomWords, function(error, memefilename){
				if(error){
					console.log(error);
				}
				else{
					var b64content = fs.readFileSync('./sb-meme.png', {encoding: 'base64'});
					console.log('successfully generated meme');

					T.post('media/upload', { media_data: b64content }, function (err, data, response) {
		    		if (err){
		      		console.log('ERROR:');
		      		console.log(err);
							fs.unlinkSync('./sb-meme.png');
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

								fs.unlinkSync('./sb-meme.png');
		        	});
		    		}
		  		});
				}
			});
		}
});
