let exec = require('child_process').exec,
    paths = ['./build', './dist']

let emoji = require('node-emoji'),
    coffee = emoji.get('coffee'),
    x = emoji.get('x'),
    check = emoji.get('white_check_mark')

let getArguments = () => {
    return process.argv
}

let isDeepClean = () => {
    let arguments = getArguments();
    return arguments.indexOf('--deep') > -1
}

let outputToTerminal = (emoji, text) => {
    console.log(emoji, text)
}

let cleanDirectory = () => {
    for (let i = 0; i < paths.length; i++) {
        let path = paths[i]
        let command = `npx rimraf ${path}`
        exec(command, (err, stdout, stderr) => {
            if (err) {
                outputToTerminal(x, `Error removing ${path}`)
            } else {
                outputToTerminal(check, `Successfully removed ${path}`)
            }
        })
    }
}

let handleDeepClean = () => {
    if (isDeepClean()) paths.push('./node_modules')
}

let initClean = () => {
    handleDeepClean()
    outputToTerminal(coffee, 'Cleaning directory...')
    cleanDirectory()
}

initClean()
