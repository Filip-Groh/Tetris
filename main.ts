const frequence = 60

type Point = {
    x: number,
    y: number
}

type Shape = {
    shape: string,
    points: Array<Point>,
    pivotPoint: Point
}

let score = 0
let lastDrop = control.millis()
let globalGamePlotArray = [
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false],
    [false, false, false, false, false]
]

enum State {
    Play,
    Win,
    Lost,
    ScoreWin,
    ScoreLost
}

let gameState = State.Play

function display(gamePlotArray: Array<Array<boolean>>): void {
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

function generateShape(): Shape {
    const avalibleShapes = ["I", "O", "L", "J"]
    const chosenShape = avalibleShapes[Math.round(Math.random() * avalibleShapes.length - 1)]
    let points = []
    let pivotPoint
    if (chosenShape === "I") {
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
        pivotPoint = {
            x: 2,
            y: 0
        }
    } else if (chosenShape === "O") {
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
        pivotPoint = {
            x: 1.5,
            y: 1.5
        }
    } else if (chosenShape === "L") {
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
        pivotPoint = {
            x: 2.5,
            y: 0.5
        }
    } else if (chosenShape === "J") {
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
        pivotPoint = {
            x: 2.5,
            y: 0.5
        }
    }
    return {
        shape: chosenShape,
        points: points,
        pivotPoint: pivotPoint
    }
}

function plotShape(gamePlotArray: Array<Array<boolean>>, currentShape: Shape): Array<Array<boolean>> {
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

function checkCollision(gamePlotArray: Array<Array<boolean>>, currentShape: Shape): boolean {
    let isColliding = false
    currentShape.points.forEach((value) => {
        if (value.x < 0 || value.x > 4 || value.y < 0 || value.y > 4 || gamePlotArray[value.y][value.x]) {
            isColliding = true
        }
    })
    return isColliding
}

function copy(currentShape: Shape): Shape {
    debugger
    let points: Array<Point> = []
    currentShape.points.forEach((value) => {
        points.push({
            x: value.x,
            y: value.y
        })
    })
    return {
        shape: currentShape.shape,
        points: points,
        pivotPoint: {
            x: currentShape.pivotPoint.x,
            y: currentShape.pivotPoint.y
        }
    }
}

function dropBlock(gamePlotArray: Array<Array<boolean>>, currentShape: Shape): Shape {
    const afterMoveShape = copy(currentShape)
    afterMoveShape.points.forEach((value) => {
        value.y += 1
    })
    afterMoveShape.pivotPoint.y += 1
    if (checkCollision(gamePlotArray, afterMoveShape)) {
        globalGamePlotArray = removeLine(plotShape(gamePlotArray, currentShape))
        return processNewShape()
    }
    return afterMoveShape
}

function removeLine(gamePlotArray: Array<Array<boolean>>): Array<Array<boolean>> {
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
    score += fullLines.length
    fullLines.reverse()
    fullLines.forEach((value) => {
        gamePlotArray[value] = [false, false, false, false, false]
        for (let i = value; i > 0; i--) {
            gamePlotArray[i] = gamePlotArray[i - 1]
        }
    })
    return gamePlotArray
}

function rotation(shape: Shape, angle: number): Shape {
    // Rotation Matrix
    const angleInRad = angle * Math.PI / 180
    shape.points.forEach((value, index) => {
        const relativeX = shape.pivotPoint.x - value.x
        const relativeY = shape.pivotPoint.y - value.y
        const rotatedX = relativeX * Math.cos(angleInRad) - relativeY * Math.sin(angleInRad)
        const rotatedY = relativeX * Math.sin(angleInRad) + relativeY * Math.cos(angleInRad)
        value.x = Math.round(shape.pivotPoint.x + rotatedX)
        value.y = Math.round(shape.pivotPoint.y + rotatedY)
    })
    return shape
}

function moveOnXBy(gamePlotArray: Array<Array<boolean>>, currentShape: Shape, move: number): Shape {
    const beforeMoveShape = copy(currentShape)
    currentShape.points.forEach((value) => {
        value.x += move
    })
    currentShape.pivotPoint.x += move
    if (checkCollision(gamePlotArray, currentShape)) {
        currentShape = beforeMoveShape
    }
    return currentShape
}

function updateState(newState: State): void {
    if (newState === State.Play) {
        globalCurrentShape = undefined
        score = 0
        lastDrop = control.millis()
        globalGamePlotArray = [
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false],
            [false, false, false, false, false]
        ]
    }
    gameState = newState
    basic.clearScreen()
}

function processNewShape(): Shape {
    let currentShape = generateShape()
    const isColliding = checkCollision(globalGamePlotArray, globalCurrentShape)
    if (isColliding) {
        updateState(State.Lost)
    }
    return currentShape
}

let globalCurrentShape: Shape = processNewShape()
basic.forever(function () {
    switch (gameState) {
        case State.Play: {
            if (score === 99) {
                updateState(State.Win)
                break
            }
            display(plotShape(globalGamePlotArray, globalCurrentShape))
            if (control.millis() - lastDrop > 1000) {
                globalCurrentShape = dropBlock(globalGamePlotArray, globalCurrentShape)
                lastDrop = control.millis()
            }
            break
        }
        case State.Win: {
            basic.showIcon(IconNames.Happy)
            break
        }
        case State.Lost: {
            basic.showIcon(IconNames.Sad)
            break
        }
        case State.ScoreWin: {
            whaleysans.showNumber(score)
            break
        }
        case State.ScoreLost: {
            whaleysans.showNumber(score)
            break
        }
    }

    basic.pause(1 / frequence)
})

input.onButtonPressed(Button.A, function() {
    switch (gameState) {
        case State.Play: {
            globalCurrentShape = moveOnXBy(globalGamePlotArray, globalCurrentShape, -1)
            break
        }
        case State.Win: {
            updateState(State.ScoreWin)
            break
        }
        case State.Lost: {
            updateState(State.ScoreLost)
            break
        }
        case State.ScoreWin: {
            updateState(State.Win)
            break
        }
        case State.ScoreLost: {
            updateState(State.Lost)
            break
        }
    }
})

input.onButtonPressed(Button.B, function () {
    switch (gameState) {
        case State.Play: {
            globalCurrentShape = moveOnXBy(globalGamePlotArray, globalCurrentShape, 1)
            break
        }
        case State.Win: {
            updateState(State.ScoreWin)
            break
        }
        case State.Lost: {
            updateState(State.ScoreLost)
            break
        }
        case State.ScoreWin: {
            updateState(State.Win)
            break
        }
        case State.ScoreLost: {
            updateState(State.Lost)
            break
        }
    }
})