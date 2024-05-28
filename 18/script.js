const faces = ['front', 'left', 'bottom', 'top', 'right', 'back'];
const oppositeFaces = {
    front: 'back',
    right: 'left',
    back: 'front',
    left: 'right',
    top: 'bottom',
    bottom: 'top'
};

class DiceCube {
    constructor(element) {
        this.element = element;
        this.cube = element.querySelector('.cube');
        this.face = 'front';
        this.prevFace = '';
    }

    get points() {
        return faces.indexOf(this.face) + 1;
    }

    roll(face) {
        this.cube.className = 'cube';
        this.cube.classList.add(`show-${face}`);
        this.prevFace = this.face;
        this.face = face;
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, 150);
        });
    }

    randomFace() {
        return faces[Math.floor(Math.random() * faces.length)];
    }

    async throw() {
        const times = 5;
        for (let i = 0; i < times; i++) {
            let nextFace;
            do {
                nextFace = this.randomFace();
            } while (nextFace === this.face || nextFace === this.prevFace || nextFace === oppositeFaces[this.face]);
            await this.roll(nextFace);
        }
        await this.roll(this.randomFace());
    }
}

function isOverlapping(x, y, width, height, positions) {
    return positions.some(pos => {
        return (
            x < pos.x + width &&
            x + width > pos.x &&
            y < pos.y + height &&
            y + height > pos.y
        );
    });
}

async function animateDice() {
    const diceElements = [
        document.getElementById('dice1'),
        document.getElementById('dice2'),
        document.getElementById('dice3'),
        document.getElementById('dice4')
    ];

const dicePositions = [];
    const animations = diceElements.map(async (diceElement) => {
      
      const boxWidth = diceElements[0].offsetWidth;
      const boxHeight = diceElements[0].offsetHeight;

        const maxX = window.innerWidth - boxWidth;
        const maxY = window.innerHeight - boxHeight;

        do {
            randomX = Math.floor(Math.random() * maxX);
            randomY = Math.floor(Math.random() * maxY);
        } while (isOverlapping(randomX, randomY, boxWidth, boxHeight, dicePositions));

        dicePositions.push({ x: randomX, y: randomY });

        diceElement.style.left = `${randomX}px`;
        diceElement.style.top = `${randomY}px`;

        const dice = new DiceCube(diceElement);
        await dice.throw();
    });
    await Promise.all(animations);
}

document.getElementById('dice-container').addEventListener('click',animateDice);
let shakeEvent = new Shake({ threshold: 15 });
shakeEvent.start();
window.addEventListener('shake', animateDice, false);
