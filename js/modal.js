setTimeout(() => {
  const userResponses = localStorage.getItem("userResponses");
  if (!userResponses) {
    openModal();
  }
}, 3000);

function openModal() {
  document.getElementById("suggestion-modal").style.display = "block";
  renderQuestion();
}

function closeModal() {
  document.getElementById("suggestion-modal").style.display = "none";
}

const questions = [
  {
    question: "Bạn bao nhiêu tuổi?",
    key: "age",
    answers: ["Dưới 18", "18-25", "26-35", "Trên 35"],
  },
  {
    question: "Giới tính của bạn là gì?",
    key: "gender",
    answers: ["Nam", "Nữ", "Khác"],
  },
  {
    question: "Màu sắc yêu thích của bạn là gì?",
    key: "color",
    answers: ["Đỏ", "Xanh", "Vàng", "Đen", "Trắng"],
  },
];

let currentQuestion = 0;
let userResponses = {};

function renderQuestion() {
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = "";
  const question = questions[currentQuestion];
  const questionElement = document.createElement("div");
  questionElement.innerText = question.question;

  question.answers.forEach((answer) => {
    const button = document.createElement("button");
    button.innerText = answer;
    button.onclick = () => {
      handleAnswer(question.key, answer);
    };
    questionElement.appendChild(button);
  });

  quizDiv.appendChild(questionElement);
}

function handleAnswer(key, answer) {
  userResponses[key] = answer;

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    localStorage.setItem("userResponses", JSON.stringify(userResponses));
    suggestProducts();
  }
}

function suggestProducts() {
  const quizDiv = document.getElementById("quiz");
  quizDiv.innerHTML = "";

  const suggestionsDiv = document.getElementById("suggestions");
  suggestionsDiv.innerHTML =
    "Cảm ơn bạn đã hoàn thành khảo sát! Chúc bạn mua sắm vui vẻ";

  const continueButton = document.createElement("button");
  continueButton.classList.add("continue-shopping");
  continueButton.innerText = "Tiếp tục mua sắm";
  continueButton.onclick = closeModal;
  continueButton.style.marginTop = "20px";

  suggestionsDiv.appendChild(continueButton);
}
