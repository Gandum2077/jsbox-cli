"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryCatch = exports.mkdirp = exports.zipFolder = exports.getPackageName = exports.isPackageDir = void 0;
const fs_1 = require("fs");
const stream = require("stream");
const util = require("util");
const path_1 = require("path");
const archiver = require("archiver");
const _ = require("lodash");
const pipeline = util.promisify(stream.pipeline);
function isPackageDir(dir) {
    const filesSet = new Set(fs_1.readdirSync(dir));
    for (const f of ['assets', 'scripts', 'strings', 'config.json', 'main.js']) {
        if (!filesSet.has(f)) {
            return false;
        }
    }
    return true;
}
exports.isPackageDir = isPackageDir;
function getPackageName(dir) {
    const config = JSON.parse(fs_1.readFileSync(path_1.join(dir, 'config.json')).toString());
    return _.get(config, 'info.name');
}
exports.getPackageName = getPackageName;
function zipFolder(dir, path) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs_1.existsSync(path_1.dirname(path))) {
            mkdirp(path_1.dirname(path));
        }
        const archive = archiver('zip');
        const s = fs_1.createWriteStream(path);
        const dirs = ["assets", "strings"];
        const files = ["main.js", "config.json", "README.md"];
        for (const d of dirs) {
            archive.directory(path_1.join(dir, d), d);
        }
        archive.append(null, { name: 'scripts/' });
        for (const f of files) {
            archive.file(path_1.join(dir, f), { name: f });
        }
        yield archive.finalize();
        yield pipeline(archive, s);
        return path;
    });
}
exports.zipFolder = zipFolder;
function mkdirp(path) {
    if (fs_1.existsSync(path)) {
        return;
    }
    const parentDir = path_1.dirname(path);
    if (!fs_1.existsSync(parentDir)) {
        mkdirp(parentDir);
    }
    fs_1.mkdirSync(path);
}
exports.mkdirp = mkdirp;
function tryCatch(promise) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ret = yield promise;
            return [ret, null];
        }
        catch (e) {
            return [null, e];
        }
    });
}
exports.tryCatch = tryCatch;
