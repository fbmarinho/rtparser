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
  const page = await pdfDocument.getPage(1);
  const textContent = await page.getTextContent();
  console.log(textContent.items)
  const startIndex = textContent.items.findIndex((item)=>item.str == "DETALHAMENTO DA EMBALAGEM")
  const endIndex = textContent.items.findIndex((item)=>item.str == "COMENTÁRIOS")

  console.log(startIndex, endIndex)

  for (var i = startIndex+12; i<=endIndex-16;i=i+16){
    let indice = parseInt(textContent.items[i].str);
    let item = parseToolFromString(textContent.items[i+2].str);  
    let peso = parseInt(textContent.items[i+8].str.split('.').join(""));
    let valor = parseInt(textContent.items[i+14].str.split('.').join(""));
    console.log({indice, ...item, peso, valor})
  }

  page.cleanup();
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

  return tool;
}

function isVirtualString(str){
  return  str.match(/^[9B]/g)?.length > 0;
}

function isSerialNumber(str){
  return  str.match(/^[1]/g)?.length > 0;
}