const SHEET_ID = "1TBykyZx-eRMBDrRGBGGA8p_49iHlVDKN3wt9wijHJWM";
const API_KEY = "AIzaSyB5VIy4kIySW7bVrjNYMpL5rkqZ7Oe758E";

// Fetch sheet data
async function getSheetData(sheetName){
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.values; // 2D array of rows
}

// Check login code
async function checkLogin(code){
  const awData = await getSheetData("AW");
  for(let i=1;i<awData.length;i++){
    if(awData[i][29] && awData[i][29].trim() === code.trim()){
      return true;
    }
  }
  return false;
}

// Get student info
async function getStudentData(code){
  const awData = await getSheetData("AW");
  const masterData = await getSheetData("Master Data 25 (New)");
  const feesData = await getSheetData("Fees Collection");

  let admissionNumber="", studentName="", studentClass="";
  let tuition=[], transport=[], exam=[];

  // AW sheet: Admission No & Name
  for(let i=1;i<awData.length;i++){
    if(awData[i][29] && awData[i][29].trim() === code.trim()){
      admissionNumber = awData[i][1]; // Column B
      studentName = awData[i][3];     // Column D
      break;
    }
  }

  // Master Data: Class
  for(let i=1;i<masterData.length;i++){
    if(masterData[i][1] && masterData[i][1].trim() === admissionNumber){
      studentClass = masterData[i][13]; // Column N
      break;
    }
  }

  // Fees Collection: Tuition, Transport, Exam
  for(let i=1;i<feesData.length;i++){
    if(feesData[i][2] && feesData[i][2].trim() === admissionNumber){
      // Tuition
      if(feesData[i][8] && feesData[i][8].trim().toLowerCase() !== "no") tuition.push(feesData[i][8].trim());
      // Transport
      if(feesData[i][9] && feesData[i][9].trim().toLowerCase() !== "no") transport.push(feesData[i][9].trim());
      // Exam
      if(feesData[i][10] && feesData[i][10].trim().toLowerCase() !== "no") exam.push(feesData[i][10].trim());
    }
  }

  // Replace empty arrays with "NA"
  if(tuition.length === 0) tuition.push("NA");
  if(transport.length === 0) transport.push("NA");
  if(exam.length === 0) exam.push("NA");

  return {
    admissionNumber,
    studentName,
    studentClass,
    tuition: tuition.join(", "),
    transport: transport.join(", "),
    exam: exam.join(", ")
  };
}

// Login button click
async function login(){
  const code = document.getElementById("code").value.trim();
  const loginBtn = document.querySelector("#loginSection button");
  if(code===""){document.getElementById("message").innerText="Enter login code"; return;}

  loginBtn.disabled=true;
  document.getElementById("loader").style.display="flex";

  try{
    const valid = await checkLogin(code);
    if(valid){
      const data = await getStudentData(code);
      showDashboard(data);
    }else{
      document.getElementById("message").innerText="Invalid Code!";
    }
  }catch(err){
    alert("Error: "+err.message);
  }

  loginBtn.disabled=false;
  document.getElementById("loader").style.display="none";
}

// Display dashboard
function showDashboard(data){
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("dashboardSection").classList.remove("hidden");

  document.getElementById("admission").innerText = data.admissionNumber || "";
  document.getElementById("name").innerText = data.studentName || "";
  document.getElementById("class").innerText = data.studentClass || "";
  document.getElementById("tuition").innerText = data.tuition || "";
  document.getElementById("transport").innerText = data.transport || "";
  document.getElementById("exam").innerText = data.exam || "";
}

// Logout button click
function logout(){
  document.getElementById("dashboardSection").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
  document.getElementById("code").value="";
  document.getElementById("message").innerText="";
}
