let exec = require('child_process').exec,
    paths = ['./build', './dist']

let emoji = require('node-emoji'),
    coffee = emoji.get('coffee'),
    x = emoji.get('x'),
    check = emoji.get('white_check_mark')

let outputToTerminal = (emoji, text) => {
    console.log(emoji, text)
}

let cleanDirectory = () => {
    for (let i = 0; i < paths.length; i++) {
        let path = paths[i]
        let command = `rm -r ${path}`
        exec(command, (err, stdout, stderr) => {
            if (err) {
                outputToTerminal(x, `Error removing ${path}`)
            } else {
                outputToTerminal(check, `Successfully removed ${path}`)
            }
        })
    }
}

let initClean = () => {
    outputToTerminal(coffee, 'Cleaning directory...')
    cleanDirectory()
}

initClean()
