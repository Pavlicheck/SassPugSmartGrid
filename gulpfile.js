const gulp = require('gulp')
	  bs   = require('browser-sync').create(),
	  grid = require('smart-grid'),
	  sass = require('gulp-sass'),
	  pug  = require('gulp-pug'),

	  babel    = require('gulp-babel'),
	  concat   = require('gulp-concat'),
	  prefix   = require('gulp-autoprefixer'),
	  gcmq     = require('gulp-group-css-media-queries'),
	  imgmin   = require('gulp-imagemin'),
	  cache    = require('gulp-cache'),
	  rimraf   = require('rimraf'),
	  cleanCSS = require('gulp-clean-css'),
	  uglify   = require('gulp-uglify');
//Main variables
const dir = {
		app: './app/',
		blocks: './blocks/',
		dist: './dist/'
}

const gridSettings = {
    outputStyle: 'sass', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: '30px', /* gutter width px || % */
    mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1200px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            width: '1100px', /* -> @media (max-width: 1100px) */
        },
        md: {
            width: '960px'
        },
        sm: {
            width: '780px',
            fields: '15px' /* set fields only if you want to change container.fields */
        },
        xs: {
            width: '560px'
        }
        /* 
        We can create any quantity of break points.
 
        some_name: {
            width: 'Npx',
            fields: 'N(px|%|rem)',
            offset: 'N(px|%|rem)'
        }
        */
    }
};

//server 
gulp.task('bs', () => {
	bs.init({
		server: {
			baseDir: dir.app
		},
		notify: false,
		reloadDelay: 500
	});
});

//Grid creator
gulp.task('grid', () => {
	grid(dir.blocks + '_base/', gridSettings);
})

// Watch
gulp.task('watch', ['bs'], () => {
	gulp.watch(dir.blocks + '**/*.sass', ['css']);
	gulp.watch(dir.blocks + '**/*.pug', ['html']);
	gulp.watch(dir.blocks + '**/*.js', ['js']);
	gulp.watch(dir.app+'**/*').on('change', bs.reload);
});

//css 
gulp.task('css', () => {
	gulp.src(dir.blocks + 'style.sass')
		.pipe(sass())
		.pipe(prefix({
			browsers: ['last 10 versions'],
			cascade: true
		}))
		.pipe(gcmq())
		.pipe(gulp.dest(dir.app + 'css'))
});

//HTML
gulp.task('html', () => {
	gulp.src(dir.blocks + '*.pug')
		.pipe(pug())
		.pipe(gulp.dest(dir.app))
})

//JavaScript
gulp.task('js', () => {
	gulp.src(dir.blocks + '**/*.js')
		.pipe(concat('main.js'))
		.pipe(babel({
            presets: ['env']
        }))
		.pipe(gulp.dest(dir.app + 'js/'))

})

//images 
gulp.task('img', () => {
	gulp.src(dir.blocks + 'img/**/*.+(png|jpg|jpeg|gif)')
		.pipe(cache(imgmin()))
		.pipe(gulp.dest(dir.app + 'img/')); 
});

//fonts
gulp.task('fonts', () => {
	gulp.src(dir.blocks + "fonts/**/*")
		.pipe(gulp.dest(dir.app + "fonts/"))
})

//clean dist
gulp.task('clean', (cb) => {
	rimraf(dir.dist, cb);
});


//test
gulp.task('test', () => {
	console.log('works');
})



//Main tasks

gulp.task('default', ['html', 'css', 'img', 'fonts', 'watch'], () => { console.log('Work begin') });

gulp.task('build', ['html', 'css', 'img', 'fonts'], () => {
	gulp.src(dir.app + '*.html')
		.pipe(gulp.dest(dir.dist));

	gulp.src(dir.app + 'css/*.css')
		.pipe(cleanCSS({level: 2}))
		.pipe(gulp.dest(dir.dist + 'css/'));

	gulp.src(dir.app + 'js/*.js')
		.pipe(uglify())
		.pipe(gulp.dest(dir.dist + 'js/'));

	gulp.src(dir.app + 'fonts/**/*')
		.pipe(gulp.dest(dir.dist + 'fonts/'));

	gulp.src(dir.app + 'img/**/*')
		.pipe(gulp.dest(dir.dist + 'img/'));
})