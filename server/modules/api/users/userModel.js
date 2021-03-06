const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = require('./userSchema');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const passportJWT = require("passport-jwt");
const jwt = require('jsonwebtoken');
const postController = require('../posts/postController');
var LocalStrategy = require('passport-local').Strategy;
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
jwtOptions.secretOrKey = 'secret';

let userModel = mongoose.model('users', userSchema);

const serializeUser = (user, expire) => {
  var payload = {
    id: user.id
  };
  var token = jwt.sign(payload, jwtOptions.secretOrKey, {
    expiresIn: expire
  });
  return token;
}

const createUser = (user, callback) => {
  userModel.create(user, (err, doc) => {
    if (err) {
      callback(err);
    } else {
      callback(null, doc);
    }
  });
};

passport.use(new LocalStrategy(
  function(username, password, done) {
    userModel.findOne({
      "username": username
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: 'Incorrect username.'
        });
      }

      bcrypt.compare(password, user.password, (err, isValid) => {
        if (err) {
          return done(err);
        }
        if (!isValid) {
          return done(null, false, {
            message: 'Incorrect password.'
          });
        }
        return done(null, user);
      });
    })
  }));

passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  userModel.findOne({
    "_id": jwt_payload.id
  }, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(null, false);
    } else {
      return next(null, user);
    }
  })
}));

const savePost = (post, userId, callback) => {
  userModel.findById(userId, (err, doc) => {
    if (err) {
      callback(err);
    } else {
      if (doc.postId.indexOf(post) == -1) {
        doc.postId.push(post);
        doc.save((err, updatedDoc) => {
          if (err) {
            callback(err);
          } else {
            callback(null, updatedDoc);
          }
        });
      } else {
        callback('already added');
      }
    }
  });
};

const deletePost = (post, userId, callback) => {
  userModel.findById(userId, (err, doc) => {
    if (err) {
      callback(err);
    } else {
      doc.postId.splice(doc.postId.indexOf(post), 1);
      doc.save((err, updatedDoc) => {
        if (err) {
          callback(err);
        } else {
          callback(null, updatedDoc);
        }
      });
    }
  });
};

const getPosts = (userId, page, callback) => {
  userModel.findById(userId, (err, doc) => {
    if (err) {
      callback(err);
    } else {
      result = [];
      favPostList = doc.postId.splice((page - 1) * 12);
      // console.log(favPostList);
      for (favPost in favPostList) {
        var post = {
          permalink_url: favPostList[favPost]
        };
        result.push(post);
      }
      callback(null, result);
    }
  });
};

const getPostsURL = (userId, callback) => {
  userModel.findById(userId, (err, doc) => {
    if (err) {
      callback(err);
    } else {
      callback(null, doc.postId);
    }
  });
};

const saveFavUrl = (url, userId, callback) => {
  userModel.findById(userId, (err, doc) => {
    if (err) {
      callback(err);
    } else {
      postController.getDataFromPageUrl(url, (data) => {
        doc.favUrls.push(data);
        doc.save((err, updatedDoc) => {
          if (err) {
            callback(err);
          } else {
            callback(null, updatedDoc);
          }
        });
      })

    }
  });
};

const getFavUrls = (userId, callback) => {
  userModel.findById(userId, (err, doc) => {
    if (err) {
      callback(err);
    } else {
      if (doc.favUrls.length != 0) {
        listData = [];
        doc.favUrls.forEach(function(data) {
          listData.push(data)
        });
        callback(listData)
      } else {
        callback(null);
      }
    }
  })
};

const deleteFavUrl = (userId, id, callback) => {
  userModel.findById(userId, (err, doc) => {
    if (err) {
      callback(err);
    } else {
      doc.favUrls.forEach(function (item) {
        if (item.id == id) {
          doc.favUrls.splice(doc.favUrls.indexOf(item), 1)
        } else {
          callback("err database");
        }
      })
      doc.save((err, updatedDoc) => {
        if (err) {
          callback(err);
        } else {
          callback(null, updatedDoc);
        }
      });
    }
  })
}

function getNameFromUrl(listUrlRaw) {
  var listPageId = [];
  listUrlRaw.forEach(function (urlRaw) {
    var urlParts = urlRaw.split("/");
    for (var i = 0; i < urlParts.length; i++) {
      if ((urlParts[i] !== "https:") && (urlParts[i] !== "") && (urlParts[i] !== "www.facebook.com") && (urlParts[i] !== "?fref=ts")) {
        listPageId.push(urlParts[i]);
      }
    };
  })
  return listPageId;
}

const updatePostsFromFavUrls = (userId, callback) => {
  userModel.findById(userId, (err, doc) => {
    if (err) {
      callback(err);
    } else {
      if(doc.favUrls.length != 0) {
        doc.postsFromFavUrls = [];
        doc.save();
        var listFavPageId = [];
        doc.favUrls.forEach(function (data) {
          listFavPageId.push(data.id);
        })
        postController.getPostsOfMultiplePagesWithinRange(listFavPageId, 7, (listData) => {
          listData.forEach(function (item) {
            doc.postsFromFavUrls.push(item.permalink_url);
          });
          doc.save((err, updatedDoc) => {
            if (err) {
              callback(err);
            } else {
              callback(null, updatedDoc);
            }
          })
        })
      } else {
        doc.postsFromFavUrls = [];
        doc.save();
        callback("list favorite urls is empty");
      }
    }
  })
}

const getPostsFromFavUrls = (userId, page, callback) => {
  userModel.findById(userId, (err, doc) => {
    if (err) {
      callback(err);
    } else {
      result = [];
      PostsFromFavUrls = doc.postsFromFavUrls.splice(12*(page-1), 12*page);
      for (favPost in PostsFromFavUrls) {
        var post = {
          permalink_url: PostsFromFavUrls[favPost]
        };
        result.push(post);
      }
      callback(null, result);
    }
  });
}

module.exports = {
  createUser,
  savePost,
  deletePost,
  getPosts,
  getPostsURL,
  saveFavUrl,
  getFavUrls,
  deleteFavUrl,
  updatePostsFromFavUrls,
  getPostsFromFavUrls,
  serializeUser
}
