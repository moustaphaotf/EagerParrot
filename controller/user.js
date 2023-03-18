const { body, validationResult } = require("express-validator");
const sqlite = require('sqlite3');
const async = require("async");
const { DateTime } = require("luxon");

module.exports = class {
    static signin_get(req, res, next) {
        res.render("signin");
    }
    
    static signin_post = [
        body("username").trim().isLength({min: 1}).withMessage("Vous devez spécifier un nom d'utilisateur") ,
        body("password").trim().isLength({min: 1}).withMessage("Vous devez renseigner un mot de passe !"),
        (req, res, next) => {
            const {session} = req;
            const {username, password} = req.body;

            const errors = validationResult(req);
            if(errors.isEmpty()) {
                const db = new sqlite.Database('eagerparrot.db', sqlite.OPEN_READONLY, err => {
                    if(err) console.log("Error while opening the database !");
                })
                db.get(
                    "SELECT * FROM user WHERE username=? AND password=?;",
                    [username, password],
                    (err, user) => {
                        if(err) return next(err);
                        else if(!user) {
                            res.render("signin", {badData: req.body});
                        } else {
                            req.session.user = user;
                            res.redirect('/');
                        }
                    }
                );
                db.close();
            } else {
                // récupérer les messages d'erreurs
                const err = {};
                for(let e of errors.errors) {
                    err[e.param] = e.msg;
                }
                res.render('signin', {badData: req.body, errors: err})
            }
        }
    ]

    static signup_get(req, res, next) {
        res.render("signup");
    }

    static signup_post = [
        body("firstname")
            .trim()
            .isLength({min: 1})
            .withMessage("Le prénom est obligatoire."),
        body("lastname")
            .trim()
            .isLength({min: 1})
            .withMessage("Le nom est obligatoire."),
        body("email")
            .trim()
            .isLength({min: 1})
            .withMessage("L'adresse email est obligatoire.")
            .isEmail()
            .withMessage("L'adresse email est invalide !"),
        body("username")
            .trim()
            .isLength({min: 1})
            .withMessage("Le nom d'utilisateur est obligatoire."),
        body("password1")
            .trim()
            .isLength({min: 1})
            .withMessage("Le mot de passe est obligatoire."),
        body("password2")
            .trim()
            .isLength({min: 1})
            .withMessage("Le mot de passe de confirmation est obligatoire."),
        (req, res, next) => {
            const errors = validationResult(req);
            if(errors.isEmpty()) {
                const {firstname, lastname, email, username, password1, password2} = req.body;
                const db = new sqlite.Database("eagerparrot.db");

                if(password1 !== password2) {
                    res.render("signup", {errors: {password2: "Les mots de passe ne correspondent pas !"}, badData: req.body});
                } else {
                    db.get("SELECT * FROM user WHERE email=? OR username=?", [email, username], (err, user) => {
                        if(err) next(err);
                        else if (user) {
                            if(user.email === email) {
                                res.render("signup", {errors: {email: "Cette adresse email est déjà utilisée !"}, badData: req.body});
                            } else if (user.username === username) {
                                res.render("signup", {errors: {username: "Ce nom d'utilisateur est déjà utilisé !"}, badData: req.body});
                            }
                        } else {
                            db.run(
                                `INSERT INTO user (firstname, lastname, email, username, password, role, active, registered_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                [firstname, lastname, email, username, password1, 'USER', 0, new Date().toISOString()],
                                err => {
                                    if(err) return next(err);
                                    else res.redirect('/user/signin');
                                }
                            )
                        }
                    });
                }

                db.close();
            } else {
                const err = {};
                for (let e of errors.errors) {
                    err[e.param] = e.msg;
                }
                res.render("signup", {errors: err, badData: req.body})
            }
        }
    ];

    static signout(req, res, next) {
        req.session.destroy(err => {
            if(err) return next(err);
            else res.redirect('/');
        });
    }

    // L'affichage du profile d'un utilisateur
    static user_profile(req, res, next) {
        // Il faudra afficher ses informations personnelles
        // Puis les articles qu'il a publiés
        // Plus tard, les histoires qu'il a publiés peut-être... je sais pas (OUAIS, on va le prévoir)
        const db = new sqlite.Database('eagerparrot.db', sqlite.OPEN_READONLY, err => {
            if(err) return console.log("Error while opening the database !");
        });

        async.parallel(
            {
                user_profile(callback) {
                    db.get("SELECT *, firstname || ' ' || lastname AS fullname FROM user WHERE id=?", req.params.id, (err, user) => {
                        if(err) return callback(err);
                        else if(!user) {
                            const err = new Error("Utilisateur introuvable !");
                            err.status = 404;
                            callback(err);
                        }
                        else {
                            callback(err, user);
                        }
                    });
                },
                articles(callback){
                    db.all(
                        "SELECT * FROM article_list WHERE author_id=? AND published=1",
                        req.params.id,
                        callback
                    );
                },
                articles_unpublished(callback){
                    db.all(
                        "SELECT * FROM article_list WHERE author_id=? AND published=0",
                        req.params.id,
                        callback
                    );
                }
            },
            (err, results) => {
                [...results.articles, ...results.articles_unpublished].map(el => {
                    el.created_at = DateTime.fromISO(el.created_at).toLocaleString(DateTime.DATETIME_MED);
                    el.last_update = DateTime.fromISO(el.last_update).toLocaleString(DateTime.DATETIME_MED);
                });
                if(err) return next(err);
                else {
                    res.render("user_profile", {
                        title: results.user_profile.fullname,
                        user: req.session.user,
                        ...results,
                    });
                }
            }
        )


        db.close();
    }
}