var memecanvas = require('memecanvas-prebuilt');
memecanvas.init('./', '-meme');
memecanvas.generate('./sb.jpg', 'tHiS iS a', 'TeSt', function(error, memefilename){
	if(error){
		console.log(error);
	}
	else{
		console.log(memefilename);
	}
});
