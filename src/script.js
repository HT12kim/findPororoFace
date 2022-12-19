// declare acanvas variable and get its context
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let $uploadBtn = document.getElementById("uploadBtn");
let $uploadImage = document.getElementById("uploadImage");
let detectModel;
let sWidth;
let sHeight;
let model, labelContainer, maxPredictions;

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/pDeFRSsqw/";

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
    var element = document.createElement("div");
    element.classList.add("d-flex");
    labelContainer.appendChild(element);
  }
}

const detectFaces = async () => {
  const width = $uploadImage.width;
  const height = $uploadImage.height;
  const prediction = await detectModel.estimateFaces($uploadImage, false); // 얼굴 좌표 생성
  let resizeRatio = 0;

  if (prediction.length === 0) {
    alert("no Face");
    return;
  }

  if (sWidth >= sHeight) {
    resizeRatio = sHeight / height;
  } else {
    resizeRatio = sWidth / width;
  }

  canvas.width = prediction[0].bottomRight[0] - prediction[0].topLeft[0] + 40;
  canvas.height = prediction[0].bottomRight[1] - prediction[0].topLeft[1] + 40;
  console.log(canvas.width);
  console.log(canvas.height);

  $("#loading").hide();
  $(".file-upload-image").hide();
  $("#detected").show();
  ctx.drawImage(
    $uploadImage,
    (prediction[0].topLeft[0] - 20) * resizeRatio,
    (prediction[0].topLeft[1] - 20) * resizeRatio,
    (prediction[0].bottomRight[0] - prediction[0].topLeft[0] + 40) * resizeRatio,
    (prediction[0].bottomRight[1] - prediction[0].topLeft[1] + 40) * resizeRatio,
    0,
    0,
    prediction[0].bottomRight[0] - prediction[0].topLeft[0] + 40,
    prediction[0].bottomRight[1] - prediction[0].topLeft[1] + 40
  );
};

// run the webcam image through the image model
async function predict() {
  // predict can take in an image, video or canvas html element
  var image = document.querySelector(".faceImage");
  var resultMsg;
  const $resultMsg = document.querySelector(".resultMsg");
  const prediction = await model.predict(image, false);
  prediction.map((e) => {
    switch (e.className) {
      case "Poby":
        e["classNameKor"] = "포비";
        break;
      case "Harry":
        e["classNameKor"] = "해리";
        break;
      case "Eddy":
        e["classNameKor"] = "에디";
        break;
      case "Crong":
        e["classNameKor"] = "크롱";
        break;
      case "Loppy":
        e["classNameKor"] = "루피";
        break;
      case "Pororo":
        e["classNameKor"] = "뽀로로";
        break;
    }
  });

  prediction.sort((a, b) => parseFloat(b.probability) - parseFloat(a.probability));
  console.log(prediction);
  resultMsg = "가장 유사한 뽀로로 캐릭터는 [" + prediction[0].classNameKor + "] 입니다.";
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
        labelTitle = "<img class='label__img' src=Img/Poby.jpeg /> 포비";
        break;
      case "Harry":
        labelTitle = "<img class='label__img' src=Img/Harry.jpeg /> 해리";
        break;
      case "Eddy":
        labelTitle = "<img class='label__img' src=Img/Eddy.jpeg /> 에디";
        break;
      case "Crong":
        labelTitle = "<img class='label__img' src=Img/Crong.jpeg /> 크롱";
        break;
      case "Loppy":
        labelTitle = "<img class='label__img' src=Img/Loppy.png /> 루피";
        break;
      case "Pororo":
        labelTitle = "<img class='label__img' src=Img/Pororo.jpeg /> 뽀로로";
        break;
      default:
        labelTitle = "알 수 없음";
    }
    var label = "<div class='face-label d-flex align-items-center'>" + labelTitle + "</div>";
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

function resize(img) {
  // 원본 이미지 사이즈 저장
  var width = img.width;
  var height = img.height;
  sWidth = img.width;
  sHeight = img.height;

  // 가로, 세로 최대 사이즈 설정
  var maxWidth = 600; // 원하는대로 설정. 픽셀로 하려면 maxWidth = 100  이런 식으로 입력
  var maxHeight = 600; // 원래 사이즈 * 0.5 = 50%

  // 가로나 세로의 길이가 최대 사이즈보다 크면 실행
  if (width > maxWidth || height > maxHeight) {
    // 가로가 세로보다 크면 가로는 최대사이즈로, 세로는 비율 맞춰 리사이즈
    if (width > height) {
      resizeWidth = maxWidth;
      resizeHeight = Math.round((height * resizeWidth) / width);

      // 세로가 가로보다 크면 세로는 최대사이즈로, 가로는 비율 맞춰 리사이즈
    } else {
      resizeHeight = maxHeight;
      resizeWidth = Math.round((width * resizeHeight) / height);
    }

    // 최대사이즈보다 작으면 원본 그대로
  } else {
    resizeWidth = width;
    resizeHeight = height;
  }

  // 리사이즈한 크기로 이미지 크기 다시 지정
  img.width = resizeWidth;
  img.height = resizeHeight;
  console.log(sWidth);
  console.log(sHeight);
}

function gaReload1() {
  window.location.reload();
}

init();
$uploadBtn.addEventListener("change", () => {
  const reader = new FileReader();
  reader.onload = (e) => {
    $uploadImage.src = e.target.result;
    $(".image-upload-wrap").hide();
    $("#detected").hide();
    $("#loading").show();
    $(".file-upload-content").show();
    $(".image-title").html($uploadBtn.files[0].name);
  };
  reader.readAsDataURL($uploadBtn.files[0]);
});
$uploadImage.addEventListener("load", async () => {
  detectModel = await blazeface.load();
  detectFaces().then(() => {
    predict();
  });
});
