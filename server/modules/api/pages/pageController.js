const express = require('express');
const Router = express.Router();
const config = require('../../../config.json');
const pageModel = require('./pageModel.js');

Router.get("/all", (req, res) => {
  pageModel.getAllPagesFromDB((err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

Router.post("/", (req, res) => {
  pageModel.createNewPage(req.body, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

Router.put("/:url", (req, res) => {
  pageModel.updatePageByUrl(req.params.url, req.body, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

Router.delete("/:url", (req, res) => {
  pageModel.deletePageByUrl(req.params.url, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

Router.get("/:url", (req, res) => {
  pageModel.getPageByUrl(req.params.url, (err, result) => {
    if (err) {
      res.send(err);
    } else {
      res.send(result);
    }
  });
});

module.exports = Router;
