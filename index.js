var express = require("express");
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var fs = require('fs');
var csv = require('fast-csv');

app.use(bodyParser());

var port = process.env.PORT || 3000;


var con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "janelaajdev",
  database: "janelaajdev"
});

app.get("/q",function(req,res){
  res.send("hi from server");
})
//
// app.get("/qqq",function(req,res){
//
//   con.getConnection(function(err,connection){
//
//     var sql = "create table doctor_location_master(ClientID SMALLINT(15) NOT NULL DEFAULT 0)";
//
//     if(err){
//       console.log("in error 1");
//       console.log("error is :"+err);
//       console.log("error code is : "+err.code);
//       return err;
//     }else{
//       connection.query(sql,function(err,result){
//         if(err){
//           console.log("in error 2");
//           console.log("error is :"+err);
//           console.log("error code is : "+err.code);
//           return err;
//         }else{
//           console.log("ye to ho gyaaa");
//         }
//       })
//     }
//
//   })
//
// })

app.post("/numberverify",function(req,res){

  var Object = req.body;

  var MOBILE =  Object.mobile;
  var PLD_ROLE = Object.pldrole;
  console.log(MOBILE);

  var obj = {
    status : "SUCCESS"
  }

  var sql = 'SELECT COUNT(*) AS namesCount FROM partner_login_details_master WHERE pld_role = ? AND  pld_mobile = ?';

  con.getConnection(function(err, connection) {


      if(err){
        console.log("ERROR IN NUMBER VRTIFY IN BUILDING CONNECTION FOR PLD_ROLE = "+PLD_ROLE+" AND FOR PLD_MOBILE = "+MOBILE);
        console.log("ERROR CODE :"+err.code);
        obj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(obj));
        return err;
      }else{

        connection.query(sql,[PLD_ROLE,MOBILE], function(err, result) {

          if(err){
            console.log("ERROR IN NUMBER VRTIFY IN RUNNING QUERY FOR PLD_ROLE = "+PLD_ROLE+" AND FOR PLD_MOBILE = "+MOBILE);
            console.log("ERROR CODE "+err.code);
            obj.status = "CONNECTION ERROR";
            res.send(JSON.stringify(obj));
            return err;
          }else{

            if(result[0].namesCount == 0){
              res.send(JSON.stringify(obj));
            }else{
              obj.status = "FAIL";
              res.send(JSON.stringify(obj));
            }
          }

            connection.release();
        });

      }


  });



});

app.post("/registeruser",function(req,res){

  var Object = req.body;

  var ID="";
  var PLD_ROLE = Object.pldrole;
  var REGISTRATION_NUMBER =  Object.registernumber;
  console.log(PLD_ROLE);
  console.log(REGISTRATION_NUMBER);

  // var NAME =  req.body.name;
  // var DOB =  req.body.dob;
  // var GENDER =  req.body.gender;
  // var EMAIL =  req.body.email;
  // var PASSWORD =  req.body.password;
  // var MOBILE =  req.body.mobile;
  // var SPECIALITY_ID =  req.body.specialityid;
  // var REGISTRATION_COUNCIL =  req.body.registercouncil;
  // var REGISTRATION_YEAR =  req.body.registeryear;
  // var EXPERIENCE =  parseInt(req.body.experience);

  var obj = {
    status : "SUCCESS",
    id : ""
  }

  var sql = 'SELECT COUNT(*) AS namesCount FROM doctor_master WHERE dm_medical_registration_number = ? AND  dm_ready_live_flag = ?';


  con.getConnection(function(err, connection) {

    if(err){
      obj.status = "FAIL";
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.query(sql,[REGISTRATION_NUMBER,'Y'], function(err, result) {

        if(err){
          obj.status = "FAIL";
          res.send(JSON.stringify(obj));
          return err;
        }else{

          if(result[0].namesCount == 0){

            console.log("in 111");

            var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
            var Mydata = [];
            var csvStream = csv.parse().on("data", function(data){

                  var value=0;

                  console.log("in loop "+PLD_ROLE);

                  console.log("in loop "+data[0]);


                  if(data[0] == PLD_ROLE){

                    console.log("in mein if mein");

                    value = parseInt(data[1]);
                    console.log(":: in if value "+value);
                    ID = PLD_ROLE+""+data[1];
                    console.log(":: in if ID "+ID);
                    value++;
                    data[1]=value.toString();
                  }
                  Mydata.push(data);
                })
                .on("end", function(){
                     var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
                     csv.write(Mydata, {headers: true}).pipe(ws);
                     InsertFinalValue(req,res,ID);
                     console.log("final Id "+ ID);
                     console.log(Mydata);

                });
            stream.pipe(csvStream);
          }else{

            console.log("in 222");

            obj.status = "FAIL";
            res.send(JSON.stringify(obj));
          }
        }

          connection.release();
      });

    }
  });



});

app.post("/signin",function(req,res){


  var obj = {
    status : "SUCCESS",
    checkpoint : 0
  }

  var Object = req.body;

  var Email = Object.email;
  var Password = Object.password;
  var DocId="";
  console.log(Email);
  console.log(Password);

  var sql = 'SELECT pld_password, pld_partner_id FROM partner_login_details_master WHERE pld_username = ?';
  var sql2 = 'SELECT COUNT(*) AS exist FROM doctor_location_master WHERE dlm_dm_doctor_id = ?';

  con.getConnection(function(err,connection){

    if(err){

      console.log("ERROR IN CONNECTING TO THE DATABASE IN SIGNIN FOR Email = "+Email);
      console.log("ERROR : "+err.code);
      obj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(obj));
      return err;

    }else{

      connection.query(sql,[Email,Password],function(err,result){

        if(err){
          console.log("ERROR IN RUNNING SQL IN SIGNIN FOR Email = "+Email);
          console.log("ERROR : "+err.code);
          obj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(obj));
          return err;
        }else{
          if(result.length==0){
            obj.status = "YOU ARE NOT REGISTERED/ INVALID USERNAME";
            res.send(JSON.stringify(obj));
          }else{
            if(result[0].pld_password == Password){

              DocId = result[0].pld_partner_id;

              console.log("i am here "+DocId);
              connection.query(sql2,[DocId],function(err,resul){

                if(err){
                  console.log("ERROR IN RUNNING SQL2 IN SIGNIN FOR Email = "+Email);
                  console.log("ERROR : "+err.code);
                  obj.status = "CONNECTION ERROR";
                  res.send(JSON.stringify(obj));
                  return err;
                }else{

                  console.log(DocId);
                  console.log(resul[0].exist);

                  if(resul[0].exist == 0){
                    console.log("in checkpoint 1");
                    obj.status = "SUCCESS";
                    obj.checkpoint = 1;//Go to add location screen
                    res.send(JSON.stringify(obj));

                  }else{
                    console.log("in checkpoint 2");
                    obj.status = "SUCCESS";
                    obj.checkpoint = 2;// go to manage location screen
                    res.send(JSON.stringify(obj));

                  }

                }

              })

            }else{
              obj.status = "YOU PASSWORD IS INCORRECT";
              res.send(JSON.stringify(obj));
            }
          }
        }

        connection.release();


      })

    }

  })

});

//Leave it fr now
app.post("/hvisitaddlocation",function(req,res){

  var Object = req.body;

  var Name = Object.name;
  var AddressLine1 = Object.adrline1;
  var AddressLine2 = Object.adrline2;
  var City = Object.city;
  var District = Object.district;
  var State = Object.state;
  var Pin = Object.pin;
  var Did = Object.docid;
  var LocId="";
  var DlmId="";
  var KmRange = Object.kmrange;


  var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
  var Mydata = [];
  var csvStream = csv.parse().on("data", function(data){

        var valueloc=0;
        var valuedlm=0;


        console.log("in loop "+data[0]);


        if(data[0] == "LOC"){

          console.log("in mein if mein");

          valueloc = parseInt(data[1]);
          console.log(":: in if value "+value);
          LocId = "LOC"+""+data[1];
          console.log(":: in if ID "+LocId);
          valueloc++;
          data[1]=valueloc.toString();
        }

        if(data[0] == "DLM"){

          console.log("in mein if mein");

          valuedlm = parseInt(data[1]);
          console.log(":: in if value "+value);
          DlmId = "DLM"+""+data[1];
          console.log(":: in if ID "+DlmId);
          valuedlm++;
          data[1]=valuedlm.toString();
        }
        Mydata.push(data);
      })
      .on("end", function(){
           var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
           csv.write(Mydata, {headers: true}).pipe(ws);
           console.log(Mydata);

      });
  stream.pipe(csvStream);


  var obj = {
    status : "SUCCESS"
  }


  var sql1 = 'INSERT INTO location_master (lm_location_id, lm_name, lm_address_line1, lm_address_line2, lm_city, lm_district, lm_state, lm_pincode, lm_range_km, lm_flag_home_service_ref) VALUES ((?),(?),(?),(?),(?),(?),(?),(?),(?),(?))';
  var sql2 = 'INSERT INTO doctor_location_master (dlm_dm_doctor_id, dlm_lm_location_id, dlm_id, lm_flag_home_service_ref) VALUES ((?),(?),(?),(?))';

  con.getConnection(function(err,connection){

    if(err){
      obj.status = "FAIL";
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.beginTransaction(function(err){

        if(err){
          obj.status = "FAIL";
          res.send(JSON.stringify(obj));
          return err;
        }else{

          connection.query(sql1,[LocId,Name,AddressLine1,AddressLine2,City,District,State,Pin,KmRange,'Y'],function(err,result){

            if(err){
              obj.status = "FAIL";
              res.send(JSON.stringify(obj));
              connection.rollback(function(){
                return err;
              })
            }else{

              if(result.affectedRows == 1){

                connection.query(sql2,[Did,LocId,DlmId,'Y'],function(err2,result2){

                  if(err2){
                    obj.status = "FAIL";
                    res.send(JSON.stringify(obj));
                    connection.rollback(function(){
                      return err2;
                    })
                  }else{

                    if(result2.affectedRows == 1){
                      connection.commit(function(err){
                        if(err){
                          console.log("in 6");
                          connection.rollback(function(){
                            return err;
                          })
                          obj.status = "FAIL";
                          res.send(JSON.stringify(obj));
                        }else{
                          obj.status = "SUCCESS";
                          res.send(JSON.stringify(obj));
                        }
                      })
                    }else{
                      connection.rollback(function(){
                      })
                      obj.status = "FAIL";
                      res.send(JSON.stringify(obj));
                    }

                  }

                })

              }else{
                connection.rollback(function(){
                })
                obj.status = "FAIL";
                res.send(JSON.stringify(obj));
              }

            }

          })

        }

      })

    }

  })


})
//Leave it fr now




app.post("/clinicaddlocation",function(req,res){

  var Object = req.body;

  var Name = Object.name;
  var AddressLine1 = Object.adrline1;
  var AddressLine2 = Object.adrline2;
  var City = Object.city;
  var District = Object.district;
  var State = Object.state;
  var Pin = Object.pin;
  var Did = Object.docid;
  var Options = Object.option;
  var LocId="";
  var DlmId="";

  console.log(Name);
  console.log(City);

  var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
  var Mydata = [];
  var csvStream = csv.parse().on("data", function(data){

        var valueloc=0;
        var valuedlm=0;


        console.log("in loop "+data[0]);


        if(data[0] == "LOC"){

          console.log("in mein if mein");

          valueloc = parseInt(data[1]);
          console.log(":: in if value "+valueloc);
          LocId = "LOC"+""+data[1];
          console.log(":: in if ID "+LocId);
          valueloc++;
          data[1]=valueloc.toString();
        }

        if(data[0] == "DLM"){

          console.log("in mein if mein");

          valuedlm = parseInt(data[1]);
          console.log(":: in if value "+valuedlm);
          DlmId = "DLM"+""+data[1];
          console.log(":: in if ID "+DlmId);
          valuedlm++;
          data[1]=valuedlm.toString();
        }
        Mydata.push(data);
      })
      .on("end", function(){
           var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
           csv.write(Mydata, {headers: true}).pipe(ws);
           console.log(Mydata);

      });
  stream.pipe(csvStream);


  var obj = {
    status : "SUCCESS"
  }

  //have to make change hererererererer

  var sql1 = 'INSERT INTO location_master (lm_location_id, lm_name, lm_address_line1, lm_address_line2, lm_city, lm_district, lm_state, lm_pincode, lm_flag_home_service_ref) VALUES ((?),(?),(?),(?),(?),(?),(?),(?),(?))';
  var sql2 = 'INSERT INTO doctor_location_master (dlm_dm_doctor_id, dlm_lm_location_id, dlm_id, dlm_doctor_options) VALUES ((?),(?),(?),(?))';

  con.getConnection(function(err,connection){

    if(err){
      console.log("ERROR IN CONNECTION TO DATABASE IN CLINICADDLOCATION DOCID = "+Did);
      console.log("ERROR:"+err);
      console.log("ERROR CODE:"+err.code);
      obj.status = "FAIL";
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.beginTransaction(function(err){

        if(err){
          console.log("ERROR IN BEGINING TRANSACTION DATABASE IN CLINICADDLOCATION DOCID = "+Did);
          console.log("ERROR:"+err);
          console.log("ERROR CODE:"+err.code);
          obj.status = "FAIL";
          res.send(JSON.stringify(obj));
          return err;
        }else{

          connection.query(sql1,[LocId,Name,AddressLine1,AddressLine2,City,District,State,Pin,'N'],function(err,result){

            if(err){
              console.log("ERROR IN RUNNING SQL1 IN CLINICADDLOCATION DOCID = "+Did);
              console.log("ERROR:"+err);
              console.log("ERROR CODE:"+err.code);
              obj.status = "FAIL";
              res.send(JSON.stringify(obj));
              connection.rollback(function(){
                return err;
              })
            }else{

              if(result.affectedRows == 1){

                connection.query(sql2,[Did,LocId,DlmId,Options],function(err2,result2){

                  if(err2){
                    console.log("ERROR IN RUNNING SQL2 IN CLINICADDLOCATION DOCID = "+Did);
                    console.log("ERROR:"+err2);
                    console.log("ERROR CODE:"+err2.code);
                    obj.status = "FAIL";
                    res.send(JSON.stringify(obj));
                    connection.rollback(function(){
                      return err2;
                    })
                  }else{

                    if(result2.affectedRows == 1){
                      connection.commit(function(err){
                        if(err){
                          console.log("ERROR IN COMMITING TO DATABASE IN CLINICADDLOCATION DOCID = "+Did);
                          console.log("ERROR:"+err);
                          console.log("ERROR CODE:"+err.code);
                          obj.status = "FAIL";
                          res.send(JSON.stringify(obj));
                          connection.rollback(function(){
                            return err;
                          })
                        }else{
                          obj.status = "SUCCESS";
                          res.send(JSON.stringify(obj));
                        }
                      })
                    }else{
                      connection.rollback(function(){
                      })
                      console.log("ERROR AFFECTING ROWS DATABASE IN CLINICADDLOCATION DOCID = "+Did);
                      obj.status = "FAIL";
                      res.send(JSON.stringify(obj));
                    }

                  }

                })

              }else{
                connection.rollback(function(){
                })
                console.log("ERROR AFFECTING ROWS DATABASE IN CLINICADDLOCATION DOCID = "+Did);
                obj.status = "FAIL";
                res.send(JSON.stringify(obj));
              }

            }

          })

        }

      })

    }

  })

})

app.post("/managelocation",function(req,res){

  var Object = req.body;

  var DocId = Object.docid;

  var Aray = [];

  var MainObj = {
    status:"",
    locations : []
  }



  var sql = "SELECT LM.lm_name, LM.lm_flag_home_service_ref, LM.lm_address_line1, LM.lm_location_id, LM.lm_city, DLM.dlm_id FROM location_master AS LM INNER JOIN doctor_location_master AS DLM ON LM.lm_location_id = DLM.dlm_lm_location_id WHERE DLM.dlm_dm_doctor_id = ?";

  con.getConnection(function(err,connection){

    if(err){
      console.log("ERROR IN BUILDING CONNECTION IN FETCHLOCATION FOR DocId = "+DocId);
      console.log("ERROR CODE :"+err.code);
      console.log("ERROR : "+err);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
    }else{
      connection.query(sql,[DocId],function(err,result){
        if(err){
          console.log("ERROR IN RUNNING SQL IN FETCHLOCATION FOR DocId = "+DocId);
          console.log("ERROR CODE :"+err.code);
          console.log("ERROR : "+err);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }else{

          MainObj.status = "SUCCESS";
          for(var i=0;i<result.length;i++){

            var obj = {
              lname:result[i].lm_name,
              lflagservice:result[i].lm_flag_home_service_ref,
              ladrline1:result[i].lm_address_line1,
              dlmid:result[i].dlm_id,
              lcity:result[i].lm_city,
              lid:result[i].lm_location_id,
              did:DocId
            }

            // obj.lname = result[i].lm_name;
            // obj.lflagservice = result[i].lm_flag_home_service_ref;
            // obj.ladrline1 = result[i].lm_address_line1;
            // obj.dlmid = result[i].dlm_id;
            // obj.lcity = result[i].lm_city;
            // obj.lid = result[i].lm_location_id;
            // obj.did = DocId;
            console.log(result[i].lm_city);
            console.log(obj);
            console.log(MainObj);
            MainObj.locations.push(obj);

          }

          console.log(MainObj);

          res.send(JSON.stringify(MainObj));

        }
      })
    }

  })


})

function InsertFinalValue(req,res,id){


  var obj = {
    status : "SUCCESS",
    id : ""
  }

  var Object = req.body;


  var ID=id;
  var PLD_ROLE = Object.pldrole;
  var NAME =  Object.name;
  var DOB =  Object.dob;
  var GENDER =  Object.gender;
  var EMAIL =  Object.email;
  var PASSWORD =  Object.password;
  var MOBILE =  Object.mobile;
  var SPECIALITY_ID =  parseInt(Object.specialityid);
  var REGISTRATION_NUMBER =  Object.registernumber;
  var REGISTRATION_COUNCIL =  Object.registercouncil;
  var REGISTRATION_YEAR =  Object.registeryear;
  var EXPERIENCE =  parseInt(Object.experience);
  var REGISTERDATE="";
  console.log(ID);
  console.log(PLD_ROLE);
  console.log(NAME);
  console.log(DOB);
  console.log(GENDER);
  console.log(EMAIL);
  console.log(PASSWORD);
  console.log(MOBILE);
  console.log(SPECIALITY_ID);
  console.log(REGISTRATION_NUMBER);
  console.log(REGISTRATION_COUNCIL);
  console.log(REGISTRATION_YEAR);
  console.log(EXPERIENCE);


  var sql = "INSERT INTO doctor_master (dm_doctor_id, dm_doctor_name, dm_dob, dm_gender, dm_doctor_contact_mobile, dm_doctor_speciality_id, dm_doctor_email, dm_medical_registration_number, dm_registration_council, dm_registration_year, dm_doctor_experience, dm_reg_date) VALUES((?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),SYSDATE())";
  var sql1 = "INSERT INTO partner_login_details_master (pld_role, pld_username, pld_password, pld_partner_id, pld_mobile) VALUES ((?),(?),(?),(?),(?))";


  con.getConnection(function(err, connection) {

    if(err){
      console.log("ERROR IN OPENING DATABASE IN INSERFINVALUE FUNCTION FOR ID ="+id);
      obj.status = "COONECTION ERROR";
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.beginTransaction(function(err){

        if(err){
          console.log("in 1");
          obj.status = "FAIL";
          res.send(JSON.stringify(obj));
          return err;
        }else{



            connection.query(sql,[ID,NAME,DOB,GENDER,MOBILE,SPECIALITY_ID,EMAIL,REGISTRATION_NUMBER,REGISTRATION_COUNCIL,REGISTRATION_YEAR,EXPERIENCE], function(err, result) {

                if(err){
                  console.log(err);
                  console.log("in 2");
                  obj.status = "FAIL";
                  res.send(JSON.stringify(obj));
                  connection.rollback(function(){
                    return err;
                  })
                }else{

                  if(result.affectedRows == 1){

                    try{

                      connection.query(sql1,[PLD_ROLE,EMAIL,PASSWORD,ID,MOBILE],function(err1,result1){


                        if(err1){
                          console.log("in 4");
                          obj.status = "FAIL";
                          res.send(JSON.stringify(obj));
                          connection.rollback(function(){
                            return err1;
                          })
                        }else{

                          if(result1.affectedRows == 1){

                            connection.commit(function(err){
                              if(err){
                                console.log("in 6");
                                connection.rollback(function(){
                                  return err;
                                })
                                obj.status = "FAIL";
                                res.send(JSON.stringify(obj));
                              }else{
                                obj.status = "SUCCESS";
                                obj.id = ID;
                                res.send(JSON.stringify(obj));
                              }
                            })
                          }else{
                            console.log("in 5");
                            connection.rollback(function(){
                              // throw err;
                            })
                            obj.status = "FAIL";
                            res.send(JSON.stringify(obj));
                          }

                        }

                      });

                    }catch(err){
                      console.log(" I AM IN THE CATCHHHH "+err);
                    }


                  }else{
                    console.log("in 3");
                    connection.rollback(function(){
                      // throw err;
                    })
                    obj.status = "FAIL";
                    res.send(JSON.stringify(obj));
                  }
                }

                  connection.release();
              });



        }

      });

    }
  });


}

// app.get("/sss",function(req,res){
//
//   var Aray = [];
//
//   var QQ = {
//     aa : [],
//     status:"SUCCESS"
//   }
//   var obj = {
//     lname:"",
//     lflagservice:"",
//     ladrline1:"",
//     dlmid:""
//   }
//
//   for(var i=0;i<9;i++){
//
//       obj.lname = i.toString()+"result[i].lm_name";
//       obj.lflagservice = i.toString()+"result[i].lm_flag_home_service_ref";
//       obj.ladrline1 = i.toString()+"result[i].lm_address_line1";
//       obj.dlmid = i.toString()+"result[i].dlm_id";
//       QQ.aa.push(obj);
//   }
//
//   res.send(JSON.stringify(QQ));
//   // console.log(Aray);
//
//
// })
//

app.listen(port,function(err1){
  console.log("Listening on the port 3000");
});
