module.exports = {
    envParams: ["schemes"],
    setup: function (utils, env) {
        if (env.schemes === 'https') {
            utils.endPoint = "https://petstore.swagger.io/v2";
        }
        else if (env.schemes === 'http') {
            utils.endPoint = "http://petstore.swagger.io/v2";
        }
        utils.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        };
    }
};