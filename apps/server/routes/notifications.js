const express = require("express");
const router = express.Router();
const PermutationDemande = require("../models/permutationDemande");
const {ObjectId} = require("mongodb");
/* GET users listing. */
router.get("/teacher/:id/", async function(req, res, next) {
  const { id } = req.params;

  var demmandes= await PermutationDemande.aggregate(
    [
      {
        $lookup: {
          from: "seances",
          localField: "target",
          foreignField: "_id",
          as: "target"
        }
      },
      {
        $unwind: {
          path: "$target"
        }
      },
      {
        $lookup: {
          from: "components",
          localField: "target.component",
          foreignField: "_id",
          as: "target.component"
        }
      },
      {
        $unwind: {
          path: "$target.component"
        }
      },
      {
        $lookup: {
          from: "teachers",
          localField: "target.component.teacher",
          foreignField: "_id",
          as: "target.component.teacher"
        }
      },
      {
        $unwind: {
          path: "$target.component.teacher"
        }
      },
      {
        $match: {
          "target.component.teacher._id":ObjectId(
            id
          )
        }
      },
      {
        $lookup: {
          from: "dayunites",
          localField: "target.dayUnite",
          foreignField: "_id",
          as: "target.dayUnite"
        }
      },
      {
        $unwind: {
          path: "$target.dayUnite"
        }
      },
      {
        $lookup: {
          from: "modules",
          localField: "target.component.module",
          foreignField: "_id",
          as: "target.component.module"
        }
      },
      {
        $unwind: {
          path: "$target.component.module"
        }
      },
      {
        $lookup: {
          from: "seances",
          localField: "source",
          foreignField: "_id",
          as: "source"
        }
      },
      {
        $unwind: {
          path: "$source"
        }
      },
      {
        $lookup: {
          from: "components",
          localField: "source.component",
          foreignField: "_id",
          as: "source.component"
        }
      },
      {
        $unwind: {
          path: "$source.component"
        }
      },
      {
        $lookup: {
          from: "modules",
          localField: "source.component.module",
          foreignField: "_id",
          as: "source.component.module"
        }
      },
      {
        $unwind: {
          path: "$source.component.module"
        }
      },
      {
        $lookup: {
          from: "dayunites",
          localField: "source.dayUnite",
          foreignField: "_id",
          as: "source.dayUnite"
        }
      },
      {
        $unwind: {
          path: "$source.dayUnite"
        }
      },
      {
        $project: {
          date: 1,
          "source.classroom": 1,
          "source.componentId": "$source.component._id",
          "source.module": "$source.component.module.name",
          "source.moduleType": "$source.component.type",
          "source.day": "$source.day",
          "source.dayUnite": "$source.dayUnite",
          // "source.end": "$source.dayUnite.end",
          "target.classroom": 1,
          "target.componentId": "$target.component._id",
          "target.module": "$target.component.module.name",
          "target.moduleType": "$target.component.type",
          "target.day": "$target.day",
          "target.dayUnite": "$target.dayUnite",
          // "target.end": "$target.dayUnite.end"
          created_at:1
        }
      }
    ]);
    
    if (demmandes != null) {
      res.send(demmandes.map((e)=>buildPermutationNotification(e)));
    } else {
      res.statusCode = 404;
      res.send();
    }
});

router.post("/", function(req, res) {});

module.exports = server => {
  server.use("/notifications", router);
};

function buildPermutationNotification( damand){
  var obj = {}
  obj._id = damand._id
  obj.message = "Teacher Foulan has sent you a demmand of permutation"
  obj.module = damand.source.module
  obj.date=damand.date
  obj.dayTime=`${damand.target.dayUnite.begin.hour} : ${damand.target.dayUnite.begin.minute}`
  obj.type = "permutation"
  obj.created_at = damand.created_at
  return obj;
}