const { authJwt } = require("../middlewares");
const controller = require("../controllers/gee.controller");
var pool_db = require("../config/crdb.config").pool_db;
var multer = require("multer");
var store = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'app/uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
var upload = multer({ storage: store });

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.post(
        "/sentinel2",
        controller.sentinel2
    );
    app.post(
        "/taianh",
        controller.taianh
    );
    app.post(
        "/taianhAdmin",
        controller.taianhAdmin
    );
    app.post(
        "/downloadAdmin",
        controller.downloadAdmin
    );
    app.post(
        "/landsat",
        controller.landsat
    );
    app.post(
        "/import",
        controller.import
    );
    app.post(
        "/themtinh",
        controller.themTinh
    );
    app.get(
        "/provinceAdmin",
        controller.provinceAdmin
    );
    app.get(
        "/userAdmin",
        controller.userAdmin
    );
    app.get(
        "/data",
        controller.data
    );
    app.get(
        "/manager",
        controller.manager
    );
    // app.get(
    //     "/home",
    //     controller.home
    // );
    app.get(
        "/",
        controller.homeUser
    );
    app.get(
        "/search",
        controller.search
    );
    app.get(
        "/searchAdmin",
        controller.searchAdmin
    );
    app.get(
        "/admin",
        controller.homeAdmin
    );
    app.post(
        "/splitPanel",
        controller.splitPanel
    );
    app.post(
        "/search",
        controller.searchAnh
    );
    app.post(
        "/searchAdmin",
        controller.searchAnhAdmin
    );
    app.post(
        "/splitPanelAdmin",
        controller.splitPanelAdmin
    );
    app.get(
        "/solar/:gid",
        controller.delete
    );
    app.get(
        "/province/:id",
        controller.deleteTinh
    );
    app.get(
        "/user/:id",
        controller.deleteUser
    );
    app.post(
        "/solarUpd/:gid",
        controller.updateStation
    );
    app.get(
        "/dlall",
        controller.deleteAll
    );
    app.get(
        "/search/:id",
        controller.anh
    );
    app.get(
        "/searchAdmin/:id",
        controller.anhAdmin
    );
    app.post(
        "/importxlsx", upload.single("xlsx"),
        controller.xlsx
    );
    app.post(
        "/xemanhcosan", 
        controller.xemAnhCoSan
    );
    app.post(
        "/xemanhcosan_Admin", 
        controller.xemAnhCoSanAdmin
    );
    app.post(
        "/deleteluachon", 
        controller.deleteLuaChon
    );
};