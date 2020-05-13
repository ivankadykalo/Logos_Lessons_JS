// =============================
// ------------Шляхи------------
// =============================
let project_folder = "dist";
let source_folder = "#src";

let path = {
  build: {
    html: project_folder + "/",
    css: project_folder + "/css/",
    js: project_folder + "/js/",
    img: project_folder + "/img/",
    fonts: project_folder + "/fonts/",
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: source_folder + "/scss/style.scss",
    js: source_folder + "/js/script.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/scss/**/*.scss",
    js: source_folder + "/js/**/*.js",
    img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + project_folder + "/",
};

// =============================
// ------------Змінні-----------
// =============================
let {
  src,
  dest
} = require("gulp"),
  gulp = require("gulp"),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  scss = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  group_media = require("gulp-group-css-media-queries"),
  clean_css = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  imagemin = require("gulp-imagemin");
// =============================
// ------------Функції----------
// =============================
// live server
function browserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + project_folder + "/",
    },
    port: 3000,
    notify: false,
  });
}

// Обробка та копіювання файлів HTML
function html() {
  return src(path.src.html)
    .pipe(fileinclude()) // Збірка різних файлів в один
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

// Обробка та копіювання файлів CSS
function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded",
      })
    ) // Обробляємо вихідний файл
    .pipe(group_media()) // Групуємо медіа запити
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true,
      })
    ) // Додаємо вендорні префікси
    .pipe(dest(path.build.css)) // Вигружаємо файл
    .pipe(clean_css()) // Зжимаємо файл
    .pipe(
      rename({
        extname: ".min.css",
      })
    ) // Переіменовуємо зжатий файл
    .pipe(dest(path.build.css)) // Вигружаємо зжатий файл
    .pipe(browsersync.stream());
}
// Обробка та копіювання файлів JS
function js() {
  return src(path.src.js)
    .pipe(fileinclude()) // Збірка різних файлів в один
    .pipe(dest(path.build.js))
    .pipe(uglify()) //Зжимання файлу JS
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}
// Обробка та копіювання файлів IMG
function images() {
  return src(path.src.img)
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{
          removeViewBox: false,
        }, ],
        interlaced: true,
        optimizationLevel: 3, //0 to 7
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}
// Обробка та копіювання шрифтів
function fonts() {
  return src(path.src.fonts).pipe(dest(path.build.fonts));
}

// Спостереження за файлами для оновлення в браузері
function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}

// Очищення папки dіst
function clean(params) {
  return del(path.clean);
}

// =============================
// ----------Виконання----------
// =============================
let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), browserSync);
let watch = gulp.parallel(build, watchFiles);

exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;