function getId (id) {
	return document.getElementById(id);
}
var oldImg = I(getId("oldImage")),
	toGray = getId("toGray"),
	bb = new Blob(), 
	arrObj = null, 
	n = 0;
["toGray", "toInverse", "toMosaic", "ConBrBaseFilter"].forEach(function (val) {
	getId(val).addEventListener("click", function () {
		oldImg[val]();
	}, false);
});

oldImg.setImg("images/t3.jpg");