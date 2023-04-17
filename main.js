/**
 * Engine of Conway's Game of Life.
 * @author Yaroslav Surilov <zhibirc.echo@gmail.com>
 */
(() => {
    // delay in ms between generational permutations
    const DELAY_MS = 1_000;

    const $gameField = document.getElementById('game-field');
    const $fragment = document.createDocumentFragment();
    const $runButton = document.getElementById('start-stop');
    const $clearButton = document.getElementById('clear');
    const $statTotal = document.getElementById('total');
    const $statLive = document.getElementById('live');
    const $statDead = document.getElementById('dead');
    const $statTime = document.getElementById('time');
    const $delayInput = document.getElementById('delay');
    const $delayChosen = document.getElementById('delay-chosen');

    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 20 | 0;
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 20 | 0;
    const cellCount = vw * vh;
    const matrix = Array.from({length: vh}, () => []);
    const activeCellClassName = 'cell-live';
    const baseCellClassName = 'cell';

    let isGameActive = false;
    let timerId;

    updateStat();
    $delayChosen.textContent = $delayInput.value = DELAY_MS;

    for ( let index = 0, $cell, row, column; index < cellCount; index += 1 ) {
        $cell = document.createElement('div');
        $cell.className = baseCellClassName;
        $cell.state = 0;
        row = index / vw | 0;
        column = index % vw;
        matrix[row][column] = $cell;
        $fragment.appendChild($cell);
    }

    $gameField.appendChild($fragment);

    $gameField.addEventListener('click', event => {
        if ( isGameActive ) return;

        const $target = event.target;

        if ( $target.className === baseCellClassName ) {
            $target.state ^= 1;
            $target.classList.toggle(activeCellClassName);
            $target.state ? updateStat(1, -1, '-') : updateStat(-1, 1, '-');
        }
    });
    $runButton.addEventListener('click', () => {
        if ( isGameActive ) {
            isGameActive = false;
            $runButton.textContent = 'START';
            $clearButton.disabled = $delayInput.disabled = false;
        } else {
            isGameActive = true;
            $runButton.textContent = 'STOP';
            $clearButton.disabled = $delayInput.disabled = true;
        }

        live(isGameActive);
    });
    $clearButton.addEventListener('click', () => {
        if ( isGameActive ) return;

        [...$gameField.children].forEach($cell => {
            $cell.classList.remove(activeCellClassName);
            $cell.state = 0;
        });
        updateStat();
    });
    $delayInput.addEventListener('input', event => {
        $delayChosen.textContent = event.target.value;
    });

    function live ( state ) {
        if ( state ) {
            let startTime = Date.now();
            timerId = setInterval(() => {
                const toLive = [];
                const toDie = [];
                for ( let x = 0, $cell; x < vh; x += 1 ) {
                    for ( let y = 0; y < vw; y += 1 ) {
                        $cell = matrix[x][y];

                        const s1 = x ? matrix[x - 1][y ? y - 1 : vw - 1] : matrix[vh - 1][y ? y - 1 : vw - 1];
                        const s2 = x ? matrix[x - 1][y] : matrix[vh - 1][y];
                        const s3 = x ? matrix[x - 1][y === vw - 1 ? 0 : y + 1] : matrix[vh - 1][y === vw - 1 ? 0 : y + 1];
                        const s4 = y ? matrix[x][y - 1] : matrix[x][vw - 1];
                        const s5 = y === vw - 1 ? matrix[x][0] : matrix[x][y + 1];
                        const s6 = x === vh - 1 ? matrix[0][y ? y - 1 : vw - 1] : matrix[x + 1][y ? y - 1 : vw - 1];
                        const s7 = x === vh - 1 ? matrix[0][y] : matrix[x + 1][y];
                        const s8 = x === vh - 1 ? matrix[0][y === vw - 1 ? 0: y + 1] : matrix[x + 1][y === vw - 1 ? 0: y + 1];

                        const liveSiblings = [s1, s2, s3, s4, s5, s6, s7, s8].filter(s => s.state === 1);

                        if ( $cell.state ) {
                            if ( liveSiblings.length < 2 || liveSiblings.length > 3 ) toDie.push($cell);
                        } else if ( liveSiblings.length === 3 ) toLive.push($cell);
                    }
                }
                toLive.forEach($cell => {
                    $cell.state = 1;
                    $cell.classList.add(activeCellClassName);
                    updateStat(1, -1, (Date.now() - startTime) / 1_000 | 0);
                });
                toDie.forEach($cell => {
                    $cell.state = 0;
                    $cell.classList.remove(activeCellClassName);
                    updateStat(-1, 1, (Date.now() - startTime) / 1_000 | 0);
                });
            }, +$delayInput.value);
        } else {
            clearInterval(timerId);
        }
    }

    function updateStat (live, dead, time) {
        if (arguments.length) {
            $statLive.textContent = (+$statLive.textContent || 0) + live;
            $statDead.textContent = (+$statDead.textContent || 0) + dead;
            $statTime.textContent = time;
        } else {
            $statTotal.textContent = $statDead.textContent = cellCount;
            $statLive.textContent = 0;
            $statTime.textContent = '-';
        }
    }
})();
