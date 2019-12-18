
// Create express app
const express = require('express');
const jwt = require('jsonwebtoken');

const webapp = express();
const path = require('path');
const favicon = require('serve-favicon');
const fileupload = require('express-fileupload');
// const swaggerUi = require('swagger-ui-express');
// const YAML = require('yamljs');

// const swaggerDocument = YAML.load('./swagger.yaml');
// webapp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// webapp.use('/static', express.static(path.join(__dirname, 'public')));
// webapp.use(favicon(path.join(__dirname, '/public/assets/favicon.ico')));
webapp.use('/img', express.static(path.join(__dirname, 'public/images')));


// Help with parsing body of HTTP requests
const bodyParser = require('body-parser');
const middleware = require('./middleware');
const config = require('./config');

webapp.use(bodyParser.urlencoded({
  extended: true,
}));
webapp.use(bodyParser.json());
webapp.use(bodyParser.json(), fileupload());

// Import database
const client = require('./database.js');

// const client = new Client({
//   connectionString: 'postgres://cetgliadpfqfbs:d91cf6c81ed4369cb99d588c16132f0886a55acf9d3330cb853357cb683cf6cb@ec2-107-21-125-211.compute-1.amazonaws.com:5432/dagjg2u1mvmf8r',
//   ssl: true,
// });

// client.connect((err) => {
//   if (err) { console.log(err); } else { console.log('Connected!'); }
// });


// Server port
const port = 8080;

// Start server
webapp.listen(process.env.PORT || port, () => {
  console.log(`Server running on port:${port}`);
});


// API endpoints
webapp.get('/allimages', (req, res) => {
  console.log('READ all images');
  const query = 'select * from image_id';
  const values = [];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successful',
      data: result.rows,
    });
  });
});

webapp.get('/profile/userimg/:userid', (req, res) => {
  if (!req.params.userid) {
    res.status(400).json({ error: 'missing userid' });
    return;
  }
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }
  const query = 'select b.IMGID, b.IMGURL, b.CAPTION, b.TAG from user_image_id as a, image_id as b where a.USERID = $1 AND b.IMGID=a.IMGID';

  const values = [req.params.userid];

  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successful',
      data: result.rows,
    });
  });
});

webapp.post('/login/', (req, res) => {
  console.log('login', req.body);

  if (!req.body.name || !req.body.password) {
    res.status(400).json({ error: 'missing name or password' });
    return;
  }


  const query = 'select a.EMAIL, a.PASSWORD from account as a where a.NAME = $1 and a.PASSWORD = $2';
  const values = [req.body.name, req.body.password];


  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }
    const token = jwt.sign({ username: values[0] },
      config.secret,
      { expiresIn: '24h', // expires in 24 hours
      });

    res.json({
      status: 'Successful',
      data: result.rows,
      token,
    });
  });
});

webapp.post('/saveImage', (req, res) => {
  const fileName = req.files.myFile.name;
  const image = req.files.myFile;
  const Imagepath = `public/images/${fileName}`;
  image.mv(Imagepath, (error) => {
    if (error) {
      console.error(error);
      res.writeHead(500, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify({ status: 'error', message: error }));
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
    });
    res.end(JSON.stringify({ status: 'success', path: `/img/${fileName}` }));
  });
});

// get an image with imageID
webapp.get('/profile/images/:imageid', (req, res) => {
  if (!req.params.imageid) {
    res.status(400).json({ error: 'missing imageid' });
    return;
  }

  const query = 'select IMGURL from image_id where IMGID = $1';
  console.log(`READ all images by imageid${req.params.imageid}`);
  const values = [req.params.imageid];

  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successful',
      data: result.rows,
    });
  });
});

// post an new image
webapp.post('/profile/images/', async (req, res) => {
  if (!req.body.userid || !req.body.imgurl) {
    res.status(400).json({ error: 'missing userid or imgurl or caption' });
    return;
  }

  // create image object
  const newImage = {
    userid: req.body.userid,
    imgurl: req.body.imgurl,
    caption: req.body.text,
  };
  const tagLst = await getTaggedUser(newImage.caption);
  
  var tagged = null;
  if (tagLst.length !== 0){
    tagged = tagLst.join();
  }
  console.log('tagged:',tagged);
  // insert new Image
  const query = 'INSERT INTO image_id (IMGURL,CAPTION,TAG) VALUES ($1,$2,$3)';
  const values = [newImage.imgurl,newImage.caption,tagged];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
    }
  });


  const query2 = 'INSERT INTO user_image_id (USERID, IMGID) SELECT $1 AS USERID, COUNT(*) AS IMGID FROM image_id LIMIT 1';
  const values2 = [newImage.userid];
  client.query(query2, values2, (error, result) => {
    if (error) {
      result.status(404).json(error);
      return;
    }
    res.json({
      status: 'Successful',
      data: newImage,
    });

  });

});


webapp.post('/account/', (req, res) => {
  console.log('CREATE an account');
  if (!req.body.name || !req.body.email || !req.body.password) {
    res.status(400).json({ error: 'missing name or email or password' });
    return;
  }
  // create account object
  const newAccount = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };
    // insert newAccount
  const query = 'INSERT INTO account (name, email, password) VALUES ($1,$2,$3)';
  const values = [newAccount.name, newAccount.email, newAccount.password];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successful',
      data: newAccount,
    });
  });
});


webapp.post('/profile/', (req, res) => {
  console.log('CREATE a profile');
  if (!req.body.name || !req.body.email || !req.body.imgurl) {
    res.status(400).json({ error: 'missing name or email or imgurl' });
    return;
  }

  // create account object
  const newProfile = {
    name: req.body.name,
    email: req.body.email,
    imgurl: req.body.imgurl,
  };
    // insert newAccount
  const query = 'INSERT INTO profile (name, email, imgurl) VALUES ($1,$2,$3)';
  const values = [newProfile.name, newProfile.email, newProfile.imgurl];
  client.query(query, values, (error) => {
    if (error) {
      res.status(404).json(error);
      return;
    }
  });
  // create following object
  const follow = {
    userid: req.body.name,
    followingid: req.body.name,
  };
  const query2 = 'INSERT INTO following (USERID,FOLLOWINGID) VALUES ($1,$2)';
  const values2 = [follow.userid, follow.followingid];

  client.query(query2, values2, (error) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successfully Follow',
      data: newProfile,
    });
  });
});

webapp.get('/profile/:userid', (req, res) => {
  if (!req.params.userid) {
    res.status(400).json({ error: 'missing userid' });
    return;
  }
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }
  const query = 'select p.NAME, p.EMAIL, p.IMGURL from profile as p where p.NAME = $1';
  const values = [req.params.userid];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successful',
      data: result.rows,
    });
  });
});


// Like an image
webapp.post('/image/like', (req, res) => {
  console.log('Liked an image');
  if (!req.body.userid || !req.body.imgid) {
    res.status(400).json({ error: 'missing userid or imgid' });
    return;
  }
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }


  // create like image object
  const newLike = {
    userid: req.body.userid,
    imgid: req.body.imgid,
  };

  const query = 'INSERT INTO user_image_like (USERID,IMGID) VALUES ($1,$2)';
  const values = [newLike.userid, newLike.imgid];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }
    res.json({
      status: 'Successful',
      data: newLike,
    });
  });
});


// Unlike an image
webapp.post('/image/unlike', (req, res) => {
  console.log('unliked an image');
  if (!req.body.userid || !req.body.imgid) {
    res.status(400).json({ error: 'missing userid or imgid' });
    return;
  }
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }

  // create like image object
  const newLike = {
    userid: req.body.userid,
    imgid: req.body.imgid,
  };
  const query = 'DELETE FROM user_image_like WHERE USERID = $1 AND IMGID = $2';
  const values = [newLike.userid, newLike.imgid];

  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }
    res.json({
      status: 'Successful',
      data: newLike,
    });
  });
});

// Follow a user
webapp.post('/feeds/follow', (req, res) => {
  if (!req.body.userid || !req.body.followingid) {
    res.status(400).json({ error: 'missing userid or followingid' });
    return;
  }

  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }


  // create following object
  const follow = {
    userid: req.body.userid,
    followingid: req.body.followingid,
  };
  const query = 'INSERT INTO following (USERID,FOLLOWINGID) VALUES ($1,$2)';
  const values = [follow.userid, follow.followingid];
  console.log(`${follow.userid} followed ${follow.followingid}`);

  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successfully Follow',
      data: follow,
    });
  });
});

// Unfollow a user
webapp.post('/feeds/unfollow', (req, res) => {
  if (!req.body.userid || !req.body.followingid) {
    res.status(400).json({ error: 'missing userid or followingid' });
    return;
  }
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }


  // create unfollowing object
  const unfollow = {
    userid: req.body.userid,
    followingid: req.body.followingid,
  };
  const query = 'DELETE FROM following WHERE USERID = $1 and FOLLOWINGID = $2';
  const values = [unfollow.userid, unfollow.followingid];
  console.log(`${unfollow.userid} unfollowed ${unfollow.followingid}`);

  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successfully Unfollow',
      data: unfollow,
    });
  });
});


// FEEDS ALL IMAGES
webapp.post('/feeds/allimages', (req, res) => {
  if (!req.body.userid) {
    res.status(400).json({ error: 'missing userid' });
    return;
  }
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }
  // get user id for following query
  const feeds = {
    userid: req.body.userid,
  };

  const query = 'SELECT A.FOLLOWINGID, C.IMGID, C.IMGURL, C.CAPTION,C.TAG FROM FOLLOWING A, user_image_id B, image_id C WHERE A.USERID = $1 AND B.USERID = A.FOLLOWINGID AND B.IMGID = C.IMGID ORDER BY C.T DESC';
  const values = [feeds.userid];
  let imageIDs = [];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }
    setValue(result.rows);
  });


  async function addLike(imageIDs, i) {
    // get the like number
    const likeCount = 'SELECT COUNT(*) FROM user_image_like WHERE IMGID = $1';
    const likeValues = [imageIDs[i].imgid];
    // eslint-disable-next-line no-loop-func
    await client.query(likeCount, likeValues, (error, result2) => {
      if (error) {
        res.status(400).json(error);
        return;
      }
      // eslint-disable-next-line no-param-reassign
      imageIDs[i].like = result2.rows[0].count;
    });
  }

  async function addComment(imageIDs, i) {
    // get the COMMENT
    const commentCount = 'SELECT * FROM user_image_comment WHERE IMGID = $1 ORDER BY T DESC';
    const commentValues = [imageIDs[i].imgid];
    // eslint-disable-next-line no-loop-func
    await client.query(commentCount, commentValues, (error, result3) => {
      if (error) {
        res.status(404).json(error);
        return;
      }
      imageIDs[i].comment = result3.rows;
      if (i == imageIDs.length - 1) {
        res.json({
          status: 'Successfully Feeds',
          data: imageIDs,
        });
      }
    });
  }

  async function setValue(value) {
    imageIDs = value;
    for (let i = 0; i < imageIDs.length; i++) {
      await addLike(imageIDs, i);
      await addComment(imageIDs, i);
    }
  }
});


// delete an image
webapp.delete('/profile/images/delete', (req, res) => {
  console.log('DELETE an image');
  if (!req.body.userid || !req.body.imgid) {
    res.status(400).json({ error: 'missing userid or imgid' });
    return;
  }

  const deleteImage = {
    userid: req.body.userid,
    imgid: req.body.imgid,
  };

  const query = 'DELETE FROM image_id WHERE IMGID = $1';
  const values = [deleteImage.imgid];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successful',
      data: deleteImage,
    });
  });
});

//const immediatePromise = () => new Promise((resolve) => setImmediate(resolve));
const timeoutPromise = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

async function getTaggedUser(str) {
  const tagLst = [];
  let idx = str.indexOf('@');
  let length = 0;
  let end = 0;
  while (idx !== -1 && end !== -1) {
    await timeoutPromise(80);
    // await immediatePromise;

    end = str.indexOf(' ');

    const word = str.substring(idx + 1, end);
    const query2 = 'SELECT COUNT(*) FROM PROFILE WHERE NAME = $1';
    const values2 = [word];

    client.query(query2, values2, (error, result) => {
      if (result.rows[0].count === '1') {
        // value = [idx + length, end + length];
        tagLst.push(word);
      }
    });

    var str = str.substring(end + 1, str.length);
    await timeoutPromise(80);
    length += end + 1;
    idx = str.indexOf('@');
  }

  return tagLst;
}
// Post comment
webapp.post('/profile/images/comment', async (req, res) => {
  console.log('Comment on an image');
  if (!req.body.userid || !req.body.imgid || !req.body.comment) {
    res.status(400).json({ error: 'missing userid or imgid or comment' });
    return;
  }
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }
  // create Comment image object
  const newComment = {
    userid: req.body.userid,
    imgid: req.body.imgid,
    comment: req.body.comment,
  };
   // check tagged profile
  const tagLst = await getTaggedUser(newComment.comment);
  var tagged = null;
  if (tagLst.length !== 0){
    tagged = tagLst.join();
  }
  // insert new Image
  const query = 'INSERT INTO user_image_comment (USERID,IMGID,COMMENT,TAG) VALUES ($1,$2,$3,$4)';
  const values = [newComment.userid, newComment.imgid, newComment.comment,tagged];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
    }
    res.json({
      status: 'Successful',
      data: newComment,

  });

  });
 
  console.log(tagged);

});


// DELETE comment
webapp.post('/image/uncomment', (req, res) => {
  console.log('delete a comment');
  if (!req.body.commentid) {
    res.status(400).json({ error: 'missing userid or imgid or comment' });
    return;
  }
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }

  // create Comment image object
  const deleteComment = {
    commentid: req.body.commentid,
  };
  const query = 'DELETE FROM user_image_comment WHERE COMMENTID = $1';
  const values = [deleteComment.commentid];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successfully delete comment',
      data: deleteComment,
    });
  });
});

webapp.post('/profile/checkfollow', (req, res) => {
  if (!req.body.userid || !req.body.followingid) {
    res.status(400).json({ error: 'missing userid or followingid' });
    return;
  }
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }

  const args = {
  	userid: req.body.userid,
  	followingid: req.body.followingid,
  };
  const query = 'select COUNT(*) FROM following WHERE USERID = $1 AND FOLLOWINGID = $2';
  const values = [args.userid, args.followingid];

  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }
    res.json({
      status: 'Successful',
      data: result.rows,
    });
  });
});

webapp.post('/image/checklike', (req, res) => {
  if (!req.body.userid || !req.body.imgid) {
    res.status(400).json({ error: 'missing userid or imgid' });
    return;
  }
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }


  // create like image object
  const checkLike = {
    userid: req.body.userid,
    imgid: req.body.imgid,
  };
  const query = 'SELECT COUNT(*) FROM user_image_like WHERE USERID = $1 AND IMGID = $2';
  const values = [checkLike.userid, checkLike.imgid];

  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }
    res.json({
      status: 'Successful',
      data: result.rows,
    });
  });
});


webapp.get('/recommend/:userid', (req, res) => {
  console.log('recommend friends!');
  if (!req.params.userid) {
    res.status(400).json({ error: 'missing userid' });
    return;
  }
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }
  // const query = 'SELECT DISTINCT B.FOLLOWINGID FROM FOLLOWING A, FOLLOWING B WHERE A.USERID = $1 AND A.FOLLOWINGID = B.USERID AND B.FOLLOWINGID NOT IN (SELECT FOLLOWINGID FROM FOLLOWING WHERE USERID = $1)';
  const query = 'SELECT DISTINCT B.NAME as FOLLOWINGID FROM FOLLOWING A, PROFILE B WHERE B.NAME NOT IN (SELECT FOLLOWINGID FROM FOLLOWING WHERE USERID = $1)';
  const values = [req.params.userid];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }
    res.json({
      status: 'Successful',
      data: result.rows,
    });
  });
});

webapp.post('/successLogin', (req, res) => {
  if (middleware.checkToken(req) === false) {
    res.status(404).json('token validation falied');
    return;
  }


  if (!req.body.userid) {
    res.status(400).json({ error: 'missing userid' });
    return;
  }
  const query = 'UPDATE PROFILE SET FAILEDCOUNT = 0 WHERE NAME = $1';
  const values = [req.body.userid];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successful',
      data: result.rows,
    });
  });
});

webapp.post('/failedLogin', (req, res) => {
  console.log('failedLogin');

  if (!req.body.userid) {
    res.status(400).json({ error: 'missing userid' });
    return;
  }
  const query = 'UPDATE PROFILE SET FAILEDCOUNT = FAILEDCOUNT + 1 WHERE NAME = $1';
  const values = [req.body.userid];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successful',
      data: result.rows,
    });
  });
});

webapp.post('/checkLockout', (req, res) => {
  console.log('checkout lockout');

  if (!req.body.userid) {
    res.status(400).json({ error: 'missing userid' });
    return;
  }
  const query = 'SELECT failedcount FROM PROFILE WHERE NAME = $1';
  const values = [req.body.userid];
  client.query(query, values, (error, result) => {
    if (error) {
      res.status(404).json(error);
      return;
    }

    res.json({
      status: 'Successful',
      data: result.rows,
    });
  });
});

// Default response for any other request
webapp.use((_req, res) => {
  res.status(404);
});
module.exports = webapp;
