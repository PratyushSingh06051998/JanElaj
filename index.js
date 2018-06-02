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


app.post("/numberverify",function(req,res){


  var MOBILE =  req.body.mobile;
  var PLD_ROLE = req.body.pldrole;

  var obj = {
    status : "SUCCESS"
  }

  var sql = 'SELECT COUNT(*) AS namesCount FROM partner_login_details_master WHERE pld_role = ? AND  pld_mobile = ?';

  con.getConnection(function(err, connection) {

    // if(err){
    //   obj.status = "FAIL";
    //   res.send(JSON.stringify(obj));
    //   //write  a log file
    // }else{


        if(err){
          obj.status = "FAIL";
          res.send(JSON.stringify(obj));
          return err;
        }else{

          connection.query(sql,[PLD_ROLE,MOBILE], function(err, result) {

            if(err){
              obj.status = "FAIL";
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


    // }
  });



});


app.post("/registeruser",function(req,res){


  var ID="";
  var PLD_ROLE = req.body.pldrole;
  var REGISTRATION_NUMBER =  req.body.registernumber;
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
    status : "SUCCESS"
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



function InsertFinalValue(req,res,id){


  var obj = {
    status : "SUCCESS"
  }

  var ID=id;
  var PLD_ROLE = req.body.pldrole;
  var NAME =  req.body.name;
  var DOB =  req.body.dob;
  var GENDER =  req.body.gender;
  var EMAIL =  req.body.email;
  var PASSWORD =  req.body.password;
  var MOBILE =  req.body.mobile;
  var SPECIALITY_ID =  parseInt(req.body.specialityid);
  var REGISTRATION_NUMBER =  req.body.registernumber;
  var REGISTRATION_COUNCIL =  req.body.registercouncil;
  var REGISTRATION_YEAR =  req.body.registeryear;
  var EXPERIENCE =  parseInt(req.body.experience);
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


  var sql = "INSERT INTO doctor_master (dm_doctor_id, dm_doctor_name, dm_dob, dm_gender, dm_doctor_contact_mobile, dm_doctor_speciality_id, dm_doctor_email, dm_medical_registration_number, dm_registration_council, dm_registration_year, dm_doctor_experience) VALUES((?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?))";
  var sql1 = "INSERT INTO partner_login_details_master (pld_role, pld_username, pld_password, pld_partner_id, pld_mobile) VALUES ((?),(?),(?),(?),(?))";


  con.getConnection(function(err, connection) {

    if(err){
      obj.status = "FAIL";
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
                            res.send(JSON.stringify(obj));
                          }
                        })
                      }else{
                        console.log("in 5");
                        connection.rollback(function(){
                          throw err;
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
                  throw err;
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



app.listen(port,function(err1){
  console.log("Listening on the port 3000");
});
