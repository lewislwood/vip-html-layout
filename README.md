# vip-html-layout

Visually Impaired HTML tutorial for layout and considerations.  Using vs Code as the editor. The css techniques that work best. Containes a detailled walk through and much more advanced topics
[See Web Site Here](https://lewislwood.github.io/vip-html-layout)

## Detailed Walk Through

Each section is covered in detail and has an audio mp3 with it.
Detailed explaination why text and data is expected to be presented in such a fashion.
What to look out for and limitations of visually impaired and blind.
Grid layout and how to manipulate it and guarantee it is where you expect it to be.
Why padding and margin are so important to those with vision.

Color choices and font sizing.
What is the optimal size for a line of text and why not to exceed this.
Beauty of seperating the content and giving subtle borders vs clear in your face borders and techniques for each.

Placing a logo and creating partitions.

## svg customizing and using

Download or create your own svg and convert it into an accessible image and easily use custom colors.
Viewbox explained as well as path tags are explained.
How to edit an svg and place a frame around it as an easy to implement technique.
How to insert and or  place it.

## Themes and colors

Provide a theme editor where you can edit the colors in a color picker.
Foreground and background color pairs auto generate a color ratio.
This way you know if the colors are ADA Compliant.
A detail analyze button, where you can match colors against each other and determine their ratios.
See also them at 2 different size fonts and svg as well.

The ability to copy the custom them the user edited to the clipboard.
Then they simply email them to the developer and they can incorporate them as well.

## Status Demo

See various ways to configure status message handling.
Mirroring ideas/concepts for screen readers.
Timers auto clearing (you can change the rimer value).
Size of the screen reader speaking area.
This limits the amount of speaking.

Discussion of fast action may be one setting, versus a slow moving adventure game wants different speaking.

## Resources are provided throughout and mp3 audio files as well

Includes an audio player, help system, and keyboard handling.

--------

## Running it

Clone or download theis repository.
You will need to have nodejs installed.
"npminstall" command to install the necessary modules to run this project locally.  
You must have Nodejs installed in order to perform any of these steps.

"npm run dev" will run the server (vite).  
Press the letter "o" in terminal followed by enter key to launch the application in the browser.
press "q" in the terminal to quit the server.

You can build for production with the following:
"npm run build"  &  "npm run preview" to preview the production version.

You you configure git to work with your own repository, thus origi.
You can do the following to make deployment easier.
"gh-pages" npm package is already installed in this repo, but you may need to install it to do it in your own custom repository.

+ "git subtree push --prefix dist origin gh-pages"
+ "npm run deploy""  this will deploy the dist folder to the gh-pages branch.
+ naviage to github/reoName/settings/pages
++  select source as branch+
++ Next dropdown select the "gh-pages" branch.  
++ Next dropdown select the root folder

Now your site is live at "userName.github.io/repoName/"
It may take a bit to update.

Do not to update the vite.config.js file and set the base: "repoName/"
Otherwise it wil not work.  You will need to rebuild & deploy as well.
"

From now on.  Build then deploy and usually live in 2 minutes.

I hope you find this useful.

Lewis L Wood
