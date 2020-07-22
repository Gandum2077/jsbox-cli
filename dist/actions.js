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
exports.upload = exports.build = exports.saveHost = exports.watch = exports.sync = exports.showHost = void 0;
const chalk_1 = require("chalk");
const config_1 = require("./config");
const log = require("./log");
const utils_1 = require("./utils");
const fs = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const chokidar = require("chokidar");
const _ = require("lodash");
const got = require("got");
const FormData = require("form-data");
function showHost() {
    const ip = config_1.getHost();
    if (!ip) {
        log.warn('Host IP has not been set up yet');
        return;
    }
    console.log(`${chalk_1.default.greenBright(`Your Host IP:`)} ${ip}`);
}
exports.showHost = showHost;
exports.sync = _.debounce((isdir, path, host, packageName) => __awaiter(void 0, void 0, void 0, function* () {
    log.info('File changed, uploading...');
    const formData = new FormData();
    if (isdir) {
        path = yield utils_1.zipFolder(path, path_1.join(os_1.tmpdir(), `${packageName}.box`));
    }
    formData.append('files[]', fs.createReadStream(path));
    const [, err] = yield utils_1.tryCatch(got.post(`http://${host}/upload`, {
        body: formData,
        timeout: 10000
    }));
    if (err) {
        log.error(err.message);
        return;
    }
    log.info('🎉 Update success!');
}), 100);
function watch(file) {
    const host = config_1.getHost();
    if (!host) {
        log.error('Host IP has not been set up yet');
        process.exit(1);
    }
    if (!fs.existsSync(file)) {
        log.error(`${file} not exists`);
    }
    log.info(`Your current Host IP: ${host}`);
    const isDir = fs.statSync(file).isDirectory();
    let packageName = path_1.basename(file);
    if (isDir) {
        if (!utils_1.isPackageDir(file)) {
            log.error(`${file} is not a package!`);
            process.exit(1);
        }
        packageName = utils_1.getPackageName(file);
        if (!packageName) {
            log.error('Package must have a name!');
            process.exit(1);
        }
    }
    chokidar.watch(file, { ignoreInitial: true })
        .on('all', () => __awaiter(this, void 0, void 0, function* () {
        yield exports.sync(isDir, file, host, packageName);
    }));
}
exports.watch = watch;
function saveHost(host) {
    config_1.setHost(host);
    log.info(`Save your host ${host} to the config`);
}
exports.saveHost = saveHost;
function build(path, ouputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(path)) {
            log.error(`${path} is not exist`);
            process.exit(1);
        }
        if (!fs.statSync(path).isDirectory()) {
            log.error(`${path} is not a directory`);
            process.exit(1);
        }
        if (!utils_1.isPackageDir(path)) {
            log.error(`${path} is not a package directory`);
            process.exit(1);
        }
        const packageName = utils_1.getPackageName(path);
        if (!packageName) {
            log.error('Package must have a name!');
            process.exit(1);
        }
        ouputPath = !ouputPath
            ? ouputPath = path_1.resolve(path, `.output/${packageName}.box`)
            : ouputPath = path_1.resolve(process.cwd(), ouputPath);
        yield utils_1.zipFolder(path, ouputPath);
        log.info(`Build in ${ouputPath}`);
    });
}
exports.build = build;
function upload(path, boxPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!fs.existsSync(path)) {
            log.error(`${path} is not exist`);
            process.exit(1);
        }
        const packageName = utils_1.getPackageName(path);
        if (!boxPath) {
            boxPath = yield utils_1.zipFolder(path, path_1.join(path, ".output", `${packageName}.box`));
        }
        if (!fs.existsSync(boxPath)) {
            log.error(`box file is not exist`);
            process.exit(1);
        }
        const formData = new FormData();
        formData.append('files[]', fs.createReadStream(boxPath));
        const host = config_1.getHost();
        const [, err] = yield utils_1.tryCatch(got.post(`http://${host}/upload`, {
            body: formData,
            timeout: 10000
        }));
        if (err) {
            log.error(err.message);
            return;
        }
    });
}
exports.upload = upload;
