"use strict";

// 获得加权矩阵
function getMatrix(matrix, r, size) {
	var cache = {},
	    sum = 0,
	    singma = 1.5,
	    singmaPow = 2 * Math.pow(singma, 2),
	    singmaPI = Math.PI * singmaPow;
	for (var i = 0; i < size; i++) {
		matrix[i] = [];
		var x = Math.abs(r - i);
		for (var j = 0; j < size; j++) {
			var y = Math.abs(r - j),
			    temp = x + y;
			matrix[i][j] = temp in cache ? cache[temp] : cache[temp] = Math.exp(-(Math.pow(x, 2) + Math.pow(y, 2)) / singmaPow) / singmaPI;
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
function GaosiBulr(arr, width, height) {
	var r = 3,
	    size = 2 * r + 1,
	    matrix = [],
	    row,
	    col,
	    temp;
	// 权重矩阵
	getMatrix(matrix, r, size);
	for (var y = 0; y < height; y++) {
		row = y * width * 4;
		for (var x = 0; x < width; x++) {
			col = row + x * 4;
			temp = calcPixel(matrix, readPixel.call(null, x, y, r, size, arr));
			arr[col] = temp[0];
			arr[col + 1] = temp[1];
			arr[col + 2] = temp[2];
		}
	}
	// 根据权值矩阵计算像素点取值
	function calcPixel(matrix, pixels) {
		var r = 0,
		    g = 0,
		    b = 0;
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
	function readPixel(x, y, r, size, arr) {
		var size = 2 * r + 1,
		    res = [],
		    pos,
		    sX = x - r,
		    sY = y - r,
		    tX,
		    tY;
		for (var i = 0; i < size; i++) {
			res[i] = [];
			for (var j = 0; j < size; j++) {
				res[i][j] = [];
				tX = i + sX;
				tY = j + sY;
				tX = tX >= width ? x : Math.abs(tX);
				tY = tY >= height ? y : Math.abs(tY);
				pos = tX * 4 + tY * 4 * width;
				res[i][j][0] = arr[pos];
				res[i][j][1] = arr[pos + 1];
				res[i][j][2] = arr[pos + 2];
			}
		}
		return res;
	}
}
onmessage = function onmessage(event) {
	console.log(event);
	var data = event.data;
	GaosiBulr(data.arr, data.width, data.height);
	postMessage(data.arr);
};