class WebSeeSourceMap {
    /**
     * 初始化
     * @param {String} options.token 项目唯一token 必填
     * @param {String} options.dsn sourceMap上传地址 必填
     * @param {String} options.appVersion wen应用版本(package.json'中的version) 必填
     * @param {String} options.productionSourceMap 生产环境是否保留sourceMap 必填 作用同webpack中的productionSourceMap，想要上传sourcemap到WebSeeUpLoadMap,webpack的productionSourceMap必须为true，WebSeeUpLoadMap中的productionSourceMap为true时，dist目录保留map文件，反之不保留
     * @param {Array}  options.uploadScript 需要上传sourceMap的命令 可选 默认值为['vue-cli-service build']，其他命令需要上传sourceMap的话，加入数组即可
     * @param {String} options.name 项目名称 可选
    */
    constructor(options) {
        this.name = options.name;
        this.token = options.token;
        this.dsn = options.dsn;
        this.appVersion = options.appVersion;
        this.productionSourceMap = options.productionSourceMap;
        this.uploadScript = ['vue-cli-service build'].concat(options.uploadScript || []);
        this.npm_lifecycle_script = process.env.npm_lifecycle_script;

        // 检查必填参数
        this.checkParams = (name) => {
            if (!this[name]) {
                throw(`插件：web-see-upload-map参数${name}必填！`);
            }
        }
        // 获取最新版本
        this.checkVersionExists = () => {
            return new Promise((resolve, reject) => {
                fetch(`${this.dsn}/api/checkVersionExists?apikey=${this.token}&version=${this.appVersion}`)
                .then((response) => response.json())
                .then((res) => {
                    resolve(res);
                });
            });
        };
        // 上传sourceMap
        this.upLoadMap = (data, name, mapVersion) => {
            return new Promise((resolve, reject) => {
                fetch(`${this.dsn}/api/upload`, {
                    method: "post",
                    body: JSON.stringify({
                        file: JSON.stringify(data),
                        apikey: this.token,
                        name,
                        mapVersion
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    }
                })
                .then((response) => response.json())
                .then((res) => {
                    resolve(res);
                });
            });
        };
        // 检查是否上传
        this.checkUpload = () => {
            let flag = false;
            for (let i=0; i < this.uploadScript.length; i++) {
                let item = this.uploadScript[i];
                if (this.npm_lifecycle_script.indexOf(item) > -1) {
                    flag = true;
                    break;
                }
            }
            return flag;
        }

        this.checkParams('dsn');
        this.checkParams('token');
        this.checkParams('appVersion');
        this.checkParams('productionSourceMap');
    }
    apply(compiler) {
        var _this = this;
        compiler.hooks.emit.tapAsync(
            "WebSeeUpLoadMap",
            async (compilation, next) => {
                if (!_this.checkUpload()) {
                    next();
                    return;
                }
                let upLoads = [];
                let info = await _this.checkVersionExists();
                let exists = info.data.data.exists;
                let appVersion = info.data.data.appVersion;
                if(info.code == 200) {
                    if (exists) {
                        throw new Error(`当前版本已存在，请修改package.json'中的version, 再重新打包，或停用web-see-upload-map.js插件`)
                    } else {
                        console.log(`当前版本sorceMap将上传至：${appVersion}`);
                        for (var filename in compilation.assets) {
                            if (/\.map$/.test(filename)) {
                                let name = filename.split("/")[1] || "";
                                upLoads.push(_this.upLoadMap(compilation.assets[filename]._value, name, appVersion));

                                if (!_this.productionSourceMap) {
                                    delete compilation.assets[filename];
                                }
                            }
                        }
                        Promise.all(upLoads)
                        .then((res) => {})
                        .catch(err => {});
                        next();
                    }
                }
            }
        );
    }
}

export default WebSeeSourceMap;
