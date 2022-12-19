let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
// Get the file input element
var fileInput = document.getElementById("file-input");

// Listen for changes to the file input element
fileInput.addEventListener("change", function () {
  // Get the selected file
  var file = this.files[0];

  // Check if the file is an image
  if (file.type.match(/image\/*/)) {
    // Create a new FileReader to read the file
    var reader = new FileReader();

    // Listen for the 'load' event on the FileReader
    reader.addEventListener("load", function () {
      // Create a new image with the src from the FileReader
      var image = new Image();
      image.src = this.result;

      // Calculate the aspect ratio of the original image
      var aspectRatio = image.width / image.height;

      // Set the width and height of the image to maintain the original aspect ratio
      if (image.width > 600) {
        // If the original width is greater than 600 pixels, set the width to 600
        // and scale the height accordingly
        image.width = 600;
        image.height = 600 / aspectRatio;
      } else {
        // If the original width is less than or equal to 600 pixels, set the width
        // and height to the original dimensions
        image.width = image.width;
        image.height = image.height;
      }
      console.log(image.width);
      console.log(image.height);
      // Append the image to the page
      document.body.appendChild(image);
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 3000, 1000, 500, 500, 50, 50, 50, 50);
    });

    // Read the file
    reader.readAsDataURL(file);
  } else {
    // If the file is not an image, display an error message
    console.error("The selected file is not an image.");
  }
});
