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
  console.log("has been hit in registeuser");

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

            var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
            var Mydata = [];
            var csvStream = csv.parse().on("data", function(data){

                  var value=0;

                  if(data[0] == PLD_ROLE){

                    value = parseInt(data[1]);
                    ID = PLD_ROLE+""+data[1];
                    value++;
                    data[1]=value.toString();
                  }
                  Mydata.push(data);
                })
                .on("end", function(){
                     var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
                     csv.write(Mydata, {headers: true}).pipe(ws);
                     InsertFinalValue(req,res,ID);
                });
            stream.pipe(csvStream);
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

            connection.release();

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
  console.log("Has been hit");


  var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
  var Mydata = [];
  var csvStream = csv.parse().on("data", function(data){

        var valueloc=0;
        var valuedlm=0;

        if(data[0] == "LOC"){

          valueloc = parseInt(data[1]);
          LocId = "LOC"+""+data[1];
          valueloc++;
          data[1]=valueloc.toString();
        }

        if(data[0] == "DLM"){

          valuedlm = parseInt(data[1]);
          DlmId = "DLM"+""+data[1];
          valuedlm++;
          data[1]=valuedlm.toString();
        }
        Mydata.push(data);
      })
      .on("end", function(){
           var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
           csv.write(Mydata, {headers: true}).pipe(ws);
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

            connection.release();

          })

        }

      })

    }

  })

})

app.post("/managelocation",function(req,res){

  var Object = req.body;

  var DocId = Object.docid;

  console.log("has been hit in manage location");

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
      return err;
    }else{
      connection.query(sql,[DocId],function(err,result){
        if(err){
          console.log("ERROR IN RUNNING SQL IN FETCHLOCATION FOR DocId = "+DocId);
          console.log("ERROR CODE :"+err.code);
          console.log("ERROR : "+err);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
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

            MainObj.locations.push(obj);

          }

          res.send(JSON.stringify(MainObj));

        }

        connection.release();

      })
    }

  })


})

app.post("/timeinsert",function(req,res){

  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];
  var Dldmid="";
  var valuedldm=0;
  var cvaluedldm=0;
  var count=0;
  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;



  console.log("1");

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;

  console.log(MON);


  var MainObj = {
    status:"SUCCESS"
  }

  // console.log("2");
  var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
  var Mydata = [];
  var csvStream = csv.parse().on("data", function(data){


        if(data[0] == "DLDM"){

          valuedldm = parseInt(data[1]);
          valuedldm = valuedldm + 7;
          data[1]=valuedldm.toString();
          valuedldm = valuedldm - 7;
          cvaluedldm=valuedldm;
          console.log("1");
        }
        console.log("2");
        Mydata.push(data);
      })
      .on("end", function(){
           var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
           csv.write(Mydata, {headers: true}).pipe(ws);

           var sql1 = "INSERT INTO doctor_location_day_master (dldm_dlm_id, dldm_day_number, dldm_id) VALUES ((?),(?),(?))";
           var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";

           console.log("3");
           con.getConnection(function(err,connection){

             if(err){
               console.log("ERROR IN TIMEINSEERT IN CONNECTING TO DATABASE FOR DLDMID = "+DlmId);
               console.log("ERROR : "+err);
               console.log("ERROR CODE : "+err.code);
               MainObj.status = "CONNECTION ERROR";
               res.send(JSON.stringify(MainObj));
               return err;
             }else{

               console.log("4");

               connection.beginTransaction(function(err){

                 if(err){
                   console.log("ERROR IN TIMEINSEERT IN RUNNING TRANSACTION FOR DLDMID = "+DlmId);
                   console.log("ERROR : "+err);
                   console.log("ERROR CODE : "+err.code);
                   MainObj.status = "CONNECTION ERROR";
                   res.send(JSON.stringify(MainObj));
                   return err;
                 }else{

                   console.log("5");
                   Dldmid = "DLDM"+""+valuedldm.toString();
                   console.log("in main forr loop  = "+Dldmid);

                   connection.query(sql1,[Dldmid,"MON",DlmId],function(err,result){

                     if(err){
                       console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                       console.log("ERROR : "+err);
                       console.log("ERROR CODE : "+err.code);
                       MainObj.status = "CONNECTION ERROR";
                       res.send(JSON.stringify(MainObj));
                       connection.rollback(function(){
                         return err;
                       })
                     }else{

                       console.log("6");
                       if(MON.length==0){

                         valuedldm++;

                         Dldmid = "DLDM"+""+valuedldm.toString();
                         console.log("in main forr loop  = "+Dldmid);

                         connection.query(sql1,[Dldmid,"TUE",DlmId],function(err,result){

                           if(err){
                             console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                             console.log("ERROR : "+err);
                             console.log("ERROR CODE : "+err.code);
                             MainObj.status = "CONNECTION ERROR";
                             res.send(JSON.stringify(MainObj));
                             connection.rollback(function(){
                               return err;
                             })
                           }else{

                             if(TUE.length == 0){


                               valuedldm++;

                               Dldmid = "DLDM"+""+valuedldm.toString();
                               console.log("in main forr loop  = "+Dldmid);

                               connection.query(sql1,[Dldmid,"WED",DlmId],function(err,result){

                                 if(err){
                                   console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                   console.log("ERROR : "+err);
                                   console.log("ERROR CODE : "+err.code);
                                   MainObj.status = "CONNECTION ERROR";
                                   res.send(JSON.stringify(MainObj));
                                   connection.rollback(function(){
                                     return err;
                                   })
                                 }else{

                                   if(WED.length==0){
                                     valuedldm++;

                                     Dldmid = "DLDM"+""+valuedldm.toString();
                                     console.log("in main forr loop  = "+Dldmid);

                                     connection.query(sql1,[Dldmid,"THU",DlmId],function(err,result){

                                       if(err){
                                         console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                         console.log("ERROR : "+err);
                                         console.log("ERROR CODE : "+err.code);
                                         MainObj.status = "CONNECTION ERROR";
                                         res.send(JSON.stringify(MainObj));
                                         connection.rollback(function(){
                                           return err;
                                         })
                                       }else{

                                         if(THU.length == 0){
                                           valuedldm++;

                                           Dldmid = "DLDM"+""+valuedldm.toString();
                                           console.log("in main forr loop  = "+Dldmid);

                                           connection.query(sql1,[Dldmid,"FRI",DlmId],function(err,result){

                                             if(err){
                                               console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                               console.log("ERROR : "+err);
                                               console.log("ERROR CODE : "+err.code);
                                               MainObj.status = "CONNECTION ERROR";
                                               res.send(JSON.stringify(MainObj));
                                               connection.rollback(function(){
                                                 return err;
                                               })
                                             }else{

                                               if(FRI.length==0){
                                                 valuedldm++;

                                                 Dldmid = "DLDM"+""+valuedldm.toString();
                                                 console.log("in main forr loop  = "+Dldmid);

                                                 connection.query(sql1,[Dldmid,"SAT",DlmId],function(err,result){

                                                   if(err){
                                                     console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                     console.log("ERROR : "+err);
                                                     console.log("ERROR CODE : "+err.code);
                                                     MainObj.status = "CONNECTION ERROR";
                                                     res.send(JSON.stringify(MainObj));
                                                     connection.rollback(function(){
                                                       return err;
                                                     })
                                                   }else{

                                                     if(SAT.length == 0){
                                                       valuedldm++;

                                                       Dldmid = "DLDM"+""+valuedldm.toString();
                                                       console.log("in main forr loop  = "+Dldmid);

                                                       connection.query(sql1,[Dldmid,"SUN",DlmId],function(err,result){

                                                         if(err){
                                                           console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                           console.log("ERROR : "+err);
                                                           console.log("ERROR CODE : "+err.code);
                                                           MainObj.status = "CONNECTION ERROR";
                                                           res.send(JSON.stringify(MainObj));
                                                           connection.rollback(function(){
                                                             return err;
                                                           })
                                                         }else{

                                                           if(SUN.length==0){
                                                             connection.commit(function(err){
                                                               if (err) {
                                                                 console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                                 console.log("ERROR : "+err);
                                                                 console.log("ERROR CODE : "+err.code);
                                                                 MainObj.status = "CONNECTION ERROR";
                                                                 res.send(JSON.stringify(MainObj));
                                                                 connection.rollback(function(){
                                                                   return err;
                                                                 })
                                                               }else{
                                                                 MainObj.status = "SUCCESS";
                                                                 res.send(JSON.stringify(MainObj));
                                                               }
                                                             })
                                                           }else{
                                                             insertsunday(connection,res,req,Dldmid,valuedldm);
                                                           }


                                                         }

                                                       })
                                                     }else{
                                                       insertsaturday(connection,res,req,Dldmid,valuedldm);
                                                     }


                                                   }

                                                 })
                                               }else{
                                                 insertfriday(connection,res,req,Dldmid,valuedldm);
                                               }

                                             }

                                           })
                                         }else{
                                           insertthursday(connection,res,req,Dldmid,valuedldm);
                                         }

                                       }

                                     })
                                   }else{
                                     insertwednesday(connection,res,req,Dldmid,valuedldm);
                                   }

                                 }

                               })

                             }else{
                               inserttuesday(connection,res,req,Dldmid,valuedldm);
                             }

                           }

                         })


                       }else{
                         insertmonday(connection,res,req,Dldmid,valuedldm);
                       }
                       // for(var moni=0;moni<MON.length;moni++){
                       //
                       //   var monid="DLDM"+""+valuedldm.toString();
                       //   var montime = MON[moni].time.split("_");
                       //   console.log("moni = "+moni);
                       //   console.log("montime = "+montime[0]+" to "+montime[1]);
                       //   console.log("monid = "+monid);
                       //
                       //   connection.query(sql2,[monid,montime[0],montime[1],"N"],function(err,result){
                       //
                       //     if(err){
                       //       console.log("ERROR IN RUNNING SQL2 IN MONDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+monid);
                       //       console.log("ERROR : "+err);
                       //       console.log("ERROR CODE : "+err.code);
                       //       MainObj.status = "CONNECTION ERROR";
                       //       res.send(JSON.stringify(MainObj));
                       //       connection.rollback(function(){
                       //         return err;
                       //       })
                       //       return;
                       //     }else{
                       //
                       //       moncount++;
                       //       console.log("moncount = "+moncount);
                       //       if(moncount == MON.length){
                       //         valuedldm++;
                       //
                       //
                       //         Dldmid = "DLDM"+""+valuedldm.toString();
                       //         console.log("in main forr loop  = "+Dldmid);
                       //
                       //         connection.query(sql1,[Dldmid,"TUE",DlmId],function(err,result){
                       //
                       //           if(err){
                       //             console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                       //             console.log("ERROR : "+err);
                       //             console.log("ERROR CODE : "+err.code);
                       //             MainObj.status = "CONNECTION ERROR";
                       //             res.send(JSON.stringify(MainObj));
                       //             connection.rollback(function(){
                       //               return err;
                       //             })
                       //           }else{
                       //
                       //             for(var tuei=0;tuei<TUE.length;tuei++){
                       //
                       //               var tueid="DLDM"+""+valuedldm.toString();
                       //               var tuetime = TUE[tuei].time.split("_");
                       //               console.log("tuei = "+tuei);
                       //               console.log("tuetime = "+tuetime[0]+" to "+tuetime[1]);
                       //               console.log("tueid = "+tueid);
                       //
                       //               connection.query(sql2,[tueid,tuetime[0],tuetime[1],"N"],function(err,result){
                       //
                       //                 if(err){
                       //                   console.log("ERROR IN RUNNING SQL2 IN TUESDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+tueid);
                       //                   console.log("ERROR : "+err);
                       //                   console.log("ERROR CODE : "+err.code);
                       //                   MainObj.status = "CONNECTION ERROR";
                       //                   res.send(JSON.stringify(MainObj));
                       //                   connection.rollback(function(){
                       //                     return err;
                       //                   })
                       //                   return;
                       //                 }else{
                       //
                       //                   tuecount++;
                       //                   console.log("tuecount = "+tuecount);
                       //                   if(tuecount == TUE.length){
                       //                     valuedldm++;
                       //
                       //                     Dldmid = "DLDM"+""+valuedldm.toString();
                       //                     console.log("in main forr loop  = "+Dldmid);
                       //
                       //                     connection.query(sql1,[Dldmid,"WED",DlmId],function(err,result){
                       //
                       //                       if(err){
                       //                         console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                       //                         console.log("ERROR : "+err);
                       //                         console.log("ERROR CODE : "+err.code);
                       //                         MainObj.status = "CONNECTION ERROR";
                       //                         res.send(JSON.stringify(MainObj));
                       //                         connection.rollback(function(){
                       //                           return err;
                       //                         })
                       //                       }else{
                       //
                       //                         for(var wedi=0;wedi<WED.length;wedi++){
                       //
                       //                           var wedid="DLDM"+""+valuedldm.toString();
                       //                           var wedtime = WED[wedi].time.split("_");
                       //                           console.log("wedi = "+wedi);
                       //                           console.log("wedtime = "+wedtime[0]+" to "+wedtime[1]);
                       //                           console.log("wedid = "+wedid);
                       //
                       //                           connection.query(sql2,[wedid,wedtime[0],wedtime[1],"N"],function(err,result){
                       //
                       //                             if(err){
                       //                               console.log("ERROR IN RUNNING SQL2 IN WEDNESDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+wedid);
                       //                               console.log("ERROR : "+err);
                       //                               console.log("ERROR CODE : "+err.code);
                       //                               MainObj.status = "CONNECTION ERROR";
                       //                               res.send(JSON.stringify(MainObj));
                       //                               connection.rollback(function(){
                       //                                 return err;
                       //                               })
                       //                               return;
                       //                             }else{
                       //
                       //                               wedcount++;
                       //                               console.log("wedcount = "+wedcount);
                       //                               if(wedcount == WED.length){
                       //                                 valuedldm++;
                       //
                       //                                 Dldmid = "DLDM"+""+valuedldm.toString();
                       //                                 console.log("in main forr loop  = "+Dldmid);
                       //
                       //                                 connection.query(sql1,[Dldmid,"THU",DlmId],function(err,result){
                       //
                       //                                   if(err){
                       //                                     console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                       //                                     console.log("ERROR : "+err);
                       //                                     console.log("ERROR CODE : "+err.code);
                       //                                     MainObj.status = "CONNECTION ERROR";
                       //                                     res.send(JSON.stringify(MainObj));
                       //                                     connection.rollback(function(){
                       //                                       return err;
                       //                                     })
                       //                                   }else{
                       //
                       //                                     for(var thui=0;thui<THU.length;thui++){
                       //
                       //                                       var thuid="DLDM"+""+valuedldm.toString();
                       //                                       var thutime = THU[thui].time.split("_");
                       //                                       console.log("thui = "+thui);
                       //                                       console.log("thutime = "+thutime[0]+" to "+thutime[1]);
                       //                                       console.log("thuid = "+thuid);
                       //
                       //                                       connection.query(sql2,[thuid,thutime[0],thutime[1],"N"],function(err,result){
                       //
                       //                                         if(err){
                       //                                           console.log("ERROR IN RUNNING SQL2 IN THURSDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+thuid);
                       //                                           console.log("ERROR : "+err);
                       //                                           console.log("ERROR CODE : "+err.code);
                       //                                           MainObj.status = "CONNECTION ERROR";
                       //                                           res.send(JSON.stringify(MainObj));
                       //                                           connection.rollback(function(){
                       //                                             return err;
                       //                                           })
                       //                                           return;
                       //                                         }else{
                       //
                       //                                           thucount++;
                       //                                           console.log("thucount = "+thucount);
                       //                                           if(thucount == THU.length){
                       //                                             valuedldm++;
                       //
                       //                                             Dldmid = "DLDM"+""+valuedldm.toString();
                       //                                             console.log("in main forr loop  = "+Dldmid);
                       //
                       //                                             connection.query(sql1,[Dldmid,"FRI",DlmId],function(err,result){
                       //
                       //                                               if(err){
                       //                                                 console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                       //                                                 console.log("ERROR : "+err);
                       //                                                 console.log("ERROR CODE : "+err.code);
                       //                                                 MainObj.status = "CONNECTION ERROR";
                       //                                                 res.send(JSON.stringify(MainObj));
                       //                                                 connection.rollback(function(){
                       //                                                   return err;
                       //                                                 })
                       //                                               }else{
                       //
                       //                                                 for(var frii=0;frii<FRI.length;frii++){
                       //
                       //                                                   var friid="DLDM"+""+valuedldm.toString();
                       //                                                   var fritime = FRI[frii].time.split("_");
                       //                                                   console.log("frii = "+frii);
                       //                                                   console.log("fritime = "+fritime[0]+" to "+fritime[1]);
                       //                                                   console.log("friid = "+friid);
                       //
                       //                                                   connection.query(sql2,[friid,fritime[0],fritime[1],"N"],function(err,result){
                       //
                       //                                                     if(err){
                       //                                                       console.log("ERROR IN RUNNING SQL2 IN FRIDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+friid);
                       //                                                       console.log("ERROR : "+err);
                       //                                                       console.log("ERROR CODE : "+err.code);
                       //                                                       MainObj.status = "CONNECTION ERROR";
                       //                                                       res.send(JSON.stringify(MainObj));
                       //                                                       connection.rollback(function(){
                       //                                                         return err;
                       //                                                       })
                       //                                                       return;
                       //                                                     }else{
                       //
                       //                                                       fricount++;
                       //                                                       console.log("fricount = "+fricount);
                       //                                                       if(fricount == FRI.length){
                       //                                                         valuedldm++;
                       //
                       //                                                         Dldmid = "DLDM"+""+valuedldm.toString();
                       //                                                         console.log("in main forr loop  = "+Dldmid);
                       //
                       //                                                         connection.query(sql1,[Dldmid,"SAT",DlmId],function(err,result){
                       //
                       //                                                           if(err){
                       //                                                             console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                       //                                                             console.log("ERROR : "+err);
                       //                                                             console.log("ERROR CODE : "+err.code);
                       //                                                             MainObj.status = "CONNECTION ERROR";
                       //                                                             res.send(JSON.stringify(MainObj));
                       //                                                             connection.rollback(function(){
                       //                                                               return err;
                       //                                                             })
                       //                                                           }else{
                       //
                       //                                                             for(var sati=0;sati<SAT.length;sati++){
                       //
                       //                                                               var satid="DLDM"+""+valuedldm.toString();
                       //                                                               var sattime = SAT[sati].time.split("_");
                       //                                                               console.log("sati = "+sati);
                       //                                                               console.log("sattime = "+sattime[0]+" to "+sattime[1]);
                       //                                                               console.log("satid = "+satid);
                       //
                       //                                                               connection.query(sql2,[satid,sattime[0],sattime[1],"N"],function(err,result){
                       //
                       //                                                                 if(err){
                       //                                                                   console.log("ERROR IN RUNNING SQL2 IN SATURDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+satid);
                       //                                                                   console.log("ERROR : "+err);
                       //                                                                   console.log("ERROR CODE : "+err.code);
                       //                                                                   MainObj.status = "CONNECTION ERROR";
                       //                                                                   res.send(JSON.stringify(MainObj));
                       //                                                                   connection.rollback(function(){
                       //                                                                     return err;
                       //                                                                   })
                       //                                                                   return;
                       //                                                                 }else{
                       //
                       //                                                                   satcount++;
                       //                                                                   console.log("satcount = "+satcount);
                       //                                                                   if(satcount == SAT.length){
                       //                                                                     valuedldm++;
                       //
                       //                                                                     Dldmid = "DLDM"+""+valuedldm.toString();
                       //                                                                     console.log("in main forr loop  = "+Dldmid);
                       //
                       //                                                                     connection.query(sql1,[Dldmid,"SUN",DlmId],function(err,result){
                       //
                       //                                                                       if(err){
                       //                                                                         console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                       //                                                                         console.log("ERROR : "+err);
                       //                                                                         console.log("ERROR CODE : "+err.code);
                       //                                                                         MainObj.status = "CONNECTION ERROR";
                       //                                                                         res.send(JSON.stringify(MainObj));
                       //                                                                         connection.rollback(function(){
                       //                                                                           return err;
                       //                                                                         })
                       //                                                                       }else{
                       //
                       //                                                                         for(var suni=0;suni<SUN.length;suni++){
                       //
                       //                                                                           var sunid="DLDM"+""+valuedldm.toString();
                       //                                                                           var suntime = SUN[suni].time.split("_");
                       //                                                                           console.log("suni = "+suni);
                       //                                                                           console.log("suntime = "+suntime[0]+" to "+suntime[1]);
                       //                                                                           console.log("sunid = "+sunid);
                       //
                       //                                                                           connection.query(sql2,[sunid,suntime[0],suntime[1],"N"],function(err,result){
                       //
                       //                                                                             if(err){
                       //                                                                               console.log("ERROR IN RUNNING SQL2 IN SUNDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+sunid);
                       //                                                                               console.log("ERROR : "+err);
                       //                                                                               console.log("ERROR CODE : "+err.code);
                       //                                                                               MainObj.status = "CONNECTION ERROR";
                       //                                                                               res.send(JSON.stringify(MainObj));
                       //                                                                               connection.rollback(function(){
                       //                                                                                 return err;
                       //                                                                               })
                       //                                                                               return;
                       //                                                                             }else{
                       //
                       //                                                                               suncount++;
                       //                                                                               console.log("suncount = "+suncount);
                       //                                                                               if(suncount == SUN.length){
                       //                                                                                 valuedldm++;
                       //
                       //                                                                                 connection.commit(function(err){
                       //                                                                                   if (err) {
                       //
                       //                                                                                   }
                       //                                                                                 })
                       //
                       //                                                                               }
                       //
                       //                                                                             }
                       //
                       //                                                                           })
                       //
                       //                                                                         }
                       //                                                                       }
                       //
                       //                                                                     })
                       //
                       //                                                                   }
                       //
                       //                                                                 }
                       //
                       //                                                               })
                       //
                       //                                                             }
                       //                                                           }
                       //
                       //                                                         })
                       //
                       //                                                       }
                       //
                       //                                                     }
                       //
                       //                                                   })
                       //
                       //                                                 }
                       //                                               }
                       //
                       //                                             })
                       //
                       //                                           }
                       //
                       //                                         }
                       //
                       //                                       })
                       //
                       //                                     }
                       //                                   }
                       //
                       //                                 })
                       //
                       //                               }
                       //
                       //                             }
                       //
                       //                           })
                       //
                       //                         }
                       //                       }
                       //
                       //                     })
                       //
                       //                   }
                       //
                       //                 }
                       //
                       //               })
                       //
                       //             }
                       //           }
                       //
                       //         })
                       //
                       //
                       //
                       //
                       //       }
                       //
                       //
                       //       }
                       //
                       //
                       //
                       //   })
                       //
                       // }

                     }

                   })




                 }

                 connection.release();


               })

             }


           })

      });
  stream.pipe(csvStream);




});

function insertmonday(connection,res,req,Dldmid,valuedldm){


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];
  // var Dldmid="";
  // var valuedldm=0;
  // var cvaluedldm=0;
  // var count=0;
  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;



  console.log("1");

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;

  console.log(MON);


  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_dlm_id, dldm_day_number, dldm_id) VALUES ((?),(?),(?))";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";

  for(var moni=0;moni<MON.length;moni++){

    var monid="DLDM"+""+valuedldm.toString();
    var montime = MON[moni].time.split("_");
    console.log("moni = "+moni);
    console.log("montime = "+montime[0]+" to "+montime[1]);
    console.log("monid = "+monid);

    connection.query(sql2,[monid,montime[0],montime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN MONDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+monid);
        console.log("ERROR : "+err);
        console.log("ERROR CODE : "+err.code);
        MainObj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(MainObj));
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        moncount++;
        console.log("moncount = "+moncount);
        if(moncount == MON.length){

          // valuedldm++;
          //
          // Dldmid = "DLDM"+""+valuedldm.toString();
          // console.log("in main forr loop  = "+Dldmid);
          //
          // connection.query(sql1,[Dldmid,"TUE",DlmId],function(err,result){
          //
          //   if(err){
          //     console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
          //     console.log("ERROR : "+err);
          //     console.log("ERROR CODE : "+err.code);
          //     MainObj.status = "CONNECTION ERROR";
          //     res.send(JSON.stringify(MainObj));
          //     connection.rollback(function(){
          //       return err;
          //     })
          //   }else{
          //
          //     if(TUE.length == 0){
          //       valuedldm++;
          //       Dldmid = "DLDM"+""+valuedldm.toString();
          //       insertwednesday(connection,res,req,Dldmid,valuedldm);
          //     }else{
          //       inserttuesday(connection,res,req,Dldmid,valuedldm);
          //     }
          //
          //   }
          //
          // })

          valuedldm++;

          Dldmid = "DLDM"+""+valuedldm.toString();
          console.log("in main forr loop  = "+Dldmid);

          connection.query(sql1,[Dldmid,"TUE",DlmId],function(err,result){

            if(err){
              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              console.log("ERROR CODE : "+err.code);
              MainObj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{

              if(TUE.length == 0){


                valuedldm++;

                Dldmid = "DLDM"+""+valuedldm.toString();
                console.log("in main forr loop  = "+Dldmid);

                connection.query(sql1,[Dldmid,"WED",DlmId],function(err,result){

                  if(err){
                    console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    console.log("ERROR CODE : "+err.code);
                    MainObj.status = "CONNECTION ERROR";
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{

                    if(WED.length==0){
                      valuedldm++;

                      Dldmid = "DLDM"+""+valuedldm.toString();
                      console.log("in main forr loop  = "+Dldmid);

                      connection.query(sql1,[Dldmid,"THU",DlmId],function(err,result){

                        if(err){
                          console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                          console.log("ERROR : "+err);
                          console.log("ERROR CODE : "+err.code);
                          MainObj.status = "CONNECTION ERROR";
                          res.send(JSON.stringify(MainObj));
                          connection.rollback(function(){
                            return err;
                          })
                        }else{

                          if(THU.length == 0){
                            valuedldm++;

                            Dldmid = "DLDM"+""+valuedldm.toString();
                            console.log("in main forr loop  = "+Dldmid);

                            connection.query(sql1,[Dldmid,"FRI",DlmId],function(err,result){

                              if(err){
                                console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                console.log("ERROR : "+err);
                                console.log("ERROR CODE : "+err.code);
                                MainObj.status = "CONNECTION ERROR";
                                res.send(JSON.stringify(MainObj));
                                connection.rollback(function(){
                                  return err;
                                })
                              }else{

                                if(FRI.length==0){
                                  valuedldm++;

                                  Dldmid = "DLDM"+""+valuedldm.toString();
                                  console.log("in main forr loop  = "+Dldmid);

                                  connection.query(sql1,[Dldmid,"SAT",DlmId],function(err,result){

                                    if(err){
                                      console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                      console.log("ERROR : "+err);
                                      console.log("ERROR CODE : "+err.code);
                                      MainObj.status = "CONNECTION ERROR";
                                      res.send(JSON.stringify(MainObj));
                                      connection.rollback(function(){
                                        return err;
                                      })
                                    }else{

                                      if(SAT.length == 0){
                                        valuedldm++;

                                        Dldmid = "DLDM"+""+valuedldm.toString();
                                        console.log("in main forr loop  = "+Dldmid);

                                        connection.query(sql1,[Dldmid,"SUN",DlmId],function(err,result){

                                          if(err){
                                            console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                            console.log("ERROR : "+err);
                                            console.log("ERROR CODE : "+err.code);
                                            MainObj.status = "CONNECTION ERROR";
                                            res.send(JSON.stringify(MainObj));
                                            connection.rollback(function(){
                                              return err;
                                            })
                                          }else{

                                            if(SUN.length==0){
                                              connection.commit(function(err){
                                                if (err) {
                                                  console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                  console.log("ERROR : "+err);
                                                  console.log("ERROR CODE : "+err.code);
                                                  MainObj.status = "CONNECTION ERROR";
                                                  res.send(JSON.stringify(MainObj));
                                                  connection.rollback(function(){
                                                    return err;
                                                  })
                                                }else{
                                                  MainObj.status = "SUCCESS";
                                                  res.send(JSON.stringify(MainObj));
                                                }
                                              })
                                            }else{
                                              insertsunday(connection,res,req,Dldmid,valuedldm);
                                            }


                                          }

                                        })
                                      }else{
                                        insertsaturday(connection,res,req,Dldmid,valuedldm);
                                      }


                                    }

                                  })
                                }else{
                                  insertfriday(connection,res,req,Dldmid,valuedldm);
                                }

                              }

                            })
                          }else{
                            insertthursday(connection,res,req,Dldmid,valuedldm);
                          }

                        }

                      })
                    }else{
                      insertwednesday(connection,res,req,Dldmid,valuedldm);
                    }

                  }

                })

              }else{
                inserttuesday(connection,res,req,Dldmid,valuedldm);
              }

            }

          })



        }


        }



    })

  }

}

function inserttuesday(connection,res,req,Dldmid,valuedldm){


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];
  // var Dldmid="";
  // var valuedldm=0;
  // var cvaluedldm=0;
  // var count=0;
  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;



  console.log("1");

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;

  console.log(MON);


  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_dlm_id, dldm_day_number, dldm_id) VALUES ((?),(?),(?))";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";


  for(var tuei=0;tuei<TUE.length;tuei++){

    var tueid="DLDM"+""+valuedldm.toString();
    var tuetime = TUE[tuei].time.split("_");
    console.log("tuei = "+tuei);
    console.log("tuetime = "+tuetime[0]+" to "+tuetime[1]);
    console.log("tueid = "+tueid);

    connection.query(sql2,[tueid,tuetime[0],tuetime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN TUESDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+tueid);
        console.log("ERROR : "+err);
        console.log("ERROR CODE : "+err.code);
        MainObj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(MainObj));
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        tuecount++;
        console.log("tuecount = "+tuecount);
        if(tuecount == TUE.length){

          valuedldm++;

          Dldmid = "DLDM"+""+valuedldm.toString();
          console.log("in main forr loop  = "+Dldmid);

          connection.query(sql1,[Dldmid,"WED",DlmId],function(err,result){

            if(err){
              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              console.log("ERROR CODE : "+err.code);
              MainObj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{

              if(WED.length==0){
                valuedldm++;

                Dldmid = "DLDM"+""+valuedldm.toString();
                console.log("in main forr loop  = "+Dldmid);

                connection.query(sql1,[Dldmid,"THU",DlmId],function(err,result){

                  if(err){
                    console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    console.log("ERROR CODE : "+err.code);
                    MainObj.status = "CONNECTION ERROR";
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{

                    if(THU.length == 0){
                      valuedldm++;

                      Dldmid = "DLDM"+""+valuedldm.toString();
                      console.log("in main forr loop  = "+Dldmid);

                      connection.query(sql1,[Dldmid,"FRI",DlmId],function(err,result){

                        if(err){
                          console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                          console.log("ERROR : "+err);
                          console.log("ERROR CODE : "+err.code);
                          MainObj.status = "CONNECTION ERROR";
                          res.send(JSON.stringify(MainObj));
                          connection.rollback(function(){
                            return err;
                          })
                        }else{

                          if(FRI.length==0){
                            valuedldm++;

                            Dldmid = "DLDM"+""+valuedldm.toString();
                            console.log("in main forr loop  = "+Dldmid);

                            connection.query(sql1,[Dldmid,"SAT",DlmId],function(err,result){

                              if(err){
                                console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                console.log("ERROR : "+err);
                                console.log("ERROR CODE : "+err.code);
                                MainObj.status = "CONNECTION ERROR";
                                res.send(JSON.stringify(MainObj));
                                connection.rollback(function(){
                                  return err;
                                })
                              }else{

                                if(SAT.length == 0){
                                  valuedldm++;

                                  Dldmid = "DLDM"+""+valuedldm.toString();
                                  console.log("in main forr loop  = "+Dldmid);

                                  connection.query(sql1,[Dldmid,"SUN",DlmId],function(err,result){

                                    if(err){
                                      console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                      console.log("ERROR : "+err);
                                      console.log("ERROR CODE : "+err.code);
                                      MainObj.status = "CONNECTION ERROR";
                                      res.send(JSON.stringify(MainObj));
                                      connection.rollback(function(){
                                        return err;
                                      })
                                    }else{

                                      if(SUN.length==0){
                                        connection.commit(function(err){
                                          if (err) {
                                            console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                            console.log("ERROR : "+err);
                                            console.log("ERROR CODE : "+err.code);
                                            MainObj.status = "CONNECTION ERROR";
                                            res.send(JSON.stringify(MainObj));
                                            connection.rollback(function(){
                                              return err;
                                            })
                                          }else{
                                            MainObj.status = "SUCCESS";
                                            res.send(JSON.stringify(MainObj));
                                          }
                                        })
                                      }else{
                                        insertsunday(connection,res,req,Dldmid,valuedldm);
                                      }


                                    }

                                  })
                                }else{
                                  insertsaturday(connection,res,req,Dldmid,valuedldm);
                                }


                              }

                            })
                          }else{
                            insertfriday(connection,res,req,Dldmid,valuedldm);
                          }

                        }

                      })
                    }else{
                      insertthursday(connection,res,req,Dldmid,valuedldm);
                    }

                  }

                })
              }else{
                insertwednesday(connection,res,req,Dldmid,valuedldm);
              }

            }

          })

        }

      }

    })

  }

}

function insertwednesday(connection,res,req,Dldmid,valuedldm){


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];
  // var Dldmid="";
  // var valuedldm=0;
  // var cvaluedldm=0;
  // var count=0;
  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;



  console.log("1");

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;

  console.log(MON);


  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_dlm_id, dldm_day_number, dldm_id) VALUES ((?),(?),(?))";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";


  for(var wedi=0;wedi<WED.length;wedi++){

    var wedid="DLDM"+""+valuedldm.toString();
    var wedtime = WED[wedi].time.split("_");
    console.log("wedi = "+wedi);
    console.log("wedtime = "+wedtime[0]+" to "+wedtime[1]);
    console.log("wedid = "+wedid);

    connection.query(sql2,[wedid,wedtime[0],wedtime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN WEDNESDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+wedid);
        console.log("ERROR : "+err);
        console.log("ERROR CODE : "+err.code);
        MainObj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(MainObj));
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        wedcount++;
        console.log("wedcount = "+wedcount);
        if(wedcount == WED.length){
          valuedldm++;

          Dldmid = "DLDM"+""+valuedldm.toString();
          console.log("in main forr loop  = "+Dldmid);

          connection.query(sql1,[Dldmid,"THU",DlmId],function(err,result){

            if(err){
              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              console.log("ERROR CODE : "+err.code);
              MainObj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{

              if(THU.length == 0){
                valuedldm++;

                Dldmid = "DLDM"+""+valuedldm.toString();
                console.log("in main forr loop  = "+Dldmid);

                connection.query(sql1,[Dldmid,"FRI",DlmId],function(err,result){

                  if(err){
                    console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    console.log("ERROR CODE : "+err.code);
                    MainObj.status = "CONNECTION ERROR";
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{

                    if(FRI.length==0){
                      valuedldm++;

                      Dldmid = "DLDM"+""+valuedldm.toString();
                      console.log("in main forr loop  = "+Dldmid);

                      connection.query(sql1,[Dldmid,"SAT",DlmId],function(err,result){

                        if(err){
                          console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                          console.log("ERROR : "+err);
                          console.log("ERROR CODE : "+err.code);
                          MainObj.status = "CONNECTION ERROR";
                          res.send(JSON.stringify(MainObj));
                          connection.rollback(function(){
                            return err;
                          })
                        }else{

                          if(SAT.length == 0){
                            valuedldm++;

                            Dldmid = "DLDM"+""+valuedldm.toString();
                            console.log("in main forr loop  = "+Dldmid);

                            connection.query(sql1,[Dldmid,"SUN",DlmId],function(err,result){

                              if(err){
                                console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                console.log("ERROR : "+err);
                                console.log("ERROR CODE : "+err.code);
                                MainObj.status = "CONNECTION ERROR";
                                res.send(JSON.stringify(MainObj));
                                connection.rollback(function(){
                                  return err;
                                })
                              }else{

                                if(SUN.length==0){
                                  connection.commit(function(err){
                                    if (err) {
                                      console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                      console.log("ERROR : "+err);
                                      console.log("ERROR CODE : "+err.code);
                                      MainObj.status = "CONNECTION ERROR";
                                      res.send(JSON.stringify(MainObj));
                                      connection.rollback(function(){
                                        return err;
                                      })
                                    }else{
                                      MainObj.status = "SUCCESS";
                                      res.send(JSON.stringify(MainObj));
                                    }
                                  })
                                }else{
                                  insertsunday(connection,res,req,Dldmid,valuedldm);
                                }


                              }

                            })
                          }else{
                            insertsaturday(connection,res,req,Dldmid,valuedldm);
                          }


                        }

                      })
                    }else{
                      insertfriday(connection,res,req,Dldmid,valuedldm);
                    }

                  }

                })
              }else{
                insertthursday(connection,res,req,Dldmid,valuedldm);
              }

            }

          })

        }

      }

    })

  }

}

function insertthursday(connection,res,req,Dldmid,valuedldm){


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];
  // var Dldmid="";
  // var valuedldm=0;
  // var cvaluedldm=0;
  // var count=0;
  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;



  console.log("1");

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;

  console.log(MON);


  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_dlm_id, dldm_day_number, dldm_id) VALUES ((?),(?),(?))";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";

  for(var thui=0;thui<THU.length;thui++){

    var thuid="DLDM"+""+valuedldm.toString();
    var thutime = THU[thui].time.split("_");
    console.log("thui = "+thui);
    console.log("thutime = "+thutime[0]+" to "+thutime[1]);
    console.log("thuid = "+thuid);

    connection.query(sql2,[thuid,thutime[0],thutime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN THURSDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+thuid);
        console.log("ERROR : "+err);
        console.log("ERROR CODE : "+err.code);
        MainObj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(MainObj));
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        thucount++;
        console.log("thucount = "+thucount);
        if(thucount == THU.length){
          valuedldm++;

          Dldmid = "DLDM"+""+valuedldm.toString();
          console.log("in main forr loop  = "+Dldmid);

          connection.query(sql1,[Dldmid,"FRI",DlmId],function(err,result){

            if(err){
              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              console.log("ERROR CODE : "+err.code);
              MainObj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{

              if(FRI.length==0){
                valuedldm++;

                Dldmid = "DLDM"+""+valuedldm.toString();
                console.log("in main forr loop  = "+Dldmid);

                connection.query(sql1,[Dldmid,"SAT",DlmId],function(err,result){

                  if(err){
                    console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    console.log("ERROR CODE : "+err.code);
                    MainObj.status = "CONNECTION ERROR";
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{

                    if(SAT.length == 0){
                      valuedldm++;

                      Dldmid = "DLDM"+""+valuedldm.toString();
                      console.log("in main forr loop  = "+Dldmid);

                      connection.query(sql1,[Dldmid,"SUN",DlmId],function(err,result){

                        if(err){
                          console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                          console.log("ERROR : "+err);
                          console.log("ERROR CODE : "+err.code);
                          MainObj.status = "CONNECTION ERROR";
                          res.send(JSON.stringify(MainObj));
                          connection.rollback(function(){
                            return err;
                          })
                        }else{

                          if(SUN.length==0){
                            connection.commit(function(err){
                              if (err) {
                                console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                console.log("ERROR : "+err);
                                console.log("ERROR CODE : "+err.code);
                                MainObj.status = "CONNECTION ERROR";
                                res.send(JSON.stringify(MainObj));
                                connection.rollback(function(){
                                  return err;
                                })
                              }else{
                                MainObj.status = "SUCCESS";
                                res.send(JSON.stringify(MainObj));
                              }
                            })
                          }else{
                            insertsunday(connection,res,req,Dldmid,valuedldm);
                          }


                        }

                      })
                    }else{
                      insertsaturday(connection,res,req,Dldmid,valuedldm);
                    }


                  }

                })
              }else{
                insertfriday(connection,res,req,Dldmid,valuedldm);
              }

            }

          })

        }

      }

    })

  }

}

function insertfriday(connection,res,req,Dldmid,valuedldm){


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];
  // var Dldmid="";
  // var valuedldm=0;
  // var cvaluedldm=0;
  // var count=0;
  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;



  console.log("1");

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;

  console.log(MON);


  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_dlm_id, dldm_day_number, dldm_id) VALUES ((?),(?),(?))";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";

  for(var frii=0;frii<FRI.length;frii++){

    var friid="DLDM"+""+valuedldm.toString();
    var fritime = FRI[frii].time.split("_");
    console.log("frii = "+frii);
    console.log("fritime = "+fritime[0]+" to "+fritime[1]);
    console.log("friid = "+friid);

    connection.query(sql2,[friid,fritime[0],fritime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN FRIDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+friid);
        console.log("ERROR : "+err);
        console.log("ERROR CODE : "+err.code);
        MainObj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(MainObj));
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        fricount++;
        console.log("fricount = "+fricount);
        if(fricount == FRI.length){
          valuedldm++;

          Dldmid = "DLDM"+""+valuedldm.toString();
          console.log("in main forr loop  = "+Dldmid);

          connection.query(sql1,[Dldmid,"SAT",DlmId],function(err,result){

            if(err){
              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              console.log("ERROR CODE : "+err.code);
              MainObj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{

              if(SAT.length == 0){
                valuedldm++;

                Dldmid = "DLDM"+""+valuedldm.toString();
                console.log("in main forr loop  = "+Dldmid);

                connection.query(sql1,[Dldmid,"SUN",DlmId],function(err,result){

                  if(err){
                    console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    console.log("ERROR CODE : "+err.code);
                    MainObj.status = "CONNECTION ERROR";
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{

                    if(SUN.length==0){
                      connection.commit(function(err){
                        if (err) {
                          console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                          console.log("ERROR : "+err);
                          console.log("ERROR CODE : "+err.code);
                          MainObj.status = "CONNECTION ERROR";
                          res.send(JSON.stringify(MainObj));
                          connection.rollback(function(){
                            return err;
                          })
                        }else{
                          MainObj.status = "SUCCESS";
                          res.send(JSON.stringify(MainObj));
                        }
                      })
                    }else{
                      insertsunday(connection,res,req,Dldmid,valuedldm);
                    }


                  }

                })
              }else{
                insertsaturday(connection,res,req,Dldmid,valuedldm);
              }


            }

          })

        }

      }

    })

  }

}

function insertsaturday(connection,res,req,Dldmid,valuedldm){


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];
  // var Dldmid="";
  // var valuedldm=0;
  // var cvaluedldm=0;
  // var count=0;
  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;



  console.log("1");

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;

  console.log(MON);


  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_dlm_id, dldm_day_number, dldm_id) VALUES ((?),(?),(?))";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";


  for(var sati=0;sati<SAT.length;sati++){

    var satid="DLDM"+""+valuedldm.toString();
    var sattime = SAT[sati].time.split("_");
    console.log("sati = "+sati);
    console.log("sattime = "+sattime[0]+" to "+sattime[1]);
    console.log("satid = "+satid);

    connection.query(sql2,[satid,sattime[0],sattime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN SATURDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+satid);
        console.log("ERROR : "+err);
        console.log("ERROR CODE : "+err.code);
        MainObj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(MainObj));
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        satcount++;
        console.log("satcount = "+satcount);
        if(satcount == SAT.length){
          valuedldm++;

          Dldmid = "DLDM"+""+valuedldm.toString();
          console.log("in main forr loop  = "+Dldmid);

          connection.query(sql1,[Dldmid,"SUN",DlmId],function(err,result){

            if(err){
              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              console.log("ERROR CODE : "+err.code);
              MainObj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{

              if(SUN.length==0){
                connection.commit(function(err){
                  if (err) {
                    console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    console.log("ERROR CODE : "+err.code);
                    MainObj.status = "CONNECTION ERROR";
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{
                    MainObj.status = "SUCCESS";
                    res.send(JSON.stringify(MainObj));
                  }
                })
              }else{
                insertsunday(connection,res,req,Dldmid,valuedldm);
              }


            }

          })

        }

      }

    })

  }
}

function insertsunday(connection,res,req,Dldmid,valuedldm){


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];
  // var Dldmid="";
  // var valuedldm=0;
  // var cvaluedldm=0;
  // var count=0;
  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;



  console.log("1");

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;

  console.log(MON);


  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_dlm_id, dldm_day_number, dldm_id) VALUES ((?),(?),(?))";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";


  for(var suni=0;suni<SUN.length;suni++){

    var sunid="DLDM"+""+valuedldm.toString();
    var suntime = SUN[suni].time.split("_");
    console.log("suni = "+suni);
    console.log("suntime = "+suntime[0]+" to "+suntime[1]);
    console.log("sunid = "+sunid);

    connection.query(sql2,[sunid,suntime[0],suntime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN SUNDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+sunid);
        console.log("ERROR : "+err);
        console.log("ERROR CODE : "+err.code);
        MainObj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(MainObj));
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        suncount++;
        console.log("suncount = "+suncount);
        if(suncount == SUN.length){
          connection.commit(function(err){
            if (err) {
              console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              console.log("ERROR CODE : "+err.code);
              MainObj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{
              MainObj.status = "SUCCESS";
              res.send(JSON.stringify(MainObj));
            }
          })

        }

      }

    })

  }

}

app.post("/timeinformation",function(req,res){

  var Object = req.body;

  var count=0;
  var DocId = Object.docid;

  var MainObj = {
    status : "SUCCESS",
    info:[]
  }

  var INFO={
    dlmdmid:"",
    locid:"",
    // locinfo:[]
    mondayid:"",
    monday:[],
    tuesdayid:"",
    tuesday:[],
    wednesdayid:"",
    wednesday:[],
    thursdayid:"",
    thursday:[],
    fridayid:"",
    friday:[],
    saturdayid:"",
    saturday:[],
    sundayid:"",
    sunday:[]
  }

  // var LOCINFO = {
  // }

  var TIMEOBJ = {
    from:"",
    to:"",
    timeid:""
  }

  var sql1 = "SELECT dlm_id, dlm_lm_location_id FROM doctor_location_master WHERE dlm_dm_doctor_id = ?"

  var sql2 = 'SELECT DLDM.dldm_day_number, DLTM.dltm_time_from, DLTM.dltm_time_to , DLTM.dltm_dldm_id, DLTM.dltm_id FROM doctor_location_day_master AS DLDM INNER JOIN doctor_location_time_master AS DLTM ON DLDM.dldm_dlm_id = DLTM.dltm_dldm_id WHERE DLDM.dldm_id = ?';

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN TIMEINFORMATION IN CONNECTING TO DATABASE FOR DOCID = "+DocId);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql1,[DocId],function(err,result){

        if(err){
          console.log("ERROR IN RUNNING SQL1 FOR DOCMID = "+DocId);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{

          if(result.length==0){
            MainObj.status = "SUCCESS";
            res.send(JSON.stringify(MainObj));
          }else{

            for(var i=0;i<result.length;i++){
              console.log("value of i "+i);
              console.log("lenght of result "+result.length);
              console.log("valaue of dlmid "+result[i].dlm_id);
              connection.query(sql2,[result[i].dlm_id],function(err,resultt){
                if(err){
                  console.log("ERROR IN RUNNING SQL2 FOR DOCID = "+DocId+" AND DLMDID = "+result[i].dlm_id);
                  console.log("ERROR : "+err);
                  console.log("ERROR CODE : "+err.code);
                  MainObj.status = "CONNECTION ERROR";
                  res.send(JSON.stringify(MainObj));
                  return err;
                  return;
                }else{


                  if(resultt.length == 0){
                    MainObj.status = "SUCCESS";
                    res.send(JSON.stringify(MainObj));
                  }else{
                    for(var j=0;j<resultt.length;j++){

                      console.log("value of j "+j);
                      console.log("lenght of resultt "+resultt.length);
                      console.log("valaue of dltmid "+resultt[j].dltm_id);

                      var TIMEOBJ = {
                        from:resultt[j].dltm_time_from,
                        to:resultt[j].dltm_time_to,
                        timeid:resultt[j].dltm_id
                      }

                      if(resultt[j].dldm_day_number == "MON"){
                        console.log("in monday id "+resultt[j].dltm_dldm_id);
                        INFO.mondayid = resultt[j].dltm_dldm_id;
                        INFO.monday.push(TIMEOBJ);
                      }else if(resultt[j].dldm_day_number == "TUE"){
                        console.log("in tue id "+resultt[j].dltm_dldm_id);
                        INFO.tuesdayid = resultt[j].dltm_dldm_id;
                        INFO.tuesday.push(TIMEOBJ);
                      }else if(resultt[j].dldm_day_number == "WED"){
                        console.log("in wed id "+resultt[j].dltm_dldm_id);
                        INFO.wednesdayid = resultt[j].dltm_dldm_id;
                        INFO.wednesday.push(TIMEOBJ);
                      }else if(resultt[j].dldm_day_number == "THU"){
                        console.log("in thu id "+resultt[j].dltm_dldm_id);
                        INFO.thursdayid = resultt[j].dltm_dldm_id;
                        INFO.thursday.push(TIMEOBJ);
                      }else if(resultt[j].dldm_day_number == "FRI"){
                        console.log("in fri id "+resultt[j].dltm_dldm_id);
                        INFO.fridayid = resultt[j].dltm_dldm_id;
                        INFO.friday.push(TIMEOBJ);
                      }else if(resultt[j].dldm_day_number == "SAT"){
                        console.log("in sat id "+resultt[j].dltm_dldm_id);
                        INFO.saturdayid = resultt[j].dltm_dldm_id;
                        INFO.saturday.push(TIMEOBJ);
                      }else if(resultt[j].dldm_day_number == "SUN"){
                        console.log("in sun id "+resultt[j].dltm_dldm_id);
                        INFO.sundayid = resultt[j].dltm_dldm_id;
                        INFO.sunday.push(TIMEOBJ);
                      }

                    }
                    // INFO.dlmdmid = resultt[j].dlm_dm_doctor_id;
                    // INFO.locid = resultt[j].dlm_lm_location_id;
                    MainObj.info.push(INFO);
                    console.log("value of count "+count);
                    count++;
                    if(count == result.length){
                      console.log("in if");
                      res.send(JSON.stringify(MainObj));
                    }
                  }


                }
              })

            }

          }

        }

        connection.release();

      })
    }
  })

})

app.post("/timecheck",function(req,res){

  var obj = {
    status : "SUCCESS",
    available : ""
  }

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
  // console.log(ID);
  // console.log(PLD_ROLE);
  // console.log(NAME);
  // console.log(DOB);
  // console.log(GENDER);
  // console.log(EMAIL);
  // console.log(PASSWORD);
  // console.log(MOBILE);
  // console.log(SPECIALITY_ID);
  // console.log(REGISTRATION_NUMBER);
  // console.log(REGISTRATION_COUNCIL);
  // console.log(REGISTRATION_YEAR);
  // console.log(EXPERIENCE);
  console.log("has been hit in insertfinvalue");


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


                  }else{
                    console.log("in 3");
                    connection.rollback(function(){
                      // throw err;
                    })
                    obj.status = "FAIL";
                    res.send(JSON.stringify(obj));
                  }
                }

              });



        }

        connection.release();


      });

    }
  });


}

app.listen(port,function(err1){
  console.log("Listening on the port 3000");
});
