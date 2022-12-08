let words = ["червоний", "синій", "рожевий", "жовтий", "білий", "чорний"];
let auto = ["Ford", "Ferrari", "Porsche", "Jeep", "Bentley", "Lamborghini", "Cadillac", "Mercedes"]
let subjects = ["Фізика", "Інформатика", "Хімія", "Математика", "Історія", "Біологія", "Труди", "Фізкультура"]
let technology = ["Apple", "Samsung", "Huawei", "Lenovo", "Motorola", "LG", "Phillips", "HP"]
let countries = ["Україна", "Великобританія", "Китай", "Японія", "Іспанія", "Італія", "Кенія", "Бразилія"]
let capitals = ["Київ", "Лондон", "Пхенья", "Токіо", "Мадрид", "Рим", "Найробі", "Бразиліа"]
let animals = ["Тигр", "Жираф", "Слон", "Кіт", "Пес", "Бегемот", "Лемур", "Кажан"]
let plants = ["Вишня", "Банан", "Персик", "Ожина", "Кавун", "Яблуко", "Груша", "Ананас"]
let birds = ["Горобець", "Фламінго", "Лебідь", "Качка", "Орел", "Беркут", "Цапля", "Гриф"]
let closedCells = []
let closedCellsForRow = []
let closedCellsForColumn = []

class crosswordWord {
    word;
    letters;
    lettersCoordinates = []
    direction;
    connectsWith = [];

    constructor(word) {
        this.word = word
        this.letters = word.split('')
    }
}

function main() {
    startPreparations()
    let wordsList = createWordsObjects(words)
    let crosswordWords = setAbstractCoordinates(wordsList)
    let gridInfo = getGridInfo(closedCells, crosswordWords)
    convertCoordinates(gridInfo[2], gridInfo[3], crosswordWords)
    createGrid(gridInfo[0], gridInfo[1])
    fillGrid(crosswordWords)
    console.log(crosswordWords)
}

function startPreparations() {
    cleanCrossword()
    let userTheme = document.getElementById('user_theme');
    let selectedTheme = userTheme.options[userTheme.selectedIndex].text
    if(selectedTheme === 'Власні слова'){
        getUserWords()
    }
    if (selectedTheme === 'Виробники авто'){
        words = auto
    }
    if (selectedTheme === 'Технологічні компанії'){
        words = technology
    }
    if (selectedTheme === 'Шкільні предмети'){
        words = subjects
    }
    if (selectedTheme === 'Країни'){
        words = countries
    }
    if (selectedTheme === 'Столиці'){
        words = capitals
    }
    if (selectedTheme === 'Тварини'){
        words = animals
    }
    if (selectedTheme === 'Фрукти'){
        words = plants
    }
    if (selectedTheme === 'Птахи'){
        words = birds
    }

}

function cleanCrossword() {
    const table = document.getElementById('crossword');
    table.innerHTML = ''
    closedCells = []
    closedCellsForRow = []
    closedCellsForColumn = []
}

function getUserWords() {
    let userText = document.getElementById('textbox').value
    if (userText != '') {
        let newWords = userText.split(', ')
        words = newWords
    }
}

function createWordsObjects(wordsList) {
    let prepared = []
    wordsList = wordsList.sort(function (a, b) {
        return b.length - a.length;
    })
    for (let word of wordsList) {
        let a = new crosswordWord(word.toLowerCase())
        prepared.push(a)
    }
    return prepared
}

function setAbstractCoordinates(wordsList) {
    let crosswordFormed = false
    let firstWordAdded = false
    let addedWords = []
    let iterations = 0
    while (crosswordFormed != true) {
        let word = wordsList.shift()
        iterations++
        if (firstWordAdded == false) {
            for (let i = 0; i < word.letters.length; i++) {
                let curLetter = word.letters[i]
                word.lettersCoordinates.push([curLetter, i, 0])
                closedCells.push([i, 0])
                closedCellsForRow.push([i, 1])
                closedCellsForRow.push([i, -1])
            }
            word.direction = 'row'
            firstWordAdded = true
            addedWords.push(word)
        } else {
            findConnectionsBetween(addedWords, word)
            let wordPlaced = false
            let bestVariant = []
            varLoop:
                while (word.connectsWith.length != 0) {
                    let variant = word.connectsWith.splice(randomVariant(word.connectsWith.length), 1)[0]
                    let connectionWord = variant[0]
                    let connectionLetter = variant[1]
                    let connectionLetterInfo = connectionWord.lettersCoordinates[connectionWord.letters.indexOf(connectionLetter)]
                    let connectionCoords = [connectionLetterInfo[1], connectionLetterInfo[2]]
                    if (connectionWord.direction === 'row') {
                        word.direction = 'column'
                        let connectionLetterPosition = word.letters.indexOf(connectionLetter)
                        for (let j = 0; j < word.letters.length; j++) {
                            if (j === connectionLetterPosition) {
                                word.lettersCoordinates.push([connectionLetter, connectionLetterInfo[1], connectionLetterInfo[2]])
                                continue
                            }
                            let curLetter = word.letters[j]
                            let curLetterCoords = [connectionCoords[0], connectionCoords[1] + connectionLetterPosition - j]
                            if (cantPlaceCharAt(curLetterCoords, 'column')) {
                                word.lettersCoordinates = []
                                bestVariant = []
                                continue varLoop
                            }
                            word.lettersCoordinates.push([curLetter, curLetterCoords[0], curLetterCoords[1]])
                            bestVariant.push(curLetterCoords)
                        }

                    } else if (connectionWord.direction === 'column') {
                        word.direction = 'row'
                        let connectionLetterPosition = word.letters.indexOf(connectionLetter)
                        for (let j = 0; j < word.letters.length; j++) {
                            if (j === connectionLetterPosition) {
                                word.lettersCoordinates.push([connectionLetter, connectionLetterInfo[1], connectionLetterInfo[2]])
                                continue
                            }
                            let curLetter = word.letters[j]
                            let curLetterCoords = [connectionCoords[0] - connectionLetterPosition + j, connectionCoords[1]]
                            if (cantPlaceCharAt(curLetterCoords, 'row')) {
                                word.lettersCoordinates = []
                                bestVariant = []
                                continue varLoop
                            }
                            word.lettersCoordinates.push([curLetter, curLetterCoords[0], curLetterCoords[1]])
                            bestVariant.push(curLetterCoords)
                        }
                    }
                    for (let coord of bestVariant) {
                        closedCells.push(coord)
                        if (word.direction === 'row') {
                            closedCellsForRow.push([coord[0], coord[1] + 1])
                            closedCellsForRow.push([coord[0], coord[1] - 1])
                        }
                        if (word.direction === 'column') {
                            closedCellsForColumn.push([coord[0] + 1, coord[1]])
                            closedCellsForColumn.push([coord[0] - 1, coord[1]])
                        }
                    }
                    addedWords.push(word)
                    wordPlaced = true
                    break varLoop
                }

            if (wordPlaced === false) {
                if (wordsList.length !== 0) {
                    wordsList.push(word)
                }
            }
            if (wordsList.length === 0 || iterations === 10) {
                crosswordFormed = true
            }
        }
    }
    return addedWords
}

function findConnectionsBetween(placedWords, word) {
    word.connectsWith = []
    for (let crosswordWord of placedWords) {
        for (let i = 0; i < crosswordWord.letters.length; i++) {
            if (word.letters.includes(crosswordWord.letters[i])) {
                word.connectsWith.push([crosswordWord, crosswordWord.letters[i], i])
            }
        }
    }
}

function randomVariant(max) {
    return Math.random() * max;
}

function cantPlaceCharAt(wantedPosition, direction) {
    let wantedCoordinate = reformatCoordinate(wantedPosition)
    for (let coordinates of closedCells) {
        let closedCoordinate = reformatCoordinate(coordinates)
        if (wantedCoordinate === closedCoordinate) {
            return true
        }
    }
    if (direction == 'row') {
        for (let coordinates of closedCellsForRow) {
            let closedCoordinate = reformatCoordinate(coordinates)
            if (wantedCoordinate === closedCoordinate) {
                return true
            }
        }
    }
    if (direction == 'column') {
        for (let coordinates of closedCellsForColumn) {
            let closedCoordinate = reformatCoordinate(coordinates)
            if (wantedCoordinate === closedCoordinate) {
                return true
            }
        }
    }
    return false
}

function reformatCoordinate(coordinate) {
    let x = coordinate[0]
    let y = coordinate[1]
    return x.toString() + y.toString()
}

function getGridInfo(closedCoordinates) {
    let xMax = Number.NEGATIVE_INFINITY
    let xMin = Number.POSITIVE_INFINITY
    let yMax = Number.NEGATIVE_INFINITY
    let yMin = Number.POSITIVE_INFINITY
    for (let coordinate of closedCoordinates) {
        coordinate[0] > xMax ? xMax = coordinate[0] : xMax = xMax
        coordinate[0] < xMin ? xMin = coordinate[0] : xMin = xMin
        coordinate[1] > yMax ? yMax = coordinate[1] : yMax = yMax
        coordinate[1] < yMin ? yMin = coordinate[1] : yMin = yMin
    }
    let gridWidth = xMax - xMin + 1
    let gridHeight = yMax - yMin + 1

    return [gridWidth, gridHeight, xMin, yMax]
}

function convertCoordinates(xModifier, yModifier, wordList) {
    for (let word of wordList) {
        for (let letter of word.lettersCoordinates) {
            letter[1] -= xModifier
            letter[2] = Math.abs(letter[2] - yModifier)
        }
    }
}

function createGrid(width, height) {
    const table = document.getElementById('crossword');
    table.style.width = `${width * 40}px`;
    table.style.height = `${height * 40}px`;
    //table.style.border = '1px solid black';

    for (let i = 0; i < height; i++) {
        const tr = table.insertRow();
        tr.style.border = '1px solid darkslategrey'
        for (let j = 0; j < width; j++) {
            const td = tr.insertCell();
            td.appendChild(document.createTextNode(` `));
            td.id = `${j}:${i}`
        }
    }
}

function fillGrid(wordsList) {
    for (let word of wordsList) {
        for (let letter of word.lettersCoordinates) {
            let x = letter[1]
            let y = letter[2]
            let coordinates = x.toString() + ':' + y.toString()
            let cell = document.getElementById(coordinates)
            cell.innerHTML = letter[0]
            cell.style.border = '1px solid black';
            cell.style.background = 'white'
        }
    }
}

