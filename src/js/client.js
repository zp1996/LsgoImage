var oldImg = I(getId("oldImage"), before, after),
	mask = getId("mask");

function getId (id) {
	return document.getElementById(id);
}

function before() {
	mask.style.display = "block";
}

function after() {
	mask.style.display = "none";
}

["toGray", "toOld", "toMosaic", "toInverse", 
 "toMirror", "toSketch", "GaosiBulr", "Roberts", 
 "RobertsSharp", "toNostalgia"].forEach(function (val) {
	getId(val).addEventListener("click", function () {
		oldImg[val]();
	}, false);
});
oldImg.setImg("images/building.jpg", after);


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

(function initImgData () {
	var _bright = 1, 
		_contrast = 1; 
	Object.defineProperties(ImgData, {
		// 亮度[-2, 4]
		bright: {
			get: function () {
				return _bright;
			},
			set: function (value) {
				value = value / width;
				_bright = (value * 6 - 2);
				b.value = value * 4;
			}
		},
		// 对比度[0, 2]
		contrast: {
			get: function () {
				return _contrast;
			},
			set: function (value) {
				value = value / width;
				_contrast = value * 2;
				c.value = value * 2;
			}
		}
	});
})();