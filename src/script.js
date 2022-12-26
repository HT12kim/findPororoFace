// declare acanvas variable and get its context
// let canvas = document.getElementById("canvas");
// let ctx = canvas.getContext("2d");
let $uploadBtn = document.getElementById("uploadBtn");
let $uploadImage = document.getElementById("upload-image");
let detectModel, sWidth, sHeight;
let model, labelContainer, maxPredictions;

// import jQuery https://code.jquery.com/jquery-3.3.1.min.js
var elementSelected = null;
var typeSelected = false;

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
  const prediction = await detectModel.estimateFaces($uploadImage, false); // detect face coordinates
  let resizeRatio = 0;

  if (prediction.length === 0) {
    alert("얼굴을 찾을 수 없거나 너무 많습니다. \n 다시 시도해주세요..\n 너무 멀리떨어져서 찍은 사진은 찾을수가 없어요..");
    gaReload1();
    return;
  }

  if (sWidth >= sHeight) {
    resizeRatio = sHeight / height;
  } else {
    resizeRatio = sWidth / width;
  }
  prediction.forEach(function (el, index) {
    // create canvas element and add to the canvases class
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img");

    $(".list-image").append(canvas);
    $(".list-image").append(img);
    canvas.classList.add("face-image");
    canvas.id = "canvas_" + index;
    img.id = "img_" + index;
    var canvas_id = canvas.id;
    var img_id = img.id;

    // set width and height of canvas based on face coordinates
    canvas.width = el.bottomRight[0] - el.topLeft[0] + 40;
    canvas.height = el.bottomRight[1] - el.topLeft[1] + 40;
    img.width = canvas.width;
    img.height = canvas.height;

    // roundedImage(0, 0, el.bottomRight[0] - el.topLeft[0] + 40, el.bottomRight[1] - el.topLeft[1] + 40, 20);
    // ctx.clip();
    ctx.drawImage(
      $uploadImage,
      (el.topLeft[0] - 20) * resizeRatio,
      (el.topLeft[1] - 20) * resizeRatio,
      (el.bottomRight[0] - el.topLeft[0] + 40) * resizeRatio,
      (el.bottomRight[1] - el.topLeft[1] + 40) * resizeRatio,
      0,
      0,
      el.bottomRight[0] - el.topLeft[0] + 40,
      el.bottomRight[1] - el.topLeft[1] + 40
    );

    // ctx.restore();
    document.getElementById(img_id).src = getBase64Image(canvas_id);
  });
  $("#loading-face").hide();
  $(".file-upload-image").hide();
  $("#detected").show();
  $(".canvases").show();
  $(".select-image").show();
};

// run the webcam image through the image model
async function predict() {
  // predict can take in an image, video or canvas html element
  // var image = document.querySelector(".faceImage"); // 원래 코드
  var image = document.querySelector(".view-image > img");
  const prediction = await model.predict(image, false);
  console.log(prediction);

  $(document).on("click", ".list-image > img", function () {
    $(".list-image > img").each(function () {
      $(this).removeClass("active");
    });
    $(this).addClass("active");
    elementSelected = $(this);
    typeSelected = false;
    $(".view-image > img").attr("src", elementSelected.attr("src"));
  });

  $(document).on("click", "#button-confirm", async function () {
    if (elementSelected !== null) {
      $(".select-image").hide();
      $("#detected").hide();

      const $resultMsg = document.querySelector(".resultMsg");
      let result_msg;
      let barWidth;

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
      result_msg = "가장 닮은 캐릭터는 [" + prediction[0].classNameKor + "] 입니다.";
      $resultMsg.innerHTML = result_msg;
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
            labelTitle = "<img class='label__img' src=Img/Poby.png /> 포비";
            break;
          case "Harry":
            labelTitle = "<img class='label__img' src=Img/Harry.png /> 해리";
            break;
          case "Eddy":
            labelTitle = "<img class='label__img' src=Img/Eddy.png /> 에디";
            break;
          case "Crong":
            labelTitle = "<img class='label__img' src=Img/Crong.png /> 크롱";
            break;
          case "Loppy":
            labelTitle = "<img class='label__img' src=Img/Loppy.png /> 루피";
            break;
          case "Pororo":
            labelTitle = "<img class='label__img' src=Img/Pororo.png /> 뽀로로";
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

      $(".view-image").fadeIn("900");
    } else {
      alert("얼굴을 선택해 주세요!");
      return;
    }
  });
}

function gaReload1() {
  window.location.reload();
}

init();
$uploadBtn.addEventListener("change", () => {
  const reader = new FileReader();
  reader.onload = (e) => {
    var image = new Image();
    image.src = e.target.result;
    image.onload = function () {
      sWidth = this.width;
      sHeight = this.height;
    };
    $uploadImage.src = e.target.result;
    $(".image-upload-wrap").hide();
    $(".file-upload-content").show();
    $("#loading-face").show();
    $(".canvases").hide();
    $(".file-upload-image").show();
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

function getBase64Image(canvasId) {
  var canvas = document.getElementById(canvasId);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL;
}

function fn_sendFB(sns) {
  var thisUrl = document.URL;
  var snsTitle = "뽀로로 탐색기]";
  if (sns == "facebook") {
    var url = "http://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(thisUrl);
    window.open(url, "", "width=486, height=286");
  } else if (sns == "twitter") {
    var url = "http://twitter.com/share?url=" + encodeURIComponent(thisUrl) + "&text=" + encodeURIComponent(snsTitle);
    window.open(url, "tweetPop", "width=486, height=286,scrollbars=yes");
  } else if (sns == "band") {
    var url = "http://www.band.us/plugin/share?body=" + encodeURIComponent(snsTitle) + "&route=" + encodeURIComponent(thisUrl);
    window.open(url, "shareBand", "width=400, height=500, resizable=yes");
  } else if (sns == "kakaotalk") {
    // 사용할 앱의 JavaScript 키 설정
    Kakao.init("68e227d1587b11c7bc6a53b04cf22db6");

    // 카카오링크 버튼 생성
    Kakao.Link.createDefaultButton({
      container: "#btnKakao", // HTML에서 작성한 ID값
      objectType: "feed",
      content: {
        title: "뽀로로 탐색기", // 보여질 제목
        description: "육아휴직 중 애기 잠자는 시간 이용해 만든 뽀로로 탐색기 입니다. 우리 애기 뽀로로 닮은 캐릭터를 찾아봐요", // 보여질 설명
        imageUrl: thisUrl, // 콘텐츠 URL
        link: {
          mobileWebUrl: thisUrl,
          webUrl: thisUrl,
        },
      },
    });
  }
}
