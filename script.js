const sheetID = "1TBykyZx-eRMBDrRGBGGA8p_49iHlVDKN3wt9wijHJWM";
const apiKey = "AIzaSyB5VIy4kIySW7bVrjNYMpL5rkqZ7Oe758E";

const masterSheet = "Master Data 25 (New)";
const feesSheet = "Fees Collection";
const awSheet = "AW";

async function login(){

const code=document.getElementById("loginCode").value.trim();

if(!code){
alert("Enter Login Code");
return;
}

document.getElementById("loader").style.display="block";

try{

const awResp=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${awSheet}?key=${apiKey}`);
const awData=await awResp.json();
const awRows=awData.values;

let studentRow=null;

for(let i=1;i<awRows.length;i++){

if(awRows[i][29] && awRows[i][29].trim()==code){

studentRow=awRows[i];
break;

}

}

if(!studentRow){
alert("Invalid Login Code");
document.getElementById("loader").style.display="none";
return;
}

const admission=studentRow[1];
const studentName=studentRow[3];
const father=studentRow[6];
const mother=studentRow[5];
const phone=studentRow[22];
const address=studentRow[7];

const masterResp=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${masterSheet}?key=${apiKey}`);
const masterData=await masterResp.json();
const masterRows=masterData.values;

let studentClass="";

for(let i=1;i<masterRows.length;i++){

if(masterRows[i][1]==admission){

studentClass=masterRows[i][13];
break;

}

}

document.getElementById("studentName").innerText="Welcome, "+studentName;
document.getElementById("class").innerText="Class : "+studentClass;
document.getElementById("adm").innerText="Admission No : "+admission;
document.getElementById("father").innerText="Father's Name : "+father;
document.getElementById("mother").innerText="Mother's Name : "+mother;
document.getElementById("phone").innerText="Phone Number : "+phone;
document.getElementById("address").innerText="Address : "+address;

const feesResp=await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${feesSheet}?key=${apiKey}`);
const feesData=await feesResp.json();
const feeRows=feesData.values;

let table="";
let cards="";

const isMobile=window.innerWidth<=600;

for(let i=1;i<feeRows.length;i++){

if(feeRows[i][2]==admission){

const r0=feeRows[i][0]||"";
const r1=feeRows[i][1]||"";
const r5=feeRows[i][5]||"";
const r6=feeRows[i][6]||"";
const r7=feeRows[i][7]||"";
const r8=feeRows[i][8]||"";
const r9=feeRows[i][9]||"";
const r10=feeRows[i][10]||"";

table+=`<tr>
<td>${r1}</td>
<td>${r0}</td>
<td>${r5}</td>
<td>${r6}</td>
<td>${r7}</td>
<td>${r8}</td>
<td>${r9}</td>
<td>${r10}</td>
</tr>`;

cards+=`<div class="fee-card">
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

document.getElementById("feeTable").innerHTML=table;
document.getElementById("feeCards").innerHTML=cards;

document.getElementById("loginBox").style.display="none";
document.getElementById("loader").style.display="none";
document.getElementById("portal").style.display="block";

}catch(err){

alert("Error loading data");

}

}

function logout(){
location.reload();
}
