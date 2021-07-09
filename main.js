var inputs = document.querySelectorAll('.controls input');
var canvas = document.getElementById('canvas-big');
var ctx = canvas.getContext('2d');

let items = [];
let mouse = {
    x: 0,
    y: 0,
    clicked: false,
    heldOut: null,
    id: null
};

canvas.addEventListener('mousedown', ({ offsetX, offsetY }) => {
    mouse.clicked = true;
    let item = findItem(offsetX, offsetY);
    if (item) {
        putItem(item);
        mouse.heldOut = item;
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

const findItem = (x, y) => items.filter(item => item.type === 'rect' ? inСanRect(x, y, item) : inСanCircle(x, y, item)).pop();

const inСanRect = (x, y, item) => x > item.x && x < item.x + item.width && y > item.y && y < item.y + item.height;

const inСanCircle = (x, y, item) => {
    var dx = item.x - x;
    var dy = item.y - y;
    return (dx * dx + dy * dy <= item.radius * item.radius);
}

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
    let properties = {
        background: getProperties(mouse.id).background,
        width: getProperties(mouse.id).width,
        height: getProperties(mouse.id).height
    };

    switch (mouse.id) {
        case 'rect':
            mouse.x = e.pageX - canvas.offsetLeft - properties.width / 2;
            mouse.y = e.pageY - canvas.offsetTop - properties.height / 2;
            addRect(mouse.x, mouse.y, properties.width, properties.height, `${properties.background}`);
            break;
        case 'circle':
            mouse.x = e.pageX - canvas.offsetLeft;
            mouse.y = e.pageY - canvas.offsetTop;
            addCircle(mouse.x, mouse.y, properties.width / 2, `${properties.background}`);
            break;
        default:
            return;
    };
    mouse.id = null;
    updateLocal();
};

const getProperties = (item) => {
    let background = window.getComputedStyle(document.getElementById(`${item}`), null).getPropertyValue('background-color');
    let width = window.getComputedStyle(document.getElementById(`${item}`), null).getPropertyValue('width');
    let height = window.getComputedStyle(document.getElementById(`${item}`), null).getPropertyValue('height');
    width = width.substring(0, width.length - 2);
    height = height.substring(0, height.length - 2);
    let properties = {
        background: background,
        width: +width,
        height: +height
    };
    return properties;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    items.forEach(element => {
        switch (element.type) {
            case 'rect':
                if (element.x >= canvas.width - element.height || element.x <= 0) {
                    if (element.x >= canvas.width - element.height) {
                        element.x = canvas.width - element.height + 1;
                    } else {
                        element.x = 1;
                    };
                };
                if (element.y >= canvas.height - element.height || element.y <= 0) {
                    if (element.y >= canvas.width - element.height) {
                        element.y = canvas.width - element.height + 1;
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
                if (element.x >= canvas.width - element.radius || element.x <= element.radius) {
                    if (element.x >= canvas.width - element.radius) {
                        element.x = canvas.width - element.radius + 1;
                    } else {
                        element.x = element.radius + 1;
                    };
                };
                if (element.y >= canvas.height - element.radius || element.y <= element.radius) {
                    if (element.y >= canvas.width - element.radius) {
                        element.y = canvas.width - element.radius + 1;
                    } else {
                        element.y = element.radius + 1;
                    };
                };
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

function handleUpdate() {
    const suffix = this.dataset.sizing || '';
    document.documentElement.style.setProperty(`--${this.name}`, this.value + suffix);
}

inputs.forEach(input => input.addEventListener('change', handleUpdate));
inputs.forEach(input => input.addEventListener('mousemove', handleUpdate));

function updateLocal() {
    localStorage.setItem('storedItems', JSON.stringify(items));
};

(function init() {
    if (localStorage.getItem('storedItems')) {
        items = JSON.parse(localStorage.getItem('storedItems'));
    };
})();