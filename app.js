let patientAgeGroup = null;
let deferredPrompt = null;

/* ===================== PWA INSTALL ===================== */

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  updateInstallButton();
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  updateInstallButton();
});

function updateInstallButton(){
  const installArea = document.getElementById("installArea");

  if(!installArea) return;

  if(deferredPrompt){
    installArea.innerHTML = `
      <button onclick="installCareBridge()">📲 Install CareBridge</button>
    `;
  } else {
    installArea.innerHTML = "";
  }
}

async function installCareBridge(){
  if(!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  updateInstallButton();
}

/* ===================== ENTRY ===================== */

function startCheck(){
  selectAgeGroup();
}

function selectAgeGroup(){
  document.getElementById("app").innerHTML = `
    <h2>Patient Profile</h2>
    <p>Who is this assessment for?</p>

    <div class="actions">
      <button onclick="setAgeGroup('child','Child (0–12)')">Child (0–12)</button>
      <button onclick="setAgeGroup('teen','Teen (13–17)')">Teen (13–17)</button>
      <button onclick="setAgeGroup('adult','Adult (18–64)')">Adult (18–64)</button>
      <button onclick="setAgeGroup('elderly','Elderly (65+)')">Elderly (65+)</button>
    </div>

    <div class="actions">
      <button onclick="goHome()">⬅ Back</button>
    </div>
  `;
}

function setAgeGroup(key, label){
  patientAgeGroup = { key, label };
  showSymptomCategories();
}

function showSymptomCategories(){
  document.getElementById("app").innerHTML = `
    <h2>Select Symptom Category</h2>
    <p style="margin-top:6px; color:#475569; font-size:13px;">
      Assessment for: <strong>${patientAgeGroup.label}</strong>
    </p>

    <div class="actions" style="margin-top:10px; display:flex;gap:10px;">
      <button onclick="goHome()">⬅ Back</button>
      <button onclick="selectAgeGroup()">👤 Change Age Group</button>
    </div>

    <div id="installArea" class="actions" style="margin-top:10px;"></div>

    <input
      id="searchSymptoms"
      placeholder="🔎Search symptoms (tooth, fever, vomiting...)"
      oninput="filterSymptoms()"
      style="margin:10px 0;"
    >

    <div id="noResults" style="display:none; font-size:13px; color:#64748b; margin:8px 0 4px 0;">
      No matching symptom found. Try: fever, tooth, stomach, vomiting.
    </div>

    <div class="actions" id="symptomList">
      <button onclick="fever()">🤒 Fever / Malaria</button>
      <button onclick="dental()">🦷 Dental Pain</button>
      <button onclick="stomach()">🤢 Stomach Pain</button>
    </div>

  `;

  updateInstallButton();
}

function filterSymptoms(){
  const input = document.getElementById("searchSymptoms").value.toLowerCase().trim();

  const symptomMap = [
    {
      id: 0,
      keywords: ["fever", "malaria", "temperature", "hot body", "hot", "chills", "sweating", "body hot"]
    },
    {
      id: 1,
      keywords: ["dental", "tooth", "teeth", "gum", "gums", "mouth", "swelling", "toothache", "tooth pain", "mouth pain"]
    },
    {
      id: 2,
      keywords: ["stomach", "belly", "vomit", "vomiting", "abdominal", "abdomen", "pain", "nausea", "stomach ache", "belly pain"]
    }
  ];

  const buttons = document.querySelectorAll("#symptomList button");
  let visibleCount = 0;

  buttons.forEach((button, index) => {
    const buttonText = button.innerText.toLowerCase();

    const matchedGroup = symptomMap.find(item => item.id === index);
    const matchesText = buttonText.includes(input);
    const matchesKeyword = matchedGroup
      ? matchedGroup.keywords.some(keyword => keyword.includes(input) || input.includes(keyword))
      : false;

    if(input === "" || matchesText || matchesKeyword){
      button.style.display = "block";
      visibleCount++;
    } else {
      button.style.display = "none";
    }
  });

  const noResults = document.getElementById("noResults");
  if(noResults){
    noResults.style.display = visibleCount === 0 ? "block" : "none";
  }
}

function newAssessment(){
  if(patientAgeGroup){
    showSymptomCategories();
  } else {
    selectAgeGroup();
  }
}

/* ===================== FEVER ===================== */

function fever(){
  document.getElementById("app").innerHTML = `
    <h2>Fever Assessment</h2>
    <p>Is the fever very high (about 39°C or more)?</p>

    <div class="actions">
      <button onclick="feverStep2(true)">Yes</button>
      <button onclick="feverStep2(false)">No</button>
    </div>

    <div class="actions">
      <button onclick="showSymptomCategories()">⬅ Back</button>
    </div>
  `;
}

function feverStep2(highFever){
  if(highFever){
    document.getElementById("app").innerHTML = `
      <h2>Fever Assessment</h2>
      <p>Any danger signs (severe weakness, confusion, convulsions, difficulty breathing)?</p>

      <div class="actions">
        <button onclick="feverResult('dangerYes')">Yes</button>
        <button onclick="feverResult('dangerNo')">No</button>
      </div>

      <div class="actions">
        <button onclick="fever()">⬅ Back</button>
      </div>
    `;
  } else {
    document.getElementById("app").innerHTML = `
      <h2>Fever Assessment</h2>
      <p>Has the fever lasted more than 3 days?</p>

      <div class="actions">
        <button onclick="feverResult('daysMore')">Yes</button>
        <button onclick="feverResult('daysLess')">No</button>
      </div>

      <div class="actions">
        <button onclick="fever()">⬅ Back</button>
      </div>
    `;
  }
}

function feverResult(type){
  if(type === "dangerYes"){
    showResult("urgent");
  } else if(type === "dangerNo"){
    showResult("moderate");
  } else if(type === "daysMore"){
    showResult("urgent");
  } else {
    showResult("mild");
  }
}

/* ===================== DENTAL ===================== */

function dental(){
  document.getElementById("app").innerHTML = `
    <h2>Dental Pain Assessment</h2>
    <p>Is the pain severe?</p>

    <div class="actions">
      <button onclick="dentalStep2(true)">Yes</button>
      <button onclick="dentalStep2(false)">No</button>
    </div>

    <div class="actions">
      <button onclick="showSymptomCategories()">⬅ Back</button>
    </div>
  `;
}

function dentalStep2(severe){
  document.getElementById("app").innerHTML = `
    <h2>Dental Pain Assessment</h2>
    <p>Is there swelling on the face or gums?</p>

    <div class="actions">
      <button onclick="dentalResult(${severe}, true)">Yes</button>
      <button onclick="dentalResult(${severe}, false)">No</button>
    </div>

    <div class="actions">
      <button onclick="dental()">⬅ Back</button>
    </div>
  `;
}

function dentalResult(severe, swelling){
  if(severe && swelling){
    showResult("urgent");
  } else if(severe || swelling){
    showResult("moderate");
  } else {
    showResult("mild");
  }
}

/* ===================== STOMACH ===================== */

function stomach(){
  document.getElementById("app").innerHTML = `
    <h2>Stomach Pain Assessment</h2>
    <p>Is the pain severe?</p>

    <div class="actions">
      <button onclick="stomachStep2(true)">Yes</button>
      <button onclick="stomachStep2(false)">No</button>
    </div>

    <div class="actions">
      <button onclick="showSymptomCategories()">⬅ Back</button>
    </div>
  `;
}

function stomachStep2(severe){
  document.getElementById("app").innerHTML = `
    <h2>Stomach Pain Assessment</h2>
    <p>Are you vomiting?</p>

    <div class="actions">
      <button onclick="stomachResult(${severe}, true)">Yes</button>
      <button onclick="stomachResult(${severe}, false)">No</button>
    </div>

    <div class="actions">
      <button onclick="stomach()">⬅ Back</button>
    </div>
  `;
}

function stomachResult(severe, vomiting){
  if(severe && vomiting){
    showResult("urgent");
  } else if(severe || vomiting){
    showResult("moderate");
  } else {
    showResult("mild");
  }
}

/* ===================== RESULT SCREEN ===================== */

function showResult(level){
  let title = "";
  let className = "";
  let action = "";
  let steps = [];
  let redFlags = [];

  const ageNote = patientAgeGroup ? `For: ${patientAgeGroup.label}` : "For: Not set";

  if(level === "urgent"){
    title = "🔴 Urgent";
    className = "urgent";
    action = "Seek medical help immediately.";
    steps = [
      "Go to the nearest hospital/clinic now.",
      "If you can’t move easily, ask someone to help you get care.",
      "Avoid self-medicating with unknown drugs."
    ];
    redFlags = [
      "Difficulty breathing",
      "Confusion / fainting",
      "Convulsions",
      "Severe swelling spreading",
      "Persistent vomiting / dehydration signs"
    ];
  } else if(level === "moderate"){
    title = "🟡 Moderate";
    className = "moderate";
    action = "Monitor closely and consider a clinic visit soon.";
    steps = [
      "Rest and stay hydrated.",
      "Avoid triggers (very spicy foods, alcohol, smoking) where relevant.",
      "If symptoms persist or worsen in 24–48 hours, visit a clinic."
    ];
    redFlags = [
      "Pain getting worse rapidly",
      "New swelling",
      "High fever developing",
      "Vomiting starts or increases"
    ];
  } else {
    title = "🟢 Mild";
    className = "mild";
    action = "Likely mild — monitor symptoms and practice self-care.";
    steps = [
      "Rest and hydrate.",
      "Use safe basic care (warm salt water rinse for mild mouth discomfort, light meals for mild stomach issues).",
      "If symptoms don’t improve, reassess or visit a clinic."
    ];
    redFlags = [
      "Symptoms worsen instead of improving",
      "Severe pain starts",
      "Swelling appears",
      "High fever develops"
    ];
  }

  const stepsHtml = steps.map(step => `<li>${step}</li>`).join("");
  const flagsHtml = redFlags.map(flag => `<li>${flag}</li>`).join("");

  document.getElementById("app").innerHTML = `
    <h2>Assessment Result</h2>

    <div class="${className}" style="text-align:left;">
      <strong style="font-size:16px;">${title}</strong><br>
      <span>${action}</span>
      <div style="margin-top:6px; font-size:12px; opacity:0.95;">${ageNote}</div>
    </div>

    <div style="text-align:left; margin-top:12px;">
      <h3 style="margin:10px 0 6px 0; font-size:14px;">Next steps</h3>
      <ul style="margin:0; padding-left:18px; line-height:1.5;">
        ${stepsHtml}
      </ul>

      <h3 style="margin:12px 0 6px 0; font-size:14px;">Red flags (go for care if any happens)</h3>
      <ul style="margin:0; padding-left:18px; line-height:1.5;">
        ${flagsHtml}
      </ul>

      <p style="font-size:12px; color:#64748b; margin-top:10px;">
        Generated by CareBridge Prototype • ${new Date().toLocaleTimeString()}
      </p>
    </div>

    <div class="actions" style="margin-top:12px;">
      <button onclick="newAssessment()">New Assessment</button>
      <button onclick="goHome()">Home</button>
    </div>
  `;
}

/* ===================== ABOUT + HOME ===================== */

function showAbout(){
  document.getElementById("app").innerHTML = `
    <h2>About CareBridge</h2>
    <p>
      CareBridge is a lightweight symptom triage prototype built for low-connectivity communities.
      It helps users quickly check common symptoms and understand whether a situation is likely mild,
      moderate, or urgent.
    </p>
    <p>
      This is an MVP prototype for the 3MTT NextGen Knowledge Showcase. It is not a medical diagnosis tool.
      If symptoms feel severe or worsen, seek professional care.
    </p>

    <div class="actions">
      <button onclick="startCheck()">Start Symptom Check</button>
    </div>
  `;
}

function goHome(){
  patientAgeGroup = null;
  document.getElementById("app").innerHTML = "";
}