const svelteCompiler = require(`svelte/compiler`);
const glob = require(`glob`);
const path = require(`path`);
const nodeFs = require(`@file-services/node`).nodeFs;

const cjsOutPath = path.join(__dirname, `./cjs`);
const esmOutPath = path.join(__dirname, `./esm`);
const srcPath = path.join(__dirname, `./src`);

const sveltePattern = `**/*.svelte`;

for (const compRelativePath of glob.sync(sveltePattern, { absolute: false, cwd: srcPath })) {
    const compAbsPath = path.join(srcPath, compRelativePath);
    const compSource = nodeFs.readFileSync(compAbsPath, `utf8`);

    const svelteEsm = svelteCompiler.compile(compSource, {
        format: `esm`,
        generate: `dom`,
        hydratable: true,
        css: true,
    });

    nodeFs.ensureDirectorySync(path.join(esmOutPath, path.dirname(compRelativePath)));
    nodeFs.ensureDirectorySync(path.join(cjsOutPath, path.dirname(compRelativePath)));

    nodeFs.writeFileSync(path.join(esmOutPath, compRelativePath + `.js`), svelteEsm.js.code);
    nodeFs.writeFileSync(path.join(esmOutPath, compRelativePath), compSource);
    nodeFs.writeFileSync(path.join(cjsOutPath, compRelativePath), compSource);
}
