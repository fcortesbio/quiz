let currentQuestionIndex = 0; // Keeps track of which question the user is on
let selectedIncorrect = new Set(); // Stores indices of incorrect answers selected
let questions = []; // Define questions variable globally

const questionEl = document.querySelector(".question"); // HTML tag for question element
const optionsContainer = document.querySelector(".options"); // Options container
const feedbackEl = document.getElementById("feedback"); // Feedback element
const nextBtn = document.getElementById("next-btn"); // Next button

// Function to shuffle an array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
}

// Function to load a question and its options into the HTML page
function loadQuestion(questionData) {
  // Reset previous state and hide next button
  feedbackEl.innerText = "";
  nextBtn.style.display = "none";
  selectedIncorrect.clear();

  // Retrieve the current question and turn markdown to HTML
  const question = questionData[currentQuestionIndex];
  questionEl.innerHTML = marked.parse(question.question); // Parse markdown to HTML

  // Shuffle options
  const options = [...question.options]; // Make a copy of options in array
  shuffle(options);

  // Find the correct option index based on the original unshuffled order
  const correctOption = question.options[0][0]; // The correct option is always the first one in the original structure
  const correctIndex = options.findIndex(opt => opt[0] === correctOption);

  // Clear old buttons
  optionsContainer.innerHTML = "";

  // Add new option buttons and render markdown for options
  options.forEach((option, i) => {
    const button = document.createElement("button");
    button.innerHTML = marked.parseInline(option[0]); // Parse markdown for options
    button.setAttribute("data-index", i); // Store index of shuffled options
    button.setAttribute("data-feedback", option[1]); // Store personalized feedback
    button.addEventListener("click", (event) => handleOptionClick(event, correctIndex));
    optionsContainer.appendChild(button);
  });
}

// Handle the option click
function handleOptionClick(event, correctIndex) {
  const selectedIndex = parseInt(event.target.getAttribute("data-index"));
  const personalizedFeedback = event.target.getAttribute("data-feedback");

  if (selectedIndex === correctIndex) {
    feedbackEl.innerText = personalizedFeedback || "Correct! Well done!";
    feedbackEl.style.color = "green";
    nextBtn.style.display = "inline-block";
    // Disable all buttons after correct selection
    Array.from(optionsContainer.children).forEach((btn) => (btn.disabled = true));
  } else {
    if (!selectedIncorrect.has(selectedIndex)) {
      feedbackEl.innerText = personalizedFeedback || "Incorrect! Try again.";
      feedbackEl.style.color = "red";
      selectedIncorrect.add(selectedIndex); // Track incorrect answers

      // Add classes for styling and animation
      event.target.classList.add("wrong-answer", "incorrect");

      // Remove classes after a delay to allow for animation
      setTimeout(() => {
        event.target.classList.remove("wrong-answer", "incorrect");
      }, 500); // Remove after 500ms
    }
  }
}

// Handle next button click
nextBtn.addEventListener("click", function () {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    loadQuestion(questions);
  } else {
    // End of quiz
    questionEl.innerText = "Quiz completed!";
    optionsContainer.innerHTML = "";
    nextBtn.style.display = "none";
    feedbackEl.innerText = "";
  }
});

// Fetch questions from external JSON file
fetch("questions.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    questions = data;
    loadQuestion(questions); // Load the first question
  })
  .catch((error) => {
    console.error("Error loading questions:", error);
    document.getElementById("error-message").innerText =
      "Failed to load questions. Please try again later.";
    document.getElementById("error-message").style.display = "block"; // Show error message
  });