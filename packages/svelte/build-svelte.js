const svelteCompiler = require(`svelte/compiler`);
const glob = require(`glob`);
const path = require(`path`);
const nodeFs = require(`@file-services/node`).nodeFs;

const cjsDistOutPath = path.join(__dirname, `dist`);
const srcPath = path.join(__dirname, `src`);

const sveltePattern = `**/*.svelte`;

copySvelteFiles(srcPath, `.`);

function copySvelteFiles(copyFrom, copyTo) {
    for (const compRelativePath of glob.sync(sveltePattern, { absolute: false, cwd: copyFrom })) {
        const compAbsPath = path.join(copyFrom, compRelativePath);
        const compSource = nodeFs.readFileSync(compAbsPath, `utf8`);

        // const svelteEsm = svelteCompiler.compile(compSource, {
        //     format: `cjs`,
        //     generate: `dom`,
        //     hydratable: true,
        //     css: true,
        // });

        nodeFs.ensureDirectorySync(
            path.join(cjsDistOutPath, copyTo, path.dirname(compRelativePath))
        );

        nodeFs.writeFileSync(path.join(cjsDistOutPath, copyTo, compRelativePath), compSource);
    }
}
