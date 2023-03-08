const sqlite = require("sqlite3");
const async = require('async');
const {DateTime} = require('luxon');

module.exports = class{
    static articles_list(req, res, next) {
        const db = new sqlite.Database('eagerparrot.db', sqlite.OPEN_READONLY, err => {
            if(err) console.log("Error while opening the database !", err.message);
        });
        console.log(req.session)
        
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
}