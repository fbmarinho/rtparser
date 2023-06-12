HTMLCollection.prototype.forEach = Array.prototype.forEach;

function copyToClipboard(e) {
  navigator.clipboard.writeText(e.innerHTML);
  console.log("Copied: "+ e.innerHTML);
  e.classList.add("copied");
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof pdfjsLib === "undefined") {
    // eslint-disable-next-line no-alert
    alert("PDF.js not found");
    return;
  }
});

document.getElementById("fileInput").addEventListener('change', handleFile, false);

function handleFile() {
  const reader = new FileReader();
  reader.readAsDataURL(this.files[0]);
  reader.onload = (e) => parsePDF(e.target.result);
}

async function parsePDF(url) {

  const loadingTask = pdfjsLib.getDocument({ url });
  const pdfDocument = await loadingTask.promise;

  //Get Div placeholder for the containers
  var containers = document.getElementById("containers")
  containers.innerHTML = "";

  console.log("Number of Pages to process:",pdfDocument.numPages);

  //Iterate over pages
  for (let pageNumber = 1; pageNumber<=parseInt(pdfDocument.numPages); pageNumber++){
    console.log("Page #",pageNumber);
    const page = await pdfDocument.getPage(pageNumber);
    const textContent = await page.getTextContent();

    const startIndex = textContent.items.findIndex((item)=>item.str == "DETALHAMENTO DA EMBALAGEM")
    const endIndex = textContent.items.findIndex((item)=>item.str == "COMENTÁRIOS")

    //console.log(startIndex, endIndex)

    let json = [];
    let html = "";

    for (let i = startIndex+12; i<=endIndex-16;i=i+16){
      let indice = parseInt(textContent.items[i].str);
      let item = parseToolFromString(textContent.items[i+2].str);  
      let peso = parseInt(textContent.items[i+8].str.split('.').join(""));
      let valor = parseInt(textContent.items[i+14].str.split('.').join(""));
      //console.log({indice, ...item, peso, valor})

      //json.push(JSON.stringify({indice, ...item, peso, valor}, null, 2))
      html = html + `<tr data-index="${indice}"><td class="name">${item.name} ${item.virtual}</td><td class="serial">${item.serial}</td><td class="comments">Peso: ${peso} | Valor: ${valor}</td></tr>`
    }

    //Create div for individual baskets
    var container = document.createElement("div");
    container.classList.add("pre","copy");
    
    container.innerHTML = "<table style='white-space: nowrap'>"+html+"</table>";

    containers.appendChild(container);

    // const view_json = document.getElementById("view_json");
    // const view_html = document.getElementById("view_html");
    // view_json.innerText = "["+json.join(",")+"]";
    // view_html.innerHTML = "<table style='white-space: nowrap'>"+html+"</table>";

    // view_json.classList.remove("disabled");
    // view_html.classList.remove("disabled");

    page.cleanup();
  }
  updateListeners();
}

function parseToolFromString(str){
  let splitted = str.split(" ")

  let tool = {
    name: "",
    serial: "",
    virtual: ""
  }

  if(splitted.length <= 1) tool.name = str;

  splitted.forEach(s=>{
    if(!isSerialNumber(s) && !isVirtualString(s)){
      tool.name = tool.name + " " + s
    }
    if(isSerialNumber(s)) tool.serial = s
    if(isVirtualString(s)) tool.virtual = s
  })
  console.log(tool)
  return tool;
}

function isVirtualString(str){
  return  str.match(/(?=^[9])([0-9]{8})|(?=^BX9)(\w{10})/g)?.length > 0;
}

function isSerialNumber(str){
  return  str.match(/(?=^[1])([0-9]{8})/g)?.length > 0;
}

function updateListeners(){
  document.getElementsByClassName("copy").forEach((element)=>{
    element.addEventListener("click",() => copyToClipboard(element),false);
    element.addEventListener("animationend",() => element.classList.remove('copied'),false);
  },false)
}