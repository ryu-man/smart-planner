const express = require("express");
const router = express.Router();
const Account = require('../models/account')
const bcrypt = require('bcryptjs');
const Student = require('../models/student')
const Teacher = require('../models/teacher')

router.post('/', (req, res) => {
  const {
    email,
    password,
    type,
    owner
  } = req.body
  console.log(email)
  let account = new Account({
    email,
    type
  })
  bcrypt.hash(password, bcrypt.genSaltSync(10), (err, hach) => {
    account.password = hach
    let user
    switch (type) {
      case "student":
        user = new Student({
          firstName: owner.firstName,
          lastName: owner.lastName,
          birthday: owner.birthday,
          contactInfos: owner.contactInfos,
          group:owner.group
        })
        account.owner = user._id
        break;
      case "teacher":
        user = new Teacher({
          firstName: owner.firstName,
          lastName: owner.lastName,
          birthday: owner.birthday,
          contactInfos: owner.contactInfos,
          grade: owner.grade
        })
        account.owner = user._id
        break;
      case "admin":
        break;
      case "technician":
        break;
    }

    account.save((err, doc) => {      
      if (err == null) {
        user.save((e, d) => {
          if (e == null) {
            res.statusCode = 200
            res.send()
          } else {
            res.statusCode = 403
            res.send(err)
          }
        })

      } else {
        res.statusCode = 403
        res.send(err)
      }

    })
  })
})
router.get('/checkEmail', async (req, res) => {
  const {
    email
  } = req.query
  if (email) {
    var account = await Account.findOne({
      "email": email
    })
    if (account) {
      res.statusCode = 200
      res.send()
    } else {
      res.statusCode = 404
      res.send()
    }
  } else {
    res.statusCode = 404
    res.send()
  }
})
router.post("/auth", (req, res, next) => {
  const auth = require("../auth");
  const {
    email,
    password,
    type
  } = req.body;
  auth
    .authenticate(email, password, type)
    .then(async doc => {
      
      switch (doc.type) {
        case "student":
          owner = await Student.findOne({_id:doc.owner})
          break;
        case "teacher":
          owner = await Teacher.findOne({_id:doc.owner})
          break;
        case "admin":
          
          break;
        case "technician":
          
          break;
      }
      res.send(doc)
    })
    .catch(err => {
      res.status(404);
    })
})

const fs = require("fs");
const multer = require("multer");
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("file: " + file);
    if (file == null) {
      cb("File not found", null);
    }
    const {
      accountId
    } = req.params;
    console.log(__dirname);
    if (!fs.existsSync(__dirname + "/../accounts")) {
      console.log("accounts folder not exist");
      fs.mkdirSync(__dirname + "/../accounts");
    }
    if (!fs.existsSync(__dirname + "/../accounts/" + accountId)) {
      console.log(accountId + " folder not exist");
      fs.mkdirSync(__dirname + "/../accounts/" + accountId);
    }
    cb(null, "accounts/" + accountId);
  },
  filename: (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

    if (allowedTypes.includes(file.mimetype)) {
      console.log("File accepted");
      const {
        accountId
      } = req.params;
      const fileName =
        accountId +
        "." +
        file.mimetype.substr(
          file.mimetype.indexOf("/") + 1,
          file.mimetype.length
        );
      console.log(fileName);
      cb(null, fileName);
    } else {
      cb("File type not allowed !", null);
    }
  }
})
const upload = multer({
  storage: storage
});
router.post(
  "/:accountId/profileImage",
  upload.single("file"),
  (req, res, next) => {
    console.log("helloo");
    const {
      accountId
    } = req.params;

    console.log(req.file);
  }
);
router.get(
  "/:accountId/profileImage", (req, res, next) => {
    const {
      accountId
    } = req.params;
    const p = path.join(__dirname, "..", "accounts", accountId, accountId + ".jpeg")
    console.log(p)
    var stat = fs.readFileSync(p);

    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
    });

    res.end(stat, "binary")
  }
);
module.exports = server => {
  server.use("/accounts", router);
};