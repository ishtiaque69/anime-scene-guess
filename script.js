let timer;
let timeLeft = 600; // 10 minutes in seconds

function startQuiz() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    if (!name || !phone || !email) {
        alert('Please enter your name, phone number, and email.');
        return;
    }

    // Retrieve the submissions from local storage, or initialize as an empty array if none exist
    const submissions = JSON.parse(localStorage.getItem('submissions')) || [];

    // Check if the email already exists in the submissions
    const emailExists = submissions.some(submission => submission.email === email);

    if (emailExists) {
        alert("This email ID has already been used to take the quiz.");
        return;
    }

    // Add the new submission to the submissions array
    submissions.push({ name, phone, email });

    // Save the updated submissions array back to local storage
    localStorage.setItem('submissions', JSON.stringify(submissions));

    // Store individual items in local storage (optional, if needed)
    localStorage.setItem('userName', name);
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('userEmail', email);

    // Redirect to quiz page
    window.location.href = 'quiz.html';
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    timer = setInterval(() => {
        timeLeft--;
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            submitQuiz();
        }
    }, 1000);
}

function submitQuiz() {
    clearInterval(timer);

    const form = document.getElementById('quizForm');
    const formData = new FormData(form);
    let score = 0;

    for (let [key, value] of formData.entries()) {
        if (value === 'correct') {
            score += 1;
        } else if (value === 'wrong') {
            score -= 0.25;
        }
    }

    const timeTaken = 600 - timeLeft;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeFinal = `${minutes} min ${seconds} sec`;
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: userName, email: userEmail, points: score, time: timeTaken });

    leaderboard.sort((a, b) => b.points - a.points || a.time - b.time);

    // Update ranks after sorting
    leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
    });

    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

    window.location.href = 'results.html';
}

function loadResults() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const leaderboardTable = document.getElementById('leaderboard').querySelector('tbody');
    const userResultTable = document.getElementById('userResult').querySelector('tbody');
    const userName = localStorage.getItem('userName');
    let userRank, userEntry;

    // Clear existing rows
    leaderboardTable.innerHTML = '';
    userResultTable.innerHTML = '';

    // Populate the entire leaderboard
    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        const minutes = Math.floor(entry.time / 60);
        const seconds = entry.time % 60;
        const timeFinal = `${minutes} min ${seconds < 10 ? '0' : ''}${seconds} sec`;

        row.innerHTML = `<td>${entry.rank}</td><td>${entry.name}</td><td>${entry.points}</td><td>${timeFinal}</td><td>${entry.email}</td>`;
        
        if (entry.rank <= 3) {
            row.classList.add('top3');
        }

        leaderboardTable.appendChild(row);

        if (entry.name === userName) {
            userRank = entry.rank;
            userEntry = entry;
        }
    });

    // Populate user result table
    if (userEntry) {
        const minutes = Math.floor(userEntry.time / 60);
        const seconds = userEntry.time % 60;
        const timeFinal = `${minutes} min ${seconds < 10 ? '0' : ''}${seconds} sec`;
        const row = document.createElement('tr');

        row.innerHTML = `<td>${userRank}</td><td>${userEntry.name}</td><td>${userEntry.points}</td><td>${timeFinal}</td><td>${userEntry.email}</td>`;
        userResultTable.appendChild(row);
    }

    document.getElementById('thankYouMessage').textContent = `Thank you, ${userName}, for participating!`;
}

if (window.location.pathname.endsWith('quiz.html')) {
    startTimer();
} else if (window.location.pathname.endsWith('results.html')) {
    loadResults();
}
