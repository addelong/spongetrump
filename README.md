# spongetrump
A twitter bot that turns Trump tweets into sarcastic spongebob memes. Check it out at https://twitter.com/RealTrumpBob


This relies on my own fork of memecanvas found here: https://github.com/addelong/memecanvas 

That fork changes the font from Impact to a Heroku-friendly font. It also sets the `miterLimit` on the canvas context to 2, which fixes spiky borders around text.

This bot was built to be deployed to a Heroku worker dyno. If you're interested in building off of this or creating your own bot, you'll mostly just want to follow this guide: https://medium.com/@mattpopovich/how-to-build-and-deploy-a-simple-twitter-bot-super-fast-with-node-js-and-heroku-7b322dbb5dd3

I should probably move the text wrangling code into its own module and add tests but this is a stupid side project so ¯\_(ツ)_/¯
