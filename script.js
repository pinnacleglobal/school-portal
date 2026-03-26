// Google Sheet and API details
const sheetID = "1Sy5uBZkjKpGnLdZp2sFuhFORhO1fRqCswfNYHRl73PM";
const masterSheet = encodeURIComponent("Master Data 2026");
const feesSheet = encodeURIComponent("Fees Collection");
const awSheet = encodeURIComponent("AW");

// JSONP endpoint (from your Apps Script deployment)
const appsScriptURL = "https://script.google.com/macros/s/AKfycbwtlKG5GVmefAR0_iHV6INCMCod8wKi1ki-PrnTnTGXm7gQn_IRZJOf5BkMlKzLCdks/exec";

// Login function
async function login() {
    const code = document.getElementById("loginCode").value.trim();
    if (!code) { alert("Enter Login Code"); return; }

    document.getElementById("loginBtn").disabled = true;
    document.getElementById("loader").style.display = "block";

    try {
        // Fetch student info from Apps Script
        const studentData = await fetchStudentData(code);
        if (!studentData) { alert("Invalid Login Code"); location.reload(); return; }

        // Populate basic info
        document.getElementById("studentName").innerText = studentData.name;
        document.getElementById("welcomeName").innerText = "Welcome, " + studentData.name;

        // Show student photo if available
        const img = document.getElementById("studentPhoto");
        if (studentData.photo) {
            img.src = studentData.photo;
            img.style.display = "inline-block";
        } else {
            img.style.display = "none";
        }

        document.getElementById("class").innerText = studentData.class || "";
        document.getElementById("adm").innerText = studentData.admissionNo || "";
        document.getElementById("father").innerText = studentData.father || "";
        document.getElementById("mother").innerText = studentData.mother || "";
        document.getElementById("phone").innerText = studentData.phone || "";
        document.getElementById("address").innerText = studentData.address || "";

        // Fetch master sheet for fees info
        const masterRows = await fetchSheetData(masterSheet);
        let monthlyTuition = 0, tuitionMonths = 0, transportFees = 0, transportMonths = 0;
        let prevRemain = 0, discount = 0, examFee = 1000;

        for (let i = 1; i < masterRows.length; i++) {
            const r = masterRows[i];
            if (r[1] == studentData.admissionNo) {
                monthlyTuition = parseFloat(r[4]) || 0;
                prevRemain = parseFloat(r[3]) || 0;
                discount = parseFloat(r[5]) || 0;
                tuitionMonths = parseFloat(r[6]) || 0;
                transportFees = parseFloat(r[7]) || 0;
                transportMonths = parseFloat(r[8]) || 0;
                examFee = parseFloat(r[9]) || 1000; // Column J
                break;
            }
        }

        document.getElementById("monthlyTuition").innerText = "₹" + monthlyTuition;
        document.getElementById("tuitionMonths").innerText = tuitionMonths;
        document.getElementById("transportFees").innerText = "₹" + transportFees;
        document.getElementById("transportMonths").innerText = transportMonths;
        document.getElementById("prevRemain").innerText = "₹" + prevRemain;
        document.getElementById("discount").innerText = "₹" + discount;
        document.getElementById("examFee").innerText = "₹" + examFee;

        // Fetch fees collection
        const feeRows = await fetchSheetData(feesSheet);
        let table = "", cards = "", totalPaid = 0;
        for (let i = 1; i < feeRows.length; i++) {
            const r = feeRows[i];
            if (r[2] == studentData.admissionNo) {
                let date = r[1] || "", slip = r[0] || "", amount = parseFloat(r[5]) || 0;
                let feeType = r[6] || "", session = r[7] || "", tMonths = r[8] || "", trMonths = r[9] || "", exMonths = r[10] || "", mode = r[11] || "";
                if (session == "2026-27" && feeType.toLowerCase() == "monthly fees") totalPaid += amount;

                table += `<tr><td>${date}</td><td>${slip}</td><td>₹${amount}</td><td>${feeType}</td><td>${session}</td><td>${tMonths}</td><td>${trMonths}</td><td>${exMonths}</td><td>${mode}</td></tr>`;
                cards += `<div class="fee-card"><div><b>Date:</b> ${date}</div><div><b>Slip Number:</b> ${slip}</div><div><b>Amount Paid:</b> ₹${amount}</div><div><b>Fee Type:</b> ${feeType}</div><div><b>Session:</b> ${session}</div><div><b>Tuition Fee Months:</b> ${tMonths}</div><div><b>Transport Fee Months:</b> ${trMonths}</div><div><b>Exam Fee Months:</b> ${exMonths}</div><div><b>Payment Mode:</b> ${mode}</div></div>`;
            }
        }

        document.getElementById("feeTable").innerHTML = table;
        document.getElementById("feeCards").innerHTML = cards;
        document.getElementById("totalPaid").innerText = "₹" + totalPaid;

        // Total Fee & Balance
        let totalFee = ((monthlyTuition - discount) * tuitionMonths) + (transportFees * transportMonths) + examFee + prevRemain;
        let feeBalance = totalFee - totalPaid;
        const bal = document.getElementById("feeBalance");
        bal.innerText = "₹" + feeBalance;
        bal.style.color = feeBalance > 0 ? "red" : "green";

        // Show portal
        document.getElementById("loginBox").style.display = "none";
        document.getElementById("loader").style.display = "none";
        document.getElementById("portal").style.display = "block";

        // Setup fee selectors and payment buttons
        populateFeeSelectors(examFee);
        setupFeeBalancePayment();
        setupSendScreenshotButton();

    } catch (e) {
        console.error(e);
        document.getElementById("loader").style.display = "none";
        document.getElementById("loginBtn").disabled = false;
        alert("Error fetching student data.");
    }
}

// Logout function
function logout() { location.reload(); }

// Fetch student data from Apps Script JSONP
function fetchStudentData(code) {
    return new Promise((resolve, reject) => {
        const callbackName = "callback_" + new Date().getTime();
        window[callbackName] = function(data) {
            resolve(data);
            delete window[callbackName];
        };
        const script = document.createElement("script");
        script.src = `${appsScriptURL}?code=${code}&callback=${callbackName}`;
        script.onerror = () => reject("Failed to fetch student data");
        document.body.appendChild(script);
    });
}

// Fetch sheet data using Google Sheets API
async function fetchSheetData(sheetName) {
    const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?key=AIzaSyB5VIy4kIySW7bVrjNYMpL5rkqZ7Oe758E`);
    const data = await resp.json();
    return data.values || [];
}

// Populate fee month selectors
function populateFeeSelectors(examFee = 500) {
    const tuition = document.getElementById("calcTuitionMonths");
    const transport = document.getElementById("calcTransportMonths");
    const exam = document.getElementById("calcExamMonths");
    tuition.innerHTML = transport.innerHTML = exam.innerHTML = "";
    for (let i = 0; i <= 12; i++) tuition.innerHTML += `<option value="${i}">${i}</option>`;
    for (let i = 0; i <= 11; i++) transport.innerHTML += `<option value="${i}">${i}</option>`;
    for (let i = 0; i <= 2; i++) exam.innerHTML += `<option value="${i}">${i}</option>`;

    tuition.addEventListener("change", () => calculateFees(examFee));
    transport.addEventListener("change", () => calculateFees(examFee));
    exam.addEventListener("change", () => calculateFees(examFee));
}

// Calculate fees for selected months
function calculateFees(examFee = 500) {
    const t = parseInt(document.getElementById("calcTuitionMonths").value);
    const tr = parseInt(document.getElementById("calcTransportMonths").value);
    const ex = parseInt(document.getElementById("calcExamMonths").value);

    const monthly = parseFloat(document.getElementById("monthlyTuition").innerText.replace("₹",""));
    const transport = parseFloat(document.getElementById("transportFees").innerText.replace("₹",""));
    const discount = parseFloat(document.getElementById("discount").innerText.replace("₹",""));

    let examFeePerMonth = examFee / 2; // HALF exam fee
    let total = (t * (monthly - discount)) + (tr * transport) + (ex * examFeePerMonth);

    document.getElementById("calcTotal").innerText = "₹" + total;

    document.getElementById("payNowBtn").onclick = () => {
        if (total <= 0) { alert("Please select months before paying"); return; }
        const upi = "pinnacleglobalschool.62697340@hdfcbank";
        const adm = document.getElementById("adm").innerText.trim();
        const name = document.getElementById("studentName").innerText.trim();
        const cls = document.getElementById("class").innerText.trim();
        const note = `${adm} ${name} ${cls} FEE`;
        const link = `upi://pay?pa=${upi}&pn=Pinnacle Global School&am=${total}&cu=INR&tn=${encodeURIComponent(note)}`;
        window.location.href = link;
    };
}

// Setup balance payment button
function setupFeeBalancePayment() {
    const btn = document.getElementById("payBalanceBtn");
    btn.addEventListener("click", () => {
        let text = document.getElementById("feeBalance").innerText.replace(/[^0-9]/g, "");
        let amount = parseFloat(text);
        if (amount <= 0) { alert("No balance to pay"); return; }
        const upi = "pinnacleglobalschool.62697340@hdfcbank";
        const adm = document.getElementById("adm").innerText.trim();
        const name = document.getElementById("studentName").innerText.trim();
        const cls = document.getElementById("class").innerText.trim();
        const note = `${adm} ${name} ${cls} FEE`;
        const link = `upi://pay?pa=${upi}&pn=Pinnacle Global School&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
        window.location.href = link;
    });
}

// Setup WhatsApp screenshot buttons
function setupSendScreenshotButton() {
    const sendBtns = [
        document.getElementById("sendScreenshotBalanceBtn"),
        document.getElementById("sendScreenshotCalcBtn")
    ].filter(Boolean);

    sendBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const adm = document.getElementById("adm").innerText.trim();
            const name = document.getElementById("studentName").innerText.trim();
            const cls = document.getElementById("class").innerText.trim();
            const message = `Hello, I have completed the fee payment.\nAdmission No: ${adm}\nName: ${name}\nClass: ${cls}\nPlease find the attached screenshot of my payment.`;
            const phone = "917830968000";
            const link = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.location.href = link;
        });
    });
}

// Initialize login button and Enter key
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginBtn").addEventListener("click", login);
    document.getElementById("loginCode").addEventListener("keypress", function(e) {
        if (e.key === "Enter") login();
    });
});
