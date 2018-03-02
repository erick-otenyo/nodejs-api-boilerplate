import { Router } from "express";

const dbCredentials = {
  // the name of cloudant db to be used
  // herein asssumed the database exists
  dbName: "db_name"
};

const createResponseData = doc => {
  return {
    type: doc.type,
    id: doc._id,
    geometry: doc.geometry,
    properties: {
      name: doc.name
    }
  };
};

export default cloudant => {
  //use specified db
  const db = cloudant.use(dbCredentials.dbName);

  let point = Router();

  //create a point
  point.post("/", (request, response) => {
    console.log("Create Invoked..");

    const data = {
      name: request.body.centre.name,
      coordinates: request.body.centre.coordinates
    };

    const saveDocument = function(id, data, response) {
      if (id === undefined) {
        // Generated random id
        id = "";
      }

      db.insert(
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: data.coordinates
          },
          name: data.name
        },
        id,
        (err, doc) => {
          if (err) {
            response.sendStatus(500);
          } else response.status(200);
          response.end();
        }
      );
    };
    saveDocument(null, data, response);
  });

  //get all points
  point.get("/", (request, response) => {
    console.log("Get all Invoked..");
    db.list({ include_docs: true }, (err, body) => {
      if (err) {
        response.json({
          error: err
        });
        return;
      } else {
        const points = body.rows.map(point => {
          return createResponseData(point.doc);
        });
        response.json({
          points: {
            type: "FeatureCollection",
            features: points
          }
        });
      }
    });
  });

  // get a point
  point.get("/:id", (request, response) => {
    const id = request.params.id;
    if (id != "") {
      db.get(id, (err, doc) => {
        if (err) {
          response.json({
            error: err.error
          });
          return;
        } else {
          response.json({
            centre: createResponseData(doc)
          });
        }
      });
    }
  });

  //update a point
  point.put("/:id", function(request, response) {
    console.log("Update Invoked..");

    const data = {
      name: request.body.centre.name
    };

    const id = request.params.id;

    console.log("ID: " + id);

    db.get(
      id,
      {
        revs_info: true
      },
      function(err, doc) {
        if (!err) {
          if (data.name) {
            doc.name = data.name;
          }
          db.insert(doc, doc.id, function(err, doc) {
            if (err) {
              console.log("Error inserting data\n" + err);
              response.status(500).json({ error: err });
            }
            response.status(200);
            response.end();
          });
        }
      }
    );
  });

  // delete a point
  point.delete("/:id", function(request, response) {
    console.log("Delete Invoked..");

    const id = request.params.id;

    console.log("ID: " + id);

    db.get(
      id,
      {
        revs_info: true
      },
      function(err, doc) {
        if (!err) {
          db.destroy(doc._id, doc._rev, (err, doc) => {
            if (!err) {
              response.sendStatus(200).end();
            } else {
              response
                .sendStatus(500)
                .json({ error: err.error })
                .end();
            }
          });
        } else {
          response
            .sendStatus(500)
            .json({ error: err.error })
            .end();
        }
      }
    );
  });

  return point;
};
