const sqlite = require("sqlite3");
const async = require('async');
const {DateTime} = require('luxon');
const {body, validationResult} = require('express-validator');
const { marked } = require("marked");

module.exports = class{
    static articles_list(req, res, next) {
        const db = new sqlite.Database('eagerparrot.db', sqlite.OPEN_READONLY, err => {
            if(err) console.log("Error while opening the database !", err.message);
        });
        
        async.parallel({
            user_articles(callback) {
                db.all(
                    `
                        SELECT * FROM article_list WHERE author_id=? AND published=1
                    `
                    , [req.session.user?.id], callback)
            },
            user_articles_unpublished(callback) {
                db.all(
                    `
                        SELECT * FROM article_list WHERE author_id=? AND published=0
                    `
                    , [req.session.user?.id], callback)
            },
            community_articles (callback){
                db.all(
                    `
                        SELECT * FROM community_articles WHERE followee_id = ?
                    `,
                    [req.session.user?.id],
                    callback
                );
            },
            all_articles (callback) {
                db.all(
                    `
                        SELECT * FROM article_list WHERE published=1;
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

                results.user_articles_unpublished.map(a => {
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
        const db = new sqlite.Database("eagerparrot.db",  err => {
            if(err) console.log("Error while opening the database !", err.message);
        });

        async.parallel(
            {
                article(callback) {
                    db.get(
                        `
                            SELECT * FROM article_list WHERE id = ?
                        `, 
                        [req.params.id], 
                        callback
                    );
                },
                comments(callback) {
                    db.all(
                        `
                            SELECT * FROM comment_list WHERE article_id=?;
                        `,
                        req.params.id,
                        callback
                    )
                }
            }, (err, results) => {
                const {article, comments} = results;

                if(err) return next(err);
                else if(!article) {
                    const err = new Error("Article introuvable !");
                    return next(err);
                } else if(article.published == 0 && req.session.user && article.author_id != req.session.user.id) {
                    const err = new Error("Vous n'avez pas accès à cet article !");
                    return next(err);
                } else {
                    // Formattage des dates
                    article.created_at = DateTime.fromISO(article.created_at).toLocaleString(DateTime.DATETIME_MED);
                    article.last_update = DateTime.fromISO(article.last_update).toLocaleString(DateTime.DATETIME_MED);
                    comments.map(c => {
                        c.created_at = DateTime.fromISO(c.created_at).toLocaleString(DateTime.DATETIME_MED);
                    });

                    // formattage du contenu
                    article.content = marked.parse(article.content);

                    // Marquer comme lu si ce n'est pas le cas
                    if(req.session.user) {
                        db.get(
                            "SELECT * FROM view WHERE user_id=? AND article_id=?", 
                            [req.session.user.id, req.params.id],
                            (err, view) => {
                                if(!err && !view) {
                                    db.run(
                                        "INSERT INTO view(user_id, created_at, article_id) VALUES(?, ?, ?)",
                                        [req.session.user.id, new Date().toISOString(), req.params.id],
                                        err => {
                                            if(err) console.log("Impossible de marquer l'article comme lu !", err.message);
                                        }
                                    );
                                }
                            }
                        )
                    }

                    res.render("article_detail", {
                        title: article.title, 
                        article: article,
                        user: req.session.user, 
                        comments: comments,
                        errors: req.commentProcessedErrors,
                    });
                }
            }
        )
        

        db.close();
    }

    static article_create_get(req, res, next) {
        if(!req.session.user) {
            res.redirect('/user/signin')
        } else {
            // Récupérer la liste des catégories
            const db = new sqlite.Database("eagerparrot.db", sqlite.OPEN_READONLY, err => {
                if(err) console.log("Error while opening the database !");
            });

            db.all("SELECT id, name FROM articlecategory;", (err, categories) => {
                if(err) console.log("An error occured while getting the articles !", err.message);

                res.render('article_create', {
                    categories: categories.map(c => c.name),
                    title: "Nouvel article", 
                    user: req.session.user
                });
            });

            db.close;
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
        body("categories").trim()
            .custom(categories => {
                categories = categories !== "" ? JSON.parse(categories) || [] : [];
                if(categories.length === 0){
                    throw new Error("Vous devez donner au moins une catégorie à l'article !");
                }
                return true;
            }),
        (req, res, next) => {
            if(!req.session.user) return res.redirect("/user/signin");
            req.body.categories = req.body.categories !== "" ? JSON.parse(req.body.categories) || [] : [];
            req.body.categories = req.body.categories.map(c => c.value);

            const db = new sqlite.Database('eagerparrot.db', err => {
                if(err) console.log("Error while opening the database !", err.message)
            });
            

            const errors = validationResult(req);
            // S'il y a une erreur de validation
            if(!errors.isEmpty()){
                // récupérer les erreurs
                const errs = {};
                for(let e of errors.errors) {
                    errs[e.param] = e.msg;
                }
                
                db.all("SELECT * FROM articlecategory ORDER BY name", (err, categories) => {
                    if(err) console.log("An error occured while selecting the article categories", err.message);

                    res.render("article_create", {
                        user: req.session.user,
                        title: "Nouvel article",
                        badData: req.body,
                        errors: errs,
                        categories: categories.map(c => c.name),
                    });
                });
            } else {
                const {title, summary, content, categories} = req.body;
                const author_id = req.session.user.id;
                const now = new Date().toISOString();
                const created_at = now , last_update = now;

                db.run(
                    `
                        INSERT INTO article (title, summary, content, author_id, created_at, last_update, published)
                        VALUES (?, ?, ?, ?, ?, ?, 1)
                    `,
                    [title, summary, content, author_id, created_at, last_update],
                    function(err) {
                        if(err) return next(err);
                        const article_id = this.lastID;
                        // Ajout des catégories
                        categories.forEach(cat => {
                            // Selon que la catégorie existe déjà
                            db.get("SELECT * FROM articlecategory WHERE name LIKE ?", cat, (err, category) => {
                                if(err) return next(err);
                                else if(category) {
                                    // si elle existe, on marque que l'article appartient à cette catégorie
                                    db.run("INSERT INTO article_articlecategory (article_id, category_id) VALUES(?, ?)", [article_id, category.id], err => {
                                        if(err) return next(err);
                                    })
                                } else {
                                    // Sinon, on ajoute la catégorie d'abord
                                    db.run("INSERT INTO articlecategory(name) VALUES(?)", cat, function(err) {
                                        if(err) return next(err);
                                        else {
                                            db.run("INSERT INTO article_articlecategory (article_id, category_id) VALUES (?, ?);", [article_id, this.lastID], err => {
                                                if(err) return next(err);
                                            });
                                        }
                                    });
                                }
                            });
                        });

                        // On ajoute cette action dans l'historique ?
                        db.run(
                            `
                                INSERT INTO history(description, created_at, article_id, author_id) 
                                VALUES("Création d'un nouveau article.", "${new Date().toISOString()}", ?, ?)
                            `,
                            [this.lastID, author_id],
                            err => {
                                if(err) console.log("Impossible d'ajouter cette cette action dans l'historique !", err.message);
                            }
                        );

                        res.redirect("/articles/"+this.lastID);
                    }
                );

            }
            db.close();
        }
    ]

    static article_publish(req, res, next){
        if(!req.session.user) return res.redirect('/user/signin');
        // On recherche l'article
        const db = new sqlite.Database('eagerparrot.db', err => {
            if(err) console.log("An error occured while opening the database !", err.message);
        });

        db.get("SELECT * FROM article WHERE id=?", req.params.id, (err, article) => {
            if(err) return next(err);
            else if(!article){
                const err = new Error("Article introuvable !");
                err.status = 403;
                return next(err);
            } else if(article.author_id != req.session.user.id) {
                const err = new Error("Vous n'êtes pas le propriétaire de cet article !")
                err.status = 403;
                return next(err);
            } else {
                db.run(
                    `UPDATE article SET published=1, last_update='${new Date().toISOString()}' WHERE id=?`,
                    req.params.id,
                    err => {
                        if(err) return next(err);
                        else {
                            db.run(
                                `
                                    INSERT INTO history(description, created_at, author_id, article_id) 
                                    VALUES("Mise en public d'un article.", "${new Date().toISOString()}", ?, ?)
                                `,
                                [req.session.user.id, req.params.id],
                                err => {
                                    if(err) console.log("Impossible d'ajouter cette action dans l'historique !", err.message);
                                    next();
                                }
                            );
                        }
                    }
                )
            }
        })

        db.close();
    }
    static article_unpublish(req, res, next){
        if(!req.session.user) return res.redirect('/user/signin');
        // On recherche l'article
        const db = new sqlite.Database('eagerparrot.db', err => {
            if(err) console.log("An error occured while opening the database !", err.message);
        });

        db.get("SELECT * FROM article WHERE id=?", req.params.id, (err, article) => {
            if(err) return next(err);
            else if(!article){
                const err = new Error("Article introuvable !");
                err.status = 403;
                return next(err);
            } else if(article.author_id != req.session.user.id) {
                const err = new Error("Vous n'êtes pas le propriétaire de cet article !")
                err.status = 403;
                return next(err);
            } else {
                db.run(
                    `UPDATE article SET published=0, last_update='${new Date().toISOString()}' WHERE id=?`,
                    req.params.id,
                    err => {
                        if(err) return next(err);
                        else {
                            db.run(
                                `
                                    INSERT INTO history(description, created_at, author_id, article_id) 
                                    VALUES("Mise en privé d'un article.", "${new Date().toISOString()}", ?, ?)
                                `,
                                [req.session.user.id, req.params.id],
                                err => {
                                    if(err) console.log("Impossible d'ajouter cette action dans l'historique !", err.message);
                                    next();
                                }
                            );
                        }
                    }
                )
            }
        })

        db.close()
    }

    static article_published_change = (req, res, next) => {
        let dest = "/articles/" + req.params.id;
        if(req.query.redirect) {
            switch(req.query.redirect) {
                case 'list' : 
                    dest = `/articles#`+req.params.id;
                    break;
                case 'edit':
                    dest = `/articles/${req.params.id}/edit`;
                    break;
            }
        }

        res.redirect(dest);
    }

    static article_new_comment = [
        body('content').trim()
            .isLength({min: 1})
            .withMessage("Le commentaire ne doit pas être vide !"),
        (req, res, next) => {
            if(!req.session.user) return res.redirect("/user/signin");
            
            const errors = validationResult(req);
            if(!errors.isEmpty()) {
                const err = {};
                for(let e of errors.errors) {
                    err[e.param] = e.msg;
                }

                req.commentProcessedErrors = err;
                this.article_details(req, res, next);
            } else {
                const {content} = req.body;
                const author_id = req.session.user.id;
                const created_at = new Date().toISOString();
                const article_id = req.params.id;
                // Tout est OKAY, on peut ajouter le commentaire
                const db = new sqlite.Database("eagerparrot.db", err => {
                    if(err) return next(err);
                });

                db.run(
                    `
                        INSERT INTO comment(content, article_id, author_id, created_at)
                        VALUES (?, ?, ?, ?)
                    `,
                    [content, article_id, author_id, created_at],
                    function(err) {
                        if(err) return next(err);
                        // The comment has been added, insert into the history table !
                        const comment_id = this.lastID;

                        db.run(
                            "INSERT INTO history(article_id, comment_id, author_id, created_at, description) VALUES (? , ?, ?, ?, ?)",
                            [article_id, comment_id, author_id, created_at, "Commentaire d'un article."],
                            err => {
                                if(err) console.log("Impossible d'ajouter cette action dans l'historique.", err.message);

                                res.redirect("/articles/"+article_id);
                            }
                        );
                    }
                );

                db.close();

            }
        }
    ]

    static article_edit_get = (req, res, next) => {
        if(!req.session.user) return res.redirect('/user/signin');

        const db = new sqlite.Database("eagerparrot.db", err => {
            if(err) return next(err);
        });

        db.get(
            `
                SELECT * FROM article
                WHERE id=?
            `, req.params.id,
            (err, article) => {
                if(err) return next(err);
                else if(!article) {
                    const err = new Error("Article introuvable !");
                    err.status = 404;
                    return next(err);
                } else if(article.author_id != req.session.user.id){
                    const err = new Error("Vous n'avez pas le droit de modifier cet article !");
                    err.status = 301;
                    return next(err);
                } else {
                    // Formulaire de modification ici
                    article.created_at = DateTime.fromISO(article.created_at).toLocaleString(DateTime.DATETIME_MED);
                    article.last_update = DateTime.fromISO(article.last_update).toLocaleString(DateTime.DATETIME_MED);
                    
                    async.parallel(
                        {
                            all_categories(callback) {
                                db.all(
                                    `
                                        SELECT * FROM articlecategory ORDER BY name;
                                    `, callback
                                );
                            },
                            article_categories(callback) {
                                db.all(
                                    `
                                        SELECT c.*
                                        FROM article a
                                        INNER JOIN article_articlecategory ac
                                        ON a.id = ac.article_id
                                        INNER JOIN articlecategory c
                                        ON c.id = ac.category_id
                                        WHERE a.id=?
                                        ORDER BY c.name;
                                    `, req.params.id, callback
                                );
                            }
                        },
                        (err, results) => {
                            if(err) return next(err);
                            else {
                                res.render('article_edit', {
                                    categories: results.article_categories.map(c => c.name),
                                    all_categories: results.all_categories.map(c => c.name),
                                    title: "Modification d'un article",
                                    user: req.session.user,
                                    article
                                });
                            }
                        }
                    );
                }
            }
        );
        db.close();
    }

    static article_edit_post = [
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
        body("categories").trim()
            .custom(categories => {
                categories = categories !== '' ? JSON.parse(categories) || [] : [];
                if(categories.length === 0) {
                    throw(new Error("Vous devez donner au moins une catégorie à l'article !"));
                }
                return true;
            }),
        (req, res, next) => {
            if(!req.session.user) return res.redirect('/user/signin');
            const db = new sqlite.Database("eagerparrot.db", err => {
                if(err) return next(err);
            });
    
            db.get(
                `
                    SELECT * FROM article
                    WHERE id=?
                `, req.params.id,
                (err, article) => {
                    if(err) return next(err);
                    else if(!article) {
                        const err = new Error("Article introuvable !");
                        err.status = 404;
                        return next(err);
                    } else if(article.author_id != req.session.user.id){
                        const err = new Error("Vous n'avez pas le droit de modifier cet article !");
                        err.status = 301;
                        return next(err);
                    } else {
                    
                        const errors = validationResult(req);
                        if(errors.isEmpty()){
                            // Modification ici
                            const {title, summary, content} = req.body;
                            const article_id = req.params.id;
                            const now = new Date().toISOString();
                            let {categories} = req.body;
                            categories = JSON.parse(categories) || [];
                            categories = categories.map(c => c.value);

                            db.run(
                                `
                                    UPDATE article SET
                                    title = ?,
                                    summary = ?,
                                    content = ?,
                                    last_update = ?
                                    WHERE id = ?;
                                `,
                                [title, summary, content, now, article_id],
                                err => {
                                    if(err) return next(err);
                                    db.run("DELETE FROM article_articlecategory WHERE article_id=?", article_id);

                                    // After updating, and deleting the article's categories
                                    // Among all the received article
                                    categories.forEach(cat => {
                                        // If the article exists
                                        db.get("SELECT * FROM articlecategory WHERE name LIKE ?", cat, (err, category) => {
                                            if(err) return next(err);
                                            else if(category) {
                                                // the category exists
                                                db.run(
                                                    "INSERT INTO article_articlecategory(article_id, category_id) VALUES (?, ?)",
                                                    [article_id, category.id],
                                                    err => {
                                                        if(err) return next(err);
                                                    }
                                                );
                                            } else {
                                                // the category doesn't exist, we must create it
                                                db.run(
                                                    "INSERT INTO articlecategory(name) VALUES (?)",
                                                    [cat], function(err){
                                                        if(err) return next(err);
                                                        else {
                                                            // Insert the article id and category id into the appropriate table
                                                            db.run(
                                                                "INSERT INTO article_articlecategory(article_id, category_id) VALUES (?, ?);",
                                                                [article_id, this.lastID],
                                                                err => {
                                                                    if(err) return next(err);
                                                                }
                                                            );
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                    });

                                    // Adding the action into the history table
                                    db.run(
                                        "INSERT INTO history(article_id, author_id, created_at, description) VALUES (?, ?, ?, ?)",
                                        [article_id, req.session.user.id, new Date().toISOString(), "Mise à jour d'un article."],
                                        err => {
                                            if(err) console.log("Impossible d'ajouter cette action dans l'historique !");
                                        }
                                    );
                                    res.redirect("/articles/" + article_id);
                                }
                            )
                        } else {
                            // Des erreurs ont survenu, reafficher le formulaire
                            const errs = {};
                            for(let e of errors.errors){
                                errs[e.param] = e.msg;
                            }

                            async.parallel(
                                {
                                    all_categories(callback) {
                                        db.all(
                                            `
                                                SELECT * FROM articlecategory ORDER BY name;
                                            `, callback
                                        );
                                    },
                                    article_categories(callback) {
                                        db.all(
                                            `
                                                SELECT c.*
                                                FROM article a
                                                INNER JOIN article_articlecategory ac
                                                ON a.id = ac.article_id
                                                INNER JOIN articlecategory c
                                                ON c.id = ac.category_id
                                                WHERE a.id=?
                                                ORDER BY c.name;
                                            `, req.params.id, callback
                                        );
                                    }
                                },
                                (err, results) => {
                                    if(err) return next(err);
                                    else {
                                        res.render('article_edit', {
                                            categories: results.article_categories.map(c => c.name),
                                            all_categories: results.all_categories.map(c => c.name),
                                            title: "Modification d'un article",
                                            user: req.session.user,
                                            article,
                                            badData: req.body,
                                            errors: errs,
                                        });
                                    }
                                }
                            );
                        }
                    }
                }
            );
    
            db.close();
        }
    ] 
}