const open = require('open')

// padding is equal on either side of the tree
// each line is the same length (53 chars)
// xmastree.length === 16
// xmastree[n].length === 53
const SONG_LENGTH_MS = (4 * 60 * 1000) + (14 * 1000)
const xmastree = [
  `                                                     `,
  `                                                     `,
  `                                                     `,
  `                                                     `,
  `                          +                          `,
  `                          #                          `,
  `                         ###                         `,
  `                 "#:. .:##"##:. .:#"                 `,
  `                   "####"###"####"                   `,
  `             "#:.    .:#"###"#:.    .:#"             `,
  `                "#########"#########"                `,
  `             "#:.  "####"###"####"  .:#"             `,
  `              "#######""##"##""#######"              `,
  `                 "##"#####"#####"##"                 `,
  `        "#:. ...  .:##"###"###"##:.  ... .:#"        `,
  `            "#######"##"#####"##"#######"            `,
  `               "#####""#######""#####"               `,
  `                         000                         `,
  `                         000                         `,
  `........................O000O........................`,
]

// on the first increment (0) put no more than 7 snowflakes on the top line
// at least 4 spaces apart
// on the next increment (1) draw each snowflake 1 line down
// if the flake is behind the tree don't draw it
// loop

let fi = 0
let frames = []
const drawTree = (function () {
  // this will be called every second
  const drawTree = function () {
    // clear the console window
    process.stdout.write('\033c');
    xmastree.map((line, ix) => {
      process.stdout.cursorTo(0, ix)
    
      const frameIdx = fi % (xmastree.length)
      const pFrameIdx = frameIdx - 1

      if (typeof frames[frameIdx] === 'undefined') {
        frames[frameIdx] = []
      }

      function drawLine () { process.stdout.write(line) }
      
      function drawFlakes () {
        const pFlakes = ix === 0 || pFrameIdx === -1 ? 
          [] : frames[pFrameIdx][ix - 1]
        const flakes = getFlakePos(line, pFlakes)
        let lineWithFlakes = line.split('')
        frames[frameIdx][ix] = flakes
        flakes.map(({ flake, hidden }) => {
          if (!hidden) lineWithFlakes.splice(flake, 1, '*')
        })
        process.stdout.write(`${lineWithFlakes.join('')}`)
      }

      if (!(fi === 0 && ix === 0) && fi < ix) drawLine()
      else drawFlakes()

    })
    fi = fi + 1
  }


  function getFlakePos (line, pFlakes = [], drawFlakes = false) {
    // get new flake positions based on the line being drawn
    // calculate the padding space on either side of the tree
    const pad = line.search(/\S/g)
    const isBehindTree = (idx) => pad !== -1 && !(idx < pad || idx > (line.length - pad)) 

    // if pFlakes was provided with flake positions
    // just draw the last line's flakes 
    // but hide them if they are behind the tree
    const drawFlakeFall = pFlakes.length > 0
    if (drawFlakeFall) {
      return pFlakes.map(({ flake }) => {
        const hidden = !drawFlakes && isBehindTree(flake)
        return { flake, hidden }
      })
    }
    
    // create an array to store indexes where to draw flakes
    let flakes = []
    // generate new flakes
    for (const spaceStr in line) {
      const space = parseInt(spaceStr)
      const isFirstSpace = space === 0
      const anyFlakes = flakes.length !== 0
      const lastFlake = isFirstSpace || !anyFlakes? 
      0 : flakes[flakes.length-1].flake
      const spaced = anyFlakes ? space > lastFlake + 3 : true
      const drawFlake = Math.random() < 0.25
      if (spaced && drawFlake) {
        const hidden = isBehindTree(space)
        flakes.push({ flake: space, hidden })
      }
    }

    return flakes
  }

  drawTree.getFlakePos = getFlakePos
  return drawTree
})()

function openCard () {
  open('./the_space_of_your_mind.mp3')
  const timer = setInterval(drawTree, 500)
  setTimeout(function () { 
    clearInterval(timer)
  }, SONG_LENGTH_MS)
}

openCard()

module.exports = {
  openCard
}
