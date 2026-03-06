const sheetID = "1TBykyZx-eRMBDrRGBGGA8p_49iHlVDKN3wt9wijHJWM";
const apiKey = "AIzaSyB5VIy4kIySW7bVrjNYMpL5rkqZ7Oe758E"; // replace with your API key

const masterSheet = "Master Data 25 (New)";
const feesSheet = "Fees Collection";
const awSheet = "AW";

async function login() {
  const code = document.getElementById("loginCode")?.value.trim();
  if (!code) {
    alert("Enter Login Code");
    return;
  }

  document.getElementById("loginBtn").disabled = true;
  document.getElementById("loader").style.display = "block";
  document.getElementById("splash").style.display = "flex"; // mini splash during loading

  try {
    // Fetch AW sheet
    const awResp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${awSheet}?key=${apiKey}`);
    const awData = await awResp.json();
    const awRows = awData.values || [];
    console.log("AW Rows:", awRows);

    // Find student row by login code
    let studentRow = null;
    for (let i = 1; i < awRows.length; i++) {
      if (awRows[i][29]?.trim() === code) {
        studentRow = awRows[i];
        break;
      }
    }

    if (!studentRow) {
      alert("Invalid Login Code");
      document.getElementById("loader").style.display = "none";
      document.getElementById("loginBtn").disabled = false;
      document.getElementById("splash").style.display = "none";
      return;
    }

    const admission = studentRow[1] || "NA";
    const studentName = studentRow[3] || "NA";
    const father = studentRow[6] || "NA";
    const mother = studentRow[5] || "NA";
    const phone = studentRow[22] || "NA";
    const address = studentRow[7] || "NA";

    // Fetch Master Sheet to get class
    const masterResp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${masterSheet}?key=${apiKey}`);
    const masterData = await masterResp.json();
    const masterRows = masterData.values || [];
    console.log("Master Rows:", masterRows);

    let studentClass = "NA";
    for (let i = 1; i < masterRows.length; i++) {
      if (masterRows[i][1] === admission) {
        studentClass = masterRows[i][13] || "NA";
        break;
      }
    }

    // Fill profile info safely
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.innerText = text;
    };

    setText("studentName", "Welcome, " + studentName);
    setText("class", "Class : " + studentClass);
    setText("adm", "Admission No : " + admission);
    setText("father", "Father's Name : " + father);
    setText("mother", "Mother's Name : " + mother);
    setText("phone", "Phone Number : " + phone);
    setText("address", "Address : " + address);

    // Fetch Fees Collection
    const feesResp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${feesSheet}?key=${apiKey}`);
    const feesData = await feesResp.json();
    const feeRows = feesData.values || [];
    console.log("Fee Rows:", feeRows);

    const isMobile = window.innerWidth <= 600;

    // Show/hide desktop table vs mobile cards
    const feeTableEl = document.getElementById("feeTable");
    const feeCardsEl = document.getElementById("feeCards");
    if (feeTableEl) feeTableEl.style.display = isMobile ? "none" : "table";
    if (feeCardsEl) feeCardsEl.style.display = isMobile ? "block" : "none";

    let tableHTML = "";
    let cardsHTML = "";

    for (let i = 1; i < feeRows.length; i++) {
      const row = feeRows[i];
      if (row?.[2] === admission) {
        const r0 = row[0] || "";
        const r1 = row[1] || "";
        const r5 = row[5] || "";
        const r6 = row[6] || "";
        const r7 = row[7] || "";
        const r8 = row[8] || "";
        const r9 = row[9] || "";
        const r10 = row[10] || "";

        // Desktop table
        if (!isMobile) {
          tableHTML += `<tr>
            <td>${r1}</td><td>${r0}</td><td>${r5}</td><td>${r6}</td><td>${r7}</td><td>${r8}</td><td>${r9}</td><td>${r10}</td>
          </tr>`;
        }

        // Mobile cards
        if (isMobile) {
          cardsHTML += `<div class="fee-card">
            <div><b>Date:</b> ${r1}</div>
            <div><b>Slip No:</b> ${r0}</div>
            <div><b>Amount:</b> ${r5}</div>
            <div><b>Fee Type:</b> ${r6}</div>
            <div><b>Session:</b> ${r7}</div>
            <div><b>Tuition:</b> ${r8}</div>
            <div><b>Transport:</b> ${r9}</div>
            <div><b>Exam:</b> ${r10}</div>
          </div>`;
        }
      }
    }

    if (feeTableEl?.querySelector("tbody")) feeTableEl.querySelector("tbody").innerHTML = tableHTML;
    if (feeCardsEl) feeCardsEl.innerHTML = cardsHTML;

    // Show portal and hide login/splash
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("portal").style.display = "block";
    document.getElementById("loader").style.display = "none";
    document.getElementById("splash").style.display = "none";

  } catch (err) {
    console.error("Error fetching data:", err);
    alert("Error loading data: " + err.message);
    document.getElementById("loader").style.display = "none";
    document.getElementById("loginBtn").disabled = false;
    document.getElementById("splash").style.display = "none";
  }
}

function logout() {
  location.reload();
}
