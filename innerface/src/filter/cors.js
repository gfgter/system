module.exports = function cors(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST,PUT,PATCH");
    res.set("Access-Control-Allow-Headers", "Content-Type,Authorization");


    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
}