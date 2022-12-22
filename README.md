follow the steps below for postman

Createroom :: post the date like below
 {
   "seats_available": "2 beds",
   "amenities": ["tv","ac","heater","wifi","locker"],
   "price_for_1hour": 400
 }
 
roombooking :: by using (get-/displayrooms) copy the objectId, room you want.. and use it as params for (post-/roombooking/*), post the data like below
 {
     "customer_name": "raghu",
     "date": "19-12-2022",
     "start_time": "01.00pm",
     "end_time": "11.00am",

 }
