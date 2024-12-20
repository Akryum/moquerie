# Changelog


## v0.6.2

[compare changes](https://github.com/Akryum/moquerie/compare/v0.6.1...v0.6.2)

### 🩹 Fixes

- OnWindowFocus leak ([89e9088](https://github.com/Akryum/moquerie/commit/89e9088))
- Add presence check for childResourceType #6 ([#6](https://github.com/Akryum/moquerie/issues/6))
- Gen ts arrays, closes #7 ([#7](https://github.com/Akryum/moquerie/issues/7))
- Rename snapshot, closes #3 ([#3](https://github.com/Akryum/moquerie/issues/3))
- Check for snapshot file presence, fix #5 ([#5](https://github.com/Akryum/moquerie/issues/5))

### 🏡 Chore

- Update eslint ([62717f0](https://github.com/Akryum/moquerie/commit/62717f0))
- Fix playground eslint autofix ([2819a54](https://github.com/Akryum/moquerie/commit/2819a54))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))
- Sandeep Ramgolam ([@MrSunshyne](https://github.com/MrSunshyne))

## v0.6.1

[compare changes](https://github.com/Akryum/moquerie/compare/v0.6.0...v0.6.1)

### 🚀 Enhancements

- CreateEmptyBranch ([97c5dfe](https://github.com/Akryum/moquerie/commit/97c5dfe))
- **createTestInstance:** Add MOQUERIE_CWD env variable ([663e349](https://github.com/Akryum/moquerie/commit/663e349))
- Switch to branch in createEmptyBranch ([b1ea872](https://github.com/Akryum/moquerie/commit/b1ea872))
- Test options ([c6f0d67](https://github.com/Akryum/moquerie/commit/c6f0d67))
- AddResolvers ([0bd24db](https://github.com/Akryum/moquerie/commit/0bd24db))
- Export addResolvers ([f57f41b](https://github.com/Akryum/moquerie/commit/f57f41b))

### 🩹 Fixes

- Use default in exports ([784a64d](https://github.com/Akryum/moquerie/commit/784a64d))
- Resolve path using MOQUERIE_CWD ([8412e8d](https://github.com/Akryum/moquerie/commit/8412e8d))

### 📖 Documentation

- Note about useSnapshot ([575f97b](https://github.com/Akryum/moquerie/commit/575f97b))
- Use cases ([cbbe234](https://github.com/Akryum/moquerie/commit/cbbe234))
- Add addResolvers example ([6823bba](https://github.com/Akryum/moquerie/commit/6823bba))

### ✅ Tests

- **lint:** Fix ([0e3eac4](https://github.com/Akryum/moquerie/commit/0e3eac4))
- **lint:** Fix ([de20646](https://github.com/Akryum/moquerie/commit/de20646))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.6.0

[compare changes](https://github.com/Akryum/moquerie/compare/v0.5.5...v0.6.0)

### 🚀 Enhancements

- New snapshot format ([c37079f](https://github.com/Akryum/moquerie/commit/c37079f))
- Auto rest ready for use ([13b3e14](https://github.com/Akryum/moquerie/commit/13b3e14))
- GetSnapshot ([e3c9472](https://github.com/Akryum/moquerie/commit/e3c9472))
- UseSnapshot + createBranchFromSnapshot accepts snapshot id ([1a1e23c](https://github.com/Akryum/moquerie/commit/1a1e23c))
- Return context and port in startServer ([39e1fc3](https://github.com/Akryum/moquerie/commit/39e1fc3))
- Throw if need to migrate snapshot but cant write ([b8899e9](https://github.com/Akryum/moquerie/commit/b8899e9))
- Context caches when not watching ([4701305](https://github.com/Akryum/moquerie/commit/4701305))
- Silent option ([937ac17](https://github.com/Akryum/moquerie/commit/937ac17))
- CreateTestInstance ([c1e2051](https://github.com/Akryum/moquerie/commit/c1e2051))
- Quick rest api with moquerie.rest.ts ([42ffe18](https://github.com/Akryum/moquerie/commit/42ffe18))
- **auto rest:** Simple query filters ([9c9a922](https://github.com/Akryum/moquerie/commit/9c9a922))
- **auto rest:** Pagination ([ef26e06](https://github.com/Akryum/moquerie/commit/ef26e06))
- **auto rest:** Simple sort ([a44ba1b](https://github.com/Akryum/moquerie/commit/a44ba1b))
- **auto rest:** Simple text search ([555fc05](https://github.com/Akryum/moquerie/commit/555fc05))

### 🩹 Fixes

- **snapshot:** Refresh resource view on edit ([427159d](https://github.com/Akryum/moquerie/commit/427159d))
- **snapshot:** Migration wrong item ids ([76325f7](https://github.com/Akryum/moquerie/commit/76325f7))
- Prevent error when child resource type is not found ([a59e6f7](https://github.com/Akryum/moquerie/commit/a59e6f7))
- Inline resource type should use inline form ([675716d](https://github.com/Akryum/moquerie/commit/675716d))
- Close server on destroy ([26accca](https://github.com/Akryum/moquerie/commit/26accca))
- Prevent some directory recate with skipWrites ([7740f25](https://github.com/Akryum/moquerie/commit/7740f25))
- Dont write settings if skipWrites ([dec80b5](https://github.com/Akryum/moquerie/commit/dec80b5))
- Should watch settings even if skipWrites is true ([b08ebcd](https://github.com/Akryum/moquerie/commit/b08ebcd))
- Dont create storage folder if skipWrites ([aec19ca](https://github.com/Akryum/moquerie/commit/aec19ca))
- Branches folder doesnt exist error ([71e159b](https://github.com/Akryum/moquerie/commit/71e159b))

### 📖 Documentation

- Auto rest endpoints ([7b9c2af](https://github.com/Akryum/moquerie/commit/7b9c2af))
- Tests ([15e44ad](https://github.com/Akryum/moquerie/commit/15e44ad))
- UseSnapshot ([6d4fffa](https://github.com/Akryum/moquerie/commit/6d4fffa))

### 🏡 Chore

- Fix root dev script ([9f3e259](https://github.com/Akryum/moquerie/commit/9f3e259))
- Playgrounds folder ([dffbe4c](https://github.com/Akryum/moquerie/commit/dffbe4c))
- Dev:rest ([5ea582e](https://github.com/Akryum/moquerie/commit/5ea582e))

### ✅ Tests

- Added test example ([55c205b](https://github.com/Akryum/moquerie/commit/55c205b))
- Rest test ([052d970](https://github.com/Akryum/moquerie/commit/052d970))
- **lint:** Fix ([4bd8385](https://github.com/Akryum/moquerie/commit/4bd8385))

### 🤖 CI

- Run playground tests ([6c23df1](https://github.com/Akryum/moquerie/commit/6c23df1))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.5.5

[compare changes](https://github.com/Akryum/moquerie/compare/v0.5.4...v0.5.5)

### 🚀 Enhancements

- Customize mockFiles and add .moq to defaults, fix #1 ([#1](https://github.com/Akryum/moquerie/issues/1))

### 📖 Documentation

- No-code graphql queries ([ab37108](https://github.com/Akryum/moquerie/commit/ab37108))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.5.4

[compare changes](https://github.com/Akryum/moquerie/compare/v0.5.3...v0.5.4)

### 🩹 Fixes

- **snapshot:** Refresh branches on create from snapshot ([2eab381](https://github.com/Akryum/moquerie/commit/2eab381))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.5.3

[compare changes](https://github.com/Akryum/moquerie/compare/v0.5.2...v0.5.3)

### 🚀 Enhancements

- Don't create resource folder in snapshot if no resources ([b109d52](https://github.com/Akryum/moquerie/commit/b109d52))

### 🩹 Fixes

- Update raw import ([c3601df](https://github.com/Akryum/moquerie/commit/c3601df))
- **storage:** Don't watch local files + improved queue busy logic ([68bf368](https://github.com/Akryum/moquerie/commit/68bf368))
- Additional guard in load if write queue is busy ([b35585d](https://github.com/Akryum/moquerie/commit/b35585d))

### 📖 Documentation

- Demo link ([e8f608c](https://github.com/Akryum/moquerie/commit/e8f608c))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.5.2

[compare changes](https://github.com/Akryum/moquerie/compare/v0.5.1...v0.5.2)

### 🚀 Enhancements

- References modal: auto select first favorite resource ([0eb4dcd](https://github.com/Akryum/moquerie/commit/0eb4dcd))
- Preview references with multiple types ([b07312d](https://github.com/Akryum/moquerie/commit/b07312d))
- Inspect instance in new tab ([46d6065](https://github.com/Akryum/moquerie/commit/46d6065))
- Filter to 'all' by default instead of active only ([598f0ac](https://github.com/Akryum/moquerie/commit/598f0ac))

### 🩹 Fixes

- ResourceTable not refetching correct resource type if changed ([2852b19](https://github.com/Akryum/moquerie/commit/2852b19))

### 📖 Documentation

- Db operations ([5b3d87a](https://github.com/Akryum/moquerie/commit/5b3d87a))
- Note about refs ([902e1b4](https://github.com/Akryum/moquerie/commit/902e1b4))
- Typo ([dc6bd83](https://github.com/Akryum/moquerie/commit/dc6bd83))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.5.1

[compare changes](https://github.com/Akryum/moquerie/compare/v0.5.0...v0.5.1)

### 🚀 Enhancements

- Branch manager + delete button ([761ae55](https://github.com/Akryum/moquerie/commit/761ae55))
- Rename branches ([1c0ae62](https://github.com/Akryum/moquerie/commit/1c0ae62))

### 📖 Documentation

- Update README.md ([88611f7](https://github.com/Akryum/moquerie/commit/88611f7))
- Continuous releases link ([87f0add](https://github.com/Akryum/moquerie/commit/87f0add))

### 🏡 Chore

- Social preview ([ea0e0e7](https://github.com/Akryum/moquerie/commit/ea0e0e7))

### 🤖 CI

- Add gh workflows ([52c1a13](https://github.com/Akryum/moquerie/commit/52c1a13))
- Specify pnpm version ([aff3ece](https://github.com/Akryum/moquerie/commit/aff3ece))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.5.0

[compare changes](https://github.com/Akryum/moquerie/compare/v0.4.8...v0.5.0)

### 🚀 Enhancements

- Allow js import ([4598bf2](https://github.com/Akryum/moquerie/commit/4598bf2))
- Improve JSON preview ([24d6cfb](https://github.com/Akryum/moquerie/commit/24d6cfb))
- Auto convert JSON strings ([fe2e739](https://github.com/Akryum/moquerie/commit/fe2e739))
- Improve resource form ui ([ee5e517](https://github.com/Akryum/moquerie/commit/ee5e517))
- Loading indicator ([aac817b](https://github.com/Akryum/moquerie/commit/aac817b))
- Scroll to top when expanding ([b75329b](https://github.com/Akryum/moquerie/commit/b75329b))
- SkipWrites option ([f62dec3](https://github.com/Akryum/moquerie/commit/f62dec3))
- StartServer ([98bf4ef](https://github.com/Akryum/moquerie/commit/98bf4ef))
- GetFactoryByName ([1000334](https://github.com/Akryum/moquerie/commit/1000334))

### 🩹 Fixes

- Refresh factories on delete ([6cb89af](https://github.com/Akryum/moquerie/commit/6cb89af))
- **factory:** Handle undefined id in file name ([ec31bdd](https://github.com/Akryum/moquerie/commit/ec31bdd))

### 💅 Refactors

- Renamed field action to resolver ([0c1b6fd](https://github.com/Akryum/moquerie/commit/0c1b6fd))

### 📖 Documentation

- DOCS ([7bef636](https://github.com/Akryum/moquerie/commit/7bef636))
- Add sponsors ([572cfba](https://github.com/Akryum/moquerie/commit/572cfba))

### 🏡 Chore

- Update example ([2654078](https://github.com/Akryum/moquerie/commit/2654078))
- More jsdoc ([52334b5](https://github.com/Akryum/moquerie/commit/52334b5))

### ✅ Tests

- **lint:** Fix ([744d775](https://github.com/Akryum/moquerie/commit/744d775))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.4.8

[compare changes](https://github.com/Akryum/moquerie/compare/v0.4.7...v0.4.8)

### 🩹 Fixes

- **resource:** Compute inline using implementations ([df9dff7](https://github.com/Akryum/moquerie/commit/df9dff7))
- **db:** Always serialize refs to array ([763c2e2](https://github.com/Akryum/moquerie/commit/763c2e2))
- Lint ([5cb2ee7](https://github.com/Akryum/moquerie/commit/5cb2ee7))

### 🏡 Chore

- Update deps ([baf9efc](https://github.com/Akryum/moquerie/commit/baf9efc))
- Add todo ([7827b41](https://github.com/Akryum/moquerie/commit/7827b41))
- Eslint vscode settings ([fd95e2c](https://github.com/Akryum/moquerie/commit/fd95e2c))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.4.7

[compare changes](https://github.com/Akryum/moquerie/compare/v0.4.6...v0.4.7)

### 🚀 Enhancements

- **apiRoute:** CreateError allowing sending error data ([42898d7](https://github.com/Akryum/moquerie/commit/42898d7))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.4.6

[compare changes](https://github.com/Akryum/moquerie/compare/v0.4.5...v0.4.6)

### 🚀 Enhancements

- **apiRoute:** ReadBody util ([ce1ce8b](https://github.com/Akryum/moquerie/commit/ce1ce8b))
- **apiRoute:** Query ([bce00df](https://github.com/Akryum/moquerie/commit/bce00df))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.4.5

[compare changes](https://github.com/Akryum/moquerie/compare/v0.4.4...v0.4.5)

### 🩹 Fixes

- **resource:** Gen union types for implemented types ([952c805](https://github.com/Akryum/moquerie/commit/952c805))

### 🏡 Chore

- Updated generated types in playground ([e2c3fcb](https://github.com/Akryum/moquerie/commit/e2c3fcb))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.4.4

[compare changes](https://github.com/Akryum/moquerie/compare/v0.4.3...v0.4.4)

### 🩹 Fixes

- **resource:** Handle merge leftover types ([8eb5135](https://github.com/Akryum/moquerie/commit/8eb5135))
- Simplify code ([4bfc48c](https://github.com/Akryum/moquerie/commit/4bfc48c))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.4.3

[compare changes](https://github.com/Akryum/moquerie/compare/v0.4.2...v0.4.3)

### 🩹 Fixes

- Type merge ([e37d5b4](https://github.com/Akryum/moquerie/commit/e37d5b4))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.4.2

[compare changes](https://github.com/Akryum/moquerie/compare/v0.4.1...v0.4.2)

### 🚀 Enhancements

- **resource:** Nested form for non-array inline resource ([d17a34f](https://github.com/Akryum/moquerie/commit/d17a34f))
- **resource:** Set all nested fields to value ([6e3e9a7](https://github.com/Akryum/moquerie/commit/6e3e9a7))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.4.1

[compare changes](https://github.com/Akryum/moquerie/compare/v0.4.0...v0.4.1)

### 🩹 Fixes

- Module not found in non-ESM env ([ea5e58f](https://github.com/Akryum/moquerie/commit/ea5e58f))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.4.0

[compare changes](https://github.com/Akryum/moquerie/compare/v0.3.3...v0.4.0)

### 🚀 Enhancements

- **config:** Server cors ([f4971d8](https://github.com/Akryum/moquerie/commit/f4971d8))
- Improve script report header ([0e48cc3](https://github.com/Akryum/moquerie/commit/0e48cc3))
- Merge resource types ([4a7fbf8](https://github.com/Akryum/moquerie/commit/4a7fbf8))
- **config:** ExtendTypes ([8020e58](https://github.com/Akryum/moquerie/commit/8020e58))
- **plugin:** ⚠️  Rename saveFactory to writeCode ([f930596](https://github.com/Akryum/moquerie/commit/f930596))
- Generate types ([3f9b01d](https://github.com/Akryum/moquerie/commit/3f9b01d))
- Typed ctx.db ([ac79bba](https://github.com/Akryum/moquerie/commit/ac79bba))

### 🩹 Fixes

- Don't show error page if json is invalid ([42d5f45](https://github.com/Akryum/moquerie/commit/42d5f45))

#### ⚠️ Breaking Changes

- **plugin:** ⚠️  Rename saveFactory to writeCode ([f930596](https://github.com/Akryum/moquerie/commit/f930596))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.3.3

[compare changes](https://github.com/Akryum/moquerie/compare/v0.3.2...v0.3.3)

### 🩹 Fixes

- **rest:** Better error handling ([0a59a60](https://github.com/Akryum/moquerie/commit/0a59a60))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.3.2

[compare changes](https://github.com/Akryum/moquerie/compare/v0.3.1...v0.3.2)

### 🚀 Enhancements

- BeforeSendResponse plugin hook ([d66f7d3](https://github.com/Akryum/moquerie/commit/d66f7d3))
- **rest:** Extract JSDoc ([ddb36bf](https://github.com/Akryum/moquerie/commit/ddb36bf))
- **rest:** Deprecate types ([1997655](https://github.com/Akryum/moquerie/commit/1997655))
- **rest:** ResolveResourceFromRequest plugin hook ([31fa4cf](https://github.com/Akryum/moquerie/commit/31fa4cf))
- Sort id fields at the top ([4d013d5](https://github.com/Akryum/moquerie/commit/4d013d5))
- Display deprecation warning in field input ([d06c5a8](https://github.com/Akryum/moquerie/commit/d06c5a8))
- Sort deprecated fields to the bottom ([1cad819](https://github.com/Akryum/moquerie/commit/1cad819))
- Handle deprecated types in the ui ([d3ea4fa](https://github.com/Akryum/moquerie/commit/d3ea4fa))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.3.1

[compare changes](https://github.com/Akryum/moquerie/compare/v0.3.0...v0.3.1)

### 🩹 Fixes

- **rest:** Handle errors ([30b3b5d](https://github.com/Akryum/moquerie/commit/30b3b5d))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.3.0

[compare changes](https://github.com/Akryum/moquerie/compare/v0.2.2...v0.3.0)

### 🚀 Enhancements

- **plugin:** TransformSchema ([2e499e7](https://github.com/Akryum/moquerie/commit/2e499e7))
- REST api support ([3c7fb1f](https://github.com/Akryum/moquerie/commit/3c7fb1f))
- **config:** Rest and graphql basePath ([d3892f9](https://github.com/Akryum/moquerie/commit/d3892f9))
- **rest:** Playground sort saved queries by name ([abb05a1](https://github.com/Akryum/moquerie/commit/abb05a1))

### 🩹 Fixes

- Resource ref selector ([00dd750](https://github.com/Akryum/moquerie/commit/00dd750))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.2.2

[compare changes](https://github.com/Akryum/moquerie/compare/v0.2.1...v0.2.2)

### 🚀 Enhancements

- **db:** Access instance metadata in predicate ([da8c362](https://github.com/Akryum/moquerie/commit/da8c362))
- Dbclick ref preview to open ([ee31f5c](https://github.com/Akryum/moquerie/commit/ee31f5c))
- Take snapshot button ([b237aee](https://github.com/Akryum/moquerie/commit/b237aee))
- Scripts ([8ff82d2](https://github.com/Akryum/moquerie/commit/8ff82d2))
- Improved error handling ([b63a1b7](https://github.com/Akryum/moquerie/commit/b63a1b7))
- Plugins to lint factories ([1f650e3](https://github.com/Akryum/moquerie/commit/1f650e3))

### 🩹 Fixes

- **factory:** Don't send ast to UI ([2d58fe5](https://github.com/Akryum/moquerie/commit/2d58fe5))
- **search:** Recent commands ([55fb6c2](https://github.com/Akryum/moquerie/commit/55fb6c2))
- **factory:** Save ([b1e566b](https://github.com/Akryum/moquerie/commit/b1e566b))
- **factory:** List all factories in select ([12448fd](https://github.com/Akryum/moquerie/commit/12448fd))
- **factory:** Create instance doesn't have factoryId anymore ([d475cec](https://github.com/Akryum/moquerie/commit/d475cec))
- **factory:** Select from url ([a08ba50](https://github.com/Akryum/moquerie/commit/a08ba50))

### 🏡 Chore

- Clean console log ([a76f98f](https://github.com/Akryum/moquerie/commit/a76f98f))
- Update nuxt ([7ccde08](https://github.com/Akryum/moquerie/commit/7ccde08))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.2.1

[compare changes](https://github.com/Akryum/moquerie/compare/v0.2.0...v0.2.1)

### 🚀 Enhancements

- Improved resource fields form search ([6db11da](https://github.com/Akryum/moquerie/commit/6db11da))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.2.0

[compare changes](https://github.com/Akryum/moquerie/compare/v0.1.2...v0.2.0)

### 🚀 Enhancements

- Filter fields on tags ([b7630a8](https://github.com/Akryum/moquerie/commit/b7630a8))

### 🩹 Fixes

- Db save not updating resource ([eb5cf06](https://github.com/Akryum/moquerie/commit/eb5cf06))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.1.2

[compare changes](https://github.com/Akryum/moquerie/compare/v0.1.1...v0.1.2)

### 🚀 Enhancements

- **fieldAction:** GenerateId ([3331a99](https://github.com/Akryum/moquerie/commit/3331a99))
- Schema transforms ([6f2fcbd](https://github.com/Akryum/moquerie/commit/6f2fcbd))
- Debug schema page ([f3fe2f1](https://github.com/Akryum/moquerie/commit/f3fe2f1))

### 💅 Refactors

- MockFileWatcher ([e8b3d02](https://github.com/Akryum/moquerie/commit/e8b3d02))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.1.1

[compare changes](https://github.com/Akryum/moquerie/compare/v0.1.0...v0.1.1)

### 🩹 Fixes

- Improve support of cjs workspaces ([bf30fd6](https://github.com/Akryum/moquerie/commit/bf30fd6))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.1.0

[compare changes](https://github.com/Akryum/moquerie/compare/v0.0.7...v0.1.0)

### 🚀 Enhancements

- Use 0 as default number value ([8f198f0](https://github.com/Akryum/moquerie/commit/8f198f0))
- Search fields in forms ([76de312](https://github.com/Akryum/moquerie/commit/76de312))
- Improve column size ([c40acb6](https://github.com/Akryum/moquerie/commit/c40acb6))
- Basic support for virtual types (gql interface/union) ([75a27fa](https://github.com/Akryum/moquerie/commit/75a27fa))
- **gql:** Sort type fields ([5eb5692](https://github.com/Akryum/moquerie/commit/5eb5692))
- History ([183336b](https://github.com/Akryum/moquerie/commit/183336b))
- Improved inline resource code editor UX ([5f537b7](https://github.com/Akryum/moquerie/commit/5f537b7))

### 🩹 Fixes

- **LinkList:** Auto scroll to selected items in ([dc7296f](https://github.com/Akryum/moquerie/commit/dc7296f))
- Singleton resource being deactivated on page load ([38e0864](https://github.com/Akryum/moquerie/commit/38e0864))
- Issue restoring saved route ([2f7f013](https://github.com/Akryum/moquerie/commit/2f7f013))

### 💅 Refactors

- Main instance ([5d37752](https://github.com/Akryum/moquerie/commit/5d37752))

### 🏡 Chore

- Clear commented log ([b3a4614](https://github.com/Akryum/moquerie/commit/b3a4614))
- Remove unused imports ([763e00f](https://github.com/Akryum/moquerie/commit/763e00f))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.0.7

[compare changes](https://github.com/Akryum/moquerie/compare/v0.0.6...v0.0.7)

### 🚀 Enhancements

- Update deps ([d19e68a](https://github.com/Akryum/moquerie/commit/d19e68a))

### 🩹 Fixes

- Include index.d.ts in @moquerie/app ([c67c8a6](https://github.com/Akryum/moquerie/commit/c67c8a6))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.0.6

[compare changes](https://github.com/Akryum/moquerie/compare/v0.0.5...v0.0.6)

### 🩹 Fixes

- Monaco editor filenames not distinct ([383b9dc](https://github.com/Akryum/moquerie/commit/383b9dc))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.0.5

[compare changes](https://github.com/Akryum/moquerie/compare/v0.0.4...v0.0.5)

### 🚀 Enhancements

- Complete factory rework, basic inline resource support ([3458a3d](https://github.com/Akryum/moquerie/commit/3458a3d))
- Basic inline resource type support in resource explorer ([1acee56](https://github.com/Akryum/moquerie/commit/1acee56))
- Improve compat with non-ESM projects ([220caa9](https://github.com/Akryum/moquerie/commit/220caa9))

### 🩹 Fixes

- Prevent scrollbars on body with tooltips ([0651678](https://github.com/Akryum/moquerie/commit/0651678))

### 🏡 Chore

- Remove draft files ([c88c8f9](https://github.com/Akryum/moquerie/commit/c88c8f9))

### ✅ Tests

- **lint:** Fix ([8c6ed08](https://github.com/Akryum/moquerie/commit/8c6ed08))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.0.4

[compare changes](https://github.com/Akryum/moquerie/compare/v0.0.3...v0.0.4)

### 🚀 Enhancements

- Allow RegExp in ignoredResourcesInExplorer ([2fa3693](https://github.com/Akryum/moquerie/commit/2fa3693))
- Favorite resources ([22c5872](https://github.com/Akryum/moquerie/commit/22c5872))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.0.3

[compare changes](https://github.com/Akryum/moquerie/compare/v0.0.2...v0.0.3)

### 🩹 Fixes

- Force version bump ([169554a](https://github.com/Akryum/moquerie/commit/169554a))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.0.2

[compare changes](https://github.com/Akryum/moquerie/compare/v0.0.1...v0.0.2)

### 🩹 Fixes

- **app:** Release files ([22c66d0](https://github.com/Akryum/moquerie/commit/22c66d0))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v0.0.1


### 🚀 Enhancements

- Init ([d2db94b](https://github.com/Akryum/moquerie/commit/d2db94b))
- Basic graphql schema ([df86708](https://github.com/Akryum/moquerie/commit/df86708))
- More pages ([7c0b8c0](https://github.com/Akryum/moquerie/commit/7c0b8c0))
- Command palette ([fa10ddc](https://github.com/Akryum/moquerie/commit/fa10ddc))
- More shortcuts ([90416b2](https://github.com/Akryum/moquerie/commit/90416b2))
- Support light theme + theme toggle ([111bd5b](https://github.com/Akryum/moquerie/commit/111bd5b))
- Basic graphql resource schema ([c4eb99f](https://github.com/Akryum/moquerie/commit/c4eb99f))
- Improved smart navigation ([ef15a56](https://github.com/Akryum/moquerie/commit/ef15a56))
- Wip factories ([57eccc6](https://github.com/Akryum/moquerie/commit/57eccc6))
- **SplitPane:** Reset on shift+click ([39b2842](https://github.com/Akryum/moquerie/commit/39b2842))
- ResourceToolbarInfo ([4fb3605](https://github.com/Akryum/moquerie/commit/4fb3605))
- **factory:** Create factories ([c288d99](https://github.com/Akryum/moquerie/commit/c288d99))
- View/update factory ([eab6351](https://github.com/Akryum/moquerie/commit/eab6351))
- Cancel update ([c387dbf](https://github.com/Akryum/moquerie/commit/c387dbf))
- Update state + more keyboard shortcuts ([0c0de13](https://github.com/Akryum/moquerie/commit/0c0de13))
- Delete factory ([3e7553c](https://github.com/Akryum/moquerie/commit/3e7553c))
- Disable update button on edit if no changes ([f4294ae](https://github.com/Akryum/moquerie/commit/f4294ae))
- Change button order ([5ad6fba](https://github.com/Akryum/moquerie/commit/5ad6fba))
- List tooltips ([6d0c636](https://github.com/Akryum/moquerie/commit/6d0c636))
- Factories in command palette ([4ed02b0](https://github.com/Akryum/moquerie/commit/4ed02b0))
- Create factory command ([c92b666](https://github.com/Akryum/moquerie/commit/c92b666))
- Improved kb shortcuts spacing ([bb6768f](https://github.com/Akryum/moquerie/commit/bb6768f))
- Generate resource instances ([4056aee](https://github.com/Akryum/moquerie/commit/4056aee))
- Basic resource instances listing ([091f42b](https://github.com/Akryum/moquerie/commit/091f42b))
- Basic edit data ([2ada234](https://github.com/Akryum/moquerie/commit/2ada234))
- Delete instances ([288ce2d](https://github.com/Akryum/moquerie/commit/288ce2d))
- Create instance manually ([b245be5](https://github.com/Akryum/moquerie/commit/b245be5))
- Use toggle instead ([728ccc5](https://github.com/Akryum/moquerie/commit/728ccc5))
- Edit resource refs ([b609cfc](https://github.com/Akryum/moquerie/commit/b609cfc))
- Duplicate instance ([b689fb8](https://github.com/Akryum/moquerie/commit/b689fb8))
- Duplicate many instances ([4752a21](https://github.com/Akryum/moquerie/commit/4752a21))
- Change refs summary color if 0 ([5341f0f](https://github.com/Akryum/moquerie/commit/5341f0f))
- Single ref edit modal keyboard up/down ([8ae5754](https://github.com/Akryum/moquerie/commit/8ae5754))
- Bg on inactive instances ([44c45ce](https://github.com/Akryum/moquerie/commit/44c45ce))
- Refs preview on hover ([79be947](https://github.com/Akryum/moquerie/commit/79be947))
- Static refs in factory ([9e5a469](https://github.com/Akryum/moquerie/commit/9e5a469))
- Clear orphan refs ([481f0f7](https://github.com/Akryum/moquerie/commit/481f0f7))
- Two-panes references modal ([1af3916](https://github.com/Akryum/moquerie/commit/1af3916))
- Move up/down refs ([6a3f6e8](https://github.com/Akryum/moquerie/commit/6a3f6e8))
- Center notifications ([5674f2b](https://github.com/Akryum/moquerie/commit/5674f2b))
- Display selected single ref ([4fa9f10](https://github.com/Akryum/moquerie/commit/4fa9f10))
- Edit array values on instance ([ce3e341](https://github.com/Akryum/moquerie/commit/ce3e341))
- Handle array field in instance table ([e9df279](https://github.com/Akryum/moquerie/commit/e9df279))
- Bulk edit ([bb0f42b](https://github.com/Akryum/moquerie/commit/bb0f42b))
- Select all instances ([ed808b6](https://github.com/Akryum/moquerie/commit/ed808b6))
- Enum field ([2729ab9](https://github.com/Akryum/moquerie/commit/2729ab9))
- Basic server ([7f9bf29](https://github.com/Akryum/moquerie/commit/7f9bf29))
- New primary color ([123fc4c](https://github.com/Akryum/moquerie/commit/123fc4c))
- Auto deactivate other instances for singleton ([e1097b5](https://github.com/Akryum/moquerie/commit/e1097b5))
- Toggle active on instance row ([f15e144](https://github.com/Akryum/moquerie/commit/f15e144))
- Basic GraphQL root type support ([e88c0c4](https://github.com/Akryum/moquerie/commit/e88c0c4))
- Small screen improvements ([3c5aee8](https://github.com/Akryum/moquerie/commit/3c5aee8))
- Graphql playground ([88a9848](https://github.com/Akryum/moquerie/commit/88a9848))
- Use ts extension in typescript projects ([29f6673](https://github.com/Akryum/moquerie/commit/29f6673))
- Basic field actions ([dfd66f1](https://github.com/Akryum/moquerie/commit/dfd66f1))
- Field action preview ([ec72170](https://github.com/Akryum/moquerie/commit/ec72170))
- Improved field action preview tooltip ([770c17d](https://github.com/Akryum/moquerie/commit/770c17d))
- **config:** IgnoredResourcesInExplorer ([f95d2c9](https://github.com/Akryum/moquerie/commit/f95d2c9))
- Storage lazyLoading option ([b106325](https://github.com/Akryum/moquerie/commit/b106325))
- Get current user ([66f4378](https://github.com/Akryum/moquerie/commit/66f4378))
- Better graphql pages titles ([712e836](https://github.com/Akryum/moquerie/commit/712e836))
- Branches ([342d07c](https://github.com/Akryum/moquerie/commit/342d07c))
- Header search bar ([0d86eb5](https://github.com/Akryum/moquerie/commit/0d86eb5))
- Apply changes from references input modal ([d2563a8](https://github.com/Akryum/moquerie/commit/d2563a8))
- Upgrade to floating-vue v5 ([c1ce342](https://github.com/Akryum/moquerie/commit/c1ce342))
- Filters in refs hover menu ([3cf7952](https://github.com/Akryum/moquerie/commit/3cf7952))
- Basic field actions explorer ([8b7d42b](https://github.com/Akryum/moquerie/commit/8b7d42b))
- **factory:** Reduce number of fields stored in repository ([ee9cda7](https://github.com/Akryum/moquerie/commit/ee9cda7))
- **factory:** Don't need to store resource name ([df9ca09](https://github.com/Akryum/moquerie/commit/df9ca09))
- Clean saved factory more ([0cee03e](https://github.com/Akryum/moquerie/commit/0cee03e))
- Display factory counts ([9ca2ca9](https://github.com/Akryum/moquerie/commit/9ca2ca9))
- **config:** DefaultFakerLocale ([ae3d8f6](https://github.com/Akryum/moquerie/commit/ae3d8f6))
- Sort factories by last used ([1f79cf3](https://github.com/Akryum/moquerie/commit/1f79cf3))
- Storage API improvements ([1f8b75a](https://github.com/Akryum/moquerie/commit/1f8b75a))
- Remove db from repository path ([ab397d4](https://github.com/Akryum/moquerie/commit/ab397d4))
- **factory:** Don't write manifest in repo ([9965dc5](https://github.com/Akryum/moquerie/commit/9965dc5))
- **factory:** Form description autoresize ([5ca162e](https://github.com/Akryum/moquerie/commit/5ca162e))
- Edit instance comment and tags ([b7bd5b4](https://github.com/Akryum/moquerie/commit/b7bd5b4))
- Command to open field actions page ([3da149f](https://github.com/Akryum/moquerie/commit/3da149f))
- **bulk edit:** Filter fields ([bdc6105](https://github.com/Akryum/moquerie/commit/bdc6105))
- **resource:** Display instance comment and tags ([3d70e44](https://github.com/Akryum/moquerie/commit/3d70e44))
- **resource:** Search in instances ([ced5d6f](https://github.com/Akryum/moquerie/commit/ced5d6f))
- **field action:** Tooltip with function code ([9eb130a](https://github.com/Akryum/moquerie/commit/9eb130a))
- **factory:** Generate from factory button ([78fb94b](https://github.com/Akryum/moquerie/commit/78fb94b))
- **resource:** Use default values for manual create ([8249d43](https://github.com/Akryum/moquerie/commit/8249d43))
- **resource:** Create save manual mode ([ab781a4](https://github.com/Akryum/moquerie/commit/ab781a4))
- Improve bulk edit modal ([c71686f](https://github.com/Akryum/moquerie/commit/c71686f))
- **app:** Upgrade deps ([ee9c535](https://github.com/Akryum/moquerie/commit/ee9c535))
- Ignore Mutation and Subscription in resource explorer by default ([16deee9](https://github.com/Akryum/moquerie/commit/16deee9))
- Pubsub and graphql subscription support ([928145c](https://github.com/Akryum/moquerie/commit/928145c))
- Allow resource ref in subscription payload ([6b1114c](https://github.com/Akryum/moquerie/commit/6b1114c))
- **pubsub:** Filter history ([a510f9a](https://github.com/Akryum/moquerie/commit/a510f9a))
- **pubsub:** Format code ([2c15aa4](https://github.com/Akryum/moquerie/commit/2c15aa4))
- **pubsub:** Insert ref to resource ([4d74c03](https://github.com/Akryum/moquerie/commit/4d74c03))
- **pubsub:** Decoration to change ref ([3773286](https://github.com/Akryum/moquerie/commit/3773286))
- **pubsub:** Meta+g shortcut to insert ref ([52fd793](https://github.com/Akryum/moquerie/commit/52fd793))
- **pubsub:** Hover bg on history item ([da633e1](https://github.com/Akryum/moquerie/commit/da633e1))
- Improved tooltip styles ([c2442c2](https://github.com/Akryum/moquerie/commit/c2442c2))
- **db:** Reference API ([1c4f964](https://github.com/Akryum/moquerie/commit/1c4f964))
- Debug page max width ([aea6d51](https://github.com/Akryum/moquerie/commit/aea6d51))
- Crud snapshots ([c5d2f9c](https://github.com/Akryum/moquerie/commit/c5d2f9c))
- **snapshot:** Import to db ([f8e5b7e](https://github.com/Akryum/moquerie/commit/f8e5b7e))
- **commands:** Create snapshot + branches ([9ffed2a](https://github.com/Akryum/moquerie/commit/9ffed2a))
- **commands:** Recent commands ([2c7b509](https://github.com/Akryum/moquerie/commit/2c7b509))
- Basic cli to start UI ([944b982](https://github.com/Akryum/moquerie/commit/944b982))

### 🔥 Performance

- Cache env utils ([5b15fb4](https://github.com/Akryum/moquerie/commit/5b15fb4))

### 🩹 Fixes

- Light theme error message ([33f0842](https://github.com/Akryum/moquerie/commit/33f0842))
- Update factory list on form submit ([f0ea0b4](https://github.com/Akryum/moquerie/commit/f0ea0b4))
- Select factory search ([c79f82e](https://github.com/Akryum/moquerie/commit/c79f82e))
- VerticalButton icon bg ([2ad66f0](https://github.com/Akryum/moquerie/commit/2ad66f0))
- Orphans being checked on filtered list ([132ab67](https://github.com/Akryum/moquerie/commit/132ab67))
- Update overwrite arrays ([6c1d138](https://github.com/Akryum/moquerie/commit/6c1d138))
- Don't sticky action bar for update instance ([76e37b1](https://github.com/Akryum/moquerie/commit/76e37b1))
- Split pane dragger z-index ([c86103c](https://github.com/Akryum/moquerie/commit/c86103c))
- Bulk edit ([0ace203](https://github.com/Akryum/moquerie/commit/0ace203))
- Faker popper should be on the left to prevent overflow ([966d258](https://github.com/Akryum/moquerie/commit/966d258))
- Monaco editor not shrinking ([2d77649](https://github.com/Akryum/moquerie/commit/2d77649))
- Tooltip z-index ([e94afdd](https://github.com/Akryum/moquerie/commit/e94afdd))
- Wait for field action initial scan ([1606dda](https://github.com/Akryum/moquerie/commit/1606dda))
- Wrong import ([b4b6d98](https://github.com/Akryum/moquerie/commit/b4b6d98))
- **storage:** Clear promise ([a4382b8](https://github.com/Akryum/moquerie/commit/a4382b8))
- Create branch shortcut ([ac16b8e](https://github.com/Akryum/moquerie/commit/ac16b8e))
- Dark theme + branch create shortcut ([1fb82b5](https://github.com/Akryum/moquerie/commit/1fb82b5))
- Dark code background ([59fe27c](https://github.com/Akryum/moquerie/commit/59fe27c))
- Can't create instances manually ([d10f460](https://github.com/Akryum/moquerie/commit/d10f460))
- Dropdown arrow bg ([f7d97e8](https://github.com/Akryum/moquerie/commit/f7d97e8))
- Field actions not updating ([f1943c3](https://github.com/Akryum/moquerie/commit/f1943c3))
- Don't display add item button on resource field input ([eadce7b](https://github.com/Akryum/moquerie/commit/eadce7b))
- Remove confusing message ([40f7bfd](https://github.com/Akryum/moquerie/commit/40f7bfd))
- Don't display ignored types' factories ([12dfe7c](https://github.com/Akryum/moquerie/commit/12dfe7c))
- Current user avatar position ([f4c84cb](https://github.com/Akryum/moquerie/commit/f4c84cb))
- Selected instances count dark theme ([5037659](https://github.com/Akryum/moquerie/commit/5037659))
- Update floating-vue ([462c3a4](https://github.com/Akryum/moquerie/commit/462c3a4))
- Branch selector out animation ([323e897](https://github.com/Akryum/moquerie/commit/323e897))
- Auto start server ([5267b2b](https://github.com/Akryum/moquerie/commit/5267b2b))
- **snapshot:** Move resources when changing location ([ecb4a79](https://github.com/Akryum/moquerie/commit/ecb4a79))
- **snapshot:** Switch to location after save ([0af982c](https://github.com/Akryum/moquerie/commit/0af982c))
- Don't reset from automatically if it was changed ([d8803f4](https://github.com/Akryum/moquerie/commit/d8803f4))

### 💅 Refactors

- FetchFactory ([2b58ca3](https://github.com/Akryum/moquerie/commit/2b58ca3))
- Storage now creates JS files instead of json files ([53dadae](https://github.com/Akryum/moquerie/commit/53dadae))
- Refs should always be arrays ([f46e414](https://github.com/Akryum/moquerie/commit/f46e414))
- Split into multiple packages ([05ddc7e](https://github.com/Akryum/moquerie/commit/05ddc7e))
- Factories in repository use name as id ([2bc7b0e](https://github.com/Akryum/moquerie/commit/2bc7b0e))

### 🏡 Chore

- Prepare ([5044a00](https://github.com/Akryum/moquerie/commit/5044a00))
- Better dev script ([9790f87](https://github.com/Akryum/moquerie/commit/9790f87))
- Cleanup comments ([34ae144](https://github.com/Akryum/moquerie/commit/34ae144))
- Clean import ([e73c7b1](https://github.com/Akryum/moquerie/commit/e73c7b1))
- Add release script ([7e11803](https://github.com/Akryum/moquerie/commit/7e11803))
- Update sheep ([df038a3](https://github.com/Akryum/moquerie/commit/df038a3))

### ❤️ Contributors

- Guillaume Chau ([@Akryum](http://github.com/Akryum))

