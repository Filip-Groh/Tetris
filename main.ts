const frequence = 60
let globalGamePlotArray = [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false]
]

type Point = {
    x: number,
    y: number
}

type Shape = {
    shape: string,
    points: Array<Point>
}

let currentShape: Shape

function display(gamePlotArray: Array<Array<boolean>>) {
    gamePlotArray.forEach((yArray, y) => {
        yArray.forEach((xValue, x) => {
            if (xValue) {
                led.plot(x, y)
            } else {
                led.unplot(x, y)
            }
        })
    })
}

function generateShape() {
    const avalibleShapes = ["I", "O", "L", "J"]
    const chosenShape = avalibleShapes[Math.round(Math.random() * avalibleShapes.length - 1)]
    let points = []
    if (chosenShape == "I") {
        points.push({
            x: 1,
            y: 0
        })
        points.push({
            x: 2,
            y: 0
        })
        points.push({
            x: 3,
            y: 0
        })
    } else if (chosenShape == "O") {
        points.push({
            x: 1,
            y: 0
        })
        points.push({
            x: 2,
            y: 0
        })
        points.push({
            x: 1,
            y: 1
        })
        points.push({
            x: 2,
            y: 1
        })
    } else if (chosenShape == "L") {
        points.push({
            x: 2,
            y: 0
        })
        points.push({
            x: 3,
            y: 0
        })
        points.push({
            x: 2,
            y: 1
        })
    } else if (chosenShape == "J") {
        points.push({
            x: 2,
            y: 0
        })
        points.push({
            x: 3,
            y: 0
        })
        points.push({
            x: 3,
            y: 1
        })
    }
    return {
        shape: chosenShape,
        points: points
    }
}

function plotShape(gamePlotArray: Array<Array<boolean>>, currentShape: Shape) {
    let newGamePlotArray = [
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false]
    ]
    gamePlotArray.forEach((yArray, y) => {
        yArray.forEach((xValue, x) => {
            if (xValue) {
                newGamePlotArray[y][x] = true
            }
        })
    })
    currentShape.points.forEach((value) => {
        newGamePlotArray[value.y][value.x] = true
    })
    return newGamePlotArray
}

function checkCollision(gamePlotArray: Array<Array<boolean>>, currentShape: Shape) {
    let isColliding = false
    currentShape.points.forEach((value) => {
        if (value.x < 0 || value.x > 4 || value.y < 0 || value.y > 4 || gamePlotArray[value.y][value.x]) {
            isColliding = true
        }
    })
    return isColliding
}

function copy(currentShape: Shape) {
    let points: Array<Point>  = []
    currentShape.points.forEach((value) => {
        points.push({
            x: value.x,
            y: value.y
        })
    })
    return {
        shape: currentShape.shape,
        points: points
    }
}

function dropBlock(gamePlotArray: Array<Array<boolean>>, currentShape: Shape) {
    const afterMoveShape = copy(currentShape)
    afterMoveShape.points.forEach((value) => {
        value.y += 1
    })
    if (checkCollision(gamePlotArray, afterMoveShape)) {
        globalGamePlotArray = removeLine(plotShape(gamePlotArray, currentShape))
        return undefined
    }
    return afterMoveShape
}

function removeLine(gamePlotArray: Array<Array<boolean>>) {
    let fullLines: Array<number> = []
    gamePlotArray.forEach((yArray, y) => {
        let line = [false, false, false, false, false]
        yArray.forEach((xValue, x) => {
            if (xValue) {
                line[x] = gamePlotArray[y][x]
            }
        })
        let isFullLine = line.every((value) => {
            return value
        })
        if (isFullLine) {
            fullLines.push(y)
        }
    })
    fullLines.reverse()
    gamePlotArray.forEach((yArray, y) => {
        if (fullLines.find((value) => {
            return y == value
        }) != undefined) {
            yArray = [false, false, false, false, false]
        }
    })
    return gamePlotArray
}

let lastDrop = control.millis()
let isLost = false
basic.forever(function () {
    if (isLost) {
        basic.clearScreen()
        basic.showIcon(IconNames.Sad)
        return
    }
    if (!currentShape) {
        currentShape = generateShape()
        if(checkCollision(globalGamePlotArray, currentShape)) {
            isLost = true
        }
    }
    display(plotShape(globalGamePlotArray, currentShape))
	basic.pause(1 / frequence)
    if (control.millis() - lastDrop > 1000) {
        currentShape = dropBlock(globalGamePlotArray, currentShape)
        lastDrop = control.millis()
    }
})

input.onButtonPressed(Button.A, function() {
    const beforeMoveShape = copy(currentShape)
    currentShape.points.forEach((value) => {
        value.x -= 1
    })
    if (checkCollision(globalGamePlotArray, currentShape)) {
        currentShape = beforeMoveShape
        return
    }
})

input.onButtonPressed(Button.B, function () {
    const beforeMoveShape = copy(currentShape)
    currentShape.points.forEach((value) => {
        value.x += 1
    })
    if (checkCollision(globalGamePlotArray, currentShape)) {
        currentShape = beforeMoveShape
        return
    }
})