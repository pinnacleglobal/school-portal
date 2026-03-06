const sheetID = "1TBykyZx-eRMBDrRGBGGA8p_49iHlVDKN3wt9wijHJWM";
const apiKey = "AIzaSyB5VIy4kIySW7bVrjNYMpL5rkqZ7Oe758E"; // Replace with your API key
const masterSheet = "Master Data 25 (New)";
const feesSheet = "Fees Collection";
const awSheet = "AW";

let deferredPrompt;

window.addEventListener('DOMContentLoaded', () => {

  // PWA install
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display='inline-block';
  });

  document.getElementById('installBtn')?.addEventListener('click', async ()=>{
    if(deferredPrompt){
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt=null;
      document.getElementById('installBtn').style.display='none';
    }
  });

  window.login = async function login() {
    const code = document.getElementById("loginCode")?.value.trim();
    if(!code){ alert("Enter Login Code"); return; }

    document.getElementById("loginBtn").disabled = true;
    document.getElementById("loader").style.display = "block";
    document.getElementById("splash").style.display = "flex";

    try{
      const awData = await fetchSheet(awSheet);
      const studentRow = awData.find(r=>r[29]?.trim()===code);
      if(!studentRow){ alert("Invalid Login Code"); resetLogin(); return; }

      const admission = studentRow[1]||"NA";
      const studentName = studentRow[3]||"NA";
      const father = studentRow[6]||"NA";
      const mother = studentRow[5]||"NA";
      const phone = studentRow[22]||"NA";
      const address = studentRow[7]||"NA";

      const masterData = await fetchSheet(masterSheet);
      const masterRow = masterData.find(r=>r[1]===admission);
      const studentClass = masterRow?.[13]||"NA";

      setText("studentName","Welcome, "+studentName);
      setText("class","Class : "+studentClass);
      setText("adm","Admission No : "+admission);
      setText("father","Father's Name : "+father);
      setText("mother","Mother's Name : "+mother);
      setText("phone","Phone Number : "+phone);
      setText("address","Address : "+address);

      const feeData = await fetchSheet(feesSheet);
      let tableHTML="", cardsHTML="";

      feeData.slice(1).forEach(row=>{
        if(row[2]===admission){
          const [r0,r1,r5,r6,r7,r8,r9,r10] = [row[0]||"",row[1]||"",row[5]||"",row[6]||"",row[7]||"",row[8]||"",row[9]||"",row[10]||""];
          tableHTML += `<tr><td>${r1}</td><td>${r0}</td><td>${r5}</td><td>${r6}</td><td>${r7}</td><td>${r8}</td><td>${r9}</td><td>${r10}</td></tr>`;
          cardsHTML += `<div class="fee-card"><div><b>Date:</b> ${r1}</div><div><b>Slip No:</b> ${r0}</div><div><b>Amount:</b> ${r5}</div><div><b>Fee Type:</b> ${r6}</div><div><b>Session:</b> ${r7}</div><div><b>Tuition:</b> ${r8}</div><div><b>Transport:</b> ${r9}</div><div><b>Exam:</b> ${r10}</div></div>`;
        }
      });

      document.getElementById("feeTable").innerHTML = tableHTML;
      document.getElementById("feeCards").innerHTML = cardsHTML;

      document.getElementById("loginBox").style.display="none";
      document.getElementById("portal").style.display="block";
      document.getElementById("loader").style.display="none";
      document.getElementById("splash").style.display="none";

    } catch(err){
      console.error(err);
      alert("Error loading data: "+err.message);
      resetLogin();
    }
  }
});

function logout(){ location.reload(); }

async function fetchSheet(sheetName){
  const resp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?key=${apiKey}`);
  const data = await resp.json();
  return data.values || [];
}

function setText(id,text){ const el=document.getElementById(id); if(el) el.innerText=text; }
function resetLogin(){
  document.getElementById("loader").style.display="none";
  document.getElementById("loginBtn").disabled=false;
  document.getElementById("splash").style.display="none";
}
