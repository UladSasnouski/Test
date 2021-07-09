var canvas = document.getElementById('canvas-big');
var ctx = canvas.getContext('2d');

let items = [];
let mouse = {
    clicked: false,
    x: 0,
    y: 0,
    heldOut: null,
    id: null
};

canvas.addEventListener('mousedown', ({ offsetX, offsetY }) => {
    mouse.clicked = true;
    let item = findItem(offsetX, offsetY);
    if (item) {
        putItem(item);
        mouse.heldOut = item;
        console.log(mouse.heldOut);
    };
});

canvas.addEventListener('mouseup', () => {
    mouse.clicked = false;
    mouse.heldOut = null;
});

canvas.addEventListener('mousemove', ({ offsetX, offsetY }) => {
    if (mouse.clicked && mouse.heldOut) {
        mouse.heldOut.x += offsetX - mouse.x;
        mouse.heldOut.y += offsetY - mouse.y;
    };
    mouse.x = offsetX;
    mouse.y = offsetY;
});

canvas.addEventListener('mouseleave', (e) => {
    if (mouse.clicked && mouse.heldOut) {
        let index = items.indexOf(mouse.heldOut);
        if (index != -1) {
            items.splice(index, 1);
            mouse.clicked = false;
            mouse.heldOut = null;
            updateLocal();
            console.log('Delete');
        };
        console.log('Mouse leave');
    };
});

function addRect(x, y, width, height, color) {
    let item = {
        x: x,
        y: y,
        width: width,
        height: height,
        color: color,
        border: false,
        type: 'rect'
    };
    items.push(item);
};

function addCircle(x, y, radius, color) {
    let item = {
        x: x,
        y: y,
        width: 100,
        height: 100,
        radius: radius,
        color: color,
        border: false,
        type: 'circle'
    };
    items.push(item);
};

const findItem = (x, y) => items.filter(item => inСan(x, y, item)).pop();

const inСan = (x, y, item) => x > item.x && x < item.x + item.width && y > item.y && y < item.y + item.height;

function putItem(item) {
    items.splice(items.indexOf(item), 1);
    items.push(item);
};

canvas.addEventListener('click', (e) => {
    let item = findItem(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop);
    if (item) {
        putItem(item);
        items.forEach(element => {
            element.border = false;
        });
        item.border = true;
        mouse.heldOut = item;
        updateLocal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.keyCode === 46) {
        let index = items.findIndex(item => item.border === true);
        if (index != -1) {
            items.splice(index, 1);
            console.log('Delete');
            updateLocal();
        };
    };
});

function dragstart_handler(e) {
    mouse.id = e.target.id;
};

function dragover_handler(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
};

function drop_handler(e) {
    e.preventDefault();
    mouse.x = e.pageX - canvas.offsetLeft - 50;
    mouse.y = e.pageY - canvas.offsetTop - 50;
    let colorBack = window.getComputedStyle(document.getElementById(`${mouse.id}`), null).getPropertyValue('background-color');
    switch (mouse.id) {
        case 'rect':
            addRect(mouse.x, mouse.y, 100, 100, `${colorBack}`);
            break;
        case 'circle':
            addCircle(mouse.x, mouse.y, 50, `${colorBack}`);
            break;
        default:
            return;
    };
    mouse.id = null;
    updateLocal();
};

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    items.forEach(element => {
        switch (element.type) {
            case 'rect':
                if (element.x >= canvas.width - 100 || element.x <= 0) {
                    if (element.x >= canvas.width - 100) {
                        element.x = canvas.width - 101;
                    } else {
                        element.x = 1;
                    };
                };
                if (element.y >= canvas.height - 100 || element.y <= 0) {
                    if (element.y >= canvas.width - 100) {
                        element.y = canvas.width - 101;
                    } else {
                        element.y = 1;
                    };
                };
                ctx.beginPath();
                ctx.rect(element.x, element.y, element.width, element.height);
                ctx.fillStyle = element.color;
                if (element.border) {
                    ctx.strokeRect(element.x, element.y, element.width, element.height);
                };
                ctx.fill();
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(element.x, element.y, element.radius, 0, (Math.PI / 180) * 360);
                ctx.fillStyle = element.color;
                if (element.border) {
                    ctx.stroke();
                };
                ctx.fill();
                break;
            default:
                return;
        };
    });
};

setInterval(render, 16);

function updateLocal() {
    localStorage.setItem('storedItems', JSON.stringify(items));
};

(function init() {
    if (localStorage.getItem('storedItems')) {
        items = JSON.parse(localStorage.getItem('storedItems'));
    };
})();