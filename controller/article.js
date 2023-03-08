const sqlite = require("sqlite3");
const async = require('async');
const {DateTime} = require('luxon');
const {body, validationResult} = require('express-validator')

module.exports = class{
    static articles_list(req, res, next) {
        const db = new sqlite.Database('eagerparrot.db', sqlite.OPEN_READONLY, err => {
            if(err) console.log("Error while opening the database !", err.message);
        });
        
        async.parallel({
            user_articles(callback) {
                db.all(
                    `
                        SELECT a.id, title, author_id, summary, created_at, last_update, u.firstname || ' ' || u.lastname AS author_name 
                        FROM article a
                        INNER JOIN user u
                        ON a.author_id = u.id
                        WHERE author_id=? AND a.published=1
                        ORDER BY created_at DESC
                    `
                    , [req.session.user?.id], callback)
            },
            community_articles (callback){
                db.all(
                    `
                        SELECT a.id, title, author_id, summary, created_at, last_update, u.firstname || ' ' || u.lastname AS author_name FROM article a
                        INNER JOIN socialization s 
                        ON a.author_id = s.user_id
                        INNER JOIN user u
                        ON a.author_id = u.id
                        WHERE s.followee_id = ? AND a.published=1
                        ORDER BY created_at DESC
                    `,
                    [req.session.user?.id],
                    callback
                );
            },
            all_articles (callback) {
                db.all(
                    `
                        SELECT a.id, title, author_id, summary, created_at, last_update, u.firstname || ' ' || u.lastname AS author_name 
                        FROM article a
                        INNER JOIN user u
                        ON a.author_id = u.id AND a.published=1
                        ORDER BY created_at DESC
                    `
                    , callback
                );
            }
        }, (err, results) => {
            if(err) return next(err);
            else {
                // Formattage de la date
                results.user_articles.map(a => {
                    a.created_at = DateTime.fromISO(a.created_at).toLocaleString(DateTime.DATETIME_MED);
                    a.last_update = DateTime.fromISO(a.last_update).toLocaleString(DateTime.DATETIME_MED);
                });
                
                results.community_articles.map(a => {
                    a.created_at = DateTime.fromISO(a.created_at).toLocaleString(DateTime.DATETIME_MED);
                    a.last_update = DateTime.fromISO(a.last_update).toLocaleString(DateTime.DATETIME_MED);
                });
                
                results.all_articles.map(a => {
                    a.created_at = DateTime.fromISO(a.created_at).toLocaleString(DateTime.DATETIME_MED);
                    a.last_update = DateTime.fromISO(a.last_update).toLocaleString(DateTime.DATETIME_MED);
                });
                res.render("articles_list", {
                    title: "Eager Parrot | Articles",
                    user: req.session.user,
                    ...results
                });
            }
        });
        db.close();
    }

    static article_details(req, res, next) {
        // afficher les détails de l'article courant
    }

    static article_create_get(req, res, next) {
        if(!req.session.user) {
            res.redirect('/user/signin')
        } else {
            res.render('article_create', {title: "Nouvel article"});
        }
    }

    static article_create_post = [
        body('title').trim()
            .isLength({min: 1})
            .withMessage("Le titre de l'article est obligatoire !")
            .custom(title => {
                const words = title.split(' ');
                const maxLength = 128;
                if(words.length > maxLength) {
                    throw new Error(`Le résumé de l'article est trop long (max: ${maxLength} mots)`);
                }
                return true;
            }),
        body('summary').trim()
            .isLength({min: 1})
            .withMessage("Le résumé de l'article est obligatoire !")
            .custom(summary => {
                const words = summary.split(' ');
                const maxLength = 128;
                if(words.length > maxLength) {
                    throw new Error(`Le résumé de l'article est trop long (max: ${maxLength} mots)`);
                }
                return true;
            }),
        body('content').trim()
            .isLength({min: 1})
            .withMessage("Le contenu de l'article ne peut pas être vide !"),
        (req, res, next) => {
            if(!req.session.user) res.redirect("/user/signin");
            
            const errors = validationResult(req);
            // S'il y a une erreur de validation
            if(!errors.isEmpty()){
                // récupérer les erreurs
                const err = {};
                for(let e of errors.errors) {
                    err[e.param] = e.msg;
                }
                res.render("article_create", {
                    title:"Nouvel article",
                    badData: req.body,
                    errors: err
                })
            } else {
                const {title, summary, content} = req.body;
                const author_id = req.session.user.id;
                const now = new Date().toISOString();
                const created_at = now , last_update = now;

                // insérer l'article
                const db = new sqlite.Database('eagerparrot.db', err => {
                    if(err) console.log("Error while opening the database !", err.message)
                });

                db.run(
                    `
                        INSERT INTO article (title, summary, content, author_id, created_at, last_update, published)
                        VALUES (?, ?, ?, ?, ?, ?, 1)
                    `,
                    [title, summary, content, author_id, created_at, last_update],
                    function(err) {
                        if(err) return next(err);
                        
                        // On ajoute cette action dans l'historique ?
                        db.run(
                            `
                                INSERT INTO history(description, created_at, article_id, author_id) 
                                VALUES("Création d'un nouveau article", "${new Date().toISOString()}", ?, ?)
                            `,
                            [this.lastID, author_id],
                            err => {
                                if(err) console.log("Impossible d'ajouter cette cette action dans l'historique !", err.message);
                            }
                        );

                        res.redirect("/articles/"+this.lastID);
                    }
                );

                db.close();
            }
        }
    ]
    
}