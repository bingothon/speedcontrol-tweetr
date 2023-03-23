# speedcontrol-tweetr
If it aint broke, rewrite the shit out of it.

Control Twitter right from your NodeCG dashboard!

[![Release](https://img.shields.io/github/v/release/nicnacnic/speedcontrol-tweetr?label=Release)](https://github.com/nicnacnic/speedcontrol-tweetr/releases)
![Downloads](https://img.shields.io/github/downloads/nicnacnic/speedcontrol-tweetr/total?label=Downloads)
![License](https://img.shields.io/github/license/nicnacnic/speedcontrol-tweetr?label=License)
[![Twitter](https://img.shields.io/twitter/follow/nicnacnic11?style=social)](https://twitter.com/nicnacnic11)
[![Discord](https://img.shields.io/badge/-Join%20the%20Discord!-brightgreen?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/A34Qpfe)

## About
*This is a bundle for [NodeCG](https://github.com/nodecg/nodecg); if you do not understand what that is, we advise you read their website first for more information.*

speedcontrol-tweetr is a bundle for NodeCG to allow users to schedule and post tweets without actually logging into the website. This bundle is meant for speedrunning marathons, therefore it includes all the features one might need to pull off an online marathon. Gone are the days where you need to use Tweetdeck or manually schedule tweets for your marathon!

### Modifications
This version of tweetr is different from [Nic's version](https://github.com/nicnacnic/speedcontrol-tweetr). The main difference is that it is written in typescript and is built on top of zonton's template.
It also has some additional features like tweeting once the transition to the game scene.

### Features
- Does not require nodecg-components to be installed
- Post tweets directly from the dashboard, without having to login to the website!
- Schedule tweets based on the active run, or create new tweets and send them instantly
- Include embedded images and videos in your tweets
- Enable and disable auto tweeting
- Integration with esa-layouts
- Import and export tweets
- Uses built-in dialog buttons
- Base on the [Vue template](https://github.com/zoton2/nodecg-vue-ts-template)

## Requirements
- [NodeCG](https://github.com/nodecg/nodecg)
- [NodeCG Speedcontrol](https://github.com/speedcontrol/nodecg-speedcontrol)


## Installation
To install, navigate to your root NodeCG directory and run the following command.

```nodecg install bsgmarathon/speedcontrol-tweetr```

Also make sure to navigate to the `speedcontrol-tweetr` directory and run `npm install --production` to install all the required dependencies.

After the installation completes, create a config file by running `nodecg defaultconfig speedcontrol-tweetr`.

**NOTE:** You most likely want to turn `useEsaLayouts` off in the config

You will need to create a Twitter Developer account and get an API key/secret and an access token/secret to connect to Twitter. Make sure you get enhanced access with read **and** write privileges to avoid any errors!


## Usage
Once the bundle is configured properly, usage is pretty simple. On first load, the bundle should automatically retrieve all runs and load them into the bundle. To edit tweets, simply select your game in the dropdown and press `Edit`. There is a 280 character limit. Make sure to save, then press anywhere outside of the dialog to exit.

For media, upload images and videos through NodeCG's asset tab, located in the top-right. To select the media you want to use for your tweet, open the dropdown and select your file. Supported formats are png, jpg, gif and mp4. Images can not be larger than 5 MB, GIF's 15 MB, and videos 512 MB. Make sure your filename does **not** have spaces or invalid characters, and your media is within the size limit, or it will cause your NodeCG instance to crash.

To enable Auto Tweet, press the button in the Settings tab of the NodeCG dashboard. Countdown time specifies how long you have to cancel the tweet, 60 seconds is recommended. Once you switch runs, the button will show a countdown, you can either cancel the tweet (you can always tweet it later!), or wait for the countdown to finish, then the tweet will be sent.

The text box at the bottom is for when you want to quickly compose and post a tweet without attaching it to a run. The limits to character count and media size still apply here as well.

## Standalone usage

If you would like your social media team to use Tweetr, but don't want them to be confused by the full dashboard, you can always pop out Tweetr to a standalone window. To do this, press the new window button in Tweetr's panel, this should pop out the window into a new tab. Alternatively, you can also use this link: `http://<your_ip>:9090/bundles/speedcontrol-tweetr/dashboard/tweetr.html?standalone=true`. Everything but the edit dialog works (this is a limitation with NodeCG).

**Security note:** Anyone who has access to Tweetr by default has access to your entire NodeCG instance, as NodeCG does not have user-level permissions and only supports a simple yes/no authentication state (if login security is enabled). Securing your NodeCG production instance is outside the scope of this bundle, please see the [official documentation on Security & Authentication](https://www.nodecg.dev/docs/security/).

# Importing/Exporting Tweets
To make life easier when you are trying to post many tweets at once, you can import a .csv file with your tweet data.

1. Load all your runs into NodeCG.
2. Export your tweets by pressing the **Export Tweets** button in the Settings tab in NodeCG.
3. Load the .csv file into your favorite sheets software and edit away!

When you're done, simply export your file as a .csv and import it back into Tweetr with the **Import Tweets** button. Make sure to not change any of the headers in the spreadsheet or it could cause errors!

At the moment, media is not automatically uploaded, so make sure to manually upload all your media through the dashboard and select the appropriate file for each tweet.

## Contributing
There is a lot of inefficient code in this bundle. If you can optimize the code, or add new features, submit a pull request! Before you do, please make sure to **test your code**.

Bugs or glitches should first be checked against the list of [known bugs](https://github.com/bsgmarathon/speedcontrol-tweetr/wiki), then by creating an issue in the [issue tracker](https://github.com/bsgmarathon/speedcontrol-tweetr/issues). Suggestions are always welcome!

If you're having issues or just want to chat, I can be reached on my [Discord](https://discord.gg/A34Qpfe) server.

## License
MIT  License

Copyright (c) 2022 nicnacnic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
