'use strict'

import gulp from 'gulp'
import swig from 'gulp-swig'
import less from 'gulp-less'
import Autoprefix from 'less-plugin-autoprefix'
import header from 'gulp-header'
import del from 'del'

import pkg from './package.json'
import webpack from 'webpack'
import gulpWebpack from 'webpack-stream'
import webpackConf from './build/webpack.config.babel'

const opts = {
  header: `
/**
* <%= pkg.name %> - <%= pkg.description %>
* @version v<%= pkg.version %>
* @link <%= pkg.homepage %>
* @license <%= pkg.license %>
*/
`
}

gulp.task('tmpl:dev', () => {
  return gulp.src(['./src/**/*.html', '!./src/**/_*.html'])
      .pipe(swig())
      .pipe(gulp.dest('./.tmp/'))
})

gulp.task('less:dev', () => {
  return gulp.src(['./src/**/*.less', ])
      .pipe(less({
        plugins: [new Autoprefix()]
      }))
      .pipe(header(opts.header, {pkg: pkg}))
      .pipe(gulp.dest('./.tmp/'))
})

gulp.task('clean', () => {
  let stream = del(['.tmp/**', 'dist/**']).then((paths) => {
    console.log(`Deleted files and folders:\n${paths.join('\n')}`)
  })

  return stream
})


gulp.task('webpack:dev', (cb) => {
  return gulp.src('./src/**/*.js')
      .pipe(gulpWebpack(webpackConf, webpack))
      .pipe(gulp.dest('.tmp/'))
  // webpack(webpackConf, (err, stats) => {
  //   cb()
  // })
})

gulp.task('dev', gulp.series('clean', gulp.parallel('less:dev', 'tmpl:dev', 'webpack:dev')))
