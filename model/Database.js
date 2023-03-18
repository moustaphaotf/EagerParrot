const sqlite = require('sqlite3');

const Database = class {
    static create() {
        const db = new sqlite.Database('eagerparrot.db', err => {
            if(err) console.log("Error while opening the database !", err.message);
            else console.log("Database opened successfully !");
        });

        // User
        db.run(
            `
                CREATE TABLE IF NOT EXISTS user(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    username TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    firstname TEXT NOT NULL,
                    lastname TEXT NOT NULL,
                    registered_at TEXT NOT NULL,
                    active INTEGER,
                    role INTEGER
                );
            `,
            err => {
                if(err) console.log("Error while creating the `user` table", err.message);
                else console.log("The `user` table was created successfully !")
            }
        );

        // Socialization
        db.run(
            `
                CREATE TABLE IF NOT EXISTS socialization(
                    user_id INTEGER NOT NULL,
                    followee_id INTEGER NOT NULL,
                    date_from TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES user(id),
                    FOREIGN KEY (followee_id) REFERENCES user(id),
                    PRIMARY KEY (user_id, followee_id)
                );
            `,
            err => {
                if(err) console.log("Error while creating the `socialization` table", err.message);
                else console.log("The `socialization` table was created successfully !")
            }
        );

        db.run(
            `
                CREATE TABLE IF NOT EXISTS story(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    summary TEXT,
                    published INTEGER,
                    created_at TEXT NOT NULL,
                    last_update TEXT NOT NULL,
                    author_id INTEGER NOT NULL,
                    FOREIGN KEY (author_id) REFERENCES user(id)
                );
            `,
            err => {
                if(err) console.log("Error while creating the `story` table", err.message);
                else console.log("The `story` table was created successfully !")
            }
        );
        
        db.run(
            `
                CREATE TABLE IF NOT EXISTS chapter(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    published INTEGER,
                    created_at TEXT NOT NULL,
                    last_update TEXT NOT NULL,
                    story_id INTEGER NOT NULL,
                    FOREIGN KEY (story_id) REFERENCES story(id)
                );
            `,
            err => {
                if(err) console.log("Error while creating the `chapter` table", err.message);
                else console.log("The `chapter` table was created successfully !")
            }
        );  

        db.run(
            `
                CREATE TABLE IF NOT EXISTS comment(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at TEXT NOT NULL,
                    content TEXT NOT NULL,
                    author_id INTEGER,
                    article_id INTEGER,
                    chapter_id INTEGER,
                    FOREIGN KEY (author_id) REFERENCES user(id),
                    FOREIGN KEY (article_id) REFERENCES article(id),
                    FOREIGN KEY (chapter_id) REFERENCES chapter(id)
                );
            `,
            err => {
                if(err) console.log("Error while creating the `comment` table", err.message);
                else console.log("The `comment` table was created successfully !")
            }
        );
        
        db.run(
            `
                CREATE TABLE IF NOT EXISTS view(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    chapter_id INTEGER,
                    article_id INTEGER,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES user(id),
                    FOREIGN KEY (article_id) REFERENCES article(id),
                    FOREIGN KEY (chapter_id) REFERENCES chapter(id)
                );
            `,
            err => {
                if(err) console.log("Error while creating the `view` table", err.message);
                else console.log("The `view` table was created successfully !")
            }
        );
                
        db.run(
            `
                CREATE TABLE IF NOT EXISTS review(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    comment_id INTEGER,
                    chapter_id INTEGER,
                    article_id INTEGER,
                    story_id INTEGER,
                    author_id INTEGER,
                    value INTEGER NOT NULL,
                    FOREIGN KEY (comment_id) REFERENCES comment(id),
                    FOREIGN KEY (chapter_id) REFERENCES chapter(id),
                    FOREIGN KEY (article_id) REFERENCES article(id),
                    FOREIGN KEY (story_id) REFERENCES story(id),
                    FOREIGN KEY (author_id) REFERENCES user(id)
                );
            `,
            err => {
                if(err) console.log("Error while creating the `review` table", err.message);
                else console.log("The `review` table was created successfully !")
            }
        ); 

        db.run(
            `
                CREATE TABLE IF NOT EXISTS report(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at TEXT NOT NULL,
                    author_id INTEGER NOT NULL,
                    chapter_id INTEGER,
                    comment_id INTEGER,
                    story_id INTEGER,
                    about TEXT NOT NULL,
                    FOREIGN KEY (author_id) REFERENCES user(id)
                    FOREIGN KEY (chapter_id) REFERENCES chapter(id)
                    FOREIGN KEY (comment_id) REFERENCES comment(id)
                    FOREIGN KEY (story_id) REFERENCES story(id)
                );
            `,
            err => {
                if(err) console.log("Error while creating the `report` table", err.message);
                else console.log("The `report` table was created successfully !")
            }
        );

        db.run(
            `
                CREATE TABLE IF NOT EXISTS storycategory(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL
                );
            `,
            err => {
                if(err) console.log("Error while creating the `storycategory` table", err.message);
                else console.log("The `storycategory` table was created successfully !")
            }
        );

        db.run(
            `
                CREATE TABLE IF NOT EXISTS articlecategory(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL
                );
            `,
            err => {
                if(err) console.log("Error while creating the `articlecategory` table", err.message);
                else console.log("The `articlecategory` table was created successfully !")
            }
        );

        db.run(
            `
                CREATE TABLE IF NOT EXISTS article_articlecategory(
                    category_id INTEGER NOT NULL,
                    article_id INTEGER NOT NULL,
                    FOREIGN KEY(category_id) REFERENCES articlecategory(id),
                    FOREIGN KEY(article_id) REFERENCES article(id),
                    PRIMARY KEY(category_id, article_id)
                );
            `,
            err => {
                if(err) console.log("Error while creating the `article_articlecategory` table", err.message);
                else console.log("The `article_articlecategory` table was created successfully !")
            }
        );

        db.run(
            `
                CREATE TABLE IF NOT EXISTS story_storycategory(
                    category_id INTEGER NOT NULL,
                    story_id INTEGER NOT NULL,
                    FOREIGN KEY(category_id) REFERENCES storycategory(id),
                    FOREIGN KEY(story_id) REFERENCES story(id) ON DELETE CASCADE,
                    PRIMARY KEY(category_id, story_id)
                );

            `,
            err => {
                if(err) console.log("Error while creating the `article_storycategory` table", err.message);
                else console.log("The `article_storycategory` table was created successfully !")
            }
        );
        
        db.run(
            `
                CREATE TABLE IF NOT EXISTS article(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    summary TEXT,
                    content TEXT NOT NULL,
                    published INTEGER,
                    created_at TEXT NOT NULL,
                    last_update TEXT NOT NULL,
                    author_id INTEGER NOT NULL,
                    FOREIGN KEY(author_id) REFERENCES user(id)
                );
            `,
            err => {
                if(err) console.log("Error while creating the `article` table", err.message);
                else console.log("The `article` table was created successfully !")
            }
        );
        
        db.run(
            `
                CREATE TABLE IF NOT EXISTS asset(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    path TEXT NOT NULL,
                    article_id INTEGER NOT NULL,
                    FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE
                );
            `,
            err => {
                if(err) console.log("Error while creating the `asset` table", err.message);
                else console.log("The `asset` table was created successfully !")
            }
        );
        
        db.run(
            `
                CREATE TABLE IF NOT EXISTS history(
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    description TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    story_id INTEGER,
                    chapter_id INTEGER,
                    comment_id INTEGER,
                    article_id INTEGER,
                    user_id INTEGER,
                    author_id INTEGER,
                    review_id INTEGER,
                    FOREIGN KEY (story_id) REFERENCES story(id),
                    FOREIGN KEY (chapter_id) REFERENCES chapter(id),
                    FOREIGN KEY (comment_id) REFERENCES comment(id),
                    FOREIGN KEY (article_id) REFERENCES article(id),
                    FOREIGN KEY (user_id) REFERENCES user(id),
                    FOREIGN KEY (author_id) REFERENCES user(id),
                    FOREIGN KEY (review_id) REFERENCES review(id)
                );
            `,
            err => {
                if(err) console.log("Error while creating the `history` table", err.message);
                else console.log("The `history` table was created successfully !")
            }
        );

        db.exec(
            `
                DROP VIEW IF EXISTS article_list;
                CREATE VIEW article_list AS
                SELECT a.id, a.title, a.summary, a.content, a.created_at, a.last_update, a.author_id, a.published,
                    u.firstname || ' ' || u.lastname AS author_name,
                    COUNT(DISTINCT c.id) AS comment_count,
                    COUNT(DISTINCT v.id) AS view_count,
                    (SELECT COUNT(*) FROM review WHERE article_id=a.id AND value=1) AS like_count,
                    (SELECT COUNT(*) FROM review WHERE article_id=a.id AND value=-1) AS dislike_count
                FROM user u
                INNER JOIN article a
                ON u.id = a.author_id
                LEFT JOIN comment c
                ON c.article_id = a.id
                LEFT JOIN view v
                ON v.article_id = a.id
                GROUP BY a.id, a.title, a.summary, a.created_at, a.last_update, a.author_id, a.published
                ORDER BY a.last_update DESC;
            `,
            err => {
                if(err) console.log("Error while creating the `article_list` view", err.message);
                else console.log("The `article_list` view was created successfully !");
            }
        );

        db.exec(
            `
                DROP VIEW IF EXISTS community_articles;
                CREATE VIEW community_articles AS
                SELECT a.id, a.title, a.summary, a.content, a.created_at, a.last_update, a.author_id, a.published, s.followee_id,
                    u.firstname || ' ' || u.lastname AS author_name,
                    COUNT(c.id) AS comment_count,
                    COUNT(v.id) AS view_count,
                    (SELECT COUNT(*) FROM review WHERE article_id=a.id AND value=1) AS like_count,
                    (SELECT COUNT(*) FROM review WHERE article_id=a.id AND value=-1) AS dislike_count
                FROM socialization s
                INNER JOIN article a
                ON a.author_id = s.user_id
                INNER JOIN user u
                ON a.author_id = u.id
                LEFT JOIN comment c
                ON c.article_id = a.id
                LEFT JOIN view v
                ON v.article_id = a.id
                WHERE a.published=1
                GROUP BY a.id, a.title, a.summary, a.created_at, a.last_update, a.author_id, s.followee_id, author_name
                ORDER BY a.created_at DESC;
            `,
            err => {
                if(err) console.log("Error while creating the `community_articles` view", err.message);
                else console.log("The `community_article` view was created successfully !");
            }
        );

        db.exec(
            `
                DROP VIEW IF EXISTS comment_list;
                CREATE VIEW comment_list AS
                SELECT c.*, u.firstname || ' ' || u.lastname AS user_fullname
                FROM comment c
                INNER JOIN user u
                ON c.author_id = u.id
                ORDER BY c.created_at DESC
            `
        )

        db.close(err => {
            if(err) console.log("Error while closing the database !", err.message);
            else console.log("Database closed successfully !")
        });
    }

    static populate(req, res) {
        const db = new sqlite.Database('eagerparrot.db', err => {
            if(err) console.log("Error while opening the database !");
        })

        db.exec(
            `
                DELETE FROM socialization;
                DELETE FROM article_articlecategory;
                DELETE FROM story_storycategory;
                DELETE FROM history;
                DELETE FROM review;
                DELETE FROM view;
                DELETE FROM storycategory;
                DELETE FROM articlecategory;
                DELETE FROM comment;
                DELETE FROM report;
                DELETE FROM asset;
                DELETE FROM chapter;
                DELETE FROM story;
                DELETE FROM article;
                DELETE FROM user;

                INSERT INTO user(id, email, username, password, firstname, lastname, active, registered_at, role) VALUES
                (1, 'amadou@gmail.com', 'amadou', 'amadou12', 'Amadou Alimou', 'Bah', 0, '${new Date('2023/03/06').toISOString()}', 'USER'),
                (2, 'fatima@gmail.com', 'fatima', 'fatima23', 'Fatoumata', 'Sow', 0, '${new Date('2023/03/06').toISOString()}', 'USER'),
                (3, 'oumarou@gmail.com', 'omran', 'oumarou45', 'Alpha Oumar', 'Bah', 0, '${new Date('2023/03/05').toISOString()}', 'USER'),
                (4, 'hawa12@gmail.com', 'hawa', 'hawa8x', 'Hawa', 'Diallo', 0, '${new Date('2023/03/06').toISOString()}', 'USER'),
                (5, 'sumptring@gmail.com', 'sumptring', '111xxI7', 'Mamadou Moustapha', 'Diallo', 0, '${new Date('2023/03/06').toISOString()}', 'USER'),
                (6, 'aboubakr@gmail.com', 'aboubakr', 'aboubakr11x', 'Aboubakr', 'Conté', 0, '${new Date('2023/03/06').toISOString()}', 'USER');

                INSERT INTO socialization (user_id, followee_id, date_from) VALUES
                (1, 2, '${new Date('2023/03/06').toISOString()}'), (2, 3, '${new Date('2023/03/06').toISOString()}'), (1, 6, '${new Date('2023/03/06').toISOString()}'), (2, 1, '${new Date('2023/03/06').toISOString()}'), (6, 2, '${new Date('2023/03/06').toISOString()}'), (6, 1, '${new Date('2023/03/06').toISOString()}');

                INSERT INTO story (id, title, summary, author_id, published, created_at, last_update) VALUES
                (1, 'La journée à la plage', "Une famille passe une journée à la plage. Ils apportent des serviettes, des chaises, des parasols et des jouets pour enfants. Les enfants s'amusent à construire des châteaux de sable et à nager dans l'océan, tandis que les parents se détendent sur les chaises longues. Après un déjeuner de pique-nique, la famille prend une longue promenade sur la plage avant de retourner à la maison.", 1, 1, '${new Date('2023/03/06').toISOString()}', '${new Date('2023/03/06').toISOString()}'),
                (2, 'Le chat et la souris', "Un chat affamé poursuit une souris à travers la maison. La souris évite de justesse le chat à plusieurs reprises jusqu'à ce qu'elle trouve refuge derrière un placard. Le chat rôde autour du placard, mais ne peut pas atteindre la souris. Finalement, le chat s'endort devant le placard et la souris s'échappe.", 2, 1, '${new Date('2023/03/06').toISOString()}', '${new Date('2023/03/06').toISOString()}'),
                (3, 'La fête surprise', "Un groupe d'amis organise une fête surprise pour l'anniversaire d'un ami commun. Ils préparent une décoration colorée, de la nourriture et des boissons pour la fête. Lorsque l'ami arrive, il est étonné de voir tous ses amis présents pour célébrer son anniversaire. Ils passent une soirée agréable à discuter, à rire et à manger ensemble. À la fin de la soirée, l'ami remercie tout le monde pour cette surprise incroyable et promet de faire une fête encore plus grande l'année suivante.", 2, 1, '${new Date('2023/03/06').toISOString()}', '${new Date('2023/03/06').toISOString()}'),
                (4, 'La chasse au trésor', "Un groupe d'enfants organise une chasse au trésor dans leur quartier. Ils créent des énigmes et des indices pour mener les participants au trésor caché. Les enfants se divisent en équipes et courent à travers les rues, résolvant des énigmes et cherchant des indices. Finalement, une équipe trouve le trésor caché, une boîte remplie de friandises et de petits jouets.", 6, 1, '${new Date('2023/03/06').toISOString()}', '${new Date('2023/03/06').toISOString()}');

                INSERT INTO storycategory(id, name) VALUES
                (1, 'Vie quotidienne'), 
                (2, 'Loisirs'), 
                (3, 'Aventure'), 
                (4, 'Célébration'), 
                (5, 'Conte'), 
                (6, 'Conte animalier');


                INSERT INTO story_storycategory(story_id, category_id) VALUES
                (1, 2), (2, 5), (3, 2), (3, 4), (4, 3);

                INSERT INTO article(id, title, author_id, summary, content, published, created_at, last_update) VALUES
                (1, "Les bienfaits de la méditation sur la santé mentale", 1, "La méditation peut aider à réduire le stress, l'anxiété et la dépression en améliorant la capacité à gérer les émotions et à se concentrer sur le moment présent.", "La méditation peut aider à réduire le stress, l'anxiété et la dépression en améliorant la capacité à gérer les émotions et à se concentrer sur le moment présent.", 1, "${new Date('2023/03/06').toISOString()}", "${new Date('2023/03/06').toISOString()}"),
                (2, "Comment l'intelligence artificielle est utilisée dans les soins de santé", 6, "L'intelligence artificielle est utilisée dans les soins de santé pour aider à diagnostiquer les maladies, personnaliser les traitements et améliorer la qualité des soins.", "L'intelligence artificielle est utilisée dans les soins de santé pour aider à diagnostiquer les maladies, personnaliser les traitements et améliorer la qualité des soins.", 1, "${new Date('2023/03/06').toISOString()}", "${new Date('2023/03/06').toISOString()}"),
                (3, "Le rôle des abeilles dans la pollinisation des cultures", 2, "Les abeilles sont essentielles à la pollinisation des cultures, ce qui permet de produire des aliments sains et nutritifs pour les humains et les animaux.", "Les abeilles sont essentielles à la pollinisation des cultures, ce qui permet de produire des aliments sains et nutritifs pour les humains et les animaux.", 1, "${new Date('2023/03/06').toISOString()}", "${new Date('2023/03/06').toISOString()}"),
                (4, "Comment la musique affecte le cerveau humain", 1, "La musique peut affecter le cerveau humain en stimulant différentes régions, ce qui peut améliorer l'humeur, la mémoire et la concentration.", "La musique peut affecter le cerveau humain en stimulant différentes régions, ce qui peut améliorer l'humeur, la mémoire et la concentration.", 1, "${new Date('2023/03/06').toISOString()}", "${new Date('2023/03/07').toISOString()}"),
                (5, "Les avantages de la culture de plantes en intérieur", 3, "La culture de plantes en intérieur peut améliorer la qualité de l'air en éliminant les polluants, réduire le stress en créant un environnement relaxant et améliorer l'humeur en offrant une activité agréable et apaisante.", "La culture de plantes en intérieur peut améliorer la qualité de l'air en éliminant les polluants, réduire le stress en créant un environnement relaxant et améliorer l'humeur en offrant une activité agréable et apaisante.", 1, "${new Date('2023/03/06').toISOString()}", "${new Date('2023/03/07')}");

                INSERT INTO articlecategory(id, name) VALUES
                (1, "Santé"),
                (2, "Bien-être"),
                (3, "Technologie"),
                (4, "Environnement"),
                (5, "Agriculture"),
                (6, "Science"),
                (7, "Psychologie"),
                (8, "Jardinage");

                INSERT INTO article_articlecategory(article_id, category_id) VALUES
                (1,1),(1,2),(2,3),(2,2),(3,4),(3,5),(4,6),(4,7),(5,8),(5,2);
            `,
            err => {
                if(err) {
                    console.log(err.message)
                    res.send("Error while populating the database");
                }
                else res.send("The database was populated successfully !");
            }
        )

        db.close();
    }
}

module.exports = Database;