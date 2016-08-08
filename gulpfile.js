const gulp = require("gulp"),
	less = require("gulp-less"),
	jade = require("gulp-jade"),
	jshint = require("gulp-jshint"),
	uglify = require("gulp-uglify"),
	filePath = [
		`${__dirname}/src/less/**/*.less`,
		`${__dirname}/src/js/**/*.js`,
		`${__dirname}/**/*.jade`
	];

gulp.task("less", () => {
	gulp.src(filePath[0])
      .pipe(less())
      .pipe(gulp.dest("./build/css"));
});

gulp.task("js", () => {
	gulp.src(filePath[1])
			.pipe(jshint())
			// .pipe(uglify())
			.pipe(gulp.dest("./build/js"));
});

gulp.task("jade", () => {
	gulp.src(filePath[2])
			.pipe(jade({
				pretty: true
			}))
			.pipe(gulp.dest("./"));
});

gulp.watch(filePath, ["less", "js", "jade"]);

gulp.task("default", ["less", "js", "jade"]);