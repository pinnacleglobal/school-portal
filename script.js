const sheetID = "1Sy5uBZkjKpGnLdZp2sFuhFORhO1fRqCswfNYHRl73PM";
const apiKey = "AIzaSyB5VIy4kIySW7bVrjNYMpL5rkqZ7Oe758E";

const masterSheet = encodeURIComponent("Master Data 2026");
const feesSheet = encodeURIComponent("Fees Collection");
const awSheet = encodeURIComponent("AW");

async function login() {
    const code = document.getElementById("loginCode").value.trim();
    if (!code) { alert("Enter Login Code"); return; }

    document.getElementById("loginBtn").disabled = true;
    document.getElementById("loader").style.display = "block";

    try {
        // AW Sheet
        let resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${awSheet}?key=${apiKey}`);
        let rows = (await resp.json()).values || [];
        let admission = "", studentName = "", father = "", mother = "", phone = "", address = "", photoUrl = "";
        let loginBlocked = false;

        for (let i = 1; i < rows.length; i++) {
            let r = rows[i];
            if (r[29] && r[29].trim() == code) {
                if (r[31] && r[31].toUpperCase() == "TRUE") { loginBlocked = true; break; }
                admission = r[1] || ""; studentName = r[3] || ""; father = r[6] || "";
                mother = r[5] || ""; phone = r[22] || ""; address = r[7] || ""; 
                photoUrl = r[28] || ""; // Column AC
                break;
            }
        }

        if (loginBlocked) { alert("You Cannot Login As You Have Left The School. Please Contact The School."); location.reload(); return; }
        if (!admission) { alert("Invalid Login Code"); location.reload(); return; }

        // Master Data
        resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${masterSheet}?key=${apiKey}`);
        rows = (await resp.json()).values || [];
        let studentClass = "", monthlyTuition = 0, tuitionMonths = 0, transportFees = 0, transportMonths = 0, prevRemain = 0, discount = 0, examFee = 1000;

        for (let i = 1; i < rows.length; i++) {
            let r = rows[i]; 
            if (r[1] == admission) {
                studentClass = r[14] || "";
                monthlyTuition = parseFloat(r[4]) || 0; 
                prevRemain = parseFloat(r[3]) || 0;
                discount = parseFloat(r[5]) || 0; 
                tuitionMonths = parseFloat(r[6]) || 0;
                transportFees = parseFloat(r[7]) || 0; 
                transportMonths = parseFloat(r[8]) || 0;
                examFee = parseFloat(r[9]) || 1000;
                break;
            }
        }

        // Populate info
        document.getElementById("studentName").innerText = studentName;
        document.getElementById("welcomeName").innerText = "Welcome, " + studentName;
        document.getElementById("class").innerText = studentClass;
        document.getElementById("adm").innerText = admission;
        document.getElementById("father").innerText = father;
        document.getElementById("mother").innerText = mother;
        document.getElementById("phone").innerText = phone;
        document.getElementById("address").innerText = address;

        // Show photo if available
       const img = document.getElementById("studentPhoto");
if(photoUrl){
    let finalUrl = photoUrl.trim();

    // If Google Drive link, convert to direct view URL
    if(finalUrl.includes("drive.google.com")){
        let id = "";
        const patterns = [
            /\/file\/d\/([-\w]+)\//,                   // /file/d/FILEID/
            /id=([-\w]+)/                              // id=FILEID
        ];
        for(const p of patterns){
            const m = finalUrl.match(p);
            if(m && m[1]){ id = m[1]; break; }
        }
        if(id) finalUrl = `https://drive.google.com/uc?export=view&id=${id}`;
    }

    // Show image
    img.src = finalUrl + "&timestamp=" + new Date().getTime(); // avoid caching
    img.style.display = "inline-block";

    // Optional: add small glow
    img.style.boxShadow = "0 0 15px 5px rgba(255,255,255,0.6)";
} else {
    img.style.display = "none";
}

        // Fees Collection
        resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${feesSheet}?key=${apiKey}`);
        rows = (await resp.json()).values || [];
        let table = "", cards = "", totalPaid = 0;

        for (let i = 1; i < rows.length; i++) {
            let r = rows[i]; 
            if (r[2] == admission) {
                let date = r[1] || "", slip = r[0] || "", amount = parseFloat(r[5]) || 0;
                let feeType = r[6] || "", session = r[7] || "", tMonths = r[8] || "", trMonths = r[9] || "", exMonths = r[10] || "", mode = r[11] || "";
                if (session == "2026-27" && feeType.toLowerCase() == "monthly fees") totalPaid += amount;

                table += `<tr><td>${date}</td><td>${slip}</td><td>₹${amount}</td><td>${feeType}</td><td>${session}</td><td>${tMonths}</td><td>${trMonths}</td><td>${exMonths}</td><td>${mode}</td></tr>`;
                cards += `<div class="fee-card"><div><b>Date:</b> ${date}</div><div><b>Slip Number:</b> ${slip}</div><div><b>Amount Paid:</b> ₹${amount}</div><div><b>Fee Type:</b> ${feeType}</div><div><b>Session:</b> ${session}</div><div><b>Tuition Fee Months:</b> ${tMonths}</div><div><b>Transport Fee Months:</b> ${trMonths}</div><div><b>Exam Fee Months:</b> ${exMonths}</div><div><b>Payment Mode:</b> ${mode}</div></div>`;
            }
        }

        // Total Fee & Balance
        let totalFee = ((monthlyTuition - discount) * tuitionMonths) + (transportFees * transportMonths) + examFee + prevRemain;
        let feeBalance = totalFee - totalPaid;

        // Populate Fee Summary
        document.getElementById("feeTable").innerHTML = table;
        document.getElementById("feeCards").innerHTML = cards;
        document.getElementById("monthlyTuition").innerText = "₹" + monthlyTuition;
        document.getElementById("tuitionMonths").innerText = tuitionMonths;
        document.getElementById("transportFees").innerText = "₹" + transportFees;
        document.getElementById("transportMonths").innerText = transportMonths;
        document.getElementById("prevRemain").innerText = "₹" + prevRemain;
        document.getElementById("discount").innerText = "₹" + discount;
        document.getElementById("totalPaid").innerText = "₹" + totalPaid;
        document.getElementById("examFee").innerText = "₹" + examFee;

        const bal = document.getElementById("feeBalance");
        bal.innerText = "₹" + feeBalance;
        bal.style.color = feeBalance > 0 ? "red" : "green";

        document.getElementById("loginBox").style.display = "none";
        document.getElementById("loader").style.display = "none";
        document.getElementById("portal").style.display = "block";

        populateFeeSelectors(examFee);
        setupFeeBalancePayment();
        setupSendScreenshotButton();

    } catch (e) {
        console.error(e);
        document.getElementById("loader").style.display = "none";
        alert("Something went wrong!");
    }
}

// Populate Fee Month Selectors
function populateFeeSelectors(examFee){
    const tSel = document.getElementById("calcTuitionMonths");
    const trSel = document.getElementById("calcTransportMonths");
    const eSel = document.getElementById("calcExamMonths");
    for(let i=1;i<=12;i++){
        tSel.innerHTML += `<option value="${i}">${i}</option>`;
        trSel.innerHTML += `<option value="${i}">${i}</option>`;
        eSel.innerHTML += `<option value="${i}">${i}</option>`;
    }

    const updateCalc = ()=>{
        const t = parseInt(tSel.value);
        const tr = parseInt(trSel.value);
        const e = parseInt(eSel.value);
        let total = 0;
        const monthlyTuition = parseFloat(document.getElementById("monthlyTuition").innerText.replace("₹","")) || 0;
        const transportFees = parseFloat(document.getElementById("transportFees").innerText.replace("₹","")) || 0;
        total = (monthlyTuition * t) + (transportFees * tr) + (examFee/2 * e);
        document.getElementById("calcTotal").innerText = "₹" + total;
    };
    tSel.onchange = trSel.onchange = eSel.onchange = updateCalc;
    updateCalc();
}

function setupFeeBalancePayment(){
    document.getElementById("payBalanceBtn").onclick = ()=>{
        const balance = document.getElementById("feeBalance").innerText;
        window.open(`https://pay.google.com/upi/pay?amount=${balance.replace("₹","")}`,"_blank");
    };
    document.getElementById("payNowBtn").onclick = ()=>{
        const total = document.getElementById("calcTotal").innerText.replace("₹","");
        window.open(`https://pay.google.com/upi/pay?amount=${total}`,"_blank");
    };
}

function setupSendScreenshotButton(){
    document.getElementById("sendScreenshotBalanceBtn").onclick = ()=>{
        const msg = "Fee Payment Screenshot for balance: " + document.getElementById("feeBalance").innerText;
        window.open("https://wa.me/918330783096?text="+encodeURIComponent(msg));
    };
    document.getElementById("sendScreenshotCalcBtn").onclick = ()=>{
        const msg = "Fee Payment Screenshot for calculated fees: " + document.getElementById("calcTotal").innerText;
        window.open("https://wa.me/918330783096?text="+encodeURIComponent(msg));
    };
}

function logout(){
    location.reload();
}

document.getElementById("loginBtn").addEventListener("click", login);
