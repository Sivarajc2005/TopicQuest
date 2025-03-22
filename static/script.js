let score = 0; // Initialize score
let totalQuestions = 0; // Track the total number of questions attempted

function fetchMCQs() {

    let loder = document.getElementById("loader");
    loder.style.display = "block";

    let topic = document.getElementById("topic").value;
    if (!topic) {
        alert("Please enter a topic!");
        return;
    }

    fetch("/get_mcqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic })
    })
    .then(response => response.json())
    .then(data => {
        let container = document.getElementById("mcq-container");
        container.innerHTML = "";
        score = 0; // Reset score for new questions
        totalQuestions = data.mcqs.length; // Set total questions count

        // Display Score at the Top
        let scoreEl = document.createElement("p");
        scoreEl.id = "score-display";
        scoreEl.innerText = `Score: ${score}`;
        container.appendChild(scoreEl);

        if (data.error) {
            container.innerHTML += `<p style='color:red;'>${data.error}</p>`;
            return;
        }
        loder.style.display = "none";
        data.mcqs.forEach((mcq, index) => {
            let questionEl = document.createElement("div");
            questionEl.classList.add("question");
            questionEl.innerHTML = `<p>${index + 1}. ${mcq.question}</p>`;

            let optionsEl = document.createElement("ul");
            optionsEl.classList.add("options");

            mcq.options.forEach(option => {
                let optionEl = document.createElement("li");
                optionEl.innerText = option;
                optionEl.onclick = () => handleAnswer(optionEl, option, mcq.answer, index, data.mcqs);
                optionsEl.appendChild(optionEl);
            });

            questionEl.appendChild(optionsEl);
            container.appendChild(questionEl);
        });
    })
    .catch(error => console.error("Error fetching MCQs:", error));
}

function handleAnswer(optionEl, selectedOption, correctAnswer, questionIndex, mcqs) {
    let options = optionEl.parentElement.querySelectorAll("li");

    // Prevent changing color after the first click
    if (optionEl.parentElement.classList.contains("answered")) return;

    optionEl.parentElement.classList.add("answered"); // Mark question as answered

    if (selectedOption === correctAnswer) {
        optionEl.style.backgroundColor = "green"; // Correct answer
        optionEl.style.color = "white";
        score++; // Increase score
    } else {
        optionEl.style.backgroundColor = "red"; // Incorrect answer
        optionEl.style.color = "white";
    }

    // Disable other options for this question
    options.forEach(opt => opt.style.pointerEvents = "none");

    // Update Score Display
    document.getElementById("score-display").innerText = `Score: ${score}`;

    // Check if all questions are answered
    let answeredQuestions = document.querySelectorAll(".answered").length;
    if (answeredQuestions === totalQuestions) {
        displayCorrectAnswers(mcqs);
    }
}

function displayCorrectAnswers(mcqs) {
    let container = document.getElementById("mcq-container");

    let answersEl = document.createElement("div");
    answersEl.classList.add("correct-answers");
    answersEl.innerHTML = `<h3>Correct Answers:</h3>`;

    mcqs.forEach((mcq, index) => {
        let answerEl = document.createElement("p");
        answerEl.innerHTML = `<strong>${index + 1}. ${mcq.question}</strong><br>✅ Answer: ${mcq.answer}`;
        answersEl.appendChild(answerEl);
    });

    container.appendChild(answersEl);
}
