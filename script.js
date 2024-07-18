function changeStickerColour(index) {
    localStorage.setItem(`rubiks-faces_sticker-${index}`, {
        white: "yellow",
        yellow: "red",
        red: "orange",
        orange: "green",
        green: "blue",
        blue: "white",
    }[localStorage.getItem(`rubiks-faces_sticker-${index}`) ?? 'white']);

    showStickers();
    getMoves();
}

function showStickers() {
    let stickers = document.querySelectorAll('td');
    for (let i = 0; i < 9; i++) {
        stickers[i].setAttribute('class', localStorage.getItem(`rubiks-faces_sticker-${i}`) ?? 'white');
    }
}

showStickers();
getMoves();

window.getMovesIsFlying = false;
async function getMoves() {
    if (window.getMovesIsFlying) {
        window.getMovesDebounced = true;
        return;
    }

    window.getMovesIsFlying = true;
    document.getElementById('path').innerText = 'Loading...';
    let [faceNumber, faceNumberIsFlipped] = getFaceNumber();

    let path = localStorage.getItem('rubiks-faces_face-' + faceNumber);
    if (path == undefined) {
        try {
            path = await fetch('data/moves.txt', { headers: { Range: 'bytes=' + faceNumber * 10 + '-' + (faceNumber * 10 + 8) } });
            path = await path.text();
        } catch (e) {
            path = '';
        }
        if (path.length != 9) {
            path = 'ERROR';
        } else {
            path = path.trim();
            localStorage.setItem('rubiks-faces_face-' + faceNumber, path);
        }
    }

    if (faceNumberIsFlipped) {
        let unflippedPath = "";
        for (let i = 0; i < path.length; i++) {
            unflippedPath += {
                U: "u",
                u: "U",
                D: "d",
                d: "D",
                L: "r",
                l: "R",
                R: "l",
                r: "L",
                F: "f",
                f: "F",
                B: "b",
                b: "B",
                M: "M", // same
                m: "m", // same
                S: "s",
                s: "S",
                E: "e",
                e: "E",
            }[path[i]];
        }
        path = unflippedPath;
    }

    showPath(path);

    window.getMovesIsFlying = false;
    if (window.getMovesDebounced) {
        window.getMovesDebounced = false;
        getMoves();
    }
}

function getFaceNumber() {
    let numberyFace = "";

    for (let i = 0; i < 9; i++) {
        numberyFace += {
            white: "0",
            yellow: "1",
            green: "2",
            blue: "3",
            red: "4",
            orange: "5",
        }[localStorage.getItem(`rubiks-faces_sticker-${i}`) ?? 'white'];
    }

    let normalizedNumberyFace = numberyFace;
    let normalizedFaceIsFlipped = false;

    numberyFace = rotateFace(numberyFace);
    if (numberyFace < normalizedNumberyFace) {
        normalizedNumberyFace = numberyFace;
    }

    numberyFace = rotateFace(numberyFace);
    if (numberyFace < normalizedNumberyFace) {
        normalizedNumberyFace = numberyFace;
    }

    numberyFace = rotateFace(numberyFace);
    if (numberyFace < normalizedNumberyFace) {
        normalizedNumberyFace = numberyFace;
    }

    numberyFace = flipFace(numberyFace);
    if (numberyFace < normalizedNumberyFace) {
        normalizedNumberyFace = numberyFace;
        normalizedFaceIsFlipped = true;
    }

    numberyFace = rotateFace(numberyFace);
    if (numberyFace < normalizedNumberyFace) {
        normalizedNumberyFace = numberyFace;
        normalizedFaceIsFlipped = true;
    }

    numberyFace = rotateFace(numberyFace);
    if (numberyFace < normalizedNumberyFace) {
        normalizedNumberyFace = numberyFace;
        normalizedFaceIsFlipped = true;
    }

    numberyFace = rotateFace(numberyFace);
    if (numberyFace < normalizedNumberyFace) {
        normalizedNumberyFace = numberyFace;
        normalizedFaceIsFlipped = true;
    }

    return [parseInt(normalizedNumberyFace, 6), normalizedFaceIsFlipped];
}

function rotateFace(face) {
    return "" +
        face[2] +
        face[5] +
        face[8] +
        face[1] +
        face[4] +
        face[7] +
        face[0] +
        face[3] +
        face[6];
}

function flipFace(oldFace) {
    let face = "";
    // we need to flip the colours horizontally
    for (let i = 0; i < oldFace.length; i++) {
        face += {
            0: "0",
            1: "1",
            2: "3",
            3: "2",
            4: "4",
            5: "5",
        }[oldFace[i]];
    }

    return "" +
        face[2] +
        face[1] +
        face[0] +
        face[5] +
        face[4] +
        face[3] +
        face[8] +
        face[7] +
        face[6];
}

function showPath(path) {
    let p = document.getElementById('path');
    p.innerText = '';

    for (let i = 0; i < path.length; i++) {
        if (path[i] == "0") continue;

        if (path[i] == path[i].toLowerCase()) {
            p.innerText += " " + path[i].toUpperCase() + "'";
        } else {
            p.innerText += " " + path[i];
        }
    }

    document.getElementById('whereIsTheFace').innerText = "The face will be on the " + whereIsTheFace(localStorage.getItem(`rubiks-faces_sticker-${4}`) ?? 'white', path);
}

function whereIsTheFace(colour, path) {
    let side = {
        white: "top",
        yellow: "bottom",
        green: "left",
        blue: "right",
        red: "front",
        orange: "back",
    }[colour];

    for (let i = 0; i < path.length; i++) {
        if (!["e", "m", "s"].includes(path[i].toLowerCase())) continue;

        if (path[i] == "e") {
            side = {
                top: "top",
                bottom: "bottom",
                left: "back",
                right: "front",
                front: "left",
                back: "right",
            }[side];
        } else if (path[i] == "E") {
            side = {
                top: "top",
                bottom: "bottom",
                left: "front",
                right: "back",
                front: "right",
                back: "left",
            }[side];
        } else if (path[i] == "m") {
            side = {
                top: "back",
                bottom: "front",
                left: "left",
                right: "right",
                front: "top",
                back: "bottom",
            }[side];
        } else if (path[i] == "M") {
            side = {
                top: "front",
                bottom: "back",
                left: "left",
                right: "right",
                front: "bottom",
                back: "top",
            }[side];
        } else if (path[i] == "s") {
            side = {
                top: "left",
                bottom: "right",
                left: "bottom",
                right: "top",
                front: "front",
                back: "back",
            }[side];
        } else if (path[i] == "S") {
            side = {
                top: "right",
                bottom: "left",
                left: "top",
                right: "bottom",
                front: "front",
                back: "back",
            }[side];
        }
    }

    return side;
}

function setColour(face) {
    let colour = prompt('HTML colour name or hex code', localStorage.getItem(`rubiks-faces_colour-${face}`) ?? face);
    if (colour == null) return;
    if (colour.trim() == "") return;
    localStorage.setItem(`rubiks-faces_colour-${face}`, colour);
    defineColours();
}

function defineColours() {
    let faces = ['white', 'yellow', 'red', 'orange', 'green', 'blue'];
    let style = document.getElementById('defineColours');
    style.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        style.innerHTML += `td[data-colour="${faces[i]}"],
                .${faces[i]} {
                    background-color: ${localStorage.getItem(`rubiks-faces_colour-${faces[i]}`) ?? faces[i]};
                    fill: ${localStorage.getItem(`rubiks-faces_colour-${faces[i]}`) ?? faces[i]};
                }`;
    }
}

defineColours();
