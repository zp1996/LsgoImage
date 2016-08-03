const gulp = require("gulp"),
	less = require("gulp-less"),
	jade = require("gulp-jade"),
	path = require("path"),
	filePath = [
		`${__dirname}/src/less/**/*.less`,
		`${__dirname}/**/*.jade`
	];

gulp.task("less", () => {
	return gulp.src(filePath[0])
		         .pipe(less())
		         .pipe(gulp.dest("./src/css"));
});

gulp.task("jade", () => {
	return gulp.src(filePath[1])
						 .pipe(jade({
						 	 pretty: true
						 })).pipe(gulp.dest("./"));
});

gulp.watch(filePath, ["less", "jade"]);

gulp.task("default", ["less", "jade"]);