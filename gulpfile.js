const {src, dest, watch, parallel} = require('gulp');
const scss = require('gulp-sass')(require('sass'));

const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();

function style() {
    return src('dev/scss/style.scss') 
    .pipe(concat('style.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('assets'))
    .pipe(browserSync.stream())
}

function fonts() {
    return src('dev/scss/fonts.scss')
    .pipe(concat('fonts.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('assets'))
    .pipe(browserSync.stream())
}
function typography() {
    return src('dev/scss/typography.scss')
    .pipe(concat('typography.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('assets'))
    .pipe(browserSync.stream()) 
}
function button() {
    return src('dev/scss/button.scss') 
    .pipe(concat('button.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('assets'))
    .pipe(browserSync.stream())
}
function announcementBarNew(){
    return src('dev/scss/announcement-bar-new.scss') 
    .pipe(concat('announcement-bar-new.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('assets'))
    .pipe(browserSync.stream())
}

function header() {
    return src('dev/scss/header.scss') 
    .pipe(concat('header.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('assets'))
    .pipe(browserSync.stream())
}
function hero() {
    return src('dev/scss/hero.scss')
    .pipe(concat('hero.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('assets'))
    .pipe(browserSync.stream()) 
}
function collection() {
    return src('dev/scss/collection.scss')
    .pipe(concat('collection.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('assets'))
    .pipe(browserSync.stream()) 
} 
function properties() {
    return src('dev/scss/properties.scss')
    .pipe(concat('properties.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('assets'))
    .pipe(browserSync.stream()) 
}
function sweep() {
    return src('dev/scss/sweep.scss')
    .pipe(concat('sweep.min.css'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('assets'))
    .pipe(browserSync.stream()) 
}
function scripts() {
    return src('dev/js/main.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('assets'))
    .pipe(browserSync.stream())
}

function watching() {
    watch(['dev/scss/style.scss'], style)
    watch(['dev/scss/typography.scss'], typography)
    watch(['dev/scss/button.scss'], button)
    watch(['dev/scss/announcement-bar-new.scss'], announcementBarNew)
    watch(['dev/scss/header.scss'], header)
    watch(['dev/scss/fonts.scss'], fonts)
    watch(['dev/scss/hero.scss'], hero) 
    watch(['dev/scss/collection.scss'], collection) 
    watch(['dev/scss/properties.scss'], properties) 
    watch(['dev/scss/sweep.scss'], sweep) 
    watch(['app/js/main.js'], scripts)
    watch(['app/*.html']).on('change', browserSync.reload)
}

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
}


exports.styles = style;
exports.fonts = fonts;
exports.typography = typography;
exports.button = button;
exports.announcementBarNew = announcementBarNew;
exports.header = header;
exports.hero = hero; 
exports.collection = collection;
exports.properties = properties;
exports.sweep = sweep;

exports.scripts = scripts;
exports.watching = watching;
exports.browsersync = browsersync;

exports.default = parallel(style, fonts, typography, announcementBarNew, header, button, hero, collection, properties, sweep, scripts, browsersync, watching);