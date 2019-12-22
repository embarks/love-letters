const open = require('open')
const chalk = require('chalk')

// padding must be equal on either side of the tree
const xmastree = [
  `                                     `,
  `                                     `,
  `                                     `,
  `                                     `,
  `                                     `,
  `                                     `,
  `                                     `,
  `                  +                  `,
  `                  #                  `,
  `                 ###                 `,
  `         "#:...:##"##:...:#"         `,
  `           "####"###"####"           `,
  `     "#:. ..  :#"###"#:  .. :#"      `,
  `        "#########"#########"        `,
  `     "#:. "####"###"####"  .:#"      `,
  `      "#######""##"##""#######"      `,
  `         "##"#####"#####"##"         `,
  `"#:. ...  .:##"###"###"##:.  ... .:#"`,
  `    "#######"##"#####"##"#######"    `,
  `       "#####""#######""#####"       `,
  `                 000                 `,
  `                 000                 `,
  `................O000O................`,
]

// on the first increment (0) put no more than 7 snowflakes on the top line
// at least 4 spaces apart
// on the next increment (1) draw each snowflake 1 line down
// if the flake is behind the tree don't draw it
// loop

const colorMap = {
  '#': 'bold.green',
  '"': 'bold.green',
  '+': 'bold.yellow',
  ':': 'bold.white',
  '.': 'bold.white',
  'O': 'white',
  '0': 'white',
  '*': 'bold.white'
}

let fi = 0
let frames = []

function center (cols, line, padStr = ' ') {
  return line
    .padStart(line.length + Math.floor((cols - line.length) / 2), padStr)
    .padEnd(cols, padStr)
}

const drawTree = (function () {
  // this will be called every second
  const drawTree = function (st) {
    
    // clear the console window
    process.stdout.write('\033c');
    // get max width
    const cols = process.stdout.columns
    xmastree.map((line, ix) => {
      const padStr = ix === xmastree.length - 1 ? '.' : ' '
      const pLine = center(cols, line, padStr)
      const frameIdx = (fi) % (xmastree.length)
      const pFrameIdx = frameIdx - 1

      if (typeof frames[frameIdx] === 'undefined') {
        frames[frameIdx] = []
      }

      function drawLine () {
        const fLine = pLine.split('').map(c => {
          return chalk`{${colorMap[c] || 'white'} ${c}}`
        }).join('')
        process.stdout.write(fLine) 
      }
      
      function drawFlakes () {
        const pfi = frameIdx === 0 ? xmastree.length - 1 : pFrameIdx
        const pix = ix - 1
        const generateNewFlakes = (ix === 0)
        const pFlakes = generateNewFlakes ? [] : frames[pfi][pix]
        const flakes = getFlakePos(
          pLine,
          pFlakes
        )
        let lineWithFlakes = pLine.split('').map(tc => {
          return chalk`{${colorMap[tc] || 'white'} ${tc}}`
        })
        frames[frameIdx][ix] = flakes
        flakes.map(({ flake, hidden }) => {
          if (!hidden) lineWithFlakes.splice(flake, 1, chalk`{${colorMap['*']} *}`)
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
    const isBehindTree = (idx) => pad !== -1 && !(idx < pad - 1 || idx > (line.length - pad)) 

    // if pFlakes was provided with flake positions
    // just draw the last line's flakes 
    // but hide them if they are behind the tree
    const drawFlakeFall = pFlakes.length > 0
    if (drawFlakeFall) {
      return pFlakes.map(({ flake }) => {
        const hidden = !drawFlakes && line[flake] !== '.' && isBehindTree(flake)
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
      const spaced = anyFlakes ? space > lastFlake + 10 : true
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

// https://codepen.io/codemzy/pen/pgNKEq
function timeLeft(endtime){
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor( (t/1000) % 60 );
  var minutes = Math.floor( (t/1000/60) % 60 );
  var hours = Math.floor( (t/(1000*60*60)) % 24 );
  var days = Math.floor( t/(1000*60*60*24) );
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
};


async function openXmasCard () {
  await open('./hark.mp3')
  setInterval(() => {
    const cols = process.stdout.columns
    drawTree()
    process.stdout.write('\n')
    const today = new Date()
    const newYear = 'January 1 ' + (today.getFullYear() + 1) + " 00:00:00";
    const { seconds, minutes, hours, days } = timeLeft(newYear)
    process.stdout.write(
      center(cols, `${days.toString().padEnd(7, ' ')}  ${hours.toString().padEnd(7, ' ')}  ${minutes.toString().padEnd(7, ' ')}  ${seconds.toString().padEnd(7, ' ')}`, ' ')
    )
    process.stdout.write(
      center(cols, `${'days'.padEnd(7, ' ')}  ${'hours'.padEnd(7, ' ')}  ${'minutes'.padEnd(7, ' ')}  seconds`)
    )
    process.stdout.write('\n')
  }, 500)
}

openXmasCard()

module.exports = {
  openXmasCard
}
