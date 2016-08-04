function getId (id) {
	var x = 10;
	return document.getElementById(id);
}
var oldImg = I(getId("oldImage")),
	toGray = getId("toGray"),
	bb = new Blob(), 
	arrObj = null, 
	n = 0;
["toGray", "toOld", "toMosaic", "toInverse"].forEach(function (val) {
	getId(val).addEventListener("click", function () {
		oldImg[val]();
	}, false);
});
oldImg.setImg("/images/t3.jpg");


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