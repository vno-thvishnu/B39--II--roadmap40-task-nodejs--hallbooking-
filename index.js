const express = require("express");
const app = express();
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const dotenv = require("dotenv").config();
const URL = process.env.DB;

app.use(express.json());


//Createroom :: post the date like below
// {
//   "seats_available": "2 beds",
//   "amenities": ["tv","ac","heater","wifi","locker"],
//   "price_for_1hour": 400
// }
app.post("/createroom", async (req, res) => {
  try {
    const connection = await mongoClient.connect(URL);

    const db = connection.db("Hallbooking_Task");

    const roomlength = await db.collection("rooms").find().toArray();

    req.body.room_no = roomlength.length + 101;
    req.body.status = "available";

    const rooms = await db.collection("rooms").insertOne(req.body);
    res.json({ message: "Room created" });

    await connection.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

app.get("/displayrooms",async function(req,res){
  try{
 const connection = await mongoClient.connect(URL);
 const db = connection.db("Hallbooking_Task") ;
 const findrooms = await db.collection("rooms").find().toArray();
 await connection.close();
 res.json(findrooms);
}
 catch(error){
     console.log(error);
 }
})

//roombooking :: by using (get-/displayrooms) copy the objectId, room you want.. and use it as params for (post-/roombooking/*), post the data like below
// {
//     "customer_name": "raghu",
//     "date": "19-12-2022",
//     "start_time": "01.00pm",
//     "end_time": "11.00am",
//
// }

app.post("/roombooking/:room_id", async (req, res) => {
  try {
    const connection = await mongoClient.connect(URL);

    const db = connection.db("Hallbooking_Task");

   

    const booking = await db.collection("bookings").insertOne(req.body);

    const obj = await db
      .collection("rooms")
      .findOne({ _id: mongodb.ObjectId(req.params.room_id) });
   
    await db
      .collection("bookings")
      .updateOne(
        { _id: booking.insertedId },
        { $set: { room_no: obj.room_no } }
      );

    const replace = await db.collection("rooms").updateOne(
      { room_no: obj.room_no },

      { $set: { status: "booked" } }
    );

    await db
      .collection("bookings")
      .updateOne(
        { _id: booking.insertedId },
        { $set: { room_id: mongodb.ObjectId(req.params.room_id) } }
      );

    res.json({
      message: "Booked successfuly",
    });

    await connection.close();
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

app.get("/room_data", async (req, res) => {
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("Hallbooking_Task");
    const room_data = await db
      .collection("bookings")
      .aggregate([
        {
          $lookup: {
            from: "rooms",
            localField: "room_id",
            foreignField: "_id",
            as: "result",
          },
        },
        {
          $unwind: {
            path: "$result",
          },
        },
        {
          $project: {
            _id: 0,
            Room_No: "$result.room_no",
            Status: "$result.status",
            Coustomer_Name: "$customer_name",
            Date: "$date",
            StartTime: "$start_time",
            EndTime: "$end_time",
          },
        },
      ])
      .toArray();

    res.json(room_data);
    await connection.close();
  } catch (error) {
    res.json("something went wrong");
  }
});

app.get("/customer_data", async (req, res) => {
  try {
    const connection = await mongoClient.connect(URL);
    const db = connection.db("Hallbooking_Task");

    const customer_data = await db
      .collection("bookings")
      .aggregate([
       
        {
          $project: {
            _id: 0,
            room_id: 0,
          },
        },
      ])
      .toArray();
    res.json(customer_data);
    await connection.close();
  } catch (error) {
    res.json("something went wrong");
  }
});

app.listen(process.env.PORT || 4002);
