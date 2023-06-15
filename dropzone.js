document.addEventListener("DOMContentLoaded",()=>{
  
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const alerts = document.getElementById("visualaid");

  ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function(event) {
    dropzone.addEventListener(event, function(e) {
      e.preventDefault();
      e.stopPropagation();
    });
  });


  dropzone.onclick = function(){
    fileInput.click();
    this.classList.add("hover");
  }

  dropzone.ondragenter = function(){
    this.classList.add("hover");
  }

  dropzone.ondragleave = function(){
    this.classList.remove("hover");
  }

  dropzone.ondrop = function(e){
    var files = e.dataTransfer.files;
    var dt = new DataTransfer();
    console.log(files);
    Array.prototype.forEach.call(files, file => {
      console.log(file);
      dt.items.add(file);
    });
    console.log(dt.files)
    var filestobeadded = dt.files;
    console.log(filestobeadded)
    fileInput.files = filestobeadded;
    fileInput.dispatchEvent(new Event('change'));
  }
  
  fileInput.onchange = function(){
    var file = this.files[0];
    var accept = this.accept;
    dropzone.classList.remove("hover","error");

    if (accept && accept!=file.type) {
      alerts.innerHTML = `Tipo não permitido, apenas o formato PDF é aceito.`;
      dropzone.classList.add("error");
      return false;
    }

    dropzone.classList.add("dropped");

    alerts.innerHTML = `Processando ${file.name}`;
  }
});