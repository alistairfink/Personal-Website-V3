let express = require('express');
let app = express();
let bodyParser = require('body-parser');
var cors = require('cors');
app.use(cors());

var url  = 'mongodb://localhost:27017/';
var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8081;

var router = express.Router();
var apiKey = '';
var dbName = '';
var collections = {
  about: 'About',
  portfolio: 'Portfolio',
  experience: 'Experience',
  education: 'Education'
};

MongoClient.connect("mongodb://localhost:27017/", function(err, database) {
	if (!err) console.log("connected");
	let db = database.db(dbName);

  router.all('*', cors());

  router.route('/GetAbout')
	.get(function(req, res) {
      db.collection(collections.about).find({}).toArray(function(err, result) {
          if (err) throw err;
        res.json(result[0]);
      });
  });
  router.route('/GetPortfolioList')
  	.get(function(req, res) {
      db.collection(collections.portfolio).find({}).toArray(function(err, result) {
        if (err) throw err;
        let itemList = [];
        for(let i = 0; i < result.length; i++)
        {
          let tempObj = {
            name: result[i].name,
            dspImg: result[i].dspImg,
            year: result[i].year,
            _id: result[i]._id
          };
          itemList.push(tempObj);
        }
        res.json(itemList);
      });
  	});
  router.route('/GetPortfolioItem')
  	.post(function(req, res) {
      let itemId = new mongo.ObjectId(req.body._id);
      db.collection(collections.portfolio).find({_id: itemId}).toArray(function(err, result) {
        if (err) throw err;
        if(result[0])
        {
          res.json(result[0]);
        }
        else
          res.json({error: "Item not found"});
      });
  	});
  router.route('/GetExperience')
  	.get(function(req, res) {
      db.collection(collections.experience).find({}).toArray(function(err, result) {
        if (err) throw err;
        res.json(result);
      });
  	});
  router.route('/GetEducation')
  	.get(function(req, res) {
      db.collection(collections.education).find({}).toArray(function(err, result) {
        if (err) throw err;
        res.json(result);
      });
  	});

  router.route('/AddPortfolio')
  	.post(function(req, res) {
      let callKey = req.body.apiKey;
      if(callKey === apiKey)
      {
        let tempObj = {
          name: req.body.name,
          dspImg: req.body.dspImg,
          desc: Array.isArray(req.body.desc) ? req.body.desc : null,
          images: Array.isArray(req.body.images) ? req.body.images : null,
          videos: Array.isArray(req.body.videos) ? req.body.videos : null,
          year: req.body.year
        }
        for(let temp in tempObj)
        {
          if(!tempObj[temp]) {
            res.json({error: "All Fields are Required"});
            return;
          }
        }
        db.collection(collections.portfolio).insertOne(tempObj, function(err, resp) {
          if (err) throw err;
          res.json(resp);
        });
      }
      else res.json({error: "Incorrect API Key"});
  	});
  router.route('/AddExperience')
  	.post(function(req, res) {
      let callKey = req.body.apiKey;
      if(callKey === apiKey)
      {
        let tempObj = {
          position: req.body.position,
          start: req.body.start,
          end: req.body.end,
          comp: req.body.comp,
          location: req.body.location,
          data: Array.isArray(req.body.data) ? req.body.data : null,
          img: req.body.img
        }
        for(let temp in tempObj)
        {
          if(!tempObj[temp]) {
            res.json({error: "All Fields are Required"});
            return;
          }
        }
        db.collection(collections.experience).insertOne(tempObj, function(err, resp) {
          if (err) throw err;
          res.json({message: "success"});
        });
      }
      else res.json({error: "Incorrect API Key"});
  	});
  router.route('/AddEducation')
  	.post(function(req, res) {
      let callKey = req.body.apiKey;
      if(callKey === apiKey)
      {
        let tempObj = {
          school: req.body.school,
          start: req.body.start,
          end: req.body.end,
          scholarships: Array.isArray(req.body.scholarships) ? req.body.scholarships : null,
          awards: Array.isArray(req.body.awards) ? req.body.awards : null,
          location: req.body.location,
          title: req.body.title,
          notableProj: Array.isArray(req.body.notableProj) ? req.body.notableProj : null,
          extraCuric: Array.isArray(req.body.extraCuric) ? req.body.extraCuric : null,
          img: req.body.img
        }
        for(let temp in tempObj)
        {
          if(!tempObj[temp]) {
            res.json({error: "All Fields are Required"});
            return;
          }
        }
        db.collection(collections.education).insertOne(tempObj, function(err, resp) {
          if (err) throw err;
          res.json(resp);
        });
      }
      else res.json({error: "Incorrect API Key"});
  	});

  router.route('/EditAbout')
  	.post(function(req, res) {
      let callKey = req.body.apiKey;
      let fields = ['desc', 'img'];
      if(callKey === apiKey)
      {
        let id = new mongo.ObjectID(req.body._id);
        db.collection(collections.about).find({_id: id}).toArray(function(err, result) {
          if (err) throw err;
          if(result[0])
          {
            let dbUpdate = {};
            let request = req.body;
            for(let obj in request)
            {
              if(fields.includes(obj))
              {
                dbUpdate[obj] = request[obj];
              }
            }
            db.collection(collections.about).updateOne({_id: id}, {$set: dbUpdate})
            res.json({message: 'success'});
          }
          else res.json({error: "Item not found"});
        });
      }
      else res.json({error: "Incorrect API Key"});
  	});
  router.route('/EditPortfolio')
  	.post(function(req, res) {
      let callKey = req.body.apiKey;
      let fields = ['name', 'dspImg', 'desc', 'images', 'videos', 'year'];
      if(callKey === apiKey)
      {
        let id = new mongo.ObjectID(req.body._id);
        db.collection(collections.portfolio).find({_id: id}).toArray(function(err, result) {
          if (err) throw err;
          if(result[0])
          {
            let dbUpdate = {};
            let request = req.body;
            for(let obj in request)
            {
              if(fields.includes(obj))
              {
                dbUpdate[obj] = request[obj];
              }
            }
            db.collection(collections.portfolio).updateOne({_id: id}, {$set: dbUpdate})
            res.json({message: 'success'});
          }
          else res.json({error: "Item not found"});
        });
      }
      else res.json({error: "Incorrect API Key"});

  	});
  router.route('/EditExperience')
  	.post(function(req, res) {
      let callKey = req.body.apiKey;
      let fields = ['position', 'start', 'end', 'comp', 'location', 'data', 'img'];
      if(callKey === apiKey)
      {
        let id = new mongo.ObjectID(req.body._id);
        db.collection(collections.experience).find({_id: id}).toArray(function(err, result) {
          if (err) throw err;
          if(result[0])
          {
            let dbUpdate = {};
            let request = req.body;
            for(let obj in request)
            {
              if(fields.includes(obj))
              {
                dbUpdate[obj] = request[obj];
              }
            }
            db.collection(collections.experience).updateOne({_id: id}, {$set: dbUpdate})
            res.json({message: 'success'});
          }
          else res.json({error: "Item not found"});
        });
      }
      else res.json({error: "Incorrect API Key"});

  	});
  router.route('/EditEducation')
  	.post(function(req, res) {
      let callKey = req.body.apiKey;
      let fields = ['school', 'start', 'end', 'scholarships', 'awards', 'location', 'title', 'notableProj', 'extraCuric', 'img'];
      if(callKey === apiKey)
      {
        let id = new mongo.ObjectID(req.body._id);
        db.collection(collections.education).find({_id: id}).toArray(function(err, result) {
          if (err) throw err;
          if(result[0])
          {
            let dbUpdate = {};
            let request = req.body;
            for(let obj in request)
            {
              if(fields.includes(obj))
              {
                dbUpdate[obj] = request[obj];
              }
            }
            db.collection(collections.education).updateOne({_id: id}, {$set: dbUpdate})
            res.json({message: 'success'});
          }
          else res.json({error: "Item not found"});
        });
      }
      else res.json({error: "Incorrect API Key"});

  	});

  app.use('/', router);
  app.listen(port);

});
