using ImageUploadApp.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PracticeWebMVC.Controllers
{
    public class HomeController : Controller
    {
        private readonly int _fileSizeLimit = 4000000;
        private readonly IWebHostEnvironment _webHostEnvironment;

        /// <summary>
        /// Initializes a new instance of the <see cref="HomeController"/> class.
        /// </summary>
        /// <param name="webHostEnvironment">The web host environment.</param>
        public HomeController(IWebHostEnvironment webHostEnvironment)
        {
            _webHostEnvironment = webHostEnvironment;
        }

        public ActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Gets the files.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public IActionResult GetFiles()
        {
            var model = new FilesModel
            {
                SystemFileNames = GetLocalFiles()
            };

            return Json(model);
        }

        /// <summary>
        /// Gets the local files.
        /// </summary>
        /// <returns></returns>
        private List<string> GetLocalFiles()
        {
            string path = Path.Combine(_webHostEnvironment.WebRootPath, "UploadedFiles");
            if (!System.IO.File.Exists(path)) Directory.CreateDirectory(path);

            List<string> systemFilesList = new List<string>();
            Directory.GetFiles(path)
                .ToList()
                .ForEach(x =>
                {
                    systemFilesList.Add(Path.GetFileName(x));
                });

            return systemFilesList.Where(x => x.Length > 36).OrderBy(x => x).ToList();
        }

        /// <summary>
        /// Uploads the file.
        /// </summary>
        /// <param name="file">The file.</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            var model = new FilesModel { SystemFileNames = GetLocalFiles() };

            if (file != null && file.Length > 0)
            {
                string fileExtension = Path.GetExtension(file.FileName);

                if (!file.ContentType.Equals("image/png") && !file.ContentType.Equals("image/jpeg"))
                {
                    model.Message = "Please upload a valid file format!";
                    return Json(model);
                }

                if (file.Length > _fileSizeLimit)
                {
                    model.Message = "File should be less than 4MB in size!";
                    return Json(model);
                }

                // extract only the filename and add a unique GUID
                var fileName = Guid.NewGuid() + Path.GetFileName(file.FileName);
                fileName = fileName.Replace("-", "_");
                string path = Path.Combine(_webHostEnvironment.WebRootPath, "UploadedFiles/" + fileName);

                if (model.SystemFileNames.Any(x => x.Substring(36) == file.FileName))
                {
                    model.Message = "File already exists on server!";
                    return Json(model);
                }
                else
                {
                    try
                    {
                        using (var fileStream = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(fileStream);
                        }

                        model.SystemFileNames = GetLocalFiles();
                        return Json(model);
                    }
                    catch (Exception e)
                    {
                        model.Message = $"Error occured whilst attempting to upload file!\nError details: {e.Message}";
                        return Json(model);
                    }
                }
            }
            else
            {
                model.Message = "Please select a file to upload!";
                return Json(model);
            }
        }

        /// <summary>
        /// Deletes the file.
        /// </summary>
        /// <param name="deleteModel">The delete model.</param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult DeleteFile([FromBody] DeleteModel deleteModel)
        {
            try
            {
                string path = Path.Combine(_webHostEnvironment.WebRootPath, "UploadedFiles/" + deleteModel.FileName);

                System.IO.File.SetAttributes(path, FileAttributes.Normal);
                System.IO.File.Delete(path);

                var model = new FilesModel
                {
                    SystemFileNames = GetLocalFiles()
                };

                return Json(model);
            }
            catch (Exception e)
            {
                var model = new FilesModel
                {
                    SystemFileNames = GetLocalFiles(),
                    Message = $"Error occured whilst attempting to delete file!\nError details: {e.Message}"
                };

                return Json(model);
            }
        }
    }
}