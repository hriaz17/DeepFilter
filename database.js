const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://cetgliadpfqfbs:d91cf6c81ed4369cb99d588c16132f0886a55acf9d3330cb853357cb683cf6cb@ec2-107-21-125-211.compute-1.amazonaws.com:5432/dagjg2u1mvmf8r',
  ssl: true,
});

client.connect((err) => {
  if (err) { console.log(err); } else { console.log('Connected!'); }
});
client.query(`
  DROP TABLE IF EXISTS following;
  DROP TABLE IF EXISTS user_image_id;
  DROP TABLE IF EXISTS user_image_like;
  DROP TABLE IF EXISTS user_image_comment;
  DROP TABLE IF EXISTS image_id;
  DROP TABLE IF EXISTS account;
  DROP TABLE IF EXISTS profile;
  
  CREATE TABLE IF NOT EXISTS profile (
    NAME char(20),
    EMAIL char(200),
    IMGURL TEXT NOT NULL,
    FAILEDCOUNT INTEGER DEFAULT 0,
    PRIMARY KEY (NAME)
);

  INSERT INTO profile (NAME, EMAIL, IMGURL) VALUES ('keqin', 'keqinzh@seas.upenn.edu', 'http://tigernewspaper.com/wp-content/uploads/2015/07/minions.jpg');
  INSERT INTO profile (NAME, EMAIL, IMGURL) VALUES ('kexin', 'kexin@seas.upenn.edu', 'http://tigernewspaper.com/wp-content/uploads/2015/07/minions.jpg');
  INSERT INTO profile (NAME, EMAIL, IMGURL) VALUES ('tianshuang', 'tianshuang@seas.upenn.edu', 'https://vignette.wikia.nocookie.net/vsbattles/images/3/37/Doraemon_renderImproved.png/revision/latest?cb=20190730170109');
  INSERT INTO profile (NAME, EMAIL, IMGURL) VALUES ('slowpoke', 'slowpoke@poke.com', 'http://res.pokemon.name/common/pokemon/pgl/079.00.png');

  CREATE TABLE IF NOT EXISTS image_id(
    IMGURL TEXT NOT NULL,
    T TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CAPTION char(200),
    TAG char(200),
    IMGID SERIAL PRIMARY KEY
  );
  CREATE TABLE IF NOT EXISTS user_image_id(
    USERID char(20),
    IMGID INTEGER,
    PRIVACY BOOLEAN DEFAULT 'f',
    PRIMARY KEY (USERID, IMGID),
    FOREIGN KEY(IMGID) REFERENCES image_id(IMGID) ON DELETE CASCADE,
    FOREIGN KEY(USERID) REFERENCES profile(NAME) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS user_image_like(
    USERID char(20),
    IMGID INTEGER,
    PRIMARY KEY (USERID, IMGID),
    FOREIGN KEY(IMGID) REFERENCES image_id(IMGID) ON DELETE CASCADE,
    FOREIGN KEY(USERID) REFERENCES profile(NAME) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS user_image_comment(
    COMMENTID SERIAL PRIMARY KEY,
    USERID char(20),
    IMGID INTEGER,
    COMMENT TEXT,
    TAG char(200),
    T TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(IMGID) REFERENCES image_id(IMGID) ON DELETE CASCADE,
    FOREIGN KEY(USERID) REFERENCES profile(NAME) ON DELETE CASCADE
  );

  INSERT INTO image_id (IMGURL) VALUES ('http://www.destinationwakefield.com/wp-content/uploads/2016/01/minions-selfie.jpg');
  INSERT INTO user_image_id (USERID, IMGID) VALUES ('kexin',1);
  INSERT INTO image_id (IMGURL) VALUES ('http://tigernewspaper.com/wp-content/uploads/2015/07/minions.jpg');
  INSERT INTO user_image_id (USERID, IMGID) VALUES ('kexin',2);
  
  INSERT INTO image_id (IMGURL) VALUES ('https://live.staticflickr.com/2032/2260981662_c49c549b4e_z.jpg');
  INSERT INTO user_image_id (USERID, IMGID) VALUES ('tianshuang',3);
  INSERT INTO image_id (IMGURL) VALUES ('https://www.thewrap.com/wp-content/uploads/2018/05/Cristiano-Ronaldo.jpg');
  INSERT INTO user_image_id (USERID, IMGID) VALUES ('tianshuang',4);
  INSERT INTO image_id (IMGURL) VALUES ('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLejh-oC_0M30HuBj_xFA4zJsJmKcq5JoXSS7ApJRUpatgffFY&s');
  INSERT INTO user_image_id (USERID, IMGID) VALUES ('tianshuang',5);

  INSERT INTO image_id (IMGURL) VALUES ('http://5b0988e595225.cdn.sohucs.com/images/20190716/10f9645350ff4f62af7c54bed6fd7067.jpeg');
  INSERT INTO user_image_id (USERID, IMGID) VALUES ('slowpoke',6);
  INSERT INTO image_id (IMGURL) VALUES ('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfVd6qs0nMDZffETh5h3HOWoLzm8k8U7xQtyhHvNyIhejeYXyL&s');
  INSERT INTO user_image_id (USERID, IMGID) VALUES ('slowpoke',7);

  INSERT INTO image_id (IMGURL) VALUES ('https://static.comicvine.com/uploads/scale_small/11/114183/6665931-bart.png');
  INSERT INTO user_image_id (USERID, IMGID) VALUES ('tianshuang',8);
  INSERT INTO image_id (IMGURL) VALUES ('https://live.staticflickr.com/4306/35144178473_ed304b8d41_b.jpg');
  INSERT INTO user_image_id (USERID, IMGID) VALUES ('tianshuang',9);
  INSERT INTO image_id (IMGURL) VALUES ('https://yt3.ggpht.com/a/AGF-l7_ugmpR28XL6hsdlparkfWMqpVCGPR37Jd2GQ=s900-c-k-c0xffffffff-no-rj-mo');
  INSERT INTO user_image_id (USERID, IMGID) VALUES ('tianshuang',10);
  
  INSERT INTO user_image_like (USERID, IMGID) VALUES ('tianshuang',2);
  INSERT INTO user_image_like (USERID, IMGID) VALUES ('keqin',2);
  INSERT INTO user_image_like (USERID, IMGID) VALUES ('keqin',3);
  INSERT INTO user_image_like (USERID, IMGID) VALUES ('slowpoke',3);
  INSERT INTO user_image_like (USERID, IMGID) VALUES ('kexin',3);

  INSERT INTO user_image_comment(USERID,IMGID,COMMENT) VALUES ('tianshuang',2,'cute!');
  INSERT INTO user_image_comment(USERID,IMGID,COMMENT) VALUES ('kexin',3,'wow!');
  INSERT INTO user_image_comment(USERID,IMGID,COMMENT) VALUES ('keqin',3,'nice!');

  CREATE TABLE IF NOT EXISTS account(
      NAME char(20),
      EMAIL char(200),
      PASSWORD char(200),
      PRIMARY KEY (NAME),
      FOREIGN KEY(NAME) REFERENCES profile(NAME) ON DELETE CASCADE
      );

  INSERT INTO account (NAME, EMAIL, PASSWORD) VALUES ('keqin', 'keqinzh@seas.upenn.edu', 'password1');
  INSERT INTO account (NAME, EMAIL, PASSWORD) VALUES ('kexin', 'kexin@seas.upenn.edu', 'password2');
  INSERT INTO account (NAME, EMAIL, PASSWORD) VALUES ('tianshuang', 'tianshuang@seas.upenn.edu', 'password3');
  INSERT INTO account (NAME, EMAIL, PASSWORD) VALUES ('slowpoke', 'slowpoke@poke.com', 'password4');

  CREATE TABLE IF NOT EXISTS following(
    USERID char(20),
    FOLLOWINGID char(20),
    PRIMARY KEY (USERID, FOLLOWINGID),
    FOREIGN KEY(USERID) REFERENCES profile(NAME) ON DELETE CASCADE,
    FOREIGN KEY(FOLLOWINGID) REFERENCES profile(NAME) ON DELETE CASCADE
    );

  INSERT INTO following (USERID,FOLLOWINGID) VALUES ('keqin', 'kexin');
  INSERT INTO following (USERID,FOLLOWINGID) VALUES ('keqin', 'tianshuang');
  INSERT INTO following (USERID,FOLLOWINGID) VALUES ('kexin', 'keqin');
  INSERT INTO following (USERID,FOLLOWINGID) VALUES ('tianshuang','kexin');
  INSERT INTO following (USERID,FOLLOWINGID) VALUES ('tianshuang','keqin');
  INSERT INTO following (USERID,FOLLOWINGID) VALUES ('slowpoke', 'tianshuang');
  
  INSERT INTO following (USERID,FOLLOWINGID) VALUES ('keqin', 'keqin');
  INSERT INTO following (USERID,FOLLOWINGID) VALUES ('kexin', 'kexin');
  INSERT INTO following (USERID,FOLLOWINGID) VALUES ('tianshuang', 'tianshuang');
  INSERT INTO following (USERID,FOLLOWINGID) VALUES ('slowpoke', 'slowpoke');
  

`, (err, res) => {
  if (err) {
    console.log('error');
    throw err; 
}

  // client.end();
});
console.log('create tables successfully!');
module.exports = client;
