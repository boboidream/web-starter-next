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

import rev from 'gulp-rev'
import collector from 'gulp-rev-collector'

const rollup = require('rollup')
const babel = require('rollup-plugin-babel')

import btRollup from 'gulp-better-rollup'

import browserSyncPlugin from 'browser-sync'
const browserSync = browserSyncPlugin.create()

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
      .pipe(swig({
        defaults: { cache: false }
      }))
      .pipe(gulp.dest('./.tmp/'))
})

gulp.task('rev:dev', () => {
  return gulp.src(['.tmp/**/*.html', '.tmp/*.json'])
      .pipe(collector({
        replaceReved: true
      }))
      .pipe(gulp.dest('.tmp/'))
      .pipe(browserSync.stream())
})

gulp.task('less:dev', () => {
  return gulp.src(['./src/**/*.less', '!./src/**/_*.less'])
      .pipe(less({
        plugins: [new Autoprefix()]
      }))
      .pipe(header(opts.header, {pkg: pkg}))
      .pipe(rev())
      .pipe(gulp.dest('./.tmp/'))
      .pipe(rev.manifest('.tmp/manifest.json', {
        merge: true,
        base: '.tmp/'
      }))
      .pipe(gulp.dest('.tmp'))
})

gulp.task('clean', () => {
  let stream = del(['.tmp/**', 'dist/**']).then((paths) => {
    console.log(`Deleted files and folders:\n${paths.join('\n')}`)
  })

  return stream
})

// webpack 打包 废弃
gulp.task('webpack:dev', (cb) => {
  return gulp.src('./src/**/*.js')
      .pipe(gulpWebpack(webpackConf, webpack))
      .pipe(gulp.dest('.tmp/'))
})

gulp.task('copy:images', () => {
  return gulp.src('./src/images/**/*')
      .pipe(gulp.dest('.tmp/images'))
})

gulp.task('copy:favicon', () => {
  return gulp.src('build/favicon.ico', { base: 'build/' })
      .pipe(gulp.dest('.tmp'))
})

// 原生 rollup 写法 废弃
gulp.task('rollup:dev', function () {
  return rollup.rollup({
    entry: './src/scripts/app.js',
    plugins: [
      babel({
        plugins:  ['external-helpers']
      })
    ]
  })
  .then(function(bundle) {
    bundle.write({
      format: 'es',
      dest: './.tmp/library.js',
      sourceMap: true
      })
    })
})

gulp.task('btRollup:dev', () => {
  return gulp.src('./src/scripts/app.js')
      .pipe(btRollup({
        plugins: [
          babel({
            plugins:  ['external-helpers']
          })
        ]
      }, {
        format: 'cjs'
      }))
      .pipe(rev())
      .pipe(gulp.dest('.tmp/scripts/'))
      .pipe(rev.manifest('.tmp/manifest.json', {
        merge: true,
        base: '.tmp/'
      }))
      .pipe(gulp.dest('.tmp/'))

})

gulp.task('server', () => {
  browserSync.init({
    server: { baseDir: ".tmp"}
  })

  gulp.watch('./src/styles/**/*.less', gulp.series('less:dev', 'rev:dev'))
  gulp.watch('./src/scripts/**/*.js', gulp.series('btRollup:dev', 'rev:dev'))
  gulp.watch('./src/**/*.html', gulp.series('tmpl:dev', 'rev:dev'))
  gulp.watch('./src/images/**/*', gulp.series('copy:images'))
})

gulp.task('dev', gulp.series(
    'clean',
    gulp.series(
      gulp.parallel('less:dev', 'btRollup:dev', 'tmpl:dev', 'copy:images', 'copy:favicon'),
      'rev:dev',
      'server'
    )
  )
)
