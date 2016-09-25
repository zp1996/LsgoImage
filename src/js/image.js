/**
  * 图像操作
  * some simple methods in image processing
  * @author zp
  */
(function (g) {

	// 规范像素值
	function clamp (num) {
		return num > 255 ? 255 : (num < 0 ? 0 : num);
	}
	// 获得加权矩阵
	function getMatrix (matrix, r, size) {
		var cache = {}, sum = 0,
			singma = 1.5,
			singmaPow = 2 * Math.pow(singma, 2),
			singmaPI = Math.PI * singmaPow;
		for (var i = 0; i < size; i++) {
			matrix[i] = [];
			var x = Math.abs(r - i);
			for (var j = 0; j < size; j++) {
				var y = Math.abs(r - j),
					temp = x + y;
				matrix[i][j] = temp in cache ? cache[temp] : 
											 (cache[temp] = Math.exp(-(Math.pow(x, 2) + Math.pow(y, 2)) / singmaPow) / singmaPI); 
				sum += matrix[i][j];
			}
		}
		// 使权重之和为1
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				matrix[i][j] /= sum;
			}
		}
	}
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
		this.oldData = [];
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
		this.oldData = [];
		for (var i = 0; i < this.height; i++) {
			var start = i * this.width * 4;
			this.oldData[i] = Array.prototype.slice.call(this.imgData.data, start, start + this.width * 4);
		}
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
	// 变为原图
	LSGOImage.fn.toOld = function () {
		this.BaseFun(function (arr) {	
			var len = arr.length,
				width = this.width * 4, row;
			for (var i = 0; i < len; i += 4) {
				row = i / width | 0;
				arr[i] = this.oldData[row][i % width];
				arr[i + 1] = this.oldData[row][(i + 1) % width];
				arr[i + 2] = this.oldData[row][(i + 2) % width]; 
			}
		});
	};
	// 马赛克(利用领域内任意一点代替当前领域像素点)
	LSGOImage.fn.toMosaic = function (arr, level) {
		this.BaseFun(function (arr) {
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
		if (!Array.isArray(arr)) {
			b = c;
			c = arr;
		}
		this.BaseFun(function (arr) {
			if (!c && !b)
				return void 0;
			var len = arr.length, 
				sum = [0, 0, 0],
				total = this.width * this.height,
				width = this.width * 4, row;
			// 计算出r,g,b的均值
			for (var i = 0; i < len; i += 4) {
				row = i / width | 0;

				arr[i] = this.oldData[row][i % width];
				arr[i + 1] = this.oldData[row][(i + 1) % width];
				arr[i + 2] = this.oldData[row][(i + 2) % width];

				sum[0] += arr[i];
				sum[1] += arr[i + 1];
				sum[2] += arr[i + 2];
			}	
			sum = sum.map(function (val) {
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
	}; 
	// 镜像
	LSGOImage.fn.toMirror = function (arr) {
		this.BaseFun(function (arr) {
			var len = arr.length,
				width = this.width,
				mid = width / 2 | 0,
				height = this.height, 
				r, g, b, col, row, op;
			for (var y = 0; y < height; y++) {
				row = y * width * 4;
				for (var x = 0; x < mid; x++) {
					col = row + x * 4;
					op = row + (width - 1 - x) * 4;

					r = arr[col];
					g = arr[col + 1];
					b = arr[col + 2];

					arr[col] = arr[op];
					arr[col + 1] = arr[op + 1];
					arr[col + 2] = arr[op + 2];

					arr[op] = r;
					arr[op + 1] = g;
					arr[op + 2] = b;
				}
			}
		}, arr);
	};
	// 高斯模糊
	LSGOImage.fn.GaosiBulr = function (arr) {
		this.BaseFun(function (arr) {
			var r = 3, 
				size = 2 * r + 1,
				matrix = [],
				width = this.width,
				height = this.height,
				row, col, temp;
			// 权重矩阵
			getMatrix(matrix, r, size);
			for (var y = 0; y < height; y++) {
				row = y * width * 4;
				for (var x = 0; x < width; x++) {
					col = row + x * 4;
					temp = calcPixel(matrix, readPixel.call(this, x, y, r, size, arr));
					arr[col] = temp[0];
					arr[col + 1] = temp[1];
					arr[col + 2] = temp[2];
				}
			}
			// 根据权值矩阵计算像素点取值
			function calcPixel (matrix, pixels) {
				var r = 0, g = 0, b = 0;
				for (var i = 0, len = matrix.length; i < len; i++) {
					for (var j = 0; j < len; j++) {
						r += matrix[i][j] * pixels[i][j][0];
						g += matrix[i][j] * pixels[i][j][1];
						b += matrix[i][j] * pixels[i][j][2];
					}
				}
				return [r | 0, g | 0, b | 0];
			}
			// 取边界点
			function readPixel (x, y, r, size, arr) {
				arr = arr || this.imgData.data;
				var size = 2 * r + 1,
					res = [], pos, 
					sX = x - r, 
					sY = y - r, 
					tX, tY;
				for (var i = 0; i < size; i++) {
					res[i] = [];
					for (var j = 0; j < size; j++) {
						res[i][j] = [];
						tX = i + sX;
						tY = j + sY;
						tX = tX >= this.width ? x : Math.abs(tX);
						tY = tY >= this.height ? y : Math.abs(tY);
						pos = tX * 4 + tY * 4 * this.width;
						res[i][j][0] = arr[pos];
						res[i][j][1] = arr[pos + 1];
						res[i][j][2] = arr[pos + 2];
					}
				}
				return res;
			}
		}, arr);
	};
	// 素描效果
	LSGOImage.fn.toSketch = function (arr) {
		this.BaseFun(function (arr) {
			// 去色
			this.toGray(arr);
			// 对去色图层取反色
			var b = Array.prototype.slice.call(arr);
			this.toInverse(b);
			this.GaosiBulr(b);
			// 颜色渐淡
			for (var i = 0; i < arr.length; i += 4) {
				arr[i] = calc(arr[i], b[i]);
				arr[i + 1] = calc(arr[i + 1], b[i + 1]);
				arr[i + 2] = calc(arr[i + 2], b[i + 2]);
			}
			function calc (a, b) {
				var temp = a + a * b / (256 - b);
				temp = temp | 0;
				return Math.min(255, temp);
			} 
		});
	};
	// 基于Roberts边缘提取	
	LSGOImage.fn.BaseRoberts = function (arr, fn) {
		var width = this.width,
			height = this.height,
			index, indexr, indexd, indexrd, newX, newY;
		for (var y = 0; y < height; y++) {
			var xgr, xgg, xgb, 
				ygr, ygb, ygg,
				mr, mb, mg;
			for (var x = 0; x < width; x++) {
				index = (y * width + x) * 4;
				// 取对角线位置
				newX = x + 1;
				newY = y + 1;
				newX = newX < width  ? newX : 0;
				newY = newY < height ? newY : 0;
				indexr = (y * width + newX) * 4;
				indexd = (newY * width + x) * 4;
				indexrd = (newY * width + newX) * 4;
				// x方向梯度
				xgr = arr[index] - arr[indexrd];
				xgg = arr[index + 1] - arr[indexrd + 1];
				xgb = arr[index + 2] - arr[indexrd + 2];
				// y方向梯度
				ygr = arr[indexr] - arr[indexd];
				ygg = arr[indexr + 1] - arr[indexd + 1]; 
				ygb = arr[indexr + 2] - arr[indexd + 2];  
				// 计算振幅
				mr = Math.sqrt(xgr * xgr + ygr * ygr);
				mg = Math.sqrt(xgg * xgg + ygg * ygg);
				mb = Math.sqrt(xgb * xgb + ygb * ygb);

				arr[index] = clamp(fn(mr, arr[index]));
				arr[index + 1] = clamp(fn(mg, arr[index + 1]));
				arr[index + 2] = clamp(fn(mb, arr[index + 2]));
			}	
		}
	};
	LSGOImage.fn.Roberts = function (arr) {
		this.BaseFun(function (arr) {
			this.BaseRoberts(arr, function (a, b) {
				return a;
			});
		}, arr);
	};
	// 基于Roberts算子锐化
	LSGOImage.fn.RobertsSharp = function (arr) {
		this.BaseFun(function (arr) {
			this.BaseRoberts(arr, function (a, b) {
				return a + b;
			});
		}, arr);
	};
	// 怀旧效果
	LSGOImage.fn.toNostalgia = function (arr) {
		function noise () {
			return Math.random() * 0.5 + 0.5;
		}
		function colorBlend (scale, dest, src) {
			return (scale * dest + (1 - scale) * src) | 0;
		}
		this.BaseFun(function (arr) {
			for (var i = 0, len = arr.length; i < len; i += 4) {
				var tr = arr[i],
					tg = arr[i + 1],
					tb = arr[i + 2];
				arr[i] = colorBlend(noise(), (tr * 0.393) + (tg * 0.769) + (tb * 0.189), tr);
				arr[i + 1] = colorBlend(noise(), (tr * 0.349) + (tg * 0.686) + (tb * 0.168), tg);
				arr[i + 2] = colorBlend(noise(), (tr * 0.272) + (tg * 0.534) + (tb * 0.131), tb);
			}
		}, arr);
	};
	g.I = g.LSGOImage = LSGOImage;
})(this);