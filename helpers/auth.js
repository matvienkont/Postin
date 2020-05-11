module.exports = {
    ensureAuthenticated: (req, res, next) => 
    {
        if(req.isAuthenticated())
        {
            return next();
        }
        req.flash("error_msg", "Sorry, not authenticated :(");
        res.redirect("/users/login");
    }
};