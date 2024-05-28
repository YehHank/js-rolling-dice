const faces = ['front', 'left', 'bottom', 'top', 'right', 'back'];
const oppsiteFaces = {
  front: 'back',
  right: 'left',
  back: 'front',
  left: 'right',
  top: 'bottom',
  bottom: 'top'
};

class DiceCube extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div class="dice-cube">
        <div class="cube">
          <div class="cube__face cube__face--front"></div>
          <div class="cube__face cube__face--back"></div>
          <div class="cube__face cube__face--right"></div>
          <div class="cube__face cube__face--left"></div>
          <div class="cube__face cube__face--top"></div>
          <div class="cube__face cube__face--bottom"></div>
        </div>  
      </div>
    `;
    this.face = 'front';
    this.prevFace = '';
  }
  get points() {
    return faces.indexOf(this.face) + 1;
  }
  roll(face) {
    let cube = this.querySelector('.cube');
    cube.className = 'cube';
    cube.classList.add(`show-${face}`);
    this.prevFace = this.face;
    this.face = face;
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 220);
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
      } while (nextFace === this.face || nextFace === this.prevFace || nextFace === oppsiteFaces[this.face]);
      await this.roll(nextFace);
    }
    await this.roll(this.randomFace());
  }
}

customElements.define('dice-cube', DiceCube);

const cubes = [...document.querySelectorAll('dice-cube')];
let selectedScores = {};

document.querySelector('#roll-dice').addEventListener('click', async function () {
  await Promise.all(cubes.map(c => c.throw()));
  const pointsArray = cubes.map(c => c.points);

  // Calculate possible scores
  const scores = calculateScores(pointsArray);

  // Display possible scores in the table
  Object.keys(scores).forEach(category => {
    const scoreCell = document.getElementById(`score-${category}`);
    if (!scoreCell.classList.contains('selected')) {
      scoreCell.textContent = scores[category];
    }
  });

  // Enable selecting scores
  document.querySelectorAll('.score-table tbody tr').forEach(row => {
    const category = row.getAttribute('data-category');
    row.onclick = function () {
      if (!row.classList.contains('selected')) {
        row.classList.add('selected');
        row.querySelector('td:last-child').classList.add('selected');
        selectedScores[category] = scores[category];
        updateTotalScore();
      }
    };
  });
});

function calculateScores(pointsArray) {
  const onesScore = pointsArray.filter(p => p === 1).length * 1;
  const twosScore = pointsArray.filter(p => p === 2).length * 2;
  const threesScore = pointsArray.filter(p => p === 3).length * 3;
  const foursScore = pointsArray.filter(p => p === 4).length * 4;
  const fivesScore = pointsArray.filter(p => p === 5).length * 5;
  const sixesScore = pointsArray.filter(p => p === 6).length * 6;

  const counts = pointsArray.reduce((acc, num) => {
    acc[num] = (acc[num] || 0) + 1;
    return acc;
  }, {});

  const threeOfKind = Object.values(counts).some(count => count >= 3) ? pointsArray.reduce((a, b) => a + b, 0) : 0;
  const fourOfKind = Object.values(counts).some(count => count >= 4) ? pointsArray.reduce((a, b) => a + b, 0) : 0;
  const fullHouse = Object.values(counts).includes(3) && Object.values(counts).includes(2) ? 25 : 0;
  const smallStraight = [1, 2, 3, 4].every(num => counts[num]) || [2, 3, 4, 5].every(num => counts[num]) || [3, 4, 5, 6].every(num => counts[num]) ? 30 : 0;
  const largeStraight = [1, 2, 3, 4, 5].every(num => counts[num]) || [2, 3, 4, 5, 6].every(num => counts[num]) ? 40 : 0;
  const yacht = Object.values(counts).some(count => count === 5) ? 50 : 0;
  const chance = pointsArray.reduce((a, b) => a + b, 0);

  return {
    ones: onesScore,
    twos: twosScore,
    threes: threesScore,
    fours: foursScore,
    fives: fivesScore,
    sixes: sixesScore,
    'three-kind': threeOfKind,
    'four-kind': fourOfKind,
    'full-house': fullHouse,
    'small-straight': smallStraight,
    'large-straight': largeStraight,
    yacht: yacht,
    chance: chance
  };
}

function updateTotalScore() {
  const totalScore = Object.values(selectedScores).reduce((a, b) => a + b, 0);
  document.getElementById('total-score').textContent = totalScore;
}
