const sheetID = "1TBykyZx-eRMBDrRGBGGA8p_49iHlVDKN3wt9wijHJWM";
const apiKey = "AIzaSyB5VIy4kIySW7bVrjNYMpL5rkqZ7Oe758E";

const masterSheet = encodeURIComponent("Master Data 25 (New)");
const feesSheet = encodeURIComponent("Fees Collection");
const awSheet = encodeURIComponent("AW");

async function login(){

const code = document.getElementById("loginCode").value.trim();

if(code==""){
alert("Enter Login Code");
return;
}

document.getElementById("loginBtn").disabled=true;
document.getElementById("loader").style.display="block";

try{

/* ---------------- AW SHEET ---------------- */

let url=`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${awSheet}?key=${apiKey}`;
let resp=await fetch(url);
let data=await resp.json();
let rows=data.values || [];

let admission="";
let studentName="";
let father="";
let mother="";
let phone="";
let address="";

for(let i=1;i<rows.length;i++){

let r=rows[i];

if(r[29] && r[29].toString().trim()==code){

admission=r[1]||"";
studentName=r[3]||"";
father=r[6]||"";
mother=r[5]||"";
phone=r[22]||"";
address=r[7]||"";

break;
}
}

if(admission==""){
alert("Invalid Login Code");
location.reload();
return;
}

/* ---------------- MASTER SHEET ---------------- */

url=`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${masterSheet}?key=${apiKey}`;
resp=await fetch(url);
data=await resp.json();
rows=data.values || [];

let studentClass="";
let monthlyTuition=0;
let tuitionMonths=0;
let transportFees=0;
let transportMonths=0;
let prevRemain=0;
let discount=0;

for(let i=1;i<rows.length;i++){

let r=rows[i];

if(r[1]==admission){

studentClass=r[13]||"";

monthlyTuition=parseFloat(r[4])||0;
prevRemain=parseFloat(r[3])||0;
discount=parseFloat(r[5])||0;
tuitionMonths=parseFloat(r[6])||0;
transportFees=parseFloat(r[7])||0;
transportMonths=parseFloat(r[8])||0;

break;
}
}

/* ---------------- DISPLAY STUDENT ---------------- */

document.getElementById("studentName").innerText=studentName;
document.getElementById("class").innerText=studentClass;
document.getElementById("adm").innerText=admission;
document.getElementById("father").innerText=father;
document.getElementById("mother").innerText=mother;
document.getElementById("phone").innerText=phone;
document.getElementById("address").innerText=address;

/* ---------------- FEES SHEET ---------------- */

url=`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${feesSheet}?key=${apiKey}`;
resp=await fetch(url);
data=await resp.json();
rows=data.values || [];

let table="";
let cards="";
let totalPaid=0;

for(let i=1;i<rows.length;i++){

let r=rows[i];

if(r[2]==admission){

let date=r[1]||"";
let slip=r[0]||"";
let amount=parseFloat(r[5])||0;
let feeType=(r[6]||"").toString();
let session=(r[7]||"").toString();

let tMonths=r[8]||"";
let trMonths=r[9]||"";
let exMonths=r[10]||"";
let mode=r[11]||"";

/* COUNT ONLY MONTHLY FEES */

if(session=="2025-26" && feeType.toLowerCase()=="monthly fees"){
totalPaid+=amount;
}

/* TABLE */

table+=`<tr>
<td>${date}</td>
<td>${slip}</td>
<td>₹${amount}</td>
<td>${feeType}</td>
<td>${session}</td>
<td>${tMonths}</td>
<td>${trMonths}</td>
<td>${exMonths}</td>
<td>${mode}</td>
</tr>`;

/* MOBILE CARD */

cards+=`<div class="fee-card">
<div><b>Date:</b> ${date}</div>
<div><b>Slip Number:</b> ${slip}</div>
<div><b>Amount Paid:</b> ₹${amount}</div>
<div><b>Fee Type:</b> ${feeType}</div>
<div><b>Session:</b> ${session}</div>
<div><b>Tuition Fee Months:</b> ${tMonths}</div>
<div><b>Transport Fee Months:</b> ${trMonths}</div>
<div><b>Exam Fee Months:</b> ${exMonths}</div>
<div><b>Payment Mode:</b> ${mode}</div>
</div>`;

}
}

/* ---------------- CALCULATE BALANCE ---------------- */

let examFee=1000;

let totalFee =
((monthlyTuition-discount)*tuitionMonths)
+(transportFees*transportMonths)
+examFee
+prevRemain;

let feeBalance = totalFee-totalPaid;

/* ---------------- DISPLAY FEES ---------------- */

document.getElementById("feeTable").innerHTML=table;
document.getElementById("feeCards").innerHTML=cards;

document.getElementById("monthlyTuition").innerText="₹"+monthlyTuition;
document.getElementById("tuitionMonths").innerText=tuitionMonths;
document.getElementById("transportFees").innerText="₹"+transportFees;
document.getElementById("transportMonths").innerText=transportMonths;
document.getElementById("prevRemain").innerText="₹"+prevRemain;
document.getElementById("discount").innerText="₹"+discount;

document.getElementById("totalPaid").innerText="₹"+totalPaid;

let bal=document.getElementById("feeBalance");
bal.innerText="₹"+feeBalance;

if(feeBalance>0){
bal.style.color="red";
}else{
bal.style.color="green";
}

/* ---------------- SHOW PORTAL ---------------- */

document.getElementById("loginBox").style.display="none";
document.getElementById("loader").style.display="none";
document.getElementById("portal").style.display="block";

}catch(e){

console.error(e);
alert("Error loading data. Check console.");
document.getElementById("loader").style.display="none";
document.getElementById("loginBtn").disabled=false;

}

}

function logout(){
location.reload();
}
