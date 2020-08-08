"use strict";

function ShowImagePreview(imageSRC) {
    var imageSrc = "/UploadedFiles/" + imageSRC;
    document.getElementById("createImage").setAttribute("src", imageSrc);
    document.getElementById("myModal").style.display = "block";
}

function CloseModal() {
    document.getElementById("createImage").removeAttribute("src");
    document.getElementById("myModal").style.display = "none";
}

async function UploadFile() {
    var file = new FormData(document.getElementById("uploadForm"));
    if (file === undefined) return;

    var uploadedFile = document.getElementById("fileUpload").files[0];

    if (uploadedFile.size > 4000000) {
        alert("File should be less than 4MB in size!");
        return;
    }

    var url = document.getElementById("upload-file").getAttribute("data-request-url");

    await fetch(url, {
        method: 'POST',
        body: file
    }).then(response => response.json())
        .then(data => UpdateContentsTable(data));
}

function UpdateContentsTable(response) {
    var tbl = document.getElementsByClassName("table-bordered");
    var tbdy = document.createElement('tbody');
    tbdy.setAttribute("id", "tbl-body");

    if (response.systemFileNames.length >= 1) {
        debugger;
        for (var i = 0; i < response.systemFileNames.length; i++) {
            var file = response.systemFileNames[i];

            var str = `
                <tr>
                    <td>
                        <span style="padding: 0 0 0 10px">${file.substr(36)}</span>
                    </td>
                    <td>
                        <img src="~/UploadedFiles/${file}" style="width: 120px; height: 55px" onclick="ShowImagePreview('${file}'); return false;" />
                    </td>
                    <td style="padding: 10px">
                        <input type="button" value="Delete" class="submitBtn delete" id="delete-file" data-request-url="@Url.Action("DeleteFile", "Home")" style="cursor: pointer" />
                    </td>
                </tr>`.trim();

            tbdy.insertAdjacentHTML("beforeend", str);
        }

        tbl.appendChild(tbdy);
    }
    else {
        var str = "<tr><td>There are no files to display.</td><td>None</td></tr>";
        tbl.insertAdjacentHTML("beforeend", str);
    }

    if (response.message !== null || response.message !== "") alert(response.message);
}

function DeleteFile(file) {
    $.ajax({
        url: $(this).data('request-url'),
        type: "Post",
        data: { fileName: file },
        success: function (data) {
            window.location.reload();
        }
    });
}

window.onload = function () {
    this.document.getElementById("close-modal").addEventListener("click", this.CloseModal, false);
    this.document.getElementById("upload-file").addEventListener("click", this.UploadFile, false);
    this.document.getElementById("delete-file").addEventListener("click", this.DeleteFile, false);
    this.CloseModal();
}