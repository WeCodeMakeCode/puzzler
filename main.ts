namespace SpriteKind {
    export const Piece = SpriteKind.create()
    export const Board = SpriteKind.create()
    export const Remove = SpriteKind.create()
    export const none = SpriteKind.create()
}
controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    change_cursor_y(-1)
})
function next_puzzle () {
    prior_score = info.score()
    cleanup_after_prior_board()
    cursor.x = randint(20, 149)
    cursor.y = randint(20, 120)
    B_is_selected = false
    g_n_pieces = g_n_pieces % g_n_pieces_limit + 1
    pieces = sprites.allOfKind(SpriteKind.Piece)
    piece_positioms = []
    make_one_piece(board_s.left, board_s.top, board_s.width, board_s.height)
    splits()
    scatter()
    info.startCountdown(60 + (g_n_pieces - 2) * 30)
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    info.stopCountdown()
    if (game.runtime() - B_time < 100) {
        game.over(false, effects.blizzard)
    } else {
        B_time = game.runtime()
        if (are_all_pieces_placed()) {
            is_this_puzzle_done()
        } else {
            show_one_solution()
            next_puzzle()
        }
    }
})
controller.up.onEvent(ControllerButtonEvent.Repeated, function () {
    change_cursor_y(-1)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (B_is_selected) {
        if (is_piece_on_board(Selected)) {
            check_mark(Selected)
            if (does_piece_overlap(Selected)) {
                O_mark(Selected)
            } else {
                if (are_all_pieces_placed()) {
                    is_this_puzzle_done()
                }
            }
        } else {
            X_mark(Selected)
        }
        B_is_selected = false
        Selected.z += -1
    } else {
        S = find_selected_piece()
        if (S != NULL_SPRITE) {
            Selected = S
            B_is_selected = true
            Selected.z += 1
        }
    }
})
function show_one_solution () {
    pause(500)
    for (let index = 0; index <= pieces.length - 1; index++) {
        S = pieces[index]
        txt = piece_positioms[index].split("|")[0]
        x = parseFloat(txt)
        txt = piece_positioms[index].split("|")[1]
        y = parseFloat(txt)
        S.setPosition(x, y)
        check_mark(S)
        pause(200)
    }
    pause(1000)
}
function X_mark (p: Sprite) {
    p_color = p.image.getPixel(0, 0)
    char_color = get_char_color(p_color, COLOR_RED, COLOR_WHITE)
    w = p.width
    h = p.height
    p.image.drawLine(1 * (w / 4), 1 * (h / 4), 3 * (w / 4), 3 * (h / 4), char_color)
    p.image.drawLine(3 * (w / 4), 1 * (h / 4), 1 * (w / 4), 3 * (h / 4), char_color)
    pause(500)
    p.image.fill(p_color)
}
function does_piece_overlap (p: Sprite) {
    b_overlap = false
    pieces = sprites.allOfKind(SpriteKind.Piece)
    for (let value of pieces) {
        b_overlap = b_overlap || p.overlapsWith(value)
    }
    return b_overlap
}
function make_one_piece (left: number, top: number, W: number, H: number) {
    S = sprites.create(image.create(W, H), SpriteKind.Piece)
    S.left = left
    S.top = top
    S.z = 1
    S.image.fill(randint(2, 14))
}
controller.right.onEvent(ControllerButtonEvent.Repeated, function () {
    change_cursor_x(1)
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    change_cursor_x(-1)
})
function is_piece_on_board (p: Sprite) {
    OK = true
    OK = OK && p.left >= board_s.left
    OK = OK && p.right <= board_s.right
    OK = OK && p.top >= board_s.top
    OK = OK && p.bottom <= board_s.bottom
    return OK
}
function winning_score () {
    cum = 0
    for (let index = 0; index <= g_n_pieces_limit; index++) {
        cum += index
    }
    return cum
}
function O_mark (p: Sprite) {
    p_color = p.image.getPixel(0, 0)
    char_color = get_char_color(p_color, COLOR_RED, COLOR_WHITE)
    w = p.width
    h = p.height
    x_to_center_third = w / 3
    y_to_center_third = h / 3
    w = w / 3
    h = h / 3
    wh = Math.min(w, h)
    p.image.drawRect(x_to_center_third, y_to_center_third, wh, wh, char_color)
    pause(500)
    p.image.fill(p_color)
}
info.onCountdownEnd(function () {
    music.playTone(262, music.beat(BeatFraction.Half))
    next_puzzle()
})
function make_cursor () {
    Cursor_black = img`
. . . . . . . . 
. . . f . . . . 
. . f f f . . . 
. f . f . f . . 
. . . f . . . . 
. . . f . . . . 
. . . f . . . . 
. . . . . . . . 
`
    Cursor_white = Cursor_black.clone()
    Cursor_white.replace(15, 1)
    S = sprites.create(Cursor_white, SpriteKind.Player)
    S.setFlag(SpriteFlag.StayInScreen, true)
    S.z = 4
    S.y = 100
    return S
}
function split_vertical (p: Sprite) {
    W1 = Math.round(p.width / randint(2, 4))
    W0 = p.width - W1
    make_one_piece(p.left, p.top, W0, p.height)
    make_one_piece(p.left + W0, p.top, W1, p.height)
}
function make_board (w: number, h: number) {
    global_board_area = w * h
    img2 = image.create(w, h)
    S = sprites.create(img2, SpriteKind.Board)
    S.image.fill(15)
    S.z = 0
    return S
}
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    change_cursor_x(1)
})
function split_horizontal (p: Sprite) {
    H1 = Math.round(p.height / randint(2, 4))
    H0 = p.height - H1
    make_one_piece(p.left, p.top, p.width, H0)
    make_one_piece(p.left, p.top + H0, p.width, H1)
}
function check_mark (p: Sprite) {
    p_color = p.image.getPixel(COLOR_GREEN, 0)
    char_color = get_char_color(p_color, COLOR_GREEN, COLOR_WHITE)
    w = p.width
    h = p.height
    p.image.drawLine(w / 2, h / 2, 1 * (w / 3), 1 * (h / 3), char_color)
    p.image.drawLine(w / 2, h / 2, 3 * (w / 5), 1 * (h / 5), char_color)
    pause(500)
    p.image.fill(p_color)
}
controller.down.onEvent(ControllerButtonEvent.Repeated, function () {
    change_cursor_y(1)
})
controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    change_cursor_y(1)
})
function are_all_pieces_placed () {
    b = true
    for (let value of pieces) {
        b = b && is_piece_on_board(value)
    }
    return b
}
function find_selected_piece () {
    pieces = sprites.allOfKind(SpriteKind.Piece)
    for (let value2 of pieces) {
        if (cursor.overlapsWith(value2)) {
            return value2
        }
    }
    return NULL_SPRITE
}
function change_cursor_x (num: number) {
    cursor.x = cursor.x + num
}
function get_char_color (p_color: number, char_color_1: number, char_color_2: number) {
    if (p_color == char_color_1) {
        char_color = char_color_2
    } else {
        char_color = char_color_1
    }
    return char_color
}
function INIT_COLOR_CONSTANTS () {
    COLOR_WHITE = 1
    COLOR_RED = 2
    COLOR_TEAL = 6
    COLOR_GREEN = 7
    COLOR_BLACK = 15
}
function splits () {
    for (let index = 0; index < g_n_pieces - 1; index++) {
        pieces = sprites.allOfKind(SpriteKind.Piece)
        maxSizePiece = pieces[0]
        maxSizePieceArea = maxSizePiece.width * maxSizePiece.height
        for (let value of pieces) {
            tmpArea = value.width * value.height
            if (tmpArea > maxSizePieceArea) {
                maxSizePiece = value
                maxSizePieceArea = tmpArea
            }
        }
        if (maxSizePiece.width > maxSizePiece.height) {
            split_vertical(maxSizePiece)
        } else {
            split_horizontal(maxSizePiece)
        }
        // V
        maxSizePiece.destroy()
    }
}
function cleanup_after_prior_board () {
    pieces = sprites.allOfKind(SpriteKind.Piece)
    for (let value3 of pieces) {
        value3.destroy()
    }
}
function change_cursor_y (num: number) {
    cursor.y = cursor.y + num
}
function scatter () {
    pieces = sprites.allOfKind(SpriteKind.Piece)
    for (let value of pieces) {
        piece_positioms.push("" + value.x + "|" + value.y)
        h = value.width / 2
        w = value.height / 2
        value.left = randint(0 - w, scene.screenWidth() - w)
        value.top = randint(0 - h, scene.screenHeight() - h)
    }
}
function is_this_puzzle_done () {
    info.stopCountdown()
    music.baDing.play()
    board_s.startEffect(effects.confetti, 2000)
    info.changeScoreBy(100 * g_n_pieces)
    if (info.score() == winning_score()) {
        game.over(true, effects.confetti)
    }
    pause(1000)
    next_puzzle()
}
controller.left.onEvent(ControllerButtonEvent.Repeated, function () {
    change_cursor_x(-1)
})
let tmpArea = 0
let maxSizePieceArea = 0
let maxSizePiece: Sprite = null
let COLOR_BLACK = 0
let COLOR_TEAL = 0
let b = false
let COLOR_GREEN = 0
let H0 = 0
let H1 = 0
let img2: Image = null
let global_board_area = 0
let W0 = 0
let W1 = 0
let Cursor_white: Image = null
let Cursor_black: Image = null
let wh = 0
let y_to_center_third = 0
let x_to_center_third = 0
let cum = 0
let OK = false
let b_overlap = false
let h = 0
let w = 0
let COLOR_WHITE = 0
let COLOR_RED = 0
let char_color = 0
let p_color = 0
let y = 0
let x = 0
let txt = ""
let S: Sprite = null
let Selected: Sprite = null
let B_time = 0
let piece_positioms: string[] = []
let pieces: Sprite[] = []
let B_is_selected = false
let prior_score = 0
let g_n_pieces = 0
let g_n_pieces_limit = 0
let cursor: Sprite = null
let board_s: Sprite = null
let NULL_SPRITE: Sprite = null
scene.setBackgroundColor(1)
INIT_COLOR_CONSTANTS()
NULL_SPRITE = sprites.create(img`
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
. . . . . . . . . . . . . . . . 
`, SpriteKind.none)
board_s = make_board(100, 100)
cursor = make_cursor()
info.setScore(0)
g_n_pieces_limit = 10
g_n_pieces = 0
next_puzzle()
game.onUpdate(function () {
    if (B_is_selected) {
        Selected.x = cursor.x
        Selected.y = cursor.y
        if (cursor.image == Cursor_white) {
            cursor.setImage(Cursor_black)
        } else {
            cursor.setImage(Cursor_white)
        }
    } else {
        if (cursor.overlapsWith(board_s)) {
            cursor.setImage(Cursor_white)
        } else {
            cursor.setImage(Cursor_black)
        }
    }
})
