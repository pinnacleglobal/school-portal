const sheetID = "1TBykyZx-eRMBDrRGBGGA8p_49iHlVDKN3wt9wijHJWM";
const apiKey = "AIzaSyB5VIy4kIySW7bVrjNYMpL5rkqZ7Oe758E";

const masterSheet = "Master Data 25 (New)";
const feesSheet = "Fees Collection";
const awSheet = "AW";

async function login(){

const code = document.getElementById("loginCode").value.trim();

if(code==""){
alert("Enter Login Code");
return;
}

document.getElementById("loginBtn").disabled = true;
document.getElementById("loader").style.display = "block";

try{

/* FETCH AW SHEET */

const awURL = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${awSheet}?key=${apiKey}`;

const awResp = await fetch(awURL);
const awData = await awResp.json();
const awRows = awData.values || [];

let admission="";
let studentName="";
let father="";
let mother="";
let phone="";
let address="";

for(let i=1;i<awRows.length;i++){

if(awRows[i][29] && awRows[i][29].trim()==code){

admission = awRows[i][1] || "NA";
studentName = awRows[i][3] || "NA";
father = awRows[i][6] || "NA";
mother = awRows[i][5] || "NA";
phone = awRows[i][22] || "NA";
address = awRows[i][7] || "NA";

break;

}

}

if(admission==""){
alert("Invalid Login Code");
document.getElementById("loader").style.display="none";
document.getElementById("loginBtn").disabled=false;
return;
}

/* FETCH MASTER DATA */

const masterURL = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${masterSheet}?key=${apiKey}`;

const masterResp = await fetch(masterURL);
const masterData = await masterResp.json();
const masterRows = masterData.values || [];

let studentClass="NA";

for(let i=1;i<masterRows.length;i++){

if(masterRows[i][1]==admission){
studentClass = masterRows[i][13] || "NA";
break;
}

}

/* FILL PROFILE */

document.getElementById("studentName").innerText = "Welcome, "+studentName;
document.getElementById("class").innerText = "Class : "+studentClass;
document.getElementById("adm").innerText = "Admission No : "+admission;
document.getElementById("father").innerText = "Father's Name : "+father;
document.getElementById("mother").innerText = "Mother's Name : "+mother;
document.getElementById("phone").innerText = "Phone Number : "+phone;
document.getElementById("address").innerText = "Address : "+address;

/* FETCH FEES DATA */

const feesURL = `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${feesSheet}?key=${apiKey}`;

const feesResp = await fetch(feesURL);
const feesData = await feesResp.json();
const feeRows = feesData.values || [];

let table="";
let cards="";

for(let i=1;i<feeRows.length;i++){

if(feeRows[i][2]==admission){

const r0 = feeRows[i][0] || "NA";
const r1 = feeRows[i][1] || "NA";
const r5 = feeRows[i][5] || "NA";
const r6 = feeRows[i][6] || "NA";
const r7 = feeRows[i][7] || "NA";
const r8 = feeRows[i][8] || "NA";
const r9 = feeRows[i][9] || "NA";
const r10 = feeRows[i][10] || "NA";

table += `<tr>
<td>${r1}</td>
<td>${r0}</td>
<td>${r5}</td>
<td>${r6}</td>
<td>${r7}</td>
<td>${r8}</td>
<td>${r9}</td>
<td>${r10}</td>
</tr>`;

cards += `<div class="fee-card">
<div><b>Date:</b> ${r1}</div>
<div><b>Slip No:</b> ${r0}</div>
<div><b>Amount:</b> ${r5}</div>
<div><b>Fee Type:</b> ${r6}</div>
<div><b>Session:</b> ${r7}</div>
<div><b>Tuition Months:</b> ${r8}</div>
<div><b>Transport Months:</b> ${r9}</div>
<div><b>Exam Months:</b> ${r10}</div>
</div>`;

}

}

/* INSERT DATA */

document.getElementById("feeTable").innerHTML = table;
document.getElementById("feeCards").innerHTML = cards;

/* SHOW DASHBOARD */

document.getElementById("loginBox").style.display="none";
document.getElementById("loader").style.display="none";
document.getElementById("portal").style.display="block";

}catch(error){

console.error(error);
alert("Error loading data: "+error.message);
document.getElementById("loader").style.display="none";
document.getElementById("loginBtn").disabled=false;

}

}

function logout(){
location.reload();
}
