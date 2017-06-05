var gulp           = require('gulp'),
    sass           = require('gulp-sass'),
    autoprefixer   = require('gulp-autoprefixer'),
    browserSync    = require('browser-sync'),
    useref         = require('gulp-useref'),
    gulpIf         = require('gulp-if'),
    uglify         = require('gulp-uglify'),
    cssnano        = require('gulp-cssnano'),
    imagemin       = require('gulp-imagemin'),
    pngquant       = require('imagemin-pngquant'),
    cache          = require('gulp-cache'),
    del            = require('del'),
    runSequence    = require('run-sequence'),
    svgSprite      = require('gulp-svg-sprite'),
    svgSpritesPNG  = require('gulp-svg-sprites'),
    filter         = require('gulp-filter'),
    svg2png        = require('gulp-svg2png');

var files = {
  dist: './dist',
  sass: './app/sass/**/*.+(sass|scss)',
  html: './app/*.html',
  js: './app/js/**/*.js',
  img: './app/images/**/*.+(png|jpg|jpeg|gif|svg)'
};

// browser-sync init
gulp.task('browser-sync', function() {
  browserSync({
    proxy: 'localhost:3000',
    notify: false
  });
});

// compile sass
gulp.task('sass', function() {
  return gulp.src(files.sass)
  .pipe(sass().on('error', sass.logError))
  .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie >= 8'], { cascade: true }))
  .pipe(gulp.dest('./app/css'))
  .pipe(browserSync.reload({ stream: true }));
});

// clear cache
gulp.task('clear-cache', function () {
    return cache.clearAll();
});

// minimazing images
gulp.task('imagemin', function(){
  return gulp.src(files.img)
  .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    })))
  .pipe(gulp.dest(files.dist + '/images'));
});

// copy fonts
gulp.task('fonts', function() {
  return gulp.src('./app/fonts/**/*')
  .pipe(gulp.dest(files.dist + '/fonts'));
});

// clean dist folder
gulp.task('clear-dist', function() {
  return del.sync(files.dist + '/*');
});

// useref: concatination, uglifying js
// minimizing css
gulp.task('useref', function(){
  return gulp.src(files.html)
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest(files.dist));
});

 // create svg sprite in «symbol» mode
gulp.task('svg-sprite', function() {
  var config = {
    shape         : {
      dimension   : {     // Set maximum dimensions 
        maxWidth  : 120,
        maxHeight : 120
      },
      dest        : 'intermediate-svg'  // Keep the intermediate files 
    },
    mode          : {
      view        : {     // Activate the «view» mode 
        bust      : false,
        render    : {
          scss    : true    // Activate Sass output (with default options) 
        }
      },
      symbol      : true    // Activate the «symbol» mode 
    }
  };

  return gulp.src('./app/images/svg/*.svg')
    .pipe(svgSprite(config))
    .pipe(gulp.dest('./app/images/svg_sprite'));
});

// create PNG sprite from SVGs
gulp.task('png-sprite', function () {
  return gulp.src('./app/images/svg_sprite/intermediate-svg/*.svg')
    .pipe(svgSpritesPNG())
    .pipe(gulp.dest('./app/images/png-sprite')) // Write the sprite-sheet + CSS + Preview 
    .pipe(filter('**/*.svg'))  // Filter out everything except the SVG file
    .pipe(svg2png())           // Create a PNG 
    .pipe(gulp.dest('./app/images/png-sprite'));
});

// build
gulp.task('build', function (callback) {
  runSequence(['clear-dist', 'clear-cache'], 
    'sass',
    ['useref', 'imagemin', 'fonts'],
    callback
  );
});

// watcher
gulp.task('watch', function() {
  gulp.watch(files.sass, ['sass']);
  gulp.watch(files.html, browserSync.reload);
  gulp.watch(files.js, browserSync.reload);
});

// default
gulp.task('default', function(callback) {
  runSequence(['browser-sync', 'sass'],
    'watch',
    callback
  );
});