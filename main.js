
// ======================
// تهيئة AOS للأنيميشن
// ======================
AOS.init();

// ======================
// تأثير الكتابة لاسم المستخدم
// ======================
const text = "ABDULLAH MOHAMED";
let index = 0;

function typeName() {
  if (index < text.length) {
    document.getElementById("typing-name").innerHTML += text.charAt(index);
    index++;
    setTimeout(typeName, 100);
  }
}

typeName();

// ======================
// تأثير الكتابة للوظائف
// ======================
const jobs = ["Frontend Developer", "UI Designer", "Web Developer", "Freelancer"];
let jobIndex = 0;
let charIndex = 0;
let currentJob = "";
let isDeleting = false;

function typeEffect() {
  currentJob = jobs[jobIndex];

  if (isDeleting) {
    charIndex--;
  } else {
    charIndex++;
  }

  document.getElementById("typing-job").textContent =
    currentJob.substring(0, charIndex);

  let speed = 100;

  if (isDeleting) {
    speed = 50;
  }

  if (!isDeleting && charIndex === currentJob.length) {
    speed = 1500; // توقف قبل الحذف
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    jobIndex++;
    if (jobIndex === jobs.length) {
      jobIndex = 0;
    }
  }

  setTimeout(typeEffect, speed);
}

typeEffect();

// ======================
// زرار العودة للأعلى (Scroll To Top)
// ======================
const scrollBtn = document.getElementById("scrollTop");

window.addEventListener("scroll", function () {
  if (window.scrollY > 300) {
    scrollBtn.style.display = "block";
  } else {
    scrollBtn.style.display = "none";
  }
});

scrollBtn.onclick = function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

// ======================
// شاشة اللودينج (Loader Screen)
// ======================
window.addEventListener("load", function () {
  const loader = document.getElementById("loader");
  loader.style.transition = "opacity 0.5s ease";
  loader.style.opacity = 0;
  setTimeout(function () {
    loader.style.display = "none";
  }, 500);
});

// ======================
// زرار المينيو للموبايل
// ======================
const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

menuToggle.addEventListener('click', () => {
  menu.classList.toggle('active'); // فتح/غلق القائمة
  menuToggle.classList.toggle('open'); // لتحويل الهامبرغر لعلامة X
});