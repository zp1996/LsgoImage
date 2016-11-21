"use strict";

function getId(id) {
	var x = 10;
	return document.getElementById(id);
}
var oldImg = I(getId("oldImage")),
    toGray = getId("toGray"),
    bb = new Blob(),
    arrObj = null,
    n = 0;
["toGray", "toOld", "toMosaic", "toInverse", "toMirror", "toSketch", "GaosiBulr", "Roberts", "RobertsSharp", "toNostalgia"].forEach(function (val) {
	getId(val).addEventListener("click", function () {
		oldImg[val]();
	}, false);
});
oldImg.setImg("images/building.jpg");

// 图像相关配置
var width = document.getElementsByTagName("progress")[0].offsetWidth,
    ImgData = {},
    b = getId("bright"),
    c = getId("contrast"),
    change = getId("radix-change");

change.addEventListener("click", function (e) {
	var target = e.target;
	if (target && ImgData.hasOwnProperty(target.id)) {
		ImgData[target.id] = e.offsetX;
		oldImg.ConBrBaseFilter(ImgData.contrast, ImgData.bright);
	}
}, false);

(function initImgData() {
	var _bright = 1,
	    _contrast = 1;
	Object.defineProperties(ImgData, {
		// 亮度[-2, 4]
		bright: {
			get: function get() {
				return _bright;
			},
			set: function set(value) {
				value = value / width;
				_bright = value * 6 - 2;
				b.value = value * 4;
			}
		},
		// 对比度[0, 2]
		contrast: {
			get: function get() {
				return _contrast;
			},
			set: function set(value) {
				value = value / width;
				_contrast = value * 2;
				c.value = value * 2;
			}
		}
	});
})();