class GameManager {
    constructor() {
        // Constants
        this.MATRIX_DIMENSION = 10;
        this.UNIT = 0.08038;
        this.BOUND = this.UNIT * 4.5;
        this.INTENSITY_UNIT = 1 / 34;
        this.FIXATION_LIMIT = 4;

        // Game state variables
        this.dots = [];
        this.maxIntensity = this.get2DMatrix(this.MATRIX_DIMENSION, this.MATRIX_DIMENSION);
        this.currentDot = null;
        this.dotPressed = false;
        this.started = false;
        this.eye = null;
        this.pressCount = 0;

        this.initializeDots();
    }

    initializeDots() {
        // Similar to Unity's Start method for dot initialization
        for (let x = -this.BOUND; x <= this.BOUND; x += this.UNIT) {
            for (let y = -this.BOUND; y <= this.BOUND; y += this.UNIT) {
                const dot = new Dot(x, y);
                const [i, j] = this.getMatrixIndices(dot);

                const isTopRow = i < 3 && (i + j) >= 3 && (i + j) <= (2 * i + 6);
                const isMiddleRow = i >= 3 && i <= 6;
                const isBottomRow = i > 6 && (i + j) <= 15 && (i + j) >= (2 * i - 6);

                if (isTopRow || isMiddleRow || isBottomRow) {
                    this.dots.push(dot);
                    this.maxIntensity[i][j] = 0;
                }
            }
        }

        // In a real implementation, you'd set the current eye 
        // This might come from a device or configuration
        this.eye = this.getCurrentEye();
    }

    // Simulated method to get current eye
    getCurrentEye() {
        // In actual implementation, this would interact with device/app
        return Math.random() > 0.5 ? 'Left' : 'Right';
    }

    async startGame() {
        this.started = true;
        await this.startCounter();
        await this.displayDots();
    }

    async startCounter() {
        for (let counter = 3; counter > 0; counter--) {
            console.log(counter);
            await this.wait(1000);
        }
    }

    async displayDots() {
        await this.wait(1000);

        let dotsPressed = 0;
        let blindSpotPressed = 0;
        let totalDotsShown = 0;

        while (this.dots.length > 0) {
            totalDotsShown++;

            // Choose and remove a random dot
            const randomIndex = Math.floor(Math.random() * this.dots.length);
            const dot = this.dots.splice(randomIndex, 1)[0];

            // Simulate dot display
            this.currentDot = dot;
            console.log(`Displaying dot at (${dot.position.x}, ${dot.position.y})`);

            await this.wait(150);  // Display time

            await this.wait(450);  // Window to press button
            this.currentDot = null;

            await this.wait(Math.random() * (900 - 550) + 550);  // Break between dots

            const [i, j] = this.getMatrixIndices(dot);

            if (this.isBlindSpot(dot)) {
                if (this.dotPressed) {
                    blindSpotPressed++;
                    dotsPressed++;
                }

                if (blindSpotPressed > this.FIXATION_LIMIT) break;
                
                dot.intensity += 3 * this.INTENSITY_UNIT;
                if (dot.intensity <= 1) this.dots.push(dot);
            } else if (this.dotPressed) {
                dotsPressed++;
                this.maxIntensity[i][j] = this.convertIntensity(dot.intensity);
            } else {
                dot.intensity += (Math.random() <= 2/3 ? 1 : 2) * this.INTENSITY_UNIT;
                if (dot.intensity <= 1) this.dots.push(dot);
                else this.maxIntensity[i][j] = 0;
            }

            this.dotPressed = false;
        }

        // Calculate results
        const falsePositive = Math.round((this.pressCount - dotsPressed) * 100 / this.pressCount);
        const falseNegative = Math.round((totalDotsShown - dotsPressed) * 100 / totalDotsShown);

        const result = {
            maxIntensity: this.maxIntensity,
            falsePositive,
            falseNegative,
            failedFixation: blindSpotPressed > this.FIXATION_LIMIT
        };

        console.log(result);
        return result;
    }

    pressDot() {
        this.pressCount++;
        if (this.currentDot === null || this.dotPressed) return;
        this.dotPressed = true;
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    get2DMatrix(n, m, defaultValue = -1) {
        return Array.from({ length: n }, () => 
            Array.from({ length: m }, () => defaultValue)
        );
    }

    getMatrixIndices(dot) {
        const nx = Math.round((dot.position.x + this.BOUND) / this.UNIT);
        const ny = Math.round((dot.position.y + this.BOUND) / this.UNIT);
        return [9 - ny, nx];
    }

    isBlindSpot(dot) {
        const [i, j] = this.getMatrixIndices(dot);
        return this.eye === 'Left' 
            ? (i === 5 && j === 2)
            : (i === 5 && j === 7);
    }

    convertIntensity(i) {
        i = 1.2 - i;
        return Math.round((i - 0.2) / (1.0 - 0.2) * 34 + 1);
    }
}

class Dot {
    constructor(x, y, intensity = 0) {
        this.position = { x, y };
        this.intensity = intensity;
    }
}

// Example usage
// const gameManager = new GameManager();
// gameManager.startGame();