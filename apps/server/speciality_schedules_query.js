[
  {
    '$addFields': {
      'today': moment().startOf('day').toDate()
    }
  }, {
    '$addFields': {
      'currentWeek': {
        '$week': {
          'date': '$today', 
          'timezone': 'CET'
        }
      }, 
      'permutationWeek': {
        '$ifNull': [
          {
            '$week': {
              'date': '$activeOn', 
              'timezone': 'CET'
            }
          }, '$$REMOVE'
        ]
      }
    }
  }, {
    '$addFields': {
      'deff': {
        '$ifNull': [
          {
            '$abs': {
              '$subtract': [
                '$currentWeek', '$permutationWeek'
              ]
            }
          }, '$$REMOVE'
        ]
      }
    }
  }, {
    '$project': {
      'replace': {
        '$cond': [
          {
            '$lte': [
              '$deff', 0
            ]
          }, '$replace', null
        ]
      }, 
      'isActive': {
        '$or': [
          {
            '$eq': [
              '$primary', true
            ]
          }, {
            '$and': [
              {
                '$eq': [
                  '$primary', false
                ]
              }, {
                '$eq': [
                  '$deff', 0
                ]
              }
            ]
          }
        ]
      }, 
      'classroom': 1, 
      'day': 1, 
      'component': 1, 
      'semester': 1, 
      'primary': 1, 
      'dayUnite': 1, 
      'currentWeek': 1, 
      'today': 1, 
      'group': 1
    }
  }, {
    '$group': {
      '_id': '$semester', 
      'list': {
        '$push': '$$ROOT'
      }, 
      'replacements': {
        '$push': '$$ROOT.replace'
      }
    }
  }, {
    '$unwind': {
      'path': '$list'
    }
  }, {
    '$addFields': {
      'list.replacements': '$replacements'
    }
  }, {
    '$replaceRoot': {
      'newRoot': '$list'
    }
  }, {
    '$project': {
      'isSelected': {
        '$or': [
          {
            '$eq': [
              '$primary', false
            ]
          }, {
            '$and': [
              {
                '$eq': [
                  '$primary', true
                ]
              }, {
                '$not': {
                  '$in': [
                    '$_id', '$replacements'
                  ]
                }
              }
            ]
          }
        ]
      }, 
      'isActive': 1, 
      'classroom': 1, 
      'day': 1, 
      'component': 1, 
      'semester': 1, 
      'primary': 1, 
      'dayUnite': 1, 
      'currentWeek': 1, 
      'today': 1, 
      'group': 1
    }
  }, {
    '$match': {
      'isSelected': true
    }
  }, {
    '$lookup': {
      'from': 'components', 
      'localField': 'component', 
      'foreignField': '_id', 
      'as': 'component'
    }
  }, {
    '$lookup': {
      'from': 'classrooms', 
      'localField': 'classroom', 
      'foreignField': '_id', 
      'as': 'classroom'
    }
  }, {
    '$lookup': {
      'from': 'dayunites', 
      'localField': 'dayUnite', 
      'foreignField': '_id', 
      'as': 'dayUnite'
    }
  }, {
    '$lookup': {
      'from': 'semesters', 
      'localField': 'semester', 
      'foreignField': '_id', 
      'as': 'semester'
    }
  }, {
    '$unwind': {
      'path': '$semester'
    }
  }, {
    '$unwind': {
      'path': '$dayUnite'
    }
  }, {
    '$lookup': {
      'from': 'consernsgroups', 
      'localField': '_id', 
      'foreignField': 'seance', 
      'as': 'groups'
    }
  }, {
    '$lookup': {
      'from': 'groups', 
      'localField': 'groups.group', 
      'foreignField': '_id', 
      'as': 'groups'
    }
  }, {
    '$unwind': {
      'path': '$groups'
    }
  }, {
    '$lookup': {
      'from': 'specialities', 
      'localField': 'groups.speciality', 
      'foreignField': '_id', 
      'as': 'groups.speciality'
    }
  }, {
    '$unwind': {
      'path': '$groups.speciality'
    }
  }, {
    '$unwind': {
      'path': '$classroom'
    }
  }, {
    '$unwind': {
      'path': '$component'
    }
  }, {
    '$group': {
      '_id': '$_id', 
      'classroom': {
        '$first': '$classroom'
      }, 
      'semester': {
        '$first': '$semester'
      }, 
      'component': {
        '$first': '$component'
      }, 
      'day': {
        '$first': '$day'
      }, 
      'dayUnite': {
        '$first': '$dayUnite'
      }, 
      'today': {
        '$first': '$today'
      }, 
      'primary': {
        '$first': '$primary'
      }, 
      'currentWeek': {
        '$first': '$currentWeek'
      }, 
      'isSelected': {
        '$first': '$isSelected'
      }, 
      'isActive': {
        '$first': '$isActive'
      }, 
      'groups': {
        '$push': '$groups'
      }
    }
  }, {
    '$lookup': {
      'from': 'teachers', 
      'localField': 'component.teacher', 
      'foreignField': '_id', 
      'as': 'component.teacher'
    }
  }, {
    '$unwind': {
      'path': '$component.teacher'
    }
  }, {
    '$lookup': {
      'from': 'modules', 
      'localField': 'component.module', 
      'foreignField': '_id', 
      'as': 'component.module'
    }
  }, {
    '$unwind': {
      'path': '$component.module'
    }
  }, {
    '$lookup': {
      'from': 'unites', 
      'localField': 'component.module.unite', 
      'foreignField': '_id', 
      'as': 'component.module.unite'
    }
  }, {
    '$unwind': {
      'path': '$component.module.unite'
    }
  }, {
    '$lookup': {
      'from': 'specialities', 
      'localField': 'component.module.unite.speciality', 
      'foreignField': '_id', 
      'as': 'component.module.unite.speciality'
    }
  }, {
    '$unwind': {
      'path': '$component.module.unite.speciality'
    }
  }, {
    '$match': {
      'component.module.unite.speciality._id': new ObjectId(speciality)
    }
  }, {
    '$lookup': {
      'from': 'homeworks', 
      'localField': 'component._id', 
      'foreignField': 'component', 
      'as': 'component.homeworks'
    }
  }, {
    '$lookup': {
      'from': 'attendances', 
      'localField': '_id', 
      'foreignField': 'schedule', 
      'as': 'attendances'
    }
  }, {
    '$lookup': {
      'from': 'plannings', 
      'localField': 'component._id', 
      'foreignField': 'form', 
      'as': 'component.planning'
    }
  }, {
    '$sort': {
      'attendances': 1
    }
  }, {
    '$project': {
      'classroom': 1, 
      'semester': 1, 
      'day': 1, 
      'dayUnite': 1, 
      'groups': 1, 
      'today': 1, 
      'primary': true, 
      'currentWeek': 1, 
      'isSelected': 1, 
      'attendances': 1, 
      'component._id': 1, 
      'component.type': 1, 
      'component.module': 1, 
      'component.teacher': 1, 
      'component.planning': 1, 
      'component.homeworks': {
        '$filter': {
          'input': '$component.homeworks', 
          'as': 'i', 
          'cond': {
            '$eq': [
              '$$i.semester', '$semester._id'
            ]
          }
        }
      }
    }
  }, {
    '$group': {
      '_id': '$day', 
      'seances': {
        '$push': '$$ROOT'
      }
    }
  }
]