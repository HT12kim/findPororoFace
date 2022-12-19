// declare acanvas variable and get its context
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let $uploadBtn = document.getElementById("uploadBtn");
let $uploadImage = document.getElementById("uploadImage");
let detectModel;

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/pDeFRSsqw/";

let model, labelContainer, maxPredictions;
init();
// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // append elements to the DOM
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    // and class labels
    labelContainer.appendChild(document.createElement("div"));
  }
}

// 작성중
$uploadBtn.addEventListener("change", () => {
  const reader = new FileReader();
  reader.onload = (e) => {
    $uploadImage.setAttribute("src", e.target.result);
  };
  reader.readAsDataURL($uploadBtn.files[0]);
});

const detectFaces = async () => {
  const prediction = await detectModel.estimateFaces($uploadImage, false);
  console.log(prediction);
  // draw the video first
  ctx.drawImage(
    $uploadImage,
    prediction[0].topLeft[0] - 20,
    prediction[0].topLeft[1] - 20,
    prediction[0].bottomRight[0] - prediction[0].topLeft[0] + 20,
    prediction[0].bottomRight[1] - prediction[0].topLeft[1] + 20,
    0,
    0,
    prediction[0].bottomRight[0] - prediction[0].topLeft[0] + 20,
    prediction[0].bottomRight[1] - prediction[0].topLeft[1] + 20
  );
  console.log(prediction[0].topLeft[0]);
  console.log(prediction[0].topLeft[1]);
  console.log(prediction[0].bottomRight[0] - prediction[0].topLeft[0]);
  console.log(prediction[0].bottomRight[1] - prediction[0].topLeft[1]);
};

$uploadImage.addEventListener("load", async () => {
  detectModel = await blazeface.load();
  detectFaces().then(() => {
    predict();
  });
});
//** 얼굴 검출까지 작동 */

// run the webcam image through the image model
async function predict() {
  // predict can take in an image, video or canvas html element
  var image = document.querySelector(".faceImage");
  var resultMsg;
  const $resultMsg = document.querySelector(".resultMsg");
  const prediction = await model.predict(image, false);

  prediction.sort((a, b) => parseFloat(b.probability) - parseFloat(a.probability));
  console.log(prediction[0].className);
  resultMsg = "가장 유사한 뽀로로 캐릭터는 " + prediction[0].className + "입니다.";
  $resultMsg.innerHTML = resultMsg;

  let barWidth;
  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability.toFixed(2) > 0.1) {
      barWidth = Math.round(prediction[i].probability.toFixed(2) * 100) + "%";
    } else if (prediction[i].probability.toFixed(2) >= 0.01) {
      barWidth = "4%";
    } else {
      barWidth = "2%";
    }
    var labelTitle;
    switch (prediction[i].className) {
      case "Poby":
        labelTitle = "포비";
        break;
      case "Harry":
        labelTitle = "해리";
        break;
      case "Eddy":
        labelTitle = "에디";
        break;
      case "Crong":
        labelTitle = "크롱";
        break;
      case "Loppy":
        labelTitle = "루피";
        break;
      case "Pororo":
        labelTitle = "뽀로로";
        break;
      default:
        labelTitle = "알 수 없음";
    }
    var label = "<div class='animal-label d-flex align-items-center'>" + labelTitle + "</div>";
    var bar =
      "<div class='bar-container position-relative container'><div class='" +
      prediction[i].className +
      "-box'></div><div class='d-flex justify-content-center align-items-center " +
      prediction[i].className +
      "-bar' style='width: " +
      barWidth +
      "'><span class='d-block percent-text'>" +
      Math.round(prediction[i].probability.toFixed(2) * 100) +
      "%</span></div></div>";
    labelContainer.childNodes[i].innerHTML = label + bar;
  }
}
