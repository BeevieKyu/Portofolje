const customCursor = document.querySelector('.custom-cursor');
const currentYear = document.querySelector('#current-year');
const logo = document.querySelector('.logo');
const terminalForm = document.querySelector('#terminal-form');
const terminalHistory = document.querySelector('#terminal-history');
const terminalInput = document.querySelector('#terminal-input');
let logoClicks = 0;

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

if (logo) {
    logo.addEventListener('click', (event) => {
        event.preventDefault();
        logoClicks += 1;

        if (logoClicks === 5) {
            window.alert('yippi you found the easter egg, now you must hire me.');
            logoClicks = 0;
        }
    });
}

if (terminalForm && terminalHistory && terminalInput) {
    const commands = {
        help: 'commands: whoami, current_focus, skills, work, contact, clear',
        whoami: 'i know who i am, do you know who you are?',
        current_focus: 'working on my bachelor :O',
        skills: 'HTML, CSS, JavaScript, React, Bash, SQL, PHP, Python, Node.js',
        work: 'scroll down, you wont be disappointed',
        contact: 'Marie.a.klausen@gmail.com',
        hire: 'that was a legally binding contract, you have to hire me now',
        hireme: 'that was a legally binding contract, you have to hire me now',
        hiering: 'that was a legally binding contract, you have to hire me now',
        ansett: 'that was a legally binding contract, you have to hire me now',
        hello: 'hello, nice to meet you!'
    };

    terminalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const command = terminalInput.value.trim().toLowerCase();

        if (!command) {
            return;
        }

        const commandLine = document.createElement('p');
        const commandPrompt = document.createElement('span');
        commandPrompt.className = 'prompt';
        commandPrompt.textContent = '$';
        commandLine.append(commandPrompt, ` ${command}`);
        terminalHistory.append(commandLine);

        if (command === 'clear') {
            terminalHistory.replaceChildren();
        } else {
            const output = document.createElement('p');
            output.className = 'console-output';
            output.textContent = commands[command] || `command not found: ${command}`;
            terminalHistory.append(output);
        }

        terminalInput.value = '';
        terminalInput.focus();
        terminalHistory.scrollTop = terminalHistory.scrollHeight;
    });
}

if (customCursor && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', (event) => {
        customCursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) rotate(155deg)`;
    });

    document.addEventListener('pointerdown', () => {
        customCursor.classList.add('is-clicking');
    });

    document.addEventListener('pointerup', () => {
        customCursor.classList.remove('is-clicking');
    });
}