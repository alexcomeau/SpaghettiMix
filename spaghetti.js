var Twit = require("twit");

var T = new Twit({
	consumer_key: '',
	consumer_secret: '',
	access_token: '',
	access_token_secret: '',
	timeout_ms: 60*1000,
});

// Put the username of the person you want to tweet at here
var targetUser = 0;
// Put the screen name of that person here
var screenName = "example";

var lastTweet = 0;

function doStuff()
{
	// Get a bunch of tweets
	T.get("statuses/user_timeline", {user_id: targetUser, 
						count: 20, 
						exclude_replies: true,
						include_rts: false}, 
						function(err, data, response){ checkTweets(data);});
	
}

function checkTweets(data)
{
	var tweets = data;
	
	// If there is a new tweet...
	if(tweets[0].id !== lastTweet)
	{
		lastTweet = tweets[0].id;
		// Unescape the text
		tweets[0].text = tweets[0].text.replace(/&amp;/g, "&")
										.replace(/&lt;/g, "<")
										.replace(/&gt;/g, ">")
										.replace(/&quot;/g, "\"")
										.replace(/&#039;/g, "'");
		var words = tweets[0].text.split(" ");
		var usableWords = [];
		
		console.log("Words: ", words);
		
		// Filter for actual words
		for(var i = 0; i < words.length; i++)
		{
			if(!words[i].substring(0,1).match(/[#@]/) 	// Not a tag or user
			   && !words[i].match(/.+\..+/) 			// Not a url
			   && !words[i].match(/^[0-9]+$/) 			// Not a number
			   && words[i].match(/[A-Z]+/i)) 			// Has letters
				usableWords.push(words[i]);
		}
		
		console.log("Usable words: ", usableWords);
		
		if(usableWords.length > 0)
		{
			// Pick one at random
			var toReplace = usableWords[Math.floor(Math.random() * usableWords.length)];
			var result;
			var replacement;
			
			// Cut off the punctuation from the beginning and end
			var toReplace = toReplace.replace(/^[^a-z]+|[^a-z]+$/gi, "");
			
			// Check for caps
			if(toReplace.match(/^[A-Z]+&/))
				replacement = "SPAGHETTI";
			else if(toReplace.substring(0,1).match(/[A-Z]/))
				replacement = "Spaghetti";
			else
				replacement = "spaghetti";
			
			console.log("ToReplace: " + toReplace + "; Replacement: " + replacement);
			result = tweets[0].text.replace(toReplace, replacement);
			result = "@" + screenName + " " + result;
			
			T.post('statuses/update', {status: result.substring(0,140), in_reply_to_status_id: tweets[0].id_str}, 
				function(err, data, response){ console.log("Tweeted!"); });
		}
	}
}

doStuff();
setInterval(doStuff, 900000);