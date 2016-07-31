/**
  * 图像操作
  * some simple methods in image processing
  * @author zp
  */
(function (global) {

	var LSGOImage = function (canvas) {
		return new LSGOImage.fn.init(canvas);
	};
	LSGOImage.fn = LSGOImage.prototype;
	LSGOImage.fn.init = function (canvas) {
		var _width = canvas.width || 0,
			_height = canvas.height || 0;
		this.n = 1;
		this.startX = 0;
		this.startY = 0;
		this.imgData = null;
		Object.defineProperties(this, {
			width: {
				get: function () {
					return _width;
				},
				set: function (val) {
					canvas.width = _width = val;
				}
			},
			height: {
				get: function () {
					return _height;
				},
				set: function (val) {
					canvas.height = _height = val;
				}
			}
		});
		this.ctx = canvas.getContext("2d");
	};
	LSGOImage.noop = function () {};
	LSGOImage.setImg = function (img, fn, x, y) {
		this.startX = x || 0;
		this.startY = y || 0;
		this.width = this.startX + img.width;
		this.height = this.startX + img.height;
		this.ctx.drawImage(img, this.startX, this.startY, img.width, img.height);
		fn = fn || LSGOImage.noop;
		this.getInfo();
		fn.call(this);
	};
	LSGOImage.fn.init.prototype = LSGOImage.fn;
	// 设置图像
	LSGOImage.fn.setImg = function (url, fn, x, y) {
		if (typeof url === "string") {
			var img = new Image(),
				self = this;
			img.src = url;
			img.onload = function () {
				LSGOImage.setImg.call(self, this, fn, x, y);
			};
			img.onerror = function () {
				alert("图片路径有误！");
			};
		} else {
			LSGOImage.setImg.call(this, url, fn, x, y);
		}
		return this;
	};
	// 得到图像数组
	LSGOImage.fn.getInfo = function (canvas) {
		this.imgData = this.ctx.getImageData(this.startX, this.startY, 
																 				 this.width - this.startX, 
																         this.height - this.startY);
		return this;
	};
	// 产生分解图像数组
	LSGOImage.fn.matrixSlice = function (n) {
		n = n || 5;
		this.n = n;
		var arr = this.imgData.data,
			len = arr.length >> 2,
			step = ((len / n) | 0),
			res = {},
			index = 0,
			t;
		for (var i = 0; i < len; i += step) {
			t = i + 4 * step;
			t = t < len ? t : -1;
			res[index++] = Array.prototype.slice.call(arr, i, i + 4 * step);
		}
		return res;
	};
	// 模板函数
	LSGOImage.fn.BaseFun = function (fn, arr) {
		arr = arr || this.imgData.data;
		fn.call(this, arr);
		this.ctx.putImageData(this.imgData, 0, 0);
		return this;
	};
	// 转成灰度图
	LSGOImage.fn.toGray = function (arr) {
		this.BaseFun(function (arr) {
			var r, g, b, len = arr.length;
			for (var i = 0; i < len; i += 4) {
				r = arr[i]; g = arr[i + 1]; b = arr[i + 2];
				arr[i] = arr[i + 1] = arr[i + 2] = (299 * r + 587 * g + 114 * b) / 1000 | 0; 
			}
		}, arr);
	};
	// 反转
	LSGOImage.fn.toInverse = function (arr) {
		this.BaseFun(function (arr) {
			var len = arr.length;
			for (var i = 0; i < len; i += 4) {
				arr[i] = 255 - arr[i];
				arr[i + 1] = 255 - arr[i + 1];
				arr[i + 2] = 255 - arr[i + 2]; 
			}
		}, arr);
	};
	// 马赛克(利用领域内任意一点代替当前领域像素点)
	LSGOImage.fn.toMosaic = function (arr, level) {
		this.BaseFun(function (arr, level) {
			level = level || 10;
			var row = this.width,
				col = this.height,
				len = arr.length,
				r, g, b, pos;
			for (var i = 0; i < row; i += level) {
				for (var j = 0; j < col; j += level) {
					m = Math.floor(Math.random() * level);
					n = Math.floor(Math.random() * level);
					h = j + m > col - 1 ? col - 1 : j + m;
					w = i + n > row - 1 ? row - 1 : i + n;	
					pos = row * h * 4 + w * 4;			
					r = arr[pos];
					g = arr[pos + 1];
					b = arr[pos + 2];
					for (var x = 0; x < level; x++) {
						for (var y = 0; y < level; y++) {
							pos = row * (j + x) * 4 + (i + y) * 4;
							if (pos > len) 
								break;
							arr[pos] = r;
							arr[pos + 1] = g;
							arr[pos + 2] = b;
						}
					}
				}
			}
		}, arr);
	};
	// 调整亮度与对比度
	LSGOImage.fn.ConBrBaseFilter = function (arr, c, b) {
		this.BaseFun(function (arr, c, b) {
			c = 2; b = 0.1;
			if (!c && !b)
				return void 0;
			var len = arr.length, 
				sum = [0, 0, 0],
				total = this.width * this.height;
			// 计算出r,g,b的均值
			for (var i = 0; i < len; i += 4) {
				sum[0] += arr[i];
				sum[1] += arr[i + 1];
				sum[2] += arr[i + 2];
			}	
			sum = sum.map((val) => {
				return val / total | 0;
			});
			for (var i = 0; i < len; i += 4) {
				arr[i] -= sum[0];
				arr[i + 1] -= sum[1];
				arr[i + 2] -= sum[2];

				arr[i] = arr[i] * c | 0;
				arr[i + 1] = arr[i + 1] * c | 0;
				arr[i + 2] = arr[i + 2] * c | 0;

				arr[i] += sum[0] * b | 0;
				arr[i + 1] += sum[1] * b | 0;
				arr[i + 2] += sum[2] * b | 0;
			}
		});
		function clamp (num) {
			return num > 255 ? 255 : (num < 0 ? 0 : num);
		}
	}; 
	global.I = global.LSGOImage = LSGOImage;

})(this);