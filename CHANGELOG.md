# Changelog

## [0.2.0](https://github.com/jens-johnson/jj-dev/compare/jj-dev-v0.1.0...jj-dev-v0.2.0) (2026-05-25)


### ✨ Features

* **about:** redesign about page with hero carousel, bento grid, 3D tilt cards, and live metrics ([#18](https://github.com/jens-johnson/jj-dev/issues/18)) ([2abce73](https://github.com/jens-johnson/jj-dev/commit/2abce7329206ae4c44cd781057fe457d8dd4d01b))
* **about:** swap github heatmap for weekly sparkline + fix metrics data bugs ([7aad3b4](https://github.com/jens-johnson/jj-dev/commit/7aad3b470bab7a10bb9c12760cb611f5a26204c4))
* **about:** swap github heatmap for weekly sparkline + fix metrics data bugs ([1f2adb9](https://github.com/jens-johnson/jj-dev/commit/1f2adb9448ae949cd764c5ebb5fe3d37349f6c6b))
* **about:** swap github heatmap for weekly sparkline + fix metrics data bugs ([b9c0379](https://github.com/jens-johnson/jj-dev/commit/b9c0379baca60ffbad81ecd9666ca1be5616d281))
* **about:** swap github heatmap for weekly sparkline + fix metrics data bugs ([7051b50](https://github.com/jens-johnson/jj-dev/commit/7051b505f5701f58aeaa6e8108d0df78a0d04735))
* **about:** swap github heatmap for weekly sparkline + fix metrics data bugs ([f395fc2](https://github.com/jens-johnson/jj-dev/commit/f395fc23ecde7403228aca71037a587c6946e2ae))
* **brand:** add svg favicon and apple touch icon ([#16](https://github.com/jens-johnson/jj-dev/issues/16)) ([0331952](https://github.com/jens-johnson/jj-dev/commit/0331952925a139df285cf67b2927c461abce908d))
* **ci:** add github actions workflows for ci and vercel deploy ([7388cd6](https://github.com/jens-johnson/jj-dev/commit/7388cd6faa7320e39897869608b74721f6b84930))
* **config:** initial project scaffold ([4d080ec](https://github.com/jens-johnson/jj-dev/commit/4d080ec5df3ad0f42ea3381549e02ab0e20cd3cc))
* **content:** add collection schemas and seed content for blog, projects, lab, resume ([9e68d92](https://github.com/jens-johnson/jj-dev/commit/9e68d921d80494485b365fe3273b9e6d5d2bc68a))
* **home:** go-live polish — animation, copy, parallax fix, placeholders ([#21](https://github.com/jens-johnson/jj-dev/issues/21)) ([4251ab2](https://github.com/jens-johnson/jj-dev/commit/4251ab2d161d49b7226959142f84758b8a59d258))
* **layout:** build out app nav with logo mark and mobile menu ([#17](https://github.com/jens-johnson/jj-dev/issues/17)) ([eee69f6](https://github.com/jens-johnson/jj-dev/commit/eee69f606e525ecc320dc8f2b2845668e8dde1f9))
* **pages:** build homepage with hero, featured projects, and recent writing ([681157c](https://github.com/jens-johnson/jj-dev/commit/681157cb8a61bd3940d806f0255569fcc0f8c092))


### 🐛 Bug Fixes

* **about:** swap NuxtImg for plain img in hero carousel ([#20](https://github.com/jens-johnson/jj-dev/issues/20)) ([ce27bc8](https://github.com/jens-johnson/jj-dev/commit/ce27bc849937cbf851bcfe54c6a0aeabcd9fd00e))
* **ci:** don't open promotion PR for sync-only merge commits ([7aad3b4](https://github.com/jens-johnson/jj-dev/commit/7aad3b470bab7a10bb9c12760cb611f5a26204c4))
* **ci:** don't open promotion PR for sync-only merge commits ([1f2adb9](https://github.com/jens-johnson/jj-dev/commit/1f2adb9448ae949cd764c5ebb5fe3d37349f6c6b))
* **ci:** don't open promotion PR for sync-only merge commits ([b9c0379](https://github.com/jens-johnson/jj-dev/commit/b9c0379baca60ffbad81ecd9666ca1be5616d281))
* **ci:** use nitro vercel preset for build output api compatibility ([ed6b7c2](https://github.com/jens-johnson/jj-dev/commit/ed6b7c2d7a0ca9899f8a9f75392243eaa4382251))
* **deps:** add tailwindcss v4 as direct devdependency for ci resolution ([9d2bd2c](https://github.com/jens-johnson/jj-dev/commit/9d2bd2c562694df3a1ac25983771b62526db5293))
* **eslint:** resolve vue plugin scope and typescript-eslint config ([6e06d7f](https://github.com/jens-johnson/jj-dev/commit/6e06d7f443a8488fe8294234a2853dd22a73496a))
* **styles:** migrate to tailwind v4 css-first config with [@theme](https://github.com/theme) block ([4cc7a3e](https://github.com/jens-johnson/jj-dev/commit/4cc7a3e483aa53ef1f5f8ea6e8b0665b3c8a1fe1))
* **types:** resolve strict null errors in theme composable and projects component ([fda8f68](https://github.com/jens-johnson/jj-dev/commit/fda8f680efb5e04d7ea7074458d53dec0887c23d))


### ⚡ Performance

* **about:** compress carousel images, remove unused 24mb portrait ([#19](https://github.com/jens-johnson/jj-dev/issues/19)) ([60caa5b](https://github.com/jens-johnson/jj-dev/commit/60caa5babd73d00f1e10ca3121bc2c403c9a10aa))


### 💅 Styles

* **design:** finalize design token system in main.css ([#13](https://github.com/jens-johnson/jj-dev/issues/13)) ([9d7c055](https://github.com/jens-johnson/jj-dev/commit/9d7c055359632b2cc0593cb8eba9f81c9d48f641))


### 📝 Docs

* **docs:** apply unified JJ logo block header to all project files ([#2](https://github.com/jens-johnson/jj-dev/issues/2)) ([e7919ec](https://github.com/jens-johnson/jj-dev/commit/e7919ec3f48461530525516ccd12e3924123f234))


### 👷 CI

* **ci:** add release-please for automated changelog and version bumps ([#11](https://github.com/jens-johnson/jj-dev/issues/11)) ([882bcf3](https://github.com/jens-johnson/jj-dev/commit/882bcf305cdb692ef27a5766022401a52ea90dca))
* **ci:** skip vercel deploy for dependabot pull requests ([#10](https://github.com/jens-johnson/jj-dev/issues/10)) ([0921347](https://github.com/jens-johnson/jj-dev/commit/0921347a7b047fef26823121781aa37534a663f5))
* **ci:** use pat for release-please to trigger ci on release pull requests ([#15](https://github.com/jens-johnson/jj-dev/issues/15)) ([6644968](https://github.com/jens-johnson/jj-dev/commit/6644968a792e01e7e17f1cafaec2d12d67fe7791))
* **deps:** bump actions/checkout from 4 to 6 ([#33](https://github.com/jens-johnson/jj-dev/issues/33)) ([47a6a5d](https://github.com/jens-johnson/jj-dev/commit/47a6a5d2bece2ab3b02a3fd311e4947e325d7a7e))
* **deps:** bump actions/checkout from 4 to 6 ([#4](https://github.com/jens-johnson/jj-dev/issues/4)) ([5fe62ed](https://github.com/jens-johnson/jj-dev/commit/5fe62ed0a6a56218a94a7ccc761467ce7c81b1b2))
* **deps:** bump actions/setup-node from 4 to 6 ([#3](https://github.com/jens-johnson/jj-dev/issues/3)) ([a1e4fb8](https://github.com/jens-johnson/jj-dev/commit/a1e4fb8f0bed0c6f0c48fc0801026925ef86d1b1))
* **deps:** bump googleapis/release-please-action from 4 to 5 ([#32](https://github.com/jens-johnson/jj-dev/issues/32)) ([3588771](https://github.com/jens-johnson/jj-dev/commit/35887713d68fa609f6291379660a8bdf8a8f74fb))


### 🔧 Chores

* **ci:** reconfigure updates for staging environments ([#25](https://github.com/jens-johnson/jj-dev/issues/25)) ([f395fc2](https://github.com/jens-johnson/jj-dev/commit/f395fc23ecde7403228aca71037a587c6946e2ae))
* **deps-dev:** bump @commitlint/cli from 19.8.1 to 21.0.1 ([#9](https://github.com/jens-johnson/jj-dev/issues/9)) ([661e9f3](https://github.com/jens-johnson/jj-dev/commit/661e9f3d17fd7e95cd74120279c70b9500aa30fe))
* **deps-dev:** bump @types/node from 24.12.4 to 25.9.1 ([#8](https://github.com/jens-johnson/jj-dev/issues/8)) ([283ca79](https://github.com/jens-johnson/jj-dev/commit/283ca79839dd1c3ea25cd64dfe96aa0a45da9a01))
* **deps-dev:** bump eslint-plugin-jsdoc from 62.9.0 to 63.0.0 ([#35](https://github.com/jens-johnson/jj-dev/issues/35)) ([e113dfc](https://github.com/jens-johnson/jj-dev/commit/e113dfc51108fd0418c0e70366a3f4dceac5830c))
* **deps-dev:** bump eslint-plugin-simple-import-sort ([694afb1](https://github.com/jens-johnson/jj-dev/commit/694afb1e57fb25307fa16956e2cf4f7a3643d283))
* **deps-dev:** bump eslint-plugin-simple-import-sort from 12.1.1 to 13.0.0 ([#6](https://github.com/jens-johnson/jj-dev/issues/6)) ([694afb1](https://github.com/jens-johnson/jj-dev/commit/694afb1e57fb25307fa16956e2cf4f7a3643d283))
* **deps-dev:** bump the minor-and-patch group with 4 updates ([#34](https://github.com/jens-johnson/jj-dev/issues/34)) ([6a82589](https://github.com/jens-johnson/jj-dev/commit/6a82589a706e7cb86312b0447e4cf4067f3c8cc8))
* **deps:** bump the minor-and-patch group with 3 updates ([#5](https://github.com/jens-johnson/jj-dev/issues/5)) ([28abadc](https://github.com/jens-johnson/jj-dev/commit/28abadcfdcf4c88a0faee8b3493b335cf510d0ca))
* **nav:** remove work page — covered by projects and lab ([b796902](https://github.com/jens-johnson/jj-dev/commit/b79690229ca96b80036f93660250141c2d72687b))
* **nav:** remove work page ([#22](https://github.com/jens-johnson/jj-dev/issues/22)) ([b796902](https://github.com/jens-johnson/jj-dev/commit/b79690229ca96b80036f93660250141c2d72687b))
