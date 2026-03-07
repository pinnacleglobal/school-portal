const sheetURL = "https://script.google.com/macros/s/AKfycbz2cXoii3UFrtivVFi6TNjnQqMQ2vIgea7RaZ5JNxHdP8IhS6DXFbyoqvBDdljdarii/exec";

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

/* INSTALL APP */

if(localStorage.getItem("pwaInstalled")){
installBtn.style.display="none";
}

window.addEventListener("beforeinstallprompt",(e)=>{

e.preventDefault();
deferredPrompt=e;

if(!localStorage.getItem("pwaInstalled")){
installBtn.style.display="block";
}

});

installBtn.addEventListener("click",async()=>{

if(!deferredPrompt) return;

deferredPrompt.prompt();

const result=await deferredPrompt.userChoice;

if(result.outcome==="accepted"){

localStorage.setItem("pwaInstalled","true");

installBtn.style.display="none";

}

});

window.addEventListener("appinstalled",()=>{

localStorage.setItem("pwaInstalled","true");

installBtn.style.display="none";

});


/* LOGIN */

function login(){

showLoading();

const adm=document.getElementById("adm").value;

const dob=document.getElementById("dob").value;

fetch(`${sheetURL}?adm=${adm}&dob=${dob}`)

.then(res=>res.json())

.then(data=>{

hideLoading();

if(data.status==="success"){

document.getElementById("loginPage").style.display="none";

document.getElementById("dashboard").style.display="block";

loadStudent(data.student);

loadFees(data.fees);

}else{

alert("Invalid Login");

}

});

}

/* STUDENT DETAILS */

function loadStudent(student){

const container=document.getElementById("studentDetails");

container.innerHTML="";

container.innerHTML=`

<p><strong>Name:</strong> ${student.name}</p>

<p><strong>Class:</strong> ${student.class}</p>

<p><strong>Admission Number:</strong> ${student.admission}</p>

<p><strong>Father's Name:</strong> ${student.father}</p>

<p><strong>Mother's Name:</strong> ${student.mother}</p>

<p><strong>Phone Number:</strong> ${student.phone}</p>

<p><strong>Address:</strong> ${student.address}</p>

`;

}

/* FEES */

function loadFees(fees){

const table=document.getElementById("tableBody");

const cards=document.getElementById("mobileCards");

table.innerHTML="";
cards.innerHTML="";

fees.forEach(f=>{

/* DESKTOP TABLE */

table.innerHTML+=`

<tr>

<td>${f.date}</td>

<td>${f.slip}</td>

<td>${f.tuition}</td>

<td>${f.transport}</td>

<td>${f.exam}</td>

<td>${f.amount}</td>

<td>${f.payment}</td>

</tr>

`;

/* MOBILE CARDS */

cards.innerHTML+=`

<div class="fee-card">

<p><b>Date:</b> ${f.date}</p>

<p><b>Slip Number:</b> ${f.slip}</p>

<p><b>Tuition Fee Months:</b> ${f.tuition}</p>

<p><b>Transport Fee Months:</b> ${f.transport}</p>

<p><b>Exam Fee Months:</b> ${f.exam}</p>

<p><b>Amount Paid:</b> ${f.amount}</p>

<p><b>Payment Mode:</b> ${f.payment}</p>

</div>

`;

});

}

/* LOADING */

function showLoading(){

document.getElementById("loadingScreen").style.display="flex";

}

function hideLoading(){

document.getElementById("loadingScreen").style.display="none";

}

/* LOGOUT */

function logout(){

showLoading();

setTimeout(()=>{

location.reload();

},800);

}
