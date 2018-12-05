var winston = require('winston');

var logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.align(),
                winston.format.printf(function (info) {
                    var timestamp = info.timestamp;
                    var level = info.level;
                    var message = info.message;
                    const ts = timestamp.slice(0, 19).replace('T', ' ');
                    return `${ts} [${level}]: ${message}`;
                })
            ),
            level: 'debug',
            handleExceptions: true,
            json: false
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};