const sheetID = "1TBykyZx-eRMBDrRGBGGA8p_49iHlVDKN3wt9wijHJWM";
const apiKey = "AIzaSyB5VIy4kIySW7bVrjNYMpL5rkqZ7Oe758E";

const masterSheet = "Master Data 25 (New)";
const feesSheet = "Fees Collection";
const awSheet = "AW";

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

// Function to hide install button if app already installed
function checkIfInstalled() {
    const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;

    if (isStandalone) {
        installBtn.style.display = "none";
    }
}

// Run check when page loads
window.addEventListener("load", () => {
    checkIfInstalled();
});

// Listen for install prompt availability
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show button only if not installed
    if (!window.matchMedia('(display-mode: standalone)').matches) {
        installBtn.style.display = "block";
    }
});

// Install button click
installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
        console.log("App installed");
    }

    deferredPrompt = null;
    installBtn.style.display = "none";
});

// Detect successful install
window.addEventListener("appinstalled", () => {
    console.log("PWA installed");
    installBtn.style.display = "none";
});

async function login(){

    const code = document.getElementById("loginCode").value.trim();

    if(!code){
        alert("Enter Login Code");
        return;
    }

    document.getElementById("loginBtn").disabled=true;
    document.getElementById("loader").style.display="block";

    try{

        /* AW sheet login check */
        const awRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${awSheet}?key=${apiKey}`);
        const awData = await awRes.json();
        const awRows = awData.values || [];

        let studentRow = awRows.find(r => r[29]?.trim() === code);

        if(!studentRow){
            alert("Invalid Login Code");
            document.getElementById("loader").style.display="none";
            document.getElementById("loginBtn").disabled=false;
            return;
        }

        const admission = studentRow[1];
        const studentName = studentRow[3];
        const father = studentRow[6];
        const mother = studentRow[5];
        const phone = studentRow[22];
        const address = studentRow[7];

        /* Master Sheet */
        const masterRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${masterSheet}?key=${apiKey}`);
        const masterData = await masterRes.json();
        const masterRows = masterData.values || [];

        const masterRow = masterRows.find(r => r[1] === admission);
        const studentClass = masterRow?.[13] || "NA";

        document.getElementById("studentName").innerText="Welcome, "+studentName;
        document.getElementById("class").innerHTML="<b>Class:</b> "+studentClass;
        document.getElementById("adm").innerHTML="<b>Admission Number:</b> "+admission;
        document.getElementById("father").innerHTML="<b>Father's Name:</b> "+father;
        document.getElementById("mother").innerHTML="<b>Mother's Name:</b> "+mother;
        document.getElementById("phone").innerHTML="<b>Phone Number:</b> "+phone;
        document.getElementById("address").innerHTML="<b>Address:</b> "+address;

        /* Fees */
        const feesRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${feesSheet}?key=${apiKey}`);
        const feesData = await feesRes.json();
        const feeRows = feesData.values || [];

        let table="";
        let cards="";

        for(let i=1;i<feeRows.length;i++){

            const row = feeRows[i];

            if(row[2] === admission){

                const date=row[1]||"";
                const slip=row[0]||"";
                const amount=row[5]||"";
                const type=row[6]||"";
                const session=row[7]||"";
                const tuition=row[8]||"";
                const transport=row[9]||"";
                const exam=row[10]||"";
                const payment=row[11]||"";

                table+=`
                <tr>
                <td>${date}</td>
                <td>${slip}</td>
                <td>${amount}</td>
                <td>${type}</td>
                <td>${session}</td>
                <td>${tuition}</td>
                <td>${transport}</td>
                <td>${exam}</td>
                <td>${payment}</td>
                </tr>`;

                cards+=`
                <div class="fee-card">
                <div><b>Date:</b> ${date}</div>
                <div><b>Slip Number:</b> ${slip}</div>
                <div><b>Amount Paid:</b> ${amount}</div>
                <div><b>Fee Type:</b> ${type}</div>
                <div><b>Session:</b> ${session}</div>
                <div><b>Tuition Fee Months:</b> ${tuition}</div>
                <div><b>Transport Fee Months:</b> ${transport}</div>
                <div><b>Exam Fee Months:</b> ${exam}</div>
                <div><b>Payment Mode:</b> ${payment}</div>
                </div>`;
            }
        }

        document.getElementById("feeTable").innerHTML=table;
        document.getElementById("feeCards").innerHTML=cards;

        document.getElementById("loginBox").style.display="none";
        document.getElementById("loader").style.display="none";
        document.getElementById("portal").style.display="block";

    }catch(err){

        alert("Error loading data");
        console.error(err);
        document.getElementById("loader").style.display="none";
        document.getElementById("loginBtn").disabled=false;

    }
}

function logout(){
location.reload();
}
