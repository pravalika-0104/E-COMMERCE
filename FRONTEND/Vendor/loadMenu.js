
async function loadMenu(){
    const htmlResponse=await fetch("Vendor_menu.html")
    const htmlData=await htmlResponse.text();
    const headerObj=document.getElementById("header");
    headerObj.innerHTML=htmlData;
}
function logout(){
    sessionStorage.clear()
    location.href="../login.html";
}
loadMenu()
