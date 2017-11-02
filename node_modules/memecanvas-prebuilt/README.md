# memecanvas
Node.js Meme Generator that uses Node-Canvas-Prebuilt to render the final image.
This is a modified version of [Mooslyvania's](https://github.com/Moosylvania/memecanvas) memecanvas.
I made this because I didn't feel like getting all the users of my [Discord bot](https://github.com/Ultie0/MagicalCat) to install [Canvas](https://github.com/Automattic/node-canvas) by Automattic, because it requires you to install a lot of dependencies, which is ok I guess, but some people don't want to install a lot of items.

# To Install
        $ npm install memecanvas-prebuilt

# Requirements
Everything should be taken care of...

# API

* init(outputDirectoryName, fileAppendedName) <br/> The outputDirectoryName is where the meme file will be written to on your file system.<br/><br/>fileAppendedName is a string that will be appended to the original file name. eg - if fileAppendedName = '-meme', photo.png will write out to photo-meme.png
* generate(file, topText, bottomText, callback)<br/>file is the filename and location - eg. __dirname + 'public/images/photo.png'<br/><br/>topText and bottomText are the text that will be overlayed on the top and bottom of the photo respectively.<br/> callback will return the filename or an error

# Example Uses -
    var memecanvas = require('memecanvas');
    memecanvas.init('./tmp', '-meme');
    memecanvas.generate('./photo.png', 'Top of Meme', 'Bottom of Meme', function(error, memefilename){
        if(error){
            console.log(error);
        } else {
            console.log(memefilename);
        }
    });
