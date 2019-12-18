const player = require('play-sound')(opts = {})

function playOurSong () {
  player.play('./the_space_of_your_mind.mp3', function (err) {
    if (err) console.error(err);
  })
}

playOurSong()

module.exports = {
  playOurSong
}
