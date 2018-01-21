var gulp = require('gulp');
var sass = require('gulp-sass');
var sass_ruby = require('gulp-ruby-sass');
var notify = require('gulp-notify');
var bower = require('gulp-bower');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var del = require('del');
var runSequence = require('run-sequence');
var bsConfig = require("gulp-bootstrap-configurator");

var config = {
     sassPath: './resources/sass',
     bowerDir: './bower_components' 
};


gulp.task('bower', function() { 
    return bower()
         .pipe(gulp.dest(config.bowerDir)) 
});

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'app'
		},
	})
});

gulp.task('build', function(callback) {
	runSequence('clean:dist', ['sass', 'useref', 'images', 'fonts'], callback)
});

gulp.task('clean:dist', function() {
	return del.sync('dist');
});

gulp.task('css', function() { 
    return gulp.src(config.sassPath + '/style.css')
         .pipe(sass({
             style: 'compressed',
             loadPath: [
                 './resources/sass',
                 config.bowerDir + '/bootstrap-sass-official/assets/stylesheets',
				config.bowerDir + '/fontawesome/scss',
             ]
         }) 
            .on("error", notify.onError(function (error) {
                 return "Error: " + error.message;
             }))) 
         .pipe(gulp.dest('./public/css')); 
});

gulp.task('default', function(callback) {
	runSequence(['sass', 'browserSync', 'watch'], callback)
});

  gulp.task('default_2', ['bower', 'icons','css']);

gulp.task('fonts', function() {
	return gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))
});

gulp.task('icons', function() { 
    return gulp.src(config.bowerDir + '/fontawesome/fonts/**.*') 
        .pipe(gulp.dest('./public/fonts')); 
});

gulp.task('images', function(){
	return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
	.pipe(imagemin({
		interlaced: true
	}))
	.pipe(gulp.dest('dist/images'))
});

gulp.task('make-bootstrap-css', function() {
	return gulp.src("./config.json")
	.pipe(bsConfig.css())
	.pipe(gulp.dest("./assets"));
})

gulp.task('make-bootstrap-js', function() {
	return gulp.src("./config.json")
	.pipe(bsConfig.js())
	.pipe(gulp.dest("./assets"));
})

gulp.task('sass', function() {
	return gulp.src('app/css/**/*.css')
		.pipe(sass())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

gulp.task('useref', function() {
	return gulp.src('app/*.html')
		.pipe(useref())
		.pipe(gulpIf('*.js', uglify()))
		.pipe(gulpIf('*.css', cssnano()))
		.pipe(gulp.dest('dist'))
});

gulp.task('watch', ['browserSync', 'sass'], function() {
	gulp.watch('app/css/**/*.css', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
	gulp.watch(config.sassPath + '/**/*.css', ['css']); 
});