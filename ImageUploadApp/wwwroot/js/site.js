"use strict";

/**
 * Shows a preview of the image
 * @param {string} imageSRC
 */
function ShowImagePreview(imageSRC) {
    var imageSrc = "/UploadedFiles/" + imageSRC;
    document.getElementById("createImage").setAttribute("src", imageSrc);
    document.getElementById("myModal").style.display = "block";
}

/**
 *Close the modal 
 */
function CloseModal() {
    document.getElementById("createImage").removeAttribute("src");
    document.getElementById("myModal").style.display = "none";
}

async function InitialLoad() {
    var url = "/Home/GetFiles";

    await fetch(url, {
        method: 'GET'
    }).then(response => response.json())
        .then(data => UpdateContentsTable(data))
        .catch(function () {
            alert("An error has occured and we couldn't load all the files!")
        });
}

/**
 * Called when uploading an image
 */
async function UploadFile() {
    var uploadedFile = document.getElementById("fileUpload").files[0];
    var file = new FormData(document.getElementById("uploadForm"));

    if (uploadedFile === undefined) {
        alert("Please select an image to upload!");
        document.getElementById("fileUpload").value = null;

        return;
    }

    if (uploadedFile.size > 4000000) {
        alert("File should be less than 4MB in size!");
        document.getElementById("fileUpload").value = null;

        return;
    }

    var url = "/Home/UploadFile";

    await fetch(url, {
        method: 'POST',
        body: file
    }).then(response => response.json())
        .then(data => UpdateContentsTable(data))
        .catch(function () {
            alert("An error has occured and we couldn't upload the file!")
        });
}

/**
 * Called when deleting a particular image
 */
async function DeleteFile() {
    var url = "/Home/DeleteFile";
    var FileName = (this).getAttribute("data-request-name");
    var deleteModel = {
        FileName: FileName
    };

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(deleteModel)
    }).then(response => response.json())
        .then(data => UpdateContentsTable(data))
        .catch(function () {
            alert("An error has occured and we couldn't delete the file!")
        });
}

/**
 * This function updates the table when an image has been uploaded or deleted
 * @param {object} response reponse object returned from the call
 */
function UpdateContentsTable(response) {
    debugger;
    $('#tbl-body').find('tr').not(':first-child').remove();
    var tbl = document.getElementById("tbl-body");

    if (response.systemFileNames.length >= 1) {
        for (var i = 0; i < response.systemFileNames.length; i++) {
            var file = response.systemFileNames[i];
            var tr = document.createElement('tr');

            var str = `
                <td>
                    <span style="padding: 0 0 0 10px">${file.substr(36)}</span>
                </td>
                <td>
                    <img src="UploadedFiles/${file}" style="width: 120px; height: 55px" onclick="ShowImagePreview('${file}'); return false;" />
                </td>
                <td style="padding: 10px">
                    <input type="button" id="${file}" data-request-name="${file}" value="Delete" class="submitBtn deleteBtn" style="cursor: pointer" />
                </td>`;

            tr.innerHTML = str;
            tbl.appendChild(tr);
            document.getElementById(file).addEventListener("click", DeleteFile);
        }
    }

    if (response.message !== null) alert(response.message);
    document.getElementById("fileUpload").value = null;
}

window.onload = function () {
    this.InitialLoad();
    this.document.getElementById("close-modal").addEventListener("click", this.CloseModal, false);
    this.document.getElementById("upload-file").addEventListener("click", this.UploadFile, false);
    this.CloseModal();
}