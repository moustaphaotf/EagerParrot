-- ---------------------------------------------------------------------------------------------
-- Date : 10/03/2023 05:00:00
--
-- Fichier SQL de la base de données EagerParrot
-- Quelques données de test sont fournies
-- Cette base de donées permet la gestion d'une plateforme de lecture en ligne et d'information.
--
-- ---------------------------------------------------------------------------------------------
-- Information sur la base de données
--
-- Tables : 15
-- Nom des tables : 
-- user, socialization, article, story, asset, chapter, articlecategory, 
-- storycategory, comment, article_articlecategory, story_storycategory, view, review, report, 
-- history
-- ---------------------------------------------------------------------------------------------
--
-- ---------------------------------------------------------------------------------------------
-- Informations sur l'auteur
-- 
-- Nom complet : Mamadou Moustapha Diallo
-- Email : moustaphaotf@gmail.com
-- Phone : +224 625 126 703
-- ---------------------------------------------------------------------------------------------

BEGIN TRANSACTION;

-- Création des tables

CREATE TABLE user(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    registered_at TEXT NOT NULL,
    active INTEGER,
    activating_code TEXT,
    role INTEGER
);

CREATE TABLE socialization(
    user_id INTEGER NOT NULL,
    followee_id INTEGER NOT NULL,
    date_from TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (followee_id) REFERENCES user(id),
    PRIMARY KEY (user_id, followee_id)
);

CREATE TABLE article(
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

CREATE TABLE story(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    summary TEXT,
    published INTEGER,
    created_at TEXT NOT NULL,
    last_update TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    FOREIGN KEY (author_id) REFERENCES user(id)
);

CREATE TABLE asset(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    article_id INTEGER NOT NULL,
    FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE
);

CREATE TABLE chapter(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published INTEGER,
    created_at TEXT NOT NULL,
    last_update TEXT NOT NULL,
    story_id INTEGER NOT NULL,
    FOREIGN KEY (story_id) REFERENCES story(id)
);

CREATE TABLE articlecategory(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE storycategory(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE comment(
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

CREATE TABLE article_articlecategory(
    category_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    FOREIGN KEY(category_id) REFERENCES articlecategory(id),
    FOREIGN KEY(article_id) REFERENCES article(id),
    PRIMARY KEY(category_id, article_id)
);

CREATE TABLE story_storycategory(
    category_id INTEGER NOT NULL,
    story_id INTEGER NOT NULL,
    FOREIGN KEY(category_id) REFERENCES storycategory(id),
    FOREIGN KEY(story_id) REFERENCES story(id) ON DELETE CASCADE,
    PRIMARY KEY(category_id, story_id)
);

CREATE TABLE view(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    chapter_id INTEGER,
    article_id INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (article_id) REFERENCES article(id),
    FOREIGN KEY (chapter_id) REFERENCES chapter(id)
);

CREATE TABLE review(
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

CREATE TABLE report(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    chapter_id INTEGER,
    comment_id INTEGER,
    story_id INTEGER,
    about TEXT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES user(id),
    FOREIGN KEY (chapter_id) REFERENCES chapter(id),
    FOREIGN KEY (comment_id) REFERENCES comment(id),
    FOREIGN KEY (story_id) REFERENCES story(id)
);

CREATE TABLE history(
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


-- Insertion des données

INSERT INTO user VALUES(1,'amadou@gmail.com','amadou','amadou12','Amadou Alimou','Bah','2023-03-05T23:00:00.000Z',0,NULL,'USER');
INSERT INTO user VALUES(2,'fatima@gmail.com','fatima','fatima23','Fatoumata','Sow','2023-03-05T23:00:00.000Z',0,NULL,'USER');
INSERT INTO user VALUES(3,'oumarou@gmail.com','omran','oumarou45','Alpha Oumar','Bah','2023-03-04T23:00:00.000Z',0,NULL,'USER');
INSERT INTO user VALUES(4,'hawa12@gmail.com','hawa','hawa8x','Hawa','Diallo','2023-03-05T23:00:00.000Z',0,NULL,'USER');
INSERT INTO user VALUES(5,'sumptring@gmail.com','sumptring','111xxI7','Mamadou Moustapha','Diallo','2023-03-05T23:00:00.000Z',0,NULL,'USER');
INSERT INTO user VALUES(6,'aboubakr@gmail.com','aboubakr','aboubakr11x','Aboubakr','Conté','2023-03-05T23:00:00.000Z',0,NULL,'USER');


INSERT INTO socialization VALUES(1,2,'2023-03-05T23:00:00.000Z');
INSERT INTO socialization VALUES(2,3,'2023-03-05T23:00:00.000Z');
INSERT INTO socialization VALUES(1,6,'2023-03-05T23:00:00.000Z');
INSERT INTO socialization VALUES(2,1,'2023-03-05T23:00:00.000Z');
INSERT INTO socialization VALUES(6,2,'2023-03-05T23:00:00.000Z');
INSERT INTO socialization VALUES(6,1,'2023-03-05T23:00:00.000Z');


INSERT INTO article VALUES(1,'Les bienfaits de la méditation sur la santé mentale','La méditation peut aider à réduire le stress, l''anxiété et la dépression en améliorant la capacité à gérer les émotions et à se concentrer sur le moment présent.','La méditation peut aider à réduire le stress, l''anxiété et la dépression en améliorant la capacité à gérer les émotions et à se concentrer sur le moment présent.',1,'2023-03-05T23:00:00.000Z','2023-03-05T23:00:00.000Z',0);
INSERT INTO article VALUES(2,'Comment l''intelligence artificielle est utilisée dans les soins de santé','L''intelligence artificielle est utilisée dans les soins de santé pour aider à diagnostiquer les maladies, personnaliser les traitements et améliorer la qualité des soins.','L''intelligence artificielle est utilisée dans les soins de santé pour aider à diagnostiquer les maladies, personnaliser les traitements et améliorer la qualité des soins.',0,'2023-03-05T23:00:00.000Z','2023-03-09T18:39:39.802Z',6);
INSERT INTO article VALUES(3,'Le rôle des abeilles dans la pollinisation des cultures','Les abeilles sont essentielles à la pollinisation des cultures, ce qui permet de produire des aliments sains et nutritifs pour les humains et les animaux.','Les abeilles sont essentielles à la pollinisation des cultures, ce qui permet de produire des aliments sains et nutritifs pour les humains et les animaux.',0,'2023-03-05T23:00:00.000Z','2023-03-05T23:00:00.000Z',2);
INSERT INTO article VALUES(4,'Comment la musique affecte le cerveau humain','La musique peut affecter le cerveau humain en stimulant différentes régions, ce qui peut améliorer l''humeur, la mémoire et la concentration.','La musique peut affecter le cerveau humain en stimulant différentes régions, ce qui peut améliorer l''humeur, la mémoire et la concentration.',0,'2023-03-05T23:00:00.000Z','2023-03-09T07:11:32.970Z',1);
INSERT INTO article VALUES(5,'Les avantages de la culture de plantes en intérieur','La culture de plantes en intérieur peut améliorer la qualité de l''air en éliminant les polluants, réduire le stress en créant un environnement relaxant et améliorer l''humeur en offrant une activité agréable et apaisante.','La culture de plantes en intérieur peut améliorer la qualité de l''air en éliminant les polluants, réduire le stress en créant un environnement relaxant et améliorer l''humeur en offrant une activité agréable et apaisante.',1,'2023-03-05T23:00:00.000Z','2023-03-06T23:00:00.000Z',3);
INSERT INTO article VALUES(6,'Un nouvel article !','Un résumé de ma journée du mardi 8 mars',replace(replace('Alors je commencerais par assumer le fait que ces derniers jours, je n''ai pas vraiment été trop actif. je ne saurait trop expliquer pourquoi.\r\nAujourd''hui, c''est un Mardi, aujourd''hui, j''ai eu une journée assez basique mais je dirais que c''est une journée comme je les aime.\r\nTout d''abord, le matin, quand je me suis levé, je me suis apprêté pour partir à Télico bien évidemment après la prière et quelques activités... Je ne sais quoi !\r\nPrimo c''était pour une réunion d''urgence du CDE et ensuite pour le cours. Et finalement pour la conférence de la ministre.','\r',char(13)),'\n',char(10)),0,'2023-03-08T10:18:46.826Z','2023-03-10T04:21:05.876Z',1);


INSERT INTO story VALUES(1,'La journée à la plage','Une famille passe une journée à la plage. Ils apportent des serviettes, des chaises, des parasols et des jouets pour enfants. Les enfants s''amusent à construire des châteaux de sable et à nager dans l''océan, tandis que les parents se détendent sur les chaises longues. Après un déjeuner de pique-nique, la famille prend une longue promenade sur la plage avant de retourner à la maison.',1,'2023-03-05T23:00:00.000Z','2023-03-05T23:00:00.000Z',1);
INSERT INTO story VALUES(2,'Le chat et la souris','Un chat affamé poursuit une souris à travers la maison. La souris évite de justesse le chat à plusieurs reprises jusqu''à ce qu''elle trouve refuge derrière un placard. Le chat rôde autour du placard, mais ne peut pas atteindre la souris. Finalement, le chat s''endort devant le placard et la souris s''échappe.',1,'2023-03-05T23:00:00.000Z','2023-03-05T23:00:00.000Z',2);
INSERT INTO story VALUES(3,'La fête surprise','Un groupe d''amis organise une fête surprise pour l''anniversaire d''un ami commun. Ils préparent une décoration colorée, de la nourriture et des boissons pour la fête. Lorsque l''ami arrive, il est étonné de voir tous ses amis présents pour célébrer son anniversaire. Ils passent une soirée agréable à discuter, à rire et à manger ensemble. À la fin de la soirée, l''ami remercie tout le monde pour cette surprise incroyable et promet de faire une fête encore plus grande l''année suivante.',1,'2023-03-05T23:00:00.000Z','2023-03-05T23:00:00.000Z',2);
INSERT INTO story VALUES(4,'La chasse au trésor','Un groupe d''enfants organise une chasse au trésor dans leur quartier. Ils créent des énigmes et des indices pour mener les participants au trésor caché. Les enfants se divisent en équipes et courent à travers les rues, résolvant des énigmes et cherchant des indices. Finalement, une équipe trouve le trésor caché, une boîte remplie de friandises et de petits jouets.',1,'2023-03-05T23:00:00.000Z','2023-03-05T23:00:00.000Z',6);


INSERT INTO articlecategory VALUES(1,'Santé');
INSERT INTO articlecategory VALUES(2,'Bien-être');
INSERT INTO articlecategory VALUES(3,'Technologie');
INSERT INTO articlecategory VALUES(4,'Environnement');
INSERT INTO articlecategory VALUES(5,'Agriculture');
INSERT INTO articlecategory VALUES(6,'Science');
INSERT INTO articlecategory VALUES(7,'Psychologie');
INSERT INTO articlecategory VALUES(8,'Jardinage');


INSERT INTO storycategory VALUES(1,'Vie quotidienne');
INSERT INTO storycategory VALUES(2,'Loisirs');
INSERT INTO storycategory VALUES(3,'Aventure');
INSERT INTO storycategory VALUES(4,'Célébration');
INSERT INTO storycategory VALUES(5,'Conte');
INSERT INTO storycategory VALUES(6,'Conte animalier');


INSERT INTO comment VALUES(1,'2023-03-09T05:50:29.213Z','Hello world !',1,10,NULL);
INSERT INTO comment VALUES(2,'2023-03-09T06:17:43.607Z','Hello joli monde !',2,10,NULL);
INSERT INTO comment VALUES(3,'2023-03-09T18:27:27.359Z','Je suis un premier commentaire',1,6,NULL);
INSERT INTO comment VALUES(4,'2023-03-09T18:34:06.495Z','Et moi alors ? Salut ici !',6,6,NULL);
INSERT INTO comment VALUES(5,'2023-03-09T18:34:31.216Z','Salut jeune homme comment vas-tu ?',6,6,NULL);
INSERT INTO comment VALUES(6,'2023-03-09T18:34:52.201Z','Je vais super bien et toi ?',1,6,NULL);
INSERT INTO comment VALUES(7,'2023-03-09T18:48:59.036Z','Hummm',1,11,NULL);


INSERT INTO article_articlecategory VALUES(1,1);
INSERT INTO article_articlecategory VALUES(2,1);
INSERT INTO article_articlecategory VALUES(3,2);
INSERT INTO article_articlecategory VALUES(2,2);
INSERT INTO article_articlecategory VALUES(4,3);
INSERT INTO article_articlecategory VALUES(5,3);
INSERT INTO article_articlecategory VALUES(6,4);
INSERT INTO article_articlecategory VALUES(7,4);
INSERT INTO article_articlecategory VALUES(8,5);
INSERT INTO article_articlecategory VALUES(2,5);


INSERT INTO story_storycategory VALUES(2,1);
INSERT INTO story_storycategory VALUES(5,2);
INSERT INTO story_storycategory VALUES(2,3);
INSERT INTO story_storycategory VALUES(4,3);
INSERT INTO story_storycategory VALUES(3,4);


INSERT INTO "view" VALUES(18,2,NULL,3,'2023-03-08T13:18:12.925Z');
INSERT INTO "view" VALUES(19,1,NULL,11,'2023-03-08T13:20:05.866Z');
INSERT INTO "view" VALUES(20,1,NULL,10,'2023-03-08T14:28:28.389Z');
INSERT INTO "view" VALUES(21,1,NULL,9,'2023-03-08T14:28:49.576Z');
INSERT INTO "view" VALUES(22,1,NULL,8,'2023-03-08T14:38:20.901Z');
INSERT INTO "view" VALUES(23,1,NULL,7,'2023-03-08T15:36:55.348Z');
INSERT INTO "view" VALUES(24,6,NULL,2,'2023-03-08T17:06:19.592Z');
INSERT INTO "view" VALUES(25,1,NULL,4,'2023-03-08T17:22:18.912Z');
INSERT INTO "view" VALUES(26,6,NULL,10,'2023-03-09T05:09:30.788Z');
INSERT INTO "view" VALUES(27,6,NULL,5,'2023-03-09T05:10:42.484Z');
INSERT INTO "view" VALUES(28,6,NULL,4,'2023-03-09T05:14:16.625Z');
INSERT INTO "view" VALUES(29,2,NULL,5,'2023-03-09T06:17:05.040Z');
INSERT INTO "view" VALUES(30,2,NULL,4,'2023-03-09T06:17:17.131Z');
INSERT INTO "view" VALUES(31,2,NULL,10,'2023-03-09T06:17:25.381Z');
INSERT INTO "view" VALUES(32,1,NULL,2,'2023-03-09T16:35:39.049Z');
INSERT INTO "view" VALUES(33,1,NULL,6,'2023-03-09T18:27:12.436Z');
INSERT INTO "view" VALUES(34,6,NULL,6,'2023-03-09T18:29:24.199Z');
INSERT INTO "view" VALUES(35,6,NULL,7,'2023-03-09T18:33:39.787Z');


INSERT INTO history VALUES(1,'Création d''un nouveau article','2023-03-08T10:47:53.957Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(2,'Mise en privé d''un article.','2023-03-08T16:06:21.253Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(3,'Mise en privé d''un article.','2023-03-08T16:10:35.158Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(4,'Mise en public d''un article.','2023-03-08T16:11:17.357Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(5,'Mise en public d''un article.','2023-03-08T16:11:17.713Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(6,'Mise en privé d''un article.','2023-03-08T16:11:47.092Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(7,'Mise en privé d''un article.','2023-03-08T17:19:44.803Z',NULL,NULL,NULL,2,NULL,6,NULL);
INSERT INTO history VALUES(8,'Mise en public d''un article.','2023-03-08T17:19:49.422Z',NULL,NULL,NULL,2,NULL,6,NULL);
INSERT INTO history VALUES(9,'Mise en privé d''un article.','2023-03-08T17:19:50.758Z',NULL,NULL,NULL,2,NULL,6,NULL);
INSERT INTO history VALUES(10,'Mise en public d''un article.','2023-03-09T05:07:44.238Z',NULL,NULL,NULL,4,NULL,1,NULL);
INSERT INTO history VALUES(11,'Commentaire d''un article.','2023-03-09T05:50:29.213Z',NULL,NULL,1,10,NULL,1,NULL);
INSERT INTO history VALUES(12,'Commentaire d''un article.','2023-03-09T06:17:43.607Z',NULL,NULL,2,10,NULL,2,NULL);
INSERT INTO history VALUES(13,'Mise en privé d''un article.','2023-03-09T07:03:08.325Z',NULL,NULL,NULL,10,NULL,1,NULL);
INSERT INTO history VALUES(14,'Mise en privé d''un article.','2023-03-09T07:11:33.091Z',NULL,NULL,NULL,4,NULL,1,NULL);
INSERT INTO history VALUES(15,'Mise en public d''un article.','2023-03-09T07:12:06.963Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(16,'Mise en privé d''un article.','2023-03-09T07:13:50.730Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(17,'Mise en public d''un article.','2023-03-09T07:14:18.495Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(18,'Mise en privé d''un article.','2023-03-09T07:15:45.087Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(19,'Mise en public d''un article.','2023-03-09T07:15:47.687Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(20,'Mise en privé d''un article.','2023-03-09T07:26:18.962Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(21,'Mise en public d''un article.','2023-03-09T08:08:54.365Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(22,'Mise en privé d''un article.','2023-03-09T08:08:56.798Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(23,'Mise en privé d''un article.','2023-03-09T08:08:57.030Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(24,'Mise en public d''un article.','2023-03-09T08:08:58.550Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(25,'Mise en privé d''un article.','2023-03-09T08:09:01.931Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(26,'Mise en public d''un article.','2023-03-09T08:09:04.357Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(27,'Mise en public d''un article.','2023-03-09T15:45:30.184Z',NULL,NULL,NULL,10,NULL,1,NULL);
INSERT INTO history VALUES(28,'Commentaire d''un article.','2023-03-09T18:27:27.359Z',NULL,NULL,3,6,NULL,1,NULL);
INSERT INTO history VALUES(29,'Mise en public d''un article.','2023-03-09T18:28:43.513Z',NULL,NULL,NULL,6,NULL,1,NULL);
INSERT INTO history VALUES(30,'Commentaire d''un article.','2023-03-09T18:34:06.495Z',NULL,NULL,4,6,NULL,6,NULL);
INSERT INTO history VALUES(31,'Commentaire d''un article.','2023-03-09T18:34:31.216Z',NULL,NULL,5,6,NULL,6,NULL);
INSERT INTO history VALUES(32,'Commentaire d''un article.','2023-03-09T18:34:52.201Z',NULL,NULL,6,6,NULL,1,NULL);
INSERT INTO history VALUES(33,'Mise en privé d''un article.','2023-03-09T18:37:04.068Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(34,'Mise en privé d''un article.','2023-03-09T18:37:16.330Z',NULL,NULL,NULL,10,NULL,1,NULL);
INSERT INTO history VALUES(35,'Mise en privé d''un article.','2023-03-09T18:37:22.759Z',NULL,NULL,NULL,6,NULL,1,NULL);
INSERT INTO history VALUES(36,'Mise en privé d''un article.','2023-03-09T18:39:39.960Z',NULL,NULL,NULL,2,NULL,6,NULL);
INSERT INTO history VALUES(37,'Mise en public d''un article.','2023-03-09T18:47:31.895Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(38,'Mise en privé d''un article.','2023-03-09T18:47:36.135Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(39,'Mise en public d''un article.','2023-03-09T18:48:48.739Z',NULL,NULL,NULL,11,NULL,1,NULL);
INSERT INTO history VALUES(40,'Commentaire d''un article.','2023-03-09T18:48:59.036Z',NULL,NULL,7,11,NULL,1,NULL);


COMMIT;