const scriptURL = "https://script.google.com/macros/s/AKfycbzNB3tQtR74siBoAMd2ZFW-w9Y4eEPz9oqGjRZA28oW_CfGwItXAYzoxY5UX-lRuw8-oQ/exec";

function login(){

const adm = document.getElementById("admNo").value.trim();
const dob = document.getElementById("dob").value.trim();

if(!adm || !dob){
document.getElementById("loginMsg").innerText="Enter login details";
return;
}

document.getElementById("loginMsg").innerText="Loading Student Data...";

fetch(scriptURL + "?adm=" + adm + "&dob=" + dob + "&t=" + new Date().getTime(),{
method:"GET",
cache:"no-store"
})

.then(res=>res.json())

.then(data=>{

if(!data || data.length===0){
document.getElementById("loginMsg").innerText="Invalid login";
return;
}

loadStudent(data);

})

.catch(err=>{
console.error(err);
document.getElementById("loginMsg").innerText="Error loading data";
});

}



function loadStudent(data){

document.getElementById("loginPage").style.display="none";
document.getElementById("dashboard").style.display="block";

const student=data[0];

document.getElementById("welcome").innerText="Welcome, "+student.name;
document.getElementById("class").innerText="Class: "+student.class;
document.getElementById("adm").innerText="Admission No: "+student.adm;
document.getElementById("father").innerText="Father's Name: "+student.father;
document.getElementById("mother").innerText="Mother's Name: "+student.mother;
document.getElementById("phone").innerText="Phone Number: "+student.phone;
document.getElementById("address").innerText="Address: "+student.address;

buildFees(data);

}



function buildFees(data){

const tbody=document.getElementById("feesBody");
const cards=document.getElementById("feeCards");

let rows="";
let cardHTML="";

data.forEach(fee=>{

rows+=`
<tr>
<td>${fee.date}</td>
<td>${fee.slip}</td>
<td>${fee.amount}</td>
<td>${fee.type}</td>
<td>${fee.session}</td>
<td>${fee.tuition}</td>
<td>${fee.transport}</td>
<td>${fee.exam}</td>
</tr>
`;

cardHTML+=`

<div class="card">

<div class="cardRow"><b>Date</b><span>${fee.date}</span></div>
<div class="cardRow"><b>Slip No.</b><span>${fee.slip}</span></div>
<div class="cardRow"><b>Amount</b><span>${fee.amount}</span></div>
<div class="cardRow"><b>Fee Type</b><span>${fee.type}</span></div>
<div class="cardRow"><b>Session</b><span>${fee.session}</span></div>
<div class="cardRow"><b>Tuition</b><span>${fee.tuition}</span></div>
<div class="cardRow"><b>Transport</b><span>${fee.transport}</span></div>
<div class="cardRow"><b>Exam</b><span>${fee.exam}</span></div>

</div>

`;

});

tbody.innerHTML=rows;
cards.innerHTML=cardHTML;

}
