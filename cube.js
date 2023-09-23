let A = 0, B = 0, C = 0;
const cubeWidths = [20, 10, 5];
const width = 300, height = 70;
const zBuffer = new Array(width * height).fill(0);
const buffer = new Array(width * height).fill(' '); // Fill with space
const distanceFromCam = 100;
const K1 = 40;
const incrementSpeed = 0.6;
let autoSpin = true; // Flag to control automatic spinning

function calculateX(i, j, k) {
    return j * Math.sin(A) * Math.sin(B) * Math.cos(C) - k * Math.cos(A) * Math.sin(B) * Math.cos(C) +
        j * Math.cos(A) * Math.sin(C) + k * Math.sin(A) * Math.sin(C) + i * Math.cos(B) * Math.cos(C);
}

function calculateY(i, j, k) {
    return j * Math.cos(A) * Math.cos(C) + k * Math.sin(A) * Math.cos(C) -
        j * Math.sin(A) * Math.sin(B) * Math.sin(C) + k * Math.cos(A) * Math.sin(B) * Math.sin(C) -
        i * Math.cos(B) * Math.sin(C);
}

function calculateZ(i, j, k) {
    return k * Math.cos(A) * Math.cos(B) - j * Math.sin(A) * Math.cos(B) + i * Math.sin(B);
}

function calculateForSurface(cubeX, cubeY, cubeZ, ch) {
    const x = calculateX(cubeX, cubeY, cubeZ);
    const y = calculateY(cubeX, cubeY, cubeZ);
    const z = calculateZ(cubeX, cubeY, cubeZ) + distanceFromCam;

    const ooz = 1 / z;
    const xp = Math.floor(width / 2 + K1 * ooz * x * 2);
    const yp = Math.floor(height / 2 + K1 * ooz * y);

    const idx = xp + yp * width;
    if (idx >= 0 && idx < width * height) {
        if (ooz > zBuffer[idx]) {
            zBuffer[idx] = ooz;
            buffer[idx] = ch;
        }
    }
}

function draw() {
    buffer.fill(' '); // Fill with space
    zBuffer.fill(0);

    cubeWidths.forEach((cubeWidth, index) => {
        for (let cubeX = -cubeWidth; cubeX < cubeWidth; cubeX += incrementSpeed) {
            for (let cubeY = -cubeWidth; cubeY < cubeWidth; cubeY += incrementSpeed) {
                calculateForSurface(cubeX, cubeY, -cubeWidth, '@');
                calculateForSurface(cubeWidth, cubeY, cubeX, '$');
                calculateForSurface(-cubeWidth, cubeY, -cubeX, '~');
                calculateForSurface(-cubeWidth, cubeY, cubeWidth, '#');
                calculateForSurface(cubeX, -cubeWidth, -cubeY, ';');
                calculateForSurface(cubeX, cubeWidth, cubeY, '+');
            }
        }
    });

    document.getElementById('output').textContent = buffer.join('').replace(new RegExp(`(.{${width}})`, 'g'), '$1\n');

    // Automatic rotation
    if (autoSpin) {
        A += 0.02;
        B += 0.02;
        C += 0.004;
    }

    setTimeout(draw, 16);
}

// Scrollwheel event for resizing the cube
document.getElementById('output').addEventListener('wheel', function(event) {
    if (event.deltaY < 0) {
        // Scrolling up, increase cube size
        for (let i = 0; i < cubeWidths.length; i++) {
            cubeWidths[i] += 1; // adjust the increment value as needed
        }
    } else {
        // Scrolling down, decrease cube size
        for (let i = 0; i < cubeWidths.length; i++) {
            cubeWidths[i] -= 1; // adjust the decrement value as needed
        }
    }

    // Ensure cube sizes don't go below or above certain thresholds
    for (let i = 0; i < cubeWidths.length; i++) {
        if (cubeWidths[i] < 5) cubeWidths[i] = 5; // set a minimum size
        if (cubeWidths[i] > 35) cubeWidths[i] = 35; // set a maximum size
    }

    // Prevent default behavior (page scroll)
    event.preventDefault();
}, { passive: false });

// Mouse adjustments for cube rotation
let isMouseDown = false;
let lastMouseX = null;
let lastMouseY = null;

document.getElementById('output').addEventListener('mousedown', function(event) {
    if (event.button === 0) { // Left mouse button
        isMouseDown = true;
        autoSpin = false; // Disable automatic spinning
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

document.getElementById('output').addEventListener('mousemove', function(event) {
    if (isMouseDown) {
        const deltaX = event.clientX - lastMouseX;
        const deltaY = event.clientY - lastMouseY;

        A += deltaY * 0.01;
        B += deltaX * 0.01;

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

document.getElementById('output').addEventListener('mouseup', function(event) {
    if (event.button === 0) { // Left mouse button
        isMouseDown = false;
        autoSpin = true; // Enable automatic spinning
    }
});

draw();
