const sheetID="1TBykyZx-eRMBDrRGBGGA8p_49iHlVDKN3wt9wijHJWM";
const apiKey="AIzaSyB5VIy4kIySW7bVrjNYMpL5rkqZ7Oe758E";

const masterSheet="Master Data 25 (New)";
const feesSheet="Fees Collection";
const awSheet="AW";

async function login(){

const code=document.getElementById("loginCode").value.trim();

if(code==""){
alert("Enter Login Code");
return;
}

document.getElementById("loginBtn").disabled=true;
document.getElementById("loader").style.display="block";

try{

/* ---------------- AW SHEET ---------------- */

const awURL=`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${awSheet}?key=${apiKey}`;
const awResp=await fetch(awURL);
const awData=await awResp.json();
const awRows=awData.values||[];

let admission="";
let studentName="";
let father="";
let mother="";
let phone="";
let address="";

for(let i=1;i<awRows.length;i++){

let row=awRows[i];

if(row[29] && row[29].trim()==code){

admission=row[1]||"NA";
studentName=row[3]||"NA";
father=row[6]||"NA";
mother=row[5]||"NA";
phone=row[22]||"NA";
address=row[7]||"NA";

break;
}

}

if(admission==""){
alert("Invalid Login Code");
location.reload();
return;
}

/* ---------------- MASTER SHEET ---------------- */

const masterURL=`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${masterSheet}?key=${apiKey}`;
const masterResp=await fetch(masterURL);
const masterData=await masterResp.json();
const masterRows=masterData.values||[];

let studentClass="NA";

let monthlyTuition=0;
let tuitionMonths=0;
let transportFees=0;
let transportMonths=0;
let prevRemain=0;
let discount=0;

for(let i=1;i<masterRows.length;i++){

let row=masterRows[i];

if(row[1]==admission){

studentClass=row[13]||"NA";

monthlyTuition=parseFloat(row[4])||0;
prevRemain=parseFloat(row[3])||0;
discount=parseFloat(row[5])||0;
tuitionMonths=parseFloat(row[6])||0;
transportFees=parseFloat(row[7])||0;
transportMonths=parseFloat(row[8])||0;

break;
}

}

/* ---------------- STUDENT DETAILS ---------------- */

document.getElementById("studentName").innerText=studentName;
document.getElementById("class").innerText=studentClass;
document.getElementById("adm").innerText=admission;
document.getElementById("father").innerText=father;
document.getElementById("mother").innerText=mother;
document.getElementById("phone").innerText=phone;
document.getElementById("address").innerText=address;

/* ---------------- FEES SHEET ---------------- */

const feesURL=`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${feesSheet}?key=${apiKey}`;
const feesResp=await fetch(feesURL);
const feesData=await feesResp.json();
const feeRows=feesData.values||[];

let table="";
let cards="";

let totalPaid=0;

for(let i=1;i<feeRows.length;i++){

let row=feeRows[i];

if(row[2]==admission){

let r0=row[0]||"NA";
let r1=row[1]||"NA";
let r5=parseFloat(row[5])||0;
let r6=row[6]||"";
let r7=row[7]||"";
let r8=row[8]||"";
let r9=row[9]||"";
let r10=row[10]||"";
let r11=row[11]||"";

if(r7=="2025-26" && r6.toLowerCase()=="monthly fees"){
totalPaid+=r5;
}

/* ----- TABLE ----- */

table+=`<tr>
<td>${r1}</td>
<td>${r0}</td>
<td>₹${r5}</td>
<td>${r6}</td>
<td>${r7}</td>
<td>${r8}</td>
<td>${r9}</td>
<td>${r10}</td>
<td>${r11}</td>
</tr>`;

/* ----- MOBILE CARDS ----- */

cards+=`<div class="fee-card">
<div><b>Date:</b> ${r1}</div>
<div><b>Slip Number:</b> ${r0}</div>
<div><b>Amount Paid:</b> ₹${r5}</div>
<div><b>Fee Type:</b> ${r6}</div>
<div><b>Session:</b> ${r7}</div>
<div><b>Tuition Fee Months:</b> ${r8}</div>
<div><b>Transport Fee Months:</b> ${r9}</div>
<div><b>Exam Fee Months:</b> ${r10}</div>
<div><b>Payment Mode:</b> ${r11}</div>
</div>`;

}

}

/* ---------------- CALCULATIONS ---------------- */

let examFee=1000;

let totalFee=
((monthlyTuition-discount)*tuitionMonths)
+(transportFees*transportMonths)
+examFee
+prevRemain;

let feeBalance=totalFee-totalPaid;

/* ---------------- DISPLAY ---------------- */

document.getElementById("feeTable").innerHTML=table;
document.getElementById("feeCards").innerHTML=cards;

document.getElementById("monthlyTuition").innerText="₹"+monthlyTuition;
document.getElementById("tuitionMonths").innerText=tuitionMonths;
document.getElementById("transportFees").innerText="₹"+transportFees;
document.getElementById("transportMonths").innerText=transportMonths;
document.getElementById("prevRemain").innerText="₹"+prevRemain;
document.getElementById("discount").innerText="₹"+discount;

document.getElementById("totalPaid").innerText="₹"+totalPaid;

let balance=document.getElementById("feeBalance");
balance.innerText="₹"+feeBalance;

if(feeBalance>0){
balance.style.color="red";
}else{
balance.style.color="green";
}

/* ---------------- SHOW PORTAL ---------------- */

document.getElementById("loginBox").style.display="none";
document.getElementById("loader").style.display="none";
document.getElementById("portal").style.display="block";

}catch(error){

console.error(error);
alert("Error loading data");
location.reload();

}

}

function logout(){
location.reload();
}
