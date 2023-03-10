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
                (6, 'aboubakr@gmail.com', 'aboubakr', 'aboubakr11x', 'Aboubakr', 'Cont??', 0, '${new Date('2023/03/06').toISOString()}', 'USER');

                INSERT INTO socialization (user_id, followee_id, date_from) VALUES
                (1, 2, '${new Date('2023/03/06').toISOString()}'), (2, 3, '${new Date('2023/03/06').toISOString()}'), (1, 6, '${new Date('2023/03/06').toISOString()}'), (2, 1, '${new Date('2023/03/06').toISOString()}'), (6, 2, '${new Date('2023/03/06').toISOString()}'), (6, 1, '${new Date('2023/03/06').toISOString()}');

                INSERT INTO story (id, title, summary, author_id, published, created_at, last_update) VALUES
                (1, 'La journ??e ?? la plage', "Une famille passe une journ??e ?? la plage. Ils apportent des serviettes, des chaises, des parasols et des jouets pour enfants. Les enfants s'amusent ?? construire des ch??teaux de sable et ?? nager dans l'oc??an, tandis que les parents se d??tendent sur les chaises longues. Apr??s un d??jeuner de pique-nique, la famille prend une longue promenade sur la plage avant de retourner ?? la maison.", 1, 1, '${new Date('2023/03/06').toISOString()}', '${new Date('2023/03/06').toISOString()}'),
                (2, 'Le chat et la souris', "Un chat affam?? poursuit une souris ?? travers la maison. La souris ??vite de justesse le chat ?? plusieurs reprises jusqu'?? ce qu'elle trouve refuge derri??re un placard. Le chat r??de autour du placard, mais ne peut pas atteindre la souris. Finalement, le chat s'endort devant le placard et la souris s'??chappe.", 2, 1, '${new Date('2023/03/06').toISOString()}', '${new Date('2023/03/06').toISOString()}'),
                (3, 'La f??te surprise', "Un groupe d'amis organise une f??te surprise pour l'anniversaire d'un ami commun. Ils pr??parent une d??coration color??e, de la nourriture et des boissons pour la f??te. Lorsque l'ami arrive, il est ??tonn?? de voir tous ses amis pr??sents pour c??l??brer son anniversaire. Ils passent une soir??e agr??able ?? discuter, ?? rire et ?? manger ensemble. ?? la fin de la soir??e, l'ami remercie tout le monde pour cette surprise incroyable et promet de faire une f??te encore plus grande l'ann??e suivante.", 2, 1, '${new Date('2023/03/06').toISOString()}', '${new Date('2023/03/06').toISOString()}'),
                (4, 'La chasse au tr??sor', "Un groupe d'enfants organise une chasse au tr??sor dans leur quartier. Ils cr??ent des ??nigmes et des indices pour mener les participants au tr??sor cach??. Les enfants se divisent en ??quipes et courent ?? travers les rues, r??solvant des ??nigmes et cherchant des indices. Finalement, une ??quipe trouve le tr??sor cach??, une bo??te remplie de friandises et de petits jouets.", 6, 1, '${new Date('2023/03/06').toISOString()}', '${new Date('2023/03/06').toISOString()}');

                INSERT INTO storycategory(id, name) VALUES
                (1, 'Vie quotidienne'), 
                (2, 'Loisirs'), 
                (3, 'Aventure'), 
                (4, 'C??l??bration'), 
                (5, 'Conte'), 
                (6, 'Conte animalier');


                INSERT INTO story_storycategory(story_id, category_id) VALUES
                (1, 2), (2, 5), (3, 2), (3, 4), (4, 3);

                INSERT INTO article(id, title, author_id, summary, content, published, created_at, last_update) VALUES
                (1, "Les bienfaits de la m??ditation sur la sant?? mentale", 1, "La m??ditation peut aider ?? r??duire le stress, l'anxi??t?? et la d??pression en am??liorant la capacit?? ?? g??rer les ??motions et ?? se concentrer sur le moment pr??sent.", "La m??ditation peut aider ?? r??duire le stress, l'anxi??t?? et la d??pression en am??liorant la capacit?? ?? g??rer les ??motions et ?? se concentrer sur le moment pr??sent.", 1, "${new Date('2023/03/06').toISOString()}", "${new Date('2023/03/06').toISOString()}"),
                (2, "Comment l'intelligence artificielle est utilis??e dans les soins de sant??", 6, "L'intelligence artificielle est utilis??e dans les soins de sant?? pour aider ?? diagnostiquer les maladies, personnaliser les traitements et am??liorer la qualit?? des soins.", "L'intelligence artificielle est utilis??e dans les soins de sant?? pour aider ?? diagnostiquer les maladies, personnaliser les traitements et am??liorer la qualit?? des soins.", 1, "${new Date('2023/03/06').toISOString()}", "${new Date('2023/03/06').toISOString()}"),
                (3, "Le r??le des abeilles dans la pollinisation des cultures", 2, "Les abeilles sont essentielles ?? la pollinisation des cultures, ce qui permet de produire des aliments sains et nutritifs pour les humains et les animaux.", "Les abeilles sont essentielles ?? la pollinisation des cultures, ce qui permet de produire des aliments sains et nutritifs pour les humains et les animaux.", 1, "${new Date('2023/03/06').toISOString()}", "${new Date('2023/03/06').toISOString()}"),
                (4, "Comment la musique affecte le cerveau humain", 1, "La musique peut affecter le cerveau humain en stimulant diff??rentes r??gions, ce qui peut am??liorer l'humeur, la m??moire et la concentration.", "La musique peut affecter le cerveau humain en stimulant diff??rentes r??gions, ce qui peut am??liorer l'humeur, la m??moire et la concentration.", 1, "${new Date('2023/03/06').toISOString()}", "${new Date('2023/03/07').toISOString()}"),
                (5, "Les avantages de la culture de plantes en int??rieur", 3, "La culture de plantes en int??rieur peut am??liorer la qualit?? de l'air en ??liminant les polluants, r??duire le stress en cr??ant un environnement relaxant et am??liorer l'humeur en offrant une activit?? agr??able et apaisante.", "La culture de plantes en int??rieur peut am??liorer la qualit?? de l'air en ??liminant les polluants, r??duire le stress en cr??ant un environnement relaxant et am??liorer l'humeur en offrant une activit?? agr??able et apaisante.", 1, "${new Date('2023/03/06').toISOString()}", "${new Date('2023/03/07')}");

                INSERT INTO articlecategory(id, name) VALUES
                (1, "Sant??"),
                (2, "Bien-??tre"),
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