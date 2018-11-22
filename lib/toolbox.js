module.exports = {
    clone: function(item) {
        try {
            return JSON.parse(JSON.stringify(item));
        }
        catch (e) {
            return item;
        }
    }
};