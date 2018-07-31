var express = require("express");
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var fs = require('fs');
var csv = require('fast-csv');
var date = require('date-and-time');


// app.use(bodyParser({
//   json: {limit: '50mb', extended: true},
//   urlencoded: {limit: '50mb', extended: true}
// }));

// app.use(bodyParser());
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));

var port = process.env.PORT || 3000;


var con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "janelaajdev",
  database: "janelaajdev"
});


app.get("/q",function(req,res){
  // console.log(date.format(now, 'YYYY/MM/DD HH:mm:ss'));
  res.send(date.format(now, 'YYYY/MM/DD HH:mm:ss'));
})

app.post("/insertappointment",function(req,res){

  var now = new Date();
  console.log("START----------insertappointment----------"+now);

  var Object = req.body;

  var dlmid = Object.dlmid;
  var pid = Object.pid;
  var dltmid = Object.tid;
  var dflag = Object.dflag;
  var arr = [];
  arr = Object.values;
  console.log("values = "+JSON.stringify(Object));

  var pdlaid = "";
  var sent=0;

  var obj = {
    status:""
  }
  var sql0 = "INSERT INTO patient_doctor_location_appointment (pdla_id,pdla_dlm_id,pdla_pm_patient_id,pdla_appointment_datetime,pdla_dltm_dltm_id,pdla_appointment_issue_date,pdla_spot_appointment_flag,pdla_dependent_flag) VALUES ((?),(?),(?),SYSDATE(),(?),SYSDATE(),(?),(?))";
  var sql1 = "INSERT INTO patient_doctor_location_appointment_details (pdlad_id,pdlad_pdla_id,pdlad_dcsm_sm_service_id,pdlad_dcsm_normal_rate,pdlad_dcsm_discount_flag,pdlad_dcsm_discounted_amount,pdlad_bp_upper,pdlad_bp_lower,pdlad_haemoglobin,pdlad_sugar,pdlad_tempreture,pdlad_oxygenlevel,pdlad_chargeable_rate,pdlad_height,pdlad_weight,pdlad_bmi,pdlad_respiratory_level,pdlad_blood_group,pdlad_pulse,pdlad_bodyfat) VALUES ((?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?))";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN insertappointment IN OPENING CONNECTION FOR DLMID = "+dlmid);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      console.log("RESPONSE = "+JSON.stringify(obj));
      console.log("END----------insertappointment----------"+now);
      res.send(JSON.stringify(obj));
      return err;
    }else{
      connection.beginTransaction(function(err){
        if(err){
          console.log("ERROR IN insertappointment IN BEGINING TRANSACTION FOR DLMID = "+dlmid);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          console.log("RESPONSE = "+JSON.stringify(obj));
          console.log("END----------insertappointment----------"+now);
          res.send(JSON.stringify(obj));
          return err;
        }else{

          var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
          var Mydata = [];
          var csvStream = csv.parse().on("data", function(data){

                var value=0;

                if(data[0] == "PDLAID"){

                  value = parseInt(data[1]);
                  pdlaid = "PDLAID"+""+data[1];
                  value++;
                  data[1]=value.toString();
                }
                Mydata.push(data);
              })
              .on("end", function(){
                   var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
                   csv.write(Mydata, {headers: true}).pipe(ws);

                   connection.query(sql0,[pdlaid,dlmid,pid,dltmid,"Y",dflag],function(err,row0){
                     if(err){
                       console.log("ERROR IN insertappointment IN RUNNING SQL0 FOR DLMID = "+dlmid);
                       console.log(err);
                       obj.status = "CONNECTION ERROR";
                       console.log("RESPONSE = "+JSON.stringify(obj));
                       console.log("END----------insertappointment----------"+now);
                       res.send(JSON.stringify(obj));
                       return err;
                     }else{
                       if(row0.affectedRows == 1){

                         var count=0;
                         var pdladidnum=0;
                         var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
                         var Mydata = [];
                         var csvStream = csv.parse().on("data", function(data){

                               var value=0;

                               if(data[0] == "PDLADID"){

                                 value = parseInt(data[1]);
                                 // pdladid = "PDLADID"+""+data[1];
                                 pdladidnum = value;
                                 value=value+arr.length;
                                 data[1]=value.toString();
                               }
                               Mydata.push(data);
                             })
                             .on("end", function(){
                                  var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
                                  csv.write(Mydata, {headers: true}).pipe(ws);

                                 for(var i = 0;i<arr.length;i++){

                                   var pdladid = "PDLADID"+""+pdladidnum;
                                   pdladidnum++;
                                   console.log("So it is the pdladid "+pdladid);

                                   connection.query(sql1,[pdladid,pdlaid,arr[i].pdlad_dcsm_sm_service_id,arr[i].pdlad_dcsm_normat_rate,arr[i].pdlad_dcsm_discount_flag,arr[i].pdlad_dcsm_discounted_amount,arr[i].pdlad_bp_upper,arr[i].pdlad_bp_lower,arr[i].pdlad_haemoglobin,arr[i].pdlad_sugar,arr[i].pdlad_temperature,arr[i].pdlad_oxygenlevel,arr[i].pdlad_chargeablerate,arr[i].pdlad_height,arr[i].pdlad_weight,arr[i].pdlad_bmi,arr[i].pdlad_respiratorylevel,arr[i].pdlad_blood_group,arr[i].pdlad_pulse,arr[i].pdlad_bodyfat],function(err,row1){
                                     if(err){
                                       console.log("ERROR IN insertappointment IN RUNNING SQL1 FOR DLMID = "+dlmid);
                                       console.log(err);
                                       obj.status = "CONNECTION ERROR";
                                       console.log("RESPONSE = "+JSON.stringify(obj));
                                       console.log("END----------insertappointment----------"+now);
                                       if(sent == 0){
                                         res.send(JSON.stringify(obj));
                                         sent=1;
                                       }
                                       return err;
                                     }else{
                                       if(row1.affectedRows == 1){
                                         count++;
                                         if(count==arr.length && sent == 0){
                                           connection.commit(function(err){
                                             if(err){
                                               console.log("ERROR IN insertappointment IN COMMITING FOR DLMID = "+dlmid);
                                               console.log(err);
                                               obj.status = "CONNECTION ERROR";
                                               console.log("RESPONSE = "+JSON.stringify(obj));
                                               console.log("END----------insertappointment----------"+now);
                                               res.send(JSON.stringify(obj));
                                               return err;
                                             }else{
                                               obj.status = "SUCCESS";
                                               res.send(JSON.stringify(obj));
                                             }
                                           })
                                         }

                                       }else{
                                         console.log("ERROR IN insertappointment IN RUNNING SQL0 0 ROWS AFFECTED FOR DLMID = "+dlmid);
                                         obj.status = "CONNECTION ERROR";
                                         console.log("RESPONSE = "+JSON.stringify(obj));
                                         console.log("END----------insertappointment----------"+now);
                                         if(sent == 0){
                                           res.send(JSON.stringify(obj));
                                           sent=1;
                                         }
                                       }
                                     }
                                   })

                                 }



                             });
                         stream.pipe(csvStream);

                       }else{
                         console.log("ERROR IN insertappointment IN RUNNING SQL0 0 ROWS AFFECTED FOR DLMID = "+dlmid);
                         obj.status = "CONNECTION ERROR";
                         console.log("RESPONSE = "+JSON.stringify(obj));
                         console.log("END----------insertappointment----------"+now);
                         res.send(JSON.stringify(obj));
                       }
                     }
                   })


              });
          stream.pipe(csvStream);


        }
      })
      connection.release();
    }
  })

})

app.post("/getdiscountinfo",function(req,res){

  var now = new Date();
  console.log("START----------getdiscountinfo----------"+now);

  var Object = req.body;

  var dlmid = Object.dlmid;

  var obj = {
    status:"",
    info : []
  }

  var sql = "SELECT dlm.dlm_currentloc_discount_flag, dldm.dldm_id, dltm.dltm_id, dcsm.dcsm_sm_service_id, dcsm.dcsm_normal_amount, dcsm.dcsm_discount_flag, dcsm.dcsm_discounted_amount, dcsm.dcsm_id, dltm.dltm_discount_offer_flag, dltm.dltm_id FROM doctor_location_master dlm, doctor_location_day_master dldm, doctor_location_time_master dltm, doctor_clinic_services_master dcsm WHERE dlm_id=dldm.dldm_dlm_id AND   dldm.dldm_id=dltm.dltm_dldm_id AND   dcsm_dlm_id=dlm.dlm_id AND   dlm_id = ? AND   dldm_day_number = upper(substr(dayname(curdate()), 1, 3));";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN getdiscountinfo IN OPENING CONNECTION FOR DLMID ="+dlmid);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      console.log("RESPONSE = "+JSON.stringify(obj));
      console.log("END----------getdiscountinfo----------"+now);
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.query(sql,[dlmid],function(err,row){
        if(err){
          console.log("ERROR IN getdiscountinfo IN RUNNING SQL FOR DLMID ="+dlmid);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          console.log("RESPONSE = "+JSON.stringify(obj));
          console.log("END----------getdiscountinfo----------"+now);
          res.send(JSON.stringify(obj));
          return err;
        }else{
          for(var i=0;i<row.length;i++){
            var oo = {
              curlocdflag : row[i].dlm_currentloc_discount_flag,
              dldmid : row[i].dldm_id,
              dltmid : row[i].dltm_id,
              sid : row[i].dcsm_sm_service_id,
              namt : row[i].dcsm_normal_amount,
              dflag : row[i].dcsm_discount_flag,
              damt : row[i].dcsm_discounted_amount,
              dcsmid : row[i].dcsm_id,
              dofferflag : row[i].dltm_discount_offer_flag,
              dltmid : row[i].dltm_id
            }
            obj.info.push(oo);
          }
          obj.status = "SUCCESS";
          console.log("RESPONSE = "+JSON.stringify(obj));
          console.log("END----------getdiscountinfo----------"+now);
          res.send(JSON.stringify(obj));
        }
      })
      connection.release();

    }
  })

})

app.post("/patientdependent",function(req,res){

  var now = new Date();
  console.log("START----------patientdependent----------"+now);

  var Object = req.body;
  var pid = Object.pid;
  var obj = {
    status : "",
    dependents : []
  }
  var sql = "SELECT * FROM patient_dependent_master AS pdm INNER JOIN patient_master AS pm ON pdm.pdm_patient_id = pm.pm_patient_id WHERE pm.pm_patient_id = ?";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN patientdependent IN CONNECTING TO DATABASE FOR PID ="+pid);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      console.log("REPONSE="+JSON.stringify(obj));
      console.log("END----------patientdependent----------"+now);
      res.send(JSON.stringify(obj));
    }else{
      connection.query(sql,[pid],function(err,row){
        if(err){
          console.log("ERROR IN patientdependent IN RUNNING SQL TO DATABASE FOR PID ="+pid);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          console.log("REPONSE="+JSON.stringify(obj));
          console.log("END----------patientdependent----------"+now);
          res.send(JSON.stringify(obj));
        }else{
          for(var i=0;i<row.length;i++){

            var oo = {
              pdmid : row[i].pdm_id,
              patientid : row[i].pdm_patient_id,
              dependentid : row[i].pdm_dependent_id,
              name : row[i].pdm_dependent_name,
              dob : row[i].pdm_dob,
              gender : row[i].pdm_gender,
              photo :"",
              email : row[i].pdm_dependent_email,
              mobile : row[i].pdm_dependent_mobile
            }
            if(row[i].pdm_dependent_photo == null){
              oo.photo = "";
            }else {
              oo.photo = row[i].pdm_dependent_photo.toString();
            }
            obj.dependents.push(oo);
          }
          obj.status = "SUCCESS";
          console.log("REPONSE="+JSON.stringify(obj));
          console.log("END----------patientdependent----------"+now);
          res.send(JSON.stringify(obj));
        }
      })
      connection.release();
    }
  })

})

app.post("/registerpatientdep",function(req,res){

  var now = new Date();
  console.log("START----------registerpatientdep----------"+now);

  var Object = req.body;
  var flag = parseInt(Object.flag);
  var pid = Object.pid;
  var pname = Object.pname;
  var pdob = Object.pdob;
  var pgender = Object.pgender;
  var pmobile = Object.pmobile;
  var pemail = Object.pemail;
  var pphoto = Object.pphoto.toString();
  var pmothername = Object.mname;
  var dname = Object.dname;
  var ddob = Object.ddob;
  var dgender = Object.dgender;
  var dphoto = Object.dphoto.toString();
  var demail = Object.demail;
  var dmobile = Object.dmobile;
  var phonetype = parseInt(Object.phonetype);

  console.log("flag="+flag);
  console.log("pid="+pid);
  console.log("pname="+pname);
  console.log("pdob="+pdob);
  console.log("pgender="+pgender);
  console.log("pmobile="+pmobile);
  console.log("pemail="+pemail);
  // console.log("pphoto="+pphoto);
  console.log("pmothername="+pmothername);
  console.log("dname="+dname);
  console.log("ddob="+ddob);
  console.log("dgender="+dgender);
  // console.log("dphoto="+dphoto);
  console.log("demail="+demail);
  console.log("dmobile="+dmobile);
  console.log("phonetype="+phonetype);

  // if(phonetype == 2){
  //   pemail = pid;
  // }

  var obj = {
    status : "SUCCESS",
    pid : "",
    pdmid : "",
    pdid : ""
  }

  var sql0 = "INSERT INTO patient_master (pm_patient_id,pm_patient_name,pm_dob,pm_gender,pm_contact_mobile,pm_patient_email,pm_patient_photo,pm_mothers_first_name,pm_dependent_flag,pm_reg_date) VALUES ((?),(?),(?),(?),(?),(?),(?),(?),(?),SYSDATE())";
  var sql1 = "INSERT INTO patient_login_details_master (pldm_username,pldm_password,pldm_patient_id,pldm_mobile) VALUES ((?),(?),(?),(?))";
  var sql3 = "INSERT INTO patient_dependent_master (pdm_patient_id,pdm_dependent_id,pdm_dependent_name,pdm_dob,pdm_gender,pdm_dependent_photo,pdm_dependent_email,pdm_dependent_mobile,pdm_dependent_reg_date) VALUES ((?),(?),(?),(?),(?),(?),(?),(?),SYSDATE())";
  var sql2 = "SELECT STR_TO_DATE((?), '%d %m %Y') AS datee";
  var sql4 = "UPDATE patient_master SET pm_dependent_flag = ? WHERE pm_patient_id = ?";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN registerpatientdep IN GETTING CONNECTION FOR PID = "+pid);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      console.log("RESPONSE="+JSON.stringify(obj));
      console.log("END----------registerpatientdep----------"+now);
      res.send(JSON.stringify(obj));
      return err;
    }else{
      if(flag == 1){

        connection.query(sql2,[pdob],function(err,row2){
          if(err){
            console.log("ERROR IN registerpatientdep IN RUNNING SQL2 FOR PID = "+pid);
            console.log(err);
            obj.status = "CONNECTION ERROR";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------registerpatientdep----------"+now);
            res.send(JSON.stringify(obj));
            return err;
          }else{

            if(row2.length>0){
              connection.beginTransaction(function(err){
                if(err){
                  console.log("ERROR IN registerpatientdep IN BEGINING TRANSACTION FOR PID = "+pid);
                  console.log(err);
                  obj.status = "CONNECTION ERROR";
                  console.log("RESPONSE="+JSON.stringify(obj));
                  console.log("END----------registerpatientdep----------"+now);
                  res.send(JSON.stringify(obj));
                  return err;
                }else{

                  if(phonetype == 2 || pmobile == "0000000000"){
                    pemail = pid;
                  }

                  connection.query(sql0,[pid,pname,row2[0].datee,pgender,pmobile,pemail,pphoto,pmothername,"N"],function(err,row0){
                    if(err){
                      console.log("ERROR IN registerpatientdep IN RUNING SQL0 FOR PID = "+pid);
                      console.log(err);
                      obj.status = "CONNECTION ERROR";
                      console.log("RESPONSE="+JSON.stringify(obj));
                      console.log("END----------registerpatientdep----------"+now);
                      res.send(JSON.stringify(obj));
                      connection.rollback(function(){
                        return err;
                      })
                    }else{
                      if(row0.affectedRows == 1){
                        connection.query(sql1,[pemail,"55555",pid,pmobile],function(err,row1){
                          if(err){
                            console.log("ERROR IN registerpatientdep IN RUNING SQL1 FOR PID = "+pid);
                            console.log(err);
                            obj.status = "CONNECTION ERROR";
                            console.log("RESPONSE="+JSON.stringify(obj));
                            console.log("END----------registerpatientdep----------"+now);
                            res.send(JSON.stringify(obj));
                            connection.rollback(function(){
                              return err;
                            })
                          }else{
                            if(row1.affectedRows == 1){
                              connection.commit(function(err){
                                if(err){
                                  console.log("ERROR IN registerpatientdep IN COMMITING FOR PID = "+pid);
                                  console.log(err);
                                  obj.status = "CONNECTION ERROR";
                                  console.log("RESPONSE="+JSON.stringify(obj));
                                  console.log("END----------registerpatientdep----------"+now);
                                  res.send(JSON.stringify(obj));
                                  connection.rollback(function(){
                                    return err;
                                  })
                                }else{
                                  obj.status = "SUCCESS";
                                  obj.pid = pid;
                                  console.log("RESPONSE="+JSON.stringify(obj));
                                  console.log("END----------registerpatientdep----------"+now);
                                  res.send(JSON.stringify(obj));
                                }
                              })
                            }else{
                              console.log("ERROR IN registerpatientdep IN RUNING SQL1 0 ROWS AFFFECTED FOR PID = "+pid);
                              obj.status = "CONNECTION ERROR";
                              console.log("RESPONSE="+JSON.stringify(obj));
                              console.log("END----------registerpatientdep----------"+now);
                              res.send(JSON.stringify(obj));
                              connection.rollback(function(){

                              })
                            }
                          }
                        })

                      }else{
                        console.log("ERROR IN registerpatientdep IN RUNING SQL0 0 ROWS AFFFECTED FOR PID = "+pid);
                        obj.status = "CONNECTION ERROR";
                        console.log("RESPONSE="+JSON.stringify(obj));
                        console.log("END----------registerpatientdep----------"+now);
                        res.send(JSON.stringify(obj));
                        connection.rollback(function(){

                        })
                      }
                    }
                  })

                }
              })
            }else{
              console.log("ERROR IN registerpatientdep IN RUNNING SQL2 0 ROWS RETURNED FOR PID = "+pid);
              obj.status = "CONNECTION ERROR";
              console.log("RESPONSE="+JSON.stringify(obj));
              console.log("END----------registerpatientdep----------"+now);
              res.send(JSON.stringify(obj));
            }


          }
        })

      }else if(flag == 2){

        connection.beginTransaction(function(err){
          if(err){
            console.log("ERROR IN registerpatientdep IN BEGINING TRANSACTION FOR PID = "+pid);
            console.log(err);
            obj.status = "CONNECTION ERROR";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------registerpatientdep----------"+now);
            res.send(JSON.stringify(obj));
            return err;
          }else{

            var pdmid="";
            var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
            var Mydata = [];
            var csvStream = csv.parse().on("data", function(data){

                  var value=0;

                  if(data[0] == "PDID"){

                    value = parseInt(data[1]);
                    pdmid = "PDID"+""+data[1];
                    value++;
                    data[1]=value.toString();
                  }
                  Mydata.push(data);
                })
                .on("end", function(){
                     var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
                     csv.write(Mydata, {headers: true}).pipe(ws);

                     console.log("aebuaebuaebvkrsbioewbv="+pdmid);

                     connection.query(sql2,[ddob],function(err,row2){
                       if(err){
                         console.log("ERROR IN registerpatientdep IN RUNNING SQL2 FOR PID = "+pid);
                         console.log(err);
                         obj.status = "CONNECTION ERROR";
                         console.log("RESPONSE="+JSON.stringify(obj));
                         console.log("END----------registerpatientdep----------"+now);
                         res.send(JSON.stringify(obj));
                         connection.rollback(function(){
                           return err;
                         })
                       }else{

                         if(row2.length>0){

                           connection.query(sql3,[pid,pdmid,dname,row2[0].datee,dgender,dphoto,demail,dmobile],function(err,row3){
                             if(err){
                               console.log("ERROR IN registerpatientdep IN RUNNING SQL3 FOR PID = "+pid);
                               console.log(err);
                               obj.status = "CONNECTION ERROR";
                               console.log("RESPONSE="+JSON.stringify(obj));
                               console.log("END----------registerpatientdep----------"+now);
                               res.send(JSON.stringify(obj));
                               connection.rollback(function(){
                                 return err;
                               })
                              }else{
                               if(row3.affectedRows == 1){

                                 connection.query(sql4,["Y",pid],function(err,row5){
                                   if(err){
                                     console.log("ERROR IN registerpatientdep IN RUNNING SQL4 FOR PID = "+pid);
                                     console.log(err);
                                     obj.status = "CONNECTION ERROR";
                                     console.log("RESPONSE="+JSON.stringify(obj));
                                     console.log("END----------registerpatientdep----------"+now);
                                     res.send(JSON.stringify(obj));
                                     connection.rollback(function(){
                                       return err;
                                     })
                                   }else{
                                     if(row5.affectedRows == 1){
                                       connection.commit(function(err){
                                         if(err){
                                           console.log("ERROR IN registerpatientdep IN COMMITING FOR PID = "+pid);
                                           console.log(err);
                                           obj.status = "CONNECTION ERROR";
                                           console.log("RESPONSE="+JSON.stringify(obj));
                                           console.log("END----------registerpatientdep----------"+now);
                                           res.send(JSON.stringify(obj));
                                           connection.rollback(function(){
                                             return err;
                                           })
                                         }else{
                                           obj.status = "SUCCESS";
                                           obj.pid = pid;
                                           obj.pdmid = row3.insertId;
                                           obj.pdid = pdmid;
                                           console.log("RESPONSE="+JSON.stringify(obj));
                                           console.log("END----------registerpatientdep----------"+now);
                                           res.send(JSON.stringify(obj));
                                         }
                                       })
                                     }else{
                                       console.log("ERROR IN registerpatientdep IN RUNNING SQL4 0 AFFECTED FOR PID = "+pid);
                                       obj.status = "CONNECTION ERROR";
                                       console.log("RESPONSE="+JSON.stringify(obj));
                                       console.log("END----------registerpatientdep----------"+now);
                                       res.send(JSON.stringify(obj));
                                       connection.rollback(function(){
                                       })
                                     }
                                   }
                                 })

                               }else{
                                 console.log("ERROR IN registerpatientdep IN SQL2 0 ROWS RETUREND FOR PID = "+pid);
                                 console.log(err);
                                 obj.status = "CONNECTION ERROR";
                                 console.log("RESPONSE="+JSON.stringify(obj));
                                 console.log("END----------registerpatientdep----------"+now);
                                 res.send(JSON.stringify(obj));
                                 connection.rollback(function(){

                                 })
                               }
                             }
                           })

                         }else{
                           console.log("ERROR IN registerpatientdep IN SQL2 0 ROWS RETUREND FOR PID = "+pid);
                           console.log(err);
                           obj.status = "CONNECTION ERROR";
                           console.log("RESPONSE="+JSON.stringify(obj));
                           console.log("END----------registerpatientdep----------"+now);
                           res.send(JSON.stringify(obj));
                           connection.rollback(function(){

                           })
                         }

                       }
                     })

                });
            stream.pipe(csvStream);

          }
        })

      }else if(flag == 3){


        connection.query(sql2,[pdob],function(err,row2){
          if(err){
            console.log("ERROR IN registerpatientdep IN RUNNING SQL2 FOR PID = "+pid);
            console.log(err);
            obj.status = "CONNECTION ERROR";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------registerpatientdep----------"+now);
            res.send(JSON.stringify(obj));
            return err;
          }else{

            if(row2.length>0){
              connection.beginTransaction(function(err){
                if(err){
                  console.log("ERROR IN registerpatientdep IN BEGINING TRANSACTION FOR PID = "+pid);
                  console.log(err);
                  obj.status = "CONNECTION ERROR";
                  console.log("RESPONSE="+JSON.stringify(obj));
                  console.log("END----------registerpatientdep----------"+now);
                  res.send(JSON.stringify(obj));
                  return err;
                }else{

                  if(phonetype == 2 || pmobile == "0000000000"){
                    pemail = pid;
                  }

                  connection.query(sql0,[pid,pname,row2[0].datee,pgender,pmobile,pemail,pphoto,pmothername,"Y"],function(err,row0){
                    if(err){
                      console.log("ERROR IN registerpatientdep IN RUNING SQL0 FOR PID = "+pid);
                      console.log(err);
                      obj.status = "CONNECTION ERROR";
                      console.log("RESPONSE="+JSON.stringify(obj));
                      console.log("END----------registerpatientdep----------"+now);
                      res.send(JSON.stringify(obj));
                      connection.rollback(function(){
                        return err;
                      })
                    }else{
                      if(row0.affectedRows == 1){
                        connection.query(sql1,[pemail,"55555",pid,pmobile],function(err,row1){
                          if(err){
                            console.log("ERROR IN registerpatientdep IN RUNING SQL1 FOR PID = "+pid);
                            console.log(err);
                            obj.status = "CONNECTION ERROR";
                            console.log("RESPONSE="+JSON.stringify(obj));
                            console.log("END----------registerpatientdep----------"+now);
                            res.send(JSON.stringify(obj));
                            connection.rollback(function(){
                              return err;
                            })
                          }else{
                            if(row1.affectedRows == 1){

                              var pdmid="";
                              var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
                              var Mydata = [];
                              var csvStream = csv.parse().on("data", function(data){

                                    var value=0;

                                    if(data[0] == "PDID"){

                                      value = parseInt(data[1]);
                                      pdmid = "PDID"+""+data[1];
                                      value++;
                                      data[1]=value.toString();
                                    }
                                    Mydata.push(data);
                                  })
                                  .on("end", function(){
                                       var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
                                       csv.write(Mydata, {headers: true}).pipe(ws);

                                       connection.query(sql2,[ddob],function(err,row22){
                                         if(err){
                                           console.log("ERROR IN registerpatientdep IN RUNNING SQL2 FOR PID = "+pid);
                                           console.log(err);
                                           obj.status = "CONNECTION ERROR";
                                           console.log("RESPONSE="+JSON.stringify(obj));
                                           console.log("END----------registerpatientdep----------"+now);
                                           res.send(JSON.stringify(obj));
                                           connection.rollback(function(){
                                             return err;
                                           })
                                         }else{

                                           if(row22.length>0){

                                             connection.query(sql3,[pid,pdmid,dname,row22[0].datee,dgender,dphoto,demail,dmobile],function(err,row3){
                                               if(err){
                                                 console.log("ERROR IN registerpatientdep IN RUNNING SQL3 FOR PID = "+pid);
                                                 console.log(err);
                                                 obj.status = "CONNECTION ERROR";
                                                 console.log("RESPONSE="+JSON.stringify(obj));
                                                 console.log("END----------registerpatientdep----------"+now);
                                                 res.send(JSON.stringify(obj));
                                                 connection.rollback(function(){
                                                   return err;
                                                 })
                                               }else{
                                                 if(row3.affectedRows == 1){
                                                   connection.commit(function(err){
                                                     if(err){
                                                       console.log("ERROR IN registerpatientdep IN COMMITING FOR PID = "+pid);
                                                       console.log(err);
                                                       obj.status = "CONNECTION ERROR";
                                                       console.log("RESPONSE="+JSON.stringify(obj));
                                                       console.log("END----------registerpatientdep----------"+now);
                                                       res.send(JSON.stringify(obj));
                                                       connection.rollback(function(){
                                                         return err;
                                                       })
                                                     }else{
                                                       obj.pid = pid;
                                                       obj.pdmid = row3.insertId;
                                                       obj.pdid = pdmid;
                                                       obj.status = "SUCCESS";
                                                       console.log("RESPONSE="+JSON.stringify(obj));
                                                       console.log("END----------registerpatientdep----------"+now);
                                                       res.send(JSON.stringify(obj));
                                                     }
                                                   })
                                                 }else{
                                                   console.log("ERROR IN registerpatientdep IN SQL2 0 ROWS RETUREND FOR PID = "+pid);
                                                   console.log(err);
                                                   obj.status = "CONNECTION ERROR";
                                                   console.log("RESPONSE="+JSON.stringify(obj));
                                                   console.log("END----------registerpatientdep----------"+now);
                                                   res.send(JSON.stringify(obj));
                                                   connection.rollback(function(){

                                                   })
                                                 }
                                               }
                                             })

                                           }else{
                                             console.log("ERROR IN registerpatientdep IN SQL2 0 ROWS RETUREND FOR PID = "+pid);
                                             console.log(err);
                                             obj.status = "CONNECTION ERROR";
                                             console.log("RESPONSE="+JSON.stringify(obj));
                                             console.log("END----------registerpatientdep----------"+now);
                                             res.send(JSON.stringify(obj));
                                             connection.rollback(function(){
                                             })
                                           }

                                         }
                                       })

                                  });
                              stream.pipe(csvStream);

                            }else{
                              console.log("ERROR IN registerpatientdep IN RUNING SQL1 0 ROWS AFFFECTED FOR PID = "+pid);
                              obj.status = "CONNECTION ERROR";
                              console.log("RESPONSE="+JSON.stringify(obj));
                              console.log("END----------registerpatientdep----------"+now);
                              res.send(JSON.stringify(obj));
                              connection.rollback(function(){

                              })
                            }
                          }
                        })

                      }else{
                        console.log("ERROR IN registerpatientdep IN RUNING SQL0 0 ROWS AFFFECTED FOR PID = "+pid);
                        obj.status = "CONNECTION ERROR";
                        console.log("RESPONSE="+JSON.stringify(obj));
                        console.log("END----------registerpatientdep----------"+now);
                        res.send(JSON.stringify(obj));
                        connection.rollback(function(){

                        })
                      }
                    }
                  })

                }
              })
            }else{
              console.log("ERROR IN registerpatientdep IN RUNNING SQL2 0 ROWS RETURNED FOR PID = "+pid);
              obj.status = "CONNECTION ERROR";
              console.log("RESPONSE="+JSON.stringify(obj));
              console.log("END----------registerpatientdep----------"+now);
              res.send(JSON.stringify(obj));
            }


          }
        })


      }else{
        console.log("ERROR IN registerpatientdep WRONG VALUE OF FLAG");
        obj.status = "CONNECTION ERROR";
        console.log("RESPONSE="+JSON.stringify(obj));
        console.log("END----------registerpatientdep----------"+now);
        res.send(JSON.stringify(obj));
      }
      connection.release();

    }
  })




})

app.post("/getpatientid",function(req,res){
  var now = new Date();
  console.log("START----------getpatientid----------"+now);

  // var Object = req.body;
  // var number = Object.number;
  var Id = "";
  var obj = {
    status : "",
    id : ""
  }

  var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
  var Mydata = [];
  var csvStream = csv.parse().on("data", function(data){

        var value=0;

        if(data[0] == "VIU"){

          value = parseInt(data[1]);
          Id = "VIU"+""+data[1];
          value++;
          data[1]=value.toString();
        }
        Mydata.push(data);
      })
      .on("end", function(){
           var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
           csv.write(Mydata, {headers: true}).pipe(ws);
           obj.status = "SUCCESS";
           obj.id = Id;
           console.log("RESPONSE="+JSON.stringify(obj));
           console.log("END----------getpatientid----------"+now);
           res.send(JSON.stringify(obj));
           // con.getConnection(function(err,connection){
           //   if(err){
           //     console.log("ERROR IN OPENING CONNECTION IN getpatientid FOR number = "+number);
           //     console.log(err);
           //     obj.status = "CONNECTION ERROR";
           //     console.log("RESPONSE="+JSON.stringify(obj));
           //     console.log("END----------getpatientid----------"+now);
           //     res.send(JSON.stringify(obj));
           //   }else{
           //     connection.query(sql,[Id,Id,number],function(err,row){
           //       if(err){
           //         console.log("ERROR IN RUNNING SQL IN getpatientid FOR number = "+number);
           //         console.log(err);
           //         obj.status = "CONNECTION ERROR";
           //         console.log("RESPONSE="+JSON.stringify(obj));
           //         console.log("END----------getpatientid----------"+now);
           //         res.send(JSON.stringify(obj));
           //       }else{
           //         if(row.affectedRows == 1){
           //           obj.status = "SUCCESS";
           //           obj.id = Id;
           //           console.log("RESPONSE="+JSON.stringify(obj));
           //           console.log("END----------getpatientid----------"+now);
           //           res.send(JSON.stringify(obj));
           //         }else{
           //           console.log("ERROR IN RUNNING SQL 0 ROWS AFFECTED IN getpatientid FOR number = "+number);
           //           obj.status = "CONNECTION ERROR";
           //           console.log("RESPONSE="+JSON.stringify(obj));
           //           console.log("END----------getpatientid----------"+now);
           //           res.send(JSON.stringify(obj));
           //         }
           //       }
           //     })
           //     connection.release();
           //   }
           // })
      });
  stream.pipe(csvStream);



})

app.post("/patientnumberidinfo",function(req,res){

  var now = new Date();
  console.log("START----------patientnumberidinfo----------"+now);

  var obj = {
    status:"",
    id:"",
    present : "",
    uname : "",
    mname : "",
    dob : "",
    gender : "",
    mobile : "",
    email : "",
    photo : ""
  }

  var Object = req.body;

  var number = Object.number;
  console.log("number="+number);

  var sql = "SELECT * FROM patient_master WHERE  (pm_contact_mobile = ? OR pm_patient_id = ?) OR pm_patient_email = ?";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN patientnumberinfo IN BUILDING CONNECTION FOR number = "+number);
      console.log("ERROR CODE :"+err);
      obj.status = "CONNECTION ERROR";
      console.log("RESPONSE="+JSON.stringify(obj));
      console.log("END----------patientnumberidinfo----------"+now);
      res.send(JSON.stringify(obj));
      return err;
    }else{
      connection.query(sql,[number,number,number],function(err,row){
        if(err){
          console.log("ERROR IN patientnumberinfo IN RUNNING SQL FOR number = "+number);
          console.log("ERROR CODE :"+err);
          obj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(obj));
          console.log("END----------patientnumberidinfo----------"+now);
          res.send(JSON.stringify(obj));
        }else{
          if(row.length >0){
            obj.status = "SUCCESS";
            obj.present = "Y"
            obj.id = row[0].pm_patient_id;
            obj.uname = row[0].pm_patient_name;
            obj.mname = row[0].pm_mothers_first_name;
            obj.dob = row[0].pm_dob;
            obj.gender = row[0].pm_gender;
            obj.mobile = row[0].pm_contact_mobile;
            obj.email = row[0].pm_patient_email;
            obj.photo = row[0].pm_patient_photo.toString();
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------patientnumberidinfo----------"+now);
            res.send(JSON.stringify(obj));
          }else{
            var Id="";
            var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
            var Mydata = [];
            var csvStream = csv.parse().on("data", function(data){

                  var value=0;

                  if(data[0] == "VIU"){

                    value = parseInt(data[1]);
                    Id = "VIU"+""+data[1];
                    value++;
                    data[1]=value.toString();
                  }
                  Mydata.push(data);
                })
                .on("end", function(){
                     var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
                     csv.write(Mydata, {headers: true}).pipe(ws);
                     obj.status = "SUCCESS";
                     obj.present = "N"
                     obj.id = Id;
                     console.log("RESPONSE="+JSON.stringify(obj));
                     console.log("END----------patientnumberidinfo----------"+now);
                     res.send(JSON.stringify(obj));
                });
            stream.pipe(csvStream);

          }
        }
      })
      connection.release();

    }
  })

})

app.post("/updatetime",function(req,res){

  var now = new Date();
  console.log("START----------updatetime----------"+now);

  var Object = req.body;

  var TimeId =  Object.tid;
  var From = Object.from;
  var To = Object.to;
  console.log("TimeId="+TimeId);
  console.log("From="+From);
  console.log("To="+To);

  var obj = {
    status : "SUCCESS"
  }

  var sql = 'UPDATE doctor_location_time_master SET dltm_time_from = ?, dltm_time_to = ? WHERE dltm_id = ?';

  con.getConnection(function(err, connection) {


      if(err){
        console.log("ERROR IN updatetime IN BUILDING CONNECTION FOR TIMEID = "+TimeId);
        console.log("ERROR CODE :"+err.code);
        obj.status = "CONNECTION ERROR";
        console.log("RESPONSE="+JSON.stringify(obj));
        console.log("END----------updatetime----------"+now);
        res.send(JSON.stringify(obj));
        return err;
      }else{

        connection.query(sql,[From,To,TimeId], function(err, result) {

          if(err){
            console.log("ERROR IN updatetime IN RUNNING QUERY FOR TIMEID = "+TimeId);
            console.log("ERROR CODE "+err.code);
            obj.status = "CONNECTION ERROR";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------updatetime----------"+now);
            res.send(JSON.stringify(obj));
            return err;
          }else{

            if(result.affectedRows == 1){
              res.send(JSON.stringify(obj));
            }else{
              obj.status = "CONNECTION ERROR";
              console.log("RESPONSE="+JSON.stringify(obj));
              console.log("END----------updatetime----------"+now);
              res.send(JSON.stringify(obj));
            }
          }

            connection.release();
        });

      }


  });

})

app.post("/deletetime",function(req,res){

  var now = new Date();
  console.log("START----------deletetime----------"+now);

  var Object = req.body;

  var obj = {
    status : "SUCCESS"
  }

  var arr = [];
  arr = Object.idss;
  var sent =0;
  var count=0;
  console.log("arr="+arr);

  var sql = 'DELETE FROM doctor_location_time_master WHERE dltm_id = ?';

  con.getConnection(function(err, connection) {


      if(err){
        console.log("ERROR IN deletetime IN BUILDING CONNECTION FOR TIMEID ");
        console.log("ERROR CODE :"+err.code);
        obj.status = "CONNECTION ERROR";
        console.log("RESPONSE="+JSON.stringify(obj));
        console.log("END----------deletetime----------"+now);
        res.send(JSON.stringify(obj));
        return err;
      }else{

        console.log(arr.length);
        for(var i=0;i<arr.length;i++){

          connection.query(sql,[arr[i].id], function(err, result) {

            if(err){
              console.log("ERROR IN deletetime IN RUNNING QUERY FOR TIMEID");
              console.log("ERROR CODE "+err.code);
              if(sent == 0){
                obj.status = "CONNECTION ERROR";
                console.log("RESPONSE="+JSON.stringify(obj));
                console.log("END----------deletetime----------"+now);
                res.send(JSON.stringify(obj));
                sent=1;
              }
              return err;
            }else{
              console.log("in here loooooooooooooooooop "+count);
              count++;
              if(result.affectedRows == 1){
                if(count == arr.length && sent==0){
                  console.log("RESPONSE="+JSON.stringify(obj));
                  console.log("END----------deletetime----------"+now);
                  res.send(JSON.stringify(obj));
                  sent=1;
                }
              }else{
                if(sent ==0){
                  obj.status = "CONNECTION ERROR";
                  console.log("RESPONSE="+JSON.stringify(obj));
                  console.log("END----------deletetime----------"+now);
                  res.send(JSON.stringify(obj));
                  sent=1;
                }

              }
            }


          });


        }

        connection.release();
      }


  });

})

app.post("/numberverify",function(req,res){

  var Object = req.body;

  var now = new Date();
  console.log("START----------numberverify----------"+now);

  var MOBILE =  Object.mobile;
  var PLD_ROLE = Object.pldrole;
  console.log("MOBILE="+MOBILE);
  console.log("PLD_ROLE="+PLD_ROLE);

  var obj = {
    status : "SUCCESS"
  }

  var sql = 'SELECT COUNT(*) AS namesCount FROM partner_login_details_master WHERE (pld_role = ? AND  pld_mobile = ?) AND pld_role = ?';

  con.getConnection(function(err, connection) {


      if(err){
        console.log("ERROR IN NUMBER VRTIFY IN BUILDING CONNECTION FOR PLD_ROLE = "+PLD_ROLE+" AND FOR PLD_MOBILE = "+MOBILE);
        console.log("ERROR CODE :"+err.code);
        console.log(err);
        obj.status = "CONNECTION ERROR";
        console.log("RESPONSE="+JSON.stringify(obj));
        console.log("END----------numberverify----------"+now);
        res.send(JSON.stringify(obj));
        return err;
      }else{

        connection.query(sql,[PLD_ROLE,MOBILE,PLD_ROLE], function(err, result) {

          if(err){
            console.log("ERROR IN NUMBER VRTIFY IN RUNNING QUERY FOR PLD_ROLE = "+PLD_ROLE+" AND FOR PLD_MOBILE = "+MOBILE);
            console.log("ERROR CODE "+err.code);
            console.log(err);
            obj.status = "CONNECTION ERROR";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------numberverify----------"+now);
            res.send(JSON.stringify(obj));
            return err;
          }else{

            if(result[0].namesCount == 0){
              console.log("RESPONSE="+JSON.stringify(obj));
              console.log("END----------numberverify----------"+now);
              res.send(JSON.stringify(obj));
            }else{
              obj.status = "FAIL";
              console.log("RESPONSE="+JSON.stringify(obj));
              console.log("END----------numberverify----------"+now);
              res.send(JSON.stringify(obj));
            }
          }

            connection.release();
        });

      }


  });



});

app.post("/vitalregiteruser",function(req,res){

  var Object = req.body;
  var now = new Date();
  console.log("START----------vitalregiteruser----------"+now);

  var ID="";
  var PLD_ROLE = Object.pldrole;
  var ADHAARNUMBER =  Object.adnumber;
  console.log("PLD_ROLE="+PLD_ROLE);
  console.log("ADHAARNUMBER="+ADHAARNUMBER);

  var obj = {
    status : "SUCCESS",
    id : ""
  }

  var sql = 'SELECT COUNT(*) AS namesCount FROM doctor_master WHERE dm_aadhar_number = ? AND  dm_ready_live_flag = ?';


  con.getConnection(function(err, connection) {

    if(err){
      console.log("ERROR IN OPENING DATABASE IN vitalregiteruser FUNCTION FOR ADHAARNUMBER ="+ADHAARNUMBER);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      console.log("RESPONSE="+JSON.stringify(obj));
      console.log("END----------vitalregiteruser----------"+now);
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.query(sql,[ADHAARNUMBER,'Y'], function(err, result) {

        if(err){
          console.log("ERROR IN RUNNING SQL IN vitalregiteruser FUNCTION FOR ADHAARNUMBER ="+ADHAARNUMBER);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(obj));
          console.log("END----------vitalregiteruser----------"+now);
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
                     console.log("RESPONSE="+JSON.stringify(obj));
                     console.log("END----------vitalregiteruser----------"+now);
                     VitalInsertFinalValue(req,res,ID);
                });
            stream.pipe(csvStream);
          }else{
            obj.status = "USER ALREADY REGISTERED";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------vitalregiteruser----------"+now);
            res.send(JSON.stringify(obj));
          }
        }

          connection.release();
      });

    }
  });




})

app.post("/registeruser",function(req,res){

  var Object = req.body;
  var now = new Date();
  console.log("START----------registeruser----------"+now);

  var ID="";
  var PLD_ROLE = Object.pldrole;
  var REGISTRATION_NUMBER =  Object.registernumber;
  console.log("PLD_ROLE="+PLD_ROLE);
  console.log("REGISTRATION_NUMBER="+REGISTRATION_NUMBER);

  var obj = {
    status : "SUCCESS",
    id : ""
  }

  var sql = 'SELECT COUNT(*) AS namesCount FROM doctor_master WHERE dm_medical_registration_number = ? AND  dm_ready_live_flag = ?';


  con.getConnection(function(err, connection) {

    if(err){
      console.log("ERROR IN registeruser IN GETTING CONNECTION FOR REGISTRATION NUMBER ="+REGISTRATION_NUMBER);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      console.log("RESPONSE="+JSON.stringify(obj));
      console.log("END----------registeruser----------"+now);
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.query(sql,[REGISTRATION_NUMBER,'Y'], function(err, result) {

        if(err){
          console.log("ERROR IN registeruser IN RUNNING SQL FOR REGISTRATION NUMBER ="+REGISTRATION_NUMBER);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(obj));
          console.log("END----------registeruser----------"+now);
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
                     console.log("RESPONSE="+JSON.stringify(obj));
                     console.log("END----------registeruser----------"+now);
                     InsertFinalValue(req,res,ID);
                });
            stream.pipe(csvStream);
          }else{
            console.log("ERROR IN registeruser IN RUNNING SQL 0 FOR REGISTRATION NUMBER ="+REGISTRATION_NUMBER);
            obj.status = "CONNECTION ERROR";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------registeruser----------"+now);
            res.send(JSON.stringify(obj));
          }
        }

          connection.release();
      });

    }
  });



});

app.post("/checkpoint",function(req,res){

  var now = new Date();
  console.log("START----------checkpoint----------"+now);

  var Object = req.body;

  var DlmId = Object.dlmid;
  console.log("DlmId="+DlmId);

  var obj = {
    status : "SUCCESS",
    progress:0
    }

  var sql1 = 'SELECT COUNT(*) AS day FROM doctor_location_day_master WHERE dldm_dlm_id = ?';
  var sql2 = 'SELECT COUNT(*) AS service FROM doctor_clinic_services_master WHERE dcsm_dlm_id = ?';

  con.getConnection(function(err, connection) {

    if(err){
      console.log("ERROR IN CHECKPOINT IN GETTING CONNECTION FOR DLMID = "+DlmId);
      console.log(err.code);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      console.log("RESPONSE="+JSON.stringify(obj));
      console.log("END----------checkpoint----------"+now);
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.query(sql1,[DlmId], function(err, result) {

        if(err){
          console.log("ERROR IN CHECKPOINT IN RUNNING SQL1 FOR DLMID = "+DlmId);
          console.log(err.code);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(obj));
          console.log("END----------checkpoint----------"+now);
          res.send(JSON.stringify(obj));
          return err;
        }else{

          if(result[0].day == 0){

            obj.progress=0;//He has not inserted time
            obj.status="SUCCESS";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------checkpoint----------"+now);
            res.send(JSON.stringify(obj));

          }else{
            connection.query(sql2,[DlmId],function(err,resultt){
              if(err){
                console.log("ERROR IN CHECKPOINT IN RUNNING SQL2 FOR DLMID = "+DlmId);
                console.log(err.code);
                console.log(err);
                obj.status = "CONNECTION ERROR";
                console.log("RESPONSE="+JSON.stringify(obj));
                console.log("END----------checkpoint----------"+now);
                res.send(JSON.stringify(obj));
                return err;
              }else{
                if(resultt[0].service == 0){
                  obj.progress=1;//He has not inserted service but inserted time
                  obj.status="SUCCESS";
                  console.log("RESPONSE="+JSON.stringify(obj));
                  console.log("END----------checkpoint----------"+now);
                  res.send(JSON.stringify(obj));
                }else{
                  obj.progress=2;//He has inserted every value
                  obj.status="SUCCESS";
                  console.log("RESPONSE="+JSON.stringify(obj));
                  console.log("END----------checkpoint----------"+now);
                  res.send(JSON.stringify(obj));
                }
              }
            })
          }
        }

          connection.release();
      });

    }
  });


})

app.post("/signin",function(req,res){

  var now = new Date();
  console.log("START----------signin----------"+now);

  var obj = {
    status : "SUCCESS",
    role : []
  }

  var Object = req.body;

  var Email = Object.email;
  var Password = Object.password;
  var DocId="";
  console.log("Email="+Email);
  console.log("Password="+Password);

  var sql = 'SELECT pld_password, pld_partner_id, pld_role FROM partner_login_details_master WHERE pld_username = ?';

  con.getConnection(function(err,connection){

    if(err){

      console.log("ERROR IN CONNECTING TO THE DATABASE IN SIGNIN FOR Email = "+Email);
      console.log("ERROR : "+err.code);
      obj.status = "CONNECTION ERROR";
      console.log("RESPONSE="+JSON.stringify(obj));
      console.log("END----------signin----------"+now);
      res.send(JSON.stringify(obj));
      return err;

    }else{

      connection.query(sql,[Email],function(err,result){

        if(err){
          console.log("ERROR IN RUNNING SQL IN SIGNIN FOR Email = "+Email);
          console.log("ERROR : "+err.code);
          obj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(obj));
          console.log("END----------signin----------"+now);
          res.send(JSON.stringify(obj));
          return err;
        }else{
          if(result.length==0){
            obj.status = "YOU ARE NOT REGISTERED/ INVALID USERNAME";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------signin----------"+now);
            res.send(JSON.stringify(obj));
          }else{
            if(result[0].pld_password == Password){

              for(var i=0;i<result.length;i++){
                var objj = {
                  role : result[i].pld_role,
                  roleid : result[i].pld_partner_id
                }
                obj.role.push(objj);
              }
              console.log(obj.role);

              obj.status = "SUCCESS";
              console.log("RESPONSE="+JSON.stringify(obj));
              console.log("END----------signin----------"+now);
              res.send(JSON.stringify(obj));



            }else{
              obj.status = "YOU PASSWORD IS INCORRECT";
              console.log("RESPONSE="+JSON.stringify(obj));
              console.log("END----------signin----------"+now);
              res.send(JSON.stringify(obj));
            }
          }
        }

        connection.release();


      })

    }

  })

});

app.post("/fetchcheckpoint",function(req,res){

  var now = new Date();
  console.log("START----------fetchcheckpoint----------"+now);

  var obj = {
    status : "SUCCESS",
    checkpoint : 0
  }

  var Object = req.body;

  var DocId= Object.docid;
  console.log("DocId="+DocId);

  var sql4 = 'SELECT dm_doctor_name, dm_dob, dm_gender, dm_doctor_speciality_id FROM doctor_master WHERE dm_doctor_id = ?';
  var sql2 = 'SELECT COUNT(*) AS exist FROM doctor_location_master WHERE dlm_dm_doctor_id = ?';
  var sql3 = 'SELECT dm_profiling_complete from doctor_master WHERE dm_doctor_id = ?';

  con.getConnection(function(err,connection){

    if(err){

      console.log("ERROR IN fetchcheckpoint in CONNECTING TO THE DATABASE IN SIGNIN FOR DocId = "+DocId);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      console.log("RESPONSE="+JSON.stringify(obj));
      console.log("END----------fetchcheckpoint----------"+now);
      res.send(JSON.stringify(obj));
      return err;

    }else{

      connection.query(sql2,[DocId],function(err,resul){

        if(err){
          console.log("ERROR IN  fetchcheckpoint in RUNNING SQL2 IN SIGNIN FOR DocId = "+DocId);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(obj));
          console.log("END----------fetchcheckpoint----------"+now);
          res.send(JSON.stringify(obj));
          return err;
        }else{

          if(resul[0].exist == 0){
            obj.status = "SUCCESS";
            obj.checkpoint = 1;//Go to add location screen
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------fetchcheckpoint----------"+now);
            res.send(JSON.stringify(obj));

          }else{
            obj.status = "SUCCESS";
            obj.checkpoint = 2;// go to manage location screen
            connection.query(sql3,[DocId],function(err,ress){
              if(err){
                console.log("ERROR IN fetchcheckpoint in RUNNING SQL3 IN SIGNIN FOR DocId = "+DocId);
                console.log(err);
                obj.status = "CONNECTION ERROR";
                console.log("RESPONSE="+JSON.stringify(obj));
                console.log("END----------fetchcheckpoint----------"+now);
                res.send(JSON.stringify(obj));
                return err;
              }else{
                  if(ress[0].dm_profiling_complete == 'Y'){
                    obj.status = "SUCCESS";
                    obj.checkpoint = 3;// go to dashboard screen
                    console.log("RESPONSE="+JSON.stringify(obj));
                    console.log("END----------fetchcheckpoint----------"+now);
                    res.send(JSON.stringify(obj));
                  }else{
                    obj.status = "SUCCESS";
                    obj.checkpoint = 2;// go to manage location screen
                    console.log("RESPONSE="+JSON.stringify(obj));
                    console.log("END----------fetchcheckpoint----------"+now);
                    res.send(JSON.stringify(obj));
                  }


              }
            })

          }

        }

      })

      connection.release();

    }

  })

})

app.post("/allinformation",function(req,res){

  var now = new Date();
  console.log("START----------allinformation----------"+now);

  var obj = {
    status : "SUCCESS",
    docname: "",
    docdob: "",
    docgender: "",
    docspeciality: "",
    introduction : "",
    experience : 0,
    mbbs : "",
    md : "",
    ms : "",
    diploma :"",
    age : 0,
    image : ""
    }

  var Object = req.body;
  var DocId = Object.docid;
  console.log("DocId="+DocId);

  var sql4 = 'SELECT dm_doctor_name, dm_dob, dm_gender,dm_doctor_mbbs_flag,dm_doctor_md_flag,dm_doctor_ms_flag,dm_doctor_diploma_flag, dm_doctor_speciality_id, dm_doctor_photo, dm_introduction, dm_doctor_experience, round((to_days(sysdate())-to_days(dm_dob))/365) as AGE FROM doctor_master WHERE dm_doctor_id = ?';

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN RUNNING SQL1 IN allinformation FOR DocId = "+DocId);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      console.log("RESPONSE="+JSON.stringify(obj));
      console.log("END----------allinformation----------"+now);
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.query(sql4,[DocId],function(err,result1){
        if(err){
          console.log("ERROR IN RUNNING SQL1 IN allinformation FOR DocId = "+DocId);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(obj));
          console.log("END----------allinformation----------"+now);
          res.send(JSON.stringify(obj));
          return err;
        }else{

          if(result1.length == 1){

            obj.docname = result1[0].dm_doctor_name;
            obj.docdob = result1[0].dm_dob;
            obj.docgender = result1[0].dm_gender;
            obj.docspeciality = result1[0].dm_doctor_speciality_id;
            obj.introduction = result1[0].dm_introduction;
            obj.experience = result1[0].dm_doctor_experience;
            obj.age = result1[0].AGE;
            obj.mbbs =result1[0].dm_doctor_mbbs_flag;
            obj.md = result1[0].dm_doctor_md_flag;
            obj.ms = result1[0].dm_doctor_ms_flag;
            obj.diploma = result1[0].dm_doctor_diploma_flag;
            if(result1[0].dm_doctor_photo == null){
              obj.image = "";
            }else{
              obj.image = result1[0].dm_doctor_photo.toString();
            }
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------allinformation----------"+now);
            res.send(JSON.stringify(obj));

          }else{
            console.log("ERROR IN RUNNING SQL1 0 ROWS RETURNED IN allinformation FOR DocId = "+DocId);
            obj.status = "CONNECTION ERROR";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------allinformation----------"+now);
            res.send(JSON.stringify(obj));
          }

        }
      })
      connection.release();


    }
  })


})

app.post("/vitalsignupinfo",function(req,res){

  var now = new Date();
  console.log("START----------vitalsignupinfo----------"+now);

  var Object = req.body;
  var phnumber = Object.number;
  console.log("phnumber="+phnumber);

  var MainObj = {
    status : "SUCCESS",
    name : "",
    dob : "",
    gender : "",
    email : "",
    password : "",
    flag : "",
    image : ""
  }

  var sql = "SELECT dm.dm_doctor_name, dm.dm_dob, dm.dm_gender,dm.dm_doctor_photo, dm.dm_doctor_email, pldm.pld_password FROM doctor_master AS dm INNER JOIN partner_login_details_master AS pldm ON dm.dm_doctor_id = pldm.pld_partner_id WHERE pldm.pld_mobile = ?";
  var sql1 = "select date_format((?),'%d-%m-%Y') AS ddd";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN GETTING CONNECTION IN vitalsignupinfo FOR phnumber = "+phnumber);
      console.log(err);
      MainObj.status = "CONNECTION ERROR";
      console.log("RSPONSE="+JSON.stringify(MainObj));
      console.log("END----------vitalsignupinfo----------"+now);
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql,[phnumber],function(err,row){
        if(err){
          console.log("ERROR IN RUNNING SQL IN vitalsignupinfo FOR phnumber = "+phnumber);
          console.log(err);
          MainObj.status = "CONNECTION ERROR";
          console.log("RSPONSE="+JSON.stringify(MainObj));
          console.log("END----------vitalsignupinfo----------"+now);
          res.send(JSON.stringify(MainObj));
          return err;
        }else{
          if(row.length>0){
            MainObj.status = "SUCCESS";
            MainObj.name = row[0].dm_doctor_name;
            MainObj.dob = row[0].dm_dob;
            MainObj.email = row[0].dm_doctor_email;
            MainObj.password = row[0].pld_password;
            MainObj.gender = row[0].dm_gender;
            if(row[0].dm_doctor_photo == null){
              MainObj.image = "";
            }else{
              MainObj.image = row[0].dm_doctor_photo.toString();
            }
            connection.query(sql1,[row[0].dm_dob],function(err,row1){
              if(err){
                console.log("ERROR IN RUNNING SQL1 IN vitalsignupinfo FOR phnumber = "+phnumber);
                console.log(err);
                MainObj.status = "CONNECTION ERROR";
                console.log("RSPONSE="+JSON.stringify(MainObj));
                console.log("END----------vitalsignupinfo----------"+now);
                res.send(JSON.stringify(MainObj));
                return err;
              }else{
                if(row1.length > 0){
                  MainObj.dob = row1[0].ddd;
                  MainObj.flag = "Y";
                  console.log("RSPONSE="+JSON.stringify(MainObj));
                  console.log("END----------vitalsignupinfo----------"+now);
                  res.send(JSON.stringify(MainObj));
                }else{
                  console.log("ERROR IN RUNNING SQL1 IN vitalsignupinfo 0 ROWS RETURNEDFOR phnumber = "+phnumber);
                  MainObj.status = "CONNECTION ERROR";
                  console.log("RSPONSE="+JSON.stringify(MainObj));
                  console.log("END----------vitalsignupinfo----------"+now);
                  res.send(JSON.stringify(MainObj));
                }

              }
            })
          }else{
            MainObj.status = "SUCCESS";
            MainObj.flag = "N";
            console.log("RSPONSE="+JSON.stringify(MainObj));
            console.log("END----------vitalsignupinfo----------"+now);
            res.send(JSON.stringify(MainObj));
          }
        }
      })
      connection.release();
    }
  })


})

app.post("/updatepicture",function(req,res){{

  var now = new Date();
  console.log("START----------updatepicture----------"+now);

  var Object = req.body;

  var DocId =  Object.docid;
  var Image = Object.image.toString();
  console.log("DocId="+DocId);
  console.log("Image="+Image);

  var obj = {
    status : "SUCCESS"
  }

  var sql = 'UPDATE doctor_master SET dm_doctor_photo = ? WHERE dm_doctor_id = ?';

  con.getConnection(function(err, connection) {


      if(err){
        console.log("ERROR IN updatepicture IN BUILDING CONNECTION FOR DOCID = "+DocId);
        obj.status = "CONNECTION ERROR";
        console.log("RESPONSE="+JSON.stringify(obj));
        console.log("END----------updatepicture----------"+now);
        res.send(JSON.stringify(obj));
        return err;
      }else{

        connection.query(sql,[Image,DocId], function(err, result) {

          if(err){
            console.log("ERROR IN updatepicture IN RUNNING QUERY FOR DOCID = "+DocId);
            obj.status = "CONNECTION ERROR";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------updatepicture----------"+now);
            res.send(JSON.stringify(obj));
            return err;
          }else{

            if(result.affectedRows == 1){
              console.log("Success");
              obj.status = "SUCCESS";
              console.log("RESPONSE="+JSON.stringify(obj));
              console.log("END----------updatepicture----------"+now);
              res.send(JSON.stringify(obj));
            }else{
              obj.status = "CONNECTION ERROR";
              console.log("RESPONSE="+JSON.stringify(obj));
              console.log("END----------updatepicture----------"+now);
              res.send(JSON.stringify(obj));
            }
          }

            connection.release();
        });

      }


  });

}})

app.post("/updateintroduction",function(req,res){

  var now = new Date();
  console.log("START----------updateintroduction----------"+now);

  var Object = req.body;

  var DocId =  Object.docid;
  var Introduction = Object.introduction;
  console.log("DocId="+DocId);
  console.log("Introduction="+Introduction);

  var obj = {
    status : "SUCCESS"
  }

  var sql = 'UPDATE doctor_master SET dm_introduction = ? WHERE dm_doctor_id = ?';

  con.getConnection(function(err, connection) {


      if(err){
        console.log("ERROR IN updateintroduction IN BUILDING CONNECTION FOR DOCID = "+DocId);
        obj.status = "CONNECTION ERROR";
        console.log("RESPONSE="+JSON.stringify(obj));
        console.log("END----------updateintroduction----------"+now);
        res.send(JSON.stringify(obj));
        return err;
      }else{

        connection.query(sql,[Introduction,DocId], function(err, result) {

          if(err){
            console.log("ERROR IN updateintroduction IN RUNNING QUERY FOR DOCID = "+DocId);
            obj.status = "CONNECTION ERROR";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------updateintroduction----------"+now);
            res.send(JSON.stringify(obj));
            return err;
          }else{

            if(result.affectedRows == 1){
              obj.status = "SUCCESS";
              console.log("RESPONSE="+JSON.stringify(obj));
              console.log("END----------updateintroduction----------"+now);
              res.send(JSON.stringify(obj));
            }else{
              obj.status = "CONNECTION ERROR";
              console.log("RESPONSE="+JSON.stringify(obj));
              console.log("END----------updateintroduction----------"+now);
              res.send(JSON.stringify(obj));
            }
          }

            connection.release();
        });

      }


  });

})

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

app.post("/updatelocation",function(req,res){

  var now = new Date();
  console.log("START----------updatelocation----------"+now);

  var Object = req.body;

  var obj = {
    status : ""
  }

  var Name = Object.name;
  var AddressLine1 = Object.adrline1;
  var AddressLine2 = Object.adrline2;
  var City = Object.city;
  var District = Object.district;
  var State = Object.state;
  var Pin = Object.pin;
  var LocId=Object.locid;
  console.log("Name="+Name);
  console.log("AddressLine1="+AddressLine1);
  console.log("AddressLine2="+AddressLine2);
  console.log("City="+City);
  console.log("District="+District);
  console.log("State="+State);
  console.log("Pin="+Pin);
  console.log("LocId="+LocId);

  var sql = "UPDATE location_master SET lm_name = ?, lm_address_line1 = ?, lm_address_line2 = ?, lm_city = ?, lm_district = ?, lm_state = ?, lm_pincode = ? WHERE lm_location_id = ?";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN updatelocation IN BUILDING CONNECTION FOR DOCID = "+LocId);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      console.log("RESPONSE="+JSON.stringify(obj));
      console.log("END----------updatelocation----------"+now);
      res.send(JSON.stringify(obj));
      return err;
    }else{
      connection.query(sql,[Name,AddressLine1,AddressLine2,City,District,State,Pin,LocId],function(err,result){
        if(err){
          console.log("ERROR IN updatelocation IN RUNNING SQL FOR DOCID = "+LocId);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(obj));
          console.log("END----------updatelocation----------"+now);
          res.send(JSON.stringify(obj));
          return err;
        }else{
          if(result.affectedRows == 1){
            obj.status = "SUCCESS";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------updatelocation----------"+now);
            res.send(JSON.stringify(obj));
          }else{
            console.log("ERROR IN updatelocation IN SQL 0 ROWS AFFESCTED FOR DOCID = "+LocId);
            obj.status = "CONNECTION ERROR";
            console.log("RESPONSE="+JSON.stringify(obj));
            console.log("END----------updatelocation----------"+now);
            res.send(JSON.stringify(obj));
          }
        }
      })
      connection.release();
    }
  })

})

app.post("/clinicaddlocation",function(req,res){

  var now = new Date();
  console.log("START----------clinicaddlocation----------"+now);

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
  console.log("Name="+Name);
  console.log("AddressLine1="+AddressLine1);
  console.log("AddressLine2="+AddressLine2);
  console.log("City="+City);
  console.log("District="+District);
  console.log("State="+State);
  console.log("Pin="+Pin);
  console.log("Did="+Did);
  console.log("Options="+Options);


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

           var sql1 = 'INSERT INTO location_master (lm_location_id, lm_name, lm_address_line1, lm_address_line2, lm_city, lm_district, lm_state, lm_pincode, lm_flag_home_service_ref) VALUES ((?),(?),(?),(?),(?),(?),(?),(?),(?))';
           var sql2 = 'INSERT INTO doctor_location_master (dlm_dm_doctor_id, dlm_lm_location_id, dlm_id, dlm_doctor_options) VALUES ((?),(?),(?),(?))';

           con.getConnection(function(err,connection){

             if(err){
               console.log("ERROR IN CONNECTION TO DATABASE IN CLINICADDLOCATION DOCID = "+Did);
               console.log(err);
               obj.status = "FAIL";
               console.log("RESPONSE="+JSON.stringify(obj));
               console.log("END----------clinicaddlocation----------"+now);
               res.send(JSON.stringify(obj));
               return err;
             }else{

               connection.beginTransaction(function(err){

                 if(err){
                   console.log("ERROR IN BEGINING TRANSACTION DATABASE IN CLINICADDLOCATION DOCID = "+Did);
                   console.log(err);
                   obj.status = "FAIL";
                   console.log("RESPONSE="+JSON.stringify(obj));
                   console.log("END----------clinicaddlocation----------"+now);
                   res.send(JSON.stringify(obj));
                   return err;
                 }else{

                   connection.query(sql1,[LocId,Name,AddressLine1,AddressLine2,City,District,State,Pin,'N'],function(err,result){

                     if(err){
                       console.log("ERROR IN RUNNING SQL1 IN CLINICADDLOCATION DOCID = "+Did);
                       console.log("ERROR:"+err);
                       obj.status = "FAIL";
                       console.log("RESPONSE="+JSON.stringify(obj));
                       console.log("END----------clinicaddlocation----------"+now);
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
                             obj.status = "FAIL";
                             console.log("RESPONSE="+JSON.stringify(obj));
                             console.log("END----------clinicaddlocation----------"+now);
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
                                   obj.status = "FAIL";
                                   console.log("RESPONSE="+JSON.stringify(obj));
                                   console.log("END----------clinicaddlocation----------"+now);
                                   res.send(JSON.stringify(obj));
                                   connection.rollback(function(){
                                     return err;
                                   })
                                 }else{
                                   obj.status = "SUCCESS";
                                   console.log("RESPONSE="+JSON.stringify(obj));
                                   console.log("END----------clinicaddlocation----------"+now);
                                   res.send(JSON.stringify(obj));
                                 }
                               })
                             }else{
                               connection.rollback(function(){
                               })
                               console.log("ERROR AFFECTING ROWS DATABASE IN CLINICADDLOCATION DOCID = "+Did);
                               obj.status = "FAIL";
                               console.log("RESPONSE="+JSON.stringify(obj));
                               console.log("END----------clinicaddlocation----------"+now);
                               res.send(JSON.stringify(obj));
                             }

                           }

                         })

                       }else{
                         connection.rollback(function(){
                         })
                         console.log("ERROR AFFECTING ROWS DATABASE IN CLINICADDLOCATION DOCID = "+Did);
                         obj.status = "FAIL";
                         console.log("RESPONSE="+JSON.stringify(obj));
                         console.log("END----------clinicaddlocation----------"+now);
                         res.send(JSON.stringify(obj));
                       }

                     }

                     connection.release();

                   })

                 }

               })

             }

           })

      });
  stream.pipe(csvStream);


  var obj = {
    status : "SUCCESS"
  }

  //have to make change hererererererer



})

app.post("/fetchlocation",function(req,res){
  var now = new Date();
  console.log("START----------fetchlocation----------"+now);

  var Object = req.body;

  var LocId = Object.locid;
  console.log("LocId="+LocId);

  var Aray = [];


  var MainObj = {
    status:"",
    lname:"",
    lflagservice:"",
    ladrline1:"",
    ladrline2:"",
    city:"",
    district:"",
    state:"",
    pincode:""
  }

  var sql = "SELECT LM.lm_name, LM.lm_flag_home_service_ref, LM.lm_address_line1, LM.lm_location_id, LM.lm_city, LM.lm_address_line2, LM.lm_district, LM.lm_state, LM.lm_pincode FROM location_master AS LM WHERE LM.lm_location_id = ?";

  con.getConnection(function(err,connection){

    if(err){
      console.log("ERROR IN BUILDING CONNECTION IN FETCHLOCATION FOR LocId = "+LocId);
      console.log("ERROR : "+err);
      MainObj.status = "CONNECTION ERROR";
      console.log("RESPONSE="+JSON.stringify(MainObj));
      console.log("END----------fetchlocation----------"+now);
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql,[LocId],function(err,result){
        if(err){
          console.log("ERROR IN RUNNING SQL IN FETCHLOCATION FOR LocId = "+LocId);
          console.log("ERROR : "+err);
          MainObj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(MainObj));
          console.log("END----------fetchlocation----------"+now);
          res.send(JSON.stringify(MainObj));
          return err;
        }else{


          if(result.length > 0){

            MainObj.status = "SUCCESS";


            MainObj.lname = result[0].lm_name
            MainObj.lflagservice = result[0].lm_flag_home_service_ref
            MainObj.ladrline1= result[0].lm_address_line1
            MainObj.ladrline2=result[0].lm_address_line2
            MainObj.city=result[0].lm_city
            MainObj.district=result[0].lm_district
            MainObj.state=result[0].lm_state
            MainObj.pincode=result[0].lm_pincode

            console.log("RESPONSE="+JSON.stringify(MainObj));
            console.log("END----------fetchlocation----------"+now);
            res.send(JSON.stringify(MainObj));


          }else{
            console.log("ERROR IN RUNNING SQL IN FETCHLOCATION FOR LocId = "+LocId);
            MainObj.status = "CONNECTION ERROR";
            console.log("RESPONSE="+JSON.stringify(MainObj));
            console.log("END----------fetchlocation----------"+now);
            res.send(JSON.stringify(MainObj));
          }


        }

        connection.release();

      })
    }

  })

})

app.post("/managelocation",function(req,res){

  var now = new Date();
  console.log("START----------managelocation----------"+now);

  var Object = req.body;

  var DocId = Object.docid;
  console.log("DocId="+DocId);

  var Aray = [];

  var MainObj = {
    status:"",
    locations : []
  }

  var sql = "SELECT LM.lm_name, LM.lm_flag_home_service_ref, LM.lm_address_line1, LM.lm_location_id, LM.lm_city, DLM.dlm_id FROM location_master AS LM INNER JOIN doctor_location_master AS DLM ON LM.lm_location_id = DLM.dlm_lm_location_id WHERE DLM.dlm_dm_doctor_id = ?";

  con.getConnection(function(err,connection){

    if(err){
      console.log("ERROR IN BUILDING CONNECTION IN managelocation FOR DocId = "+DocId);
      console.log("ERROR : "+err);
      MainObj.status = "CONNECTION ERROR";
      console.log("RESPONSE="+JSON.stringify(MainObj));
      console.log("END----------managelocation----------"+now);
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql,[DocId],function(err,result){
        if(err){
          console.log("ERROR IN RUNNING SQL IN managelocation FOR DocId = "+DocId);
          console.log("ERROR : "+err);
          MainObj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(MainObj));
          console.log("END----------managelocation----------"+now);
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

          console.log("RESPONSE="+JSON.stringify(MainObj));
          console.log("END----------managelocation----------"+now);
          res.send(JSON.stringify(MainObj));

        }

        connection.release();

      })
    }

  })


})

app.post("/timeinsert",function(req,res){

  var now = new Date();
  console.log("START----------timeinsert----------"+now);

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

  var DlmId = Object.dlmid;
  console.log("DlmId="+DlmId);

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;


  console.log("mon=");
  console.log(MON);
  console.log("tue=");
  console.log(TUE);
  console.log("wed=");
  console.log(WED);
  console.log("thu=");
  console.log(THU);
  console.log("fri=");
  console.log(FRI);
  console.log("sat=");
  console.log(SAT);
  console.log("sun=");
  console.log(SUN);


  var MainObj = {
    status:"SUCCESS"
  }

  var method = 0;//0 for insert and 1 for select

  var sql0 = "SELECT dldm_dlm_id FROM doctor_location_day_master WHERE dldm_dlm_id = ?";

  con.getConnection(function(err,connection2){
    if(err){
      console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
      console.log("ERROR : "+err);
      console.log("RESPONSE="+JSON.stringify(MainObj));
      console.log("END----------timeinsert----------"+now);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection2.query(sql0,[DlmId],function(err,row0){
        if(err){
          console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
          console.log("ERROR : "+err);
          MainObj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(MainObj));
          console.log("END----------timeinsert----------"+now);
          res.send(JSON.stringify(MainObj));
          return err;
        }else{
          if(row0.length > 0){


                var sql1 = "SELECT dldm_id FROM doctor_location_day_master WHERE dldm_day_number = ? AND dldm_dlm_id = ?";
                var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";

                con.getConnection(function(err,connection){
                  if(err){
                    console.log("ERROR IN GETTING CONNECTION FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    MainObj.status = "CONNECTION ERROR";
                    console.log("RESPONSE="+JSON.stringify(MainObj));
                    console.log("END----------timeinsert----------"+now);
                    res.send(JSON.stringify(MainObj));
                      return err;
                  }else{
                    connection.beginTransaction(function(err){
                      if(err){
                        console.log("ERROR IN BEGIING TRANSACTION FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                        console.log("ERROR : "+err);
                        MainObj.status = "CONNECTION ERROR";
                        console.log("RESPONSE="+JSON.stringify(MainObj));
                        console.log("END----------timeinsert----------"+now);
                        res.send(JSON.stringify(MainObj));
                          return err;

                      }else{
                        connection.query(sql1,["MON",DlmId],function(err,row1){
                          if(err){
                            console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                            console.log("ERROR : "+err);
                            MainObj.status = "CONNECTION ERROR";
                            console.log("RESPONSE="+JSON.stringify(MainObj));
                            console.log("END----------timeinsert----------"+now);
                            res.send(JSON.stringify(MainObj));
                            connection.rollback(function(){
                              return err;
                            })
                          }else{

                            Dldmid = row1[0].dldm_id;

                            if(MON.length==0){


                              connection.query(sql1,["TUE",DlmId],function(err,row2){

                                if(err){
                                  console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                  console.log("ERROR : "+err);
                                  MainObj.status = "CONNECTION ERROR";
                                  console.log("RESPONSE="+JSON.stringify(MainObj));
                                  console.log("END----------timeinsert----------"+now);
                                  res.send(JSON.stringify(MainObj));
                                  connection.rollback(function(){
                                    return err;
                                  })
                                }else{

                                  Dldmid = row2[0].dldm_id;

                                  if(TUE.length == 0){

                                    connection.query(sql1,["WED",DlmId],function(err,row3){

                                      if(err){
                                        console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                        console.log("ERROR : "+err);
                                        MainObj.status = "CONNECTION ERROR";
                                        console.log("RESPONSE="+JSON.stringify(MainObj));
                                        console.log("END----------timeinsert----------"+now);
                                        res.send(JSON.stringify(MainObj));
                                        connection.rollback(function(){
                                          return err;
                                        })
                                      }else{

                                        Dldmid = row3[0].dldm_id;

                                        if(WED.length==0){

                                          connection.query(sql1,["THU",DlmId],function(err,row4){

                                            if(err){
                                              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                              console.log("ERROR : "+err);
                                              MainObj.status = "CONNECTION ERROR";
                                              console.log("RESPONSE="+JSON.stringify(MainObj));
                                              console.log("END----------timeinsert----------"+now);
                                              res.send(JSON.stringify(MainObj));
                                              connection.rollback(function(){
                                                return err;
                                              })
                                            }else{

                                              Dldmid = row4[0].dldm_id;

                                              if(THU.length == 0){

                                                connection.query(sql1,["FRI",DlmId],function(err,row5){

                                                  if(err){
                                                    console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                    console.log("ERROR : "+err);
                                                    MainObj.status = "CONNECTION ERROR";
                                                    console.log("RESPONSE="+JSON.stringify(MainObj));
                                                    console.log("END----------timeinsert----------"+now);
                                                    res.send(JSON.stringify(MainObj));
                                                    connection.rollback(function(){
                                                      return err;
                                                    })
                                                  }else{

                                                    Dldmid = row5[0].dldm_id;

                                                    if(FRI.length==0){

                                                      connection.query(sql1,["SAT",DlmId],function(err,row6){

                                                        if(err){
                                                          console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                          console.log("ERROR : "+err);
                                                          MainObj.status = "CONNECTION ERROR";
                                                          console.log("RESPONSE="+JSON.stringify(MainObj));
                                                          console.log("END----------timeinsert----------"+now);
                                                          res.send(JSON.stringify(MainObj));
                                                          connection.rollback(function(){
                                                            return err;
                                                          })
                                                        }else{

                                                          Dldmid = row6[0].dldm_id;

                                                          if(SAT.length == 0){

                                                            connection.query(sql1,["SUN",DlmId],function(err,row7){

                                                              if(err){
                                                                console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                                console.log("ERROR : "+err);
                                                                MainObj.status = "CONNECTION ERROR";
                                                                console.log("RESPONSE="+JSON.stringify(MainObj));
                                                                console.log("END----------timeinsert----------"+now);
                                                                res.send(JSON.stringify(MainObj));
                                                                connection.rollback(function(){
                                                                  return err;
                                                                })
                                                              }else{

                                                                Dldmid = row7[0].dldm_id;

                                                                if(SUN.length==0){
                                                                  connection.commit(function(err){
                                                                    if (err) {
                                                                      console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                                      console.log("ERROR : "+err);
                                                                      MainObj.status = "CONNECTION ERROR";
                                                                      console.log("RESPONSE="+JSON.stringify(MainObj));
                                                                      console.log("END----------timeinsert----------"+now);
                                                                      res.send(JSON.stringify(MainObj));
                                                                      connection.rollback(function(){
                                                                        return err;
                                                                      })
                                                                    }else{
                                                                      MainObj.status = "SUCCESS";
                                                                      console.log("RESPONSE="+JSON.stringify(MainObj));
                                                                      console.log("END----------timeinsert----------"+now);
                                                                      res.send(JSON.stringify(MainObj));
                                                                    }
                                                                  })
                                                                }else{
                                                                  insertsunday2(connection,res,req,Dldmid,valuedldm);
                                                                }


                                                              }

                                                            })
                                                          }else{
                                                            insertsaturday2(connection,res,req,Dldmid,valuedldm);
                                                          }


                                                        }

                                                      })
                                                    }else{
                                                      insertfriday2(connection,res,req,Dldmid,valuedldm);
                                                    }

                                                  }

                                                })
                                              }else{
                                                insertthursday2(connection,res,req,Dldmid,valuedldm);
                                              }

                                            }

                                          })
                                        }else{
                                          insertwednesday2(connection,res,req,Dldmid,valuedldm);
                                        }

                                      }

                                    })

                                  }else{
                                    inserttuesday2(connection,res,req,Dldmid,valuedldm);
                                  }

                                }

                              })


                            }else{
                              insertmonday2(connection,res,req,Dldmid,valuedldm);
                            }

                          }

                        })
                        connection.release();
                      }
                    })

                  }
                })



          }else{

            var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
            var Mydata = [];
            var csvStream = csv.parse().on("data", function(data){


                  if(data[0] == "DLDM"){

                    valuedldm = parseInt(data[1]);
                    valuedldm = valuedldm + 7;
                    data[1]=valuedldm.toString();
                    valuedldm = valuedldm - 7;
                    cvaluedldm=valuedldm;
                  }
                  Mydata.push(data);
                })
                .on("end", function(){
                     var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
                     csv.write(Mydata, {headers: true}).pipe(ws);

                     var sql1 = "INSERT INTO doctor_location_day_master (dldm_id, dldm_day_number, dldm_dlm_id) VALUES ((?),(?),(?))";
                     var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";

                     con.getConnection(function(err,connection){

                       if(err){
                         console.log("ERROR IN TIMEINSEERT IN CONNECTING TO DATABASE FOR DLDMID = "+DlmId);
                         console.log("ERROR : "+err);
                         MainObj.status = "CONNECTION ERROR";
                         console.log("RESPONSE="+JSON.stringify(MainObj));
                         console.log("END----------timeinsert----------"+now);
                         res.send(JSON.stringify(MainObj));
                         return err;
                       }else{

                         connection.beginTransaction(function(err){

                           if(err){
                             console.log("ERROR IN TIMEINSEERT IN RUNNING TRANSACTION FOR DLDMID = "+DlmId);
                             console.log("ERROR : "+err);
                             MainObj.status = "CONNECTION ERROR";
                             console.log("RESPONSE="+JSON.stringify(MainObj));
                             console.log("END----------timeinsert----------"+now);
                             res.send(JSON.stringify(MainObj));
                             return err;
                           }else{

                             Dldmid = "DLDM"+""+valuedldm.toString();

                             connection.query(sql1,[Dldmid,"MON",DlmId],function(err,result){

                               if(err){
                                 console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                 console.log("ERROR : "+err);
                                 MainObj.status = "CONNECTION ERROR";
                                 console.log("RESPONSE="+JSON.stringify(MainObj));
                                 console.log("END----------timeinsert----------"+now);
                                 res.send(JSON.stringify(MainObj));
                                 connection.rollback(function(){
                                   return err;
                                 })
                               }else{

                                 if(MON.length==0){

                                   valuedldm++;

                                   Dldmid = "DLDM"+""+valuedldm.toString();

                                   connection.query(sql1,[Dldmid,"TUE",DlmId],function(err,result){

                                     if(err){
                                       console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                       console.log("ERROR : "+err);
                                       MainObj.status = "CONNECTION ERROR";
                                       console.log("RESPONSE="+JSON.stringify(MainObj));
                                       console.log("END----------timeinsert----------"+now);
                                       res.send(JSON.stringify(MainObj));
                                       connection.rollback(function(){
                                         return err;
                                       })
                                     }else{

                                       if(TUE.length == 0){


                                         valuedldm++;

                                         Dldmid = "DLDM"+""+valuedldm.toString();

                                         connection.query(sql1,[Dldmid,"WED",DlmId],function(err,result){

                                           if(err){
                                             console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                             console.log("ERROR : "+err);
                                             MainObj.status = "CONNECTION ERROR";
                                             console.log("RESPONSE="+JSON.stringify(MainObj));
                                             console.log("END----------timeinsert----------"+now);
                                             res.send(JSON.stringify(MainObj));
                                             connection.rollback(function(){
                                               return err;
                                             })
                                           }else{

                                             if(WED.length==0){
                                               valuedldm++;

                                               Dldmid = "DLDM"+""+valuedldm.toString();

                                               connection.query(sql1,[Dldmid,"THU",DlmId],function(err,result){

                                                 if(err){
                                                   console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                   console.log("ERROR : "+err);
                                                   MainObj.status = "CONNECTION ERROR";
                                                   console.log("RESPONSE="+JSON.stringify(MainObj));
                                                   console.log("END----------timeinsert----------"+now);
                                                   res.send(JSON.stringify(MainObj));
                                                   connection.rollback(function(){
                                                     return err;
                                                   })
                                                 }else{

                                                   if(THU.length == 0){
                                                     valuedldm++;

                                                     Dldmid = "DLDM"+""+valuedldm.toString();

                                                     connection.query(sql1,[Dldmid,"FRI",DlmId],function(err,result){

                                                       if(err){
                                                         console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                         console.log("ERROR : "+err);
                                                         MainObj.status = "CONNECTION ERROR";
                                                         console.log("RESPONSE="+JSON.stringify(MainObj));
                                                         console.log("END----------timeinsert----------"+now);
                                                         res.send(JSON.stringify(MainObj));
                                                         connection.rollback(function(){
                                                           return err;
                                                         })
                                                       }else{

                                                         if(FRI.length==0){
                                                           valuedldm++;

                                                           Dldmid = "DLDM"+""+valuedldm.toString();

                                                           connection.query(sql1,[Dldmid,"SAT",DlmId],function(err,result){

                                                             if(err){
                                                               console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                               console.log("ERROR : "+err);
                                                               MainObj.status = "CONNECTION ERROR";
                                                               console.log("RESPONSE="+JSON.stringify(MainObj));
                                                               console.log("END----------timeinsert----------"+now);
                                                               res.send(JSON.stringify(MainObj));
                                                               connection.rollback(function(){
                                                                 return err;
                                                               })
                                                             }else{

                                                               if(SAT.length == 0){
                                                                 valuedldm++;

                                                                 Dldmid = "DLDM"+""+valuedldm.toString();

                                                                 connection.query(sql1,[Dldmid,"SUN",DlmId],function(err,result){

                                                                   if(err){
                                                                     console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                                     console.log("ERROR : "+err);
                                                                     MainObj.status = "CONNECTION ERROR";
                                                                     console.log("RESPONSE="+JSON.stringify(MainObj));
                                                                     console.log("END----------timeinsert----------"+now);
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
                                                                           MainObj.status = "CONNECTION ERROR";
                                                                           console.log("RESPONSE="+JSON.stringify(MainObj));
                                                                           console.log("END----------timeinsert----------"+now);
                                                                           res.send(JSON.stringify(MainObj));
                                                                           connection.rollback(function(){
                                                                             return err;
                                                                           })
                                                                         }else{
                                                                           MainObj.status = "SUCCESS";
                                                                           console.log("RESPONSE="+JSON.stringify(MainObj));
                                                                           console.log("END----------timeinsert----------"+now);
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


          }
        }
      })
      connection2.release();
    }
  })

  console.log(method+"methoooooooooososssssss hiaaiai ye");

  if(method == 0){




  }else{

  }




});

function insertmonday2(connection,res,req,Dldmid,valuedldm){

  var now = new Date();


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];

  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;
  var sent=0;


  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;


  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "SELECT dldm_id FROM doctor_location_day_master WHERE dldm_day_number = ? AND dldm_dlm_id = ?";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";

  for(var moni=0;moni<MON.length;moni++){

    var monid=Dldmid;
    var montime = MON[moni].time.split("_");

    connection.query(sql2,[monid,montime[0],montime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN MONDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+monid);
        console.log("ERROR : "+err);
        if(sent == 0){
          sent=1;
          MainObj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(MainObj));
          console.log("END----------timeinsert----------"+now);
          res.send(JSON.stringify(MainObj));
        }
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        moncount++;
        if(moncount == MON.length){


            connection.query(sql1,["TUE",DlmId],function(err,row2){

              if(err){
                console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                console.log("ERROR : "+err);
                MainObj.status = "CONNECTION ERROR";
                console.log("RESPONSE="+JSON.stringify(MainObj));
                console.log("END----------timeinsert----------"+now);
                res.send(JSON.stringify(MainObj));
                connection.rollback(function(){
                  return err;
                })
              }else{

                Dldmid = row2[0].dldm_id;

                if(TUE.length == 0){

                  connection.query(sql1,["WED",DlmId],function(err,row3){

                    if(err){
                      console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                      console.log("ERROR : "+err);
                      MainObj.status = "CONNECTION ERROR";
                      console.log("RESPONSE="+JSON.stringify(MainObj));
                      console.log("END----------timeinsert----------"+now);
                      res.send(JSON.stringify(MainObj));
                      connection.rollback(function(){
                        return err;
                      })
                    }else{

                      Dldmid = row3[0].dldm_id;

                      if(WED.length==0){

                        connection.query(sql1,["THU",DlmId],function(err,row4){

                          if(err){
                            console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                            console.log("ERROR : "+err);
                            MainObj.status = "CONNECTION ERROR";
                            console.log("RESPONSE="+JSON.stringify(MainObj));
                            console.log("END----------timeinsert----------"+now);
                            res.send(JSON.stringify(MainObj));
                            connection.rollback(function(){
                              return err;
                            })
                          }else{

                            Dldmid = row4[0].dldm_id;

                            if(THU.length == 0){

                              connection.query(sql1,["FRI",DlmId],function(err,row5){

                                if(err){
                                  console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                  console.log("ERROR : "+err);
                                  MainObj.status = "CONNECTION ERROR";
                                  console.log("RESPONSE="+JSON.stringify(MainObj));
                                  console.log("END----------timeinsert----------"+now);
                                  res.send(JSON.stringify(MainObj));
                                  connection.rollback(function(){
                                    return err;
                                  })
                                }else{

                                  Dldmid = row5[0].dldm_id;

                                  if(FRI.length==0){

                                    connection.query(sql1,["SAT",DlmId],function(err,row6){

                                      if(err){
                                        console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                        console.log("ERROR : "+err);
                                        MainObj.status = "CONNECTION ERROR";
                                        console.log("RESPONSE="+JSON.stringify(MainObj));
                                        console.log("END----------timeinsert----------"+now);
                                        res.send(JSON.stringify(MainObj));
                                        connection.rollback(function(){
                                          return err;
                                        })
                                      }else{

                                        Dldmid = row6[0].dldm_id;

                                        if(SAT.length == 0){


                                          connection.query(sql1,["SUN",DlmId],function(err,row7){

                                            if(err){
                                              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                              console.log("ERROR : "+err);
                                              MainObj.status = "CONNECTION ERROR";
                                              console.log("RESPONSE="+JSON.stringify(MainObj));
                                              console.log("END----------timeinsert----------"+now);
                                              res.send(JSON.stringify(MainObj));
                                              connection.rollback(function(){
                                                return err;
                                              })
                                            }else{

                                              Dldmid = row7[0].dldm_id;

                                              if(SUN.length==0){
                                                connection.commit(function(err){
                                                  if (err) {
                                                    console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                                    console.log("ERROR : "+err);
                                                    MainObj.status = "CONNECTION ERROR";
                                                    console.log("RESPONSE="+JSON.stringify(MainObj));
                                                    console.log("END----------timeinsert----------"+now);
                                                    res.send(JSON.stringify(MainObj));
                                                    connection.rollback(function(){
                                                      return err;
                                                    })
                                                  }else{
                                                    MainObj.status = "SUCCESS";
                                                    console.log("RESPONSE="+JSON.stringify(MainObj));
                                                    console.log("END----------timeinsert----------"+now);
                                                    res.send(JSON.stringify(MainObj));
                                                  }
                                                })
                                              }else{
                                                insertsunday2(connection,res,req,Dldmid,valuedldm);
                                              }


                                            }

                                          })
                                        }else{
                                          insertsaturday2(connection,res,req,Dldmid,valuedldm);
                                        }


                                      }

                                    })
                                  }else{
                                    insertfriday2(connection,res,req,Dldmid,valuedldm);
                                  }

                                }

                              })
                            }else{
                              insertthursday2(connection,res,req,Dldmid,valuedldm);
                            }

                          }

                        })
                      }else{
                        insertwednesday2(connection,res,req,Dldmid,valuedldm);
                      }

                    }

                  })

                }else{
                  inserttuesday2(connection,res,req,Dldmid,valuedldm);
                }

              }

            })



        }


        }



    })

  }

}

function inserttuesday2(connection,res,req,Dldmid,valuedldm){
  var now = new Date();



  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];

  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;
  var sent=0;


  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;



  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "SELECT dldm_id FROM doctor_location_day_master WHERE dldm_day_number = ? AND dldm_dlm_id = ?";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";


  for(var tuei=0;tuei<TUE.length;tuei++){

    var tueid=Dldmid;
    var tuetime = TUE[tuei].time.split("_");

    connection.query(sql2,[tueid,tuetime[0],tuetime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN TUESDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+tueid);
        console.log("ERROR : "+err);
        if(sent == 0){
          sent=1;
          console.log("RESPONSE="+JSON.stringify(MainObj));
          console.log("END----------timeinsert----------"+now);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        tuecount++;
        if(tuecount == TUE.length){

          connection.query(sql1,["WED",DlmId],function(err,row3){

            if(err){
              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              MainObj.status = "CONNECTION ERROR";
              console.log("RESPONSE="+JSON.stringify(MainObj));
              console.log("END----------timeinsert----------"+now);
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{

              Dldmid = row3[0].dldm_id;

              if(WED.length==0){

                connection.query(sql1,["THU",DlmId],function(err,row4){

                  if(err){
                    console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    MainObj.status = "CONNECTION ERROR";
                    console.log("RESPONSE="+JSON.stringify(MainObj));
                    console.log("END----------timeinsert----------"+now);
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{

                    Dldmid = row4[0].dldm_id;

                    if(THU.length == 0){

                      connection.query(sql1,["FRI",DlmId],function(err,row5){

                        if(err){
                          console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                          console.log("ERROR : "+err);
                          MainObj.status = "CONNECTION ERROR";
                          console.log("RESPONSE="+JSON.stringify(MainObj));
                          console.log("END----------timeinsert----------"+now);
                          res.send(JSON.stringify(MainObj));
                          connection.rollback(function(){
                            return err;
                          })
                        }else{

                          Dldmid = row5[0].dldm_id;

                          if(FRI.length==0){

                            connection.query(sql1,["SAT",DlmId],function(err,row6){

                              if(err){
                                console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                console.log("ERROR : "+err);
                                MainObj.status = "CONNECTION ERROR";
                                console.log("RESPONSE="+JSON.stringify(MainObj));
                                console.log("END----------timeinsert----------"+now);
                                res.send(JSON.stringify(MainObj));
                                connection.rollback(function(){
                                  return err;
                                })
                              }else{

                                Dldmid = row6[0].dldm_id;

                                if(SAT.length == 0){


                                  connection.query(sql1,["SUN",DlmId],function(err,row7){

                                    if(err){
                                      console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                      console.log("ERROR : "+err);
                                      MainObj.status = "CONNECTION ERROR";
                                      console.log("RESPONSE="+JSON.stringify(MainObj));
                                      console.log("END----------timeinsert----------"+now);
                                      res.send(JSON.stringify(MainObj));
                                      connection.rollback(function(){
                                        return err;
                                      })
                                    }else{

                                      Dldmid = row7[0].dldm_id;

                                      if(SUN.length==0){
                                        connection.commit(function(err){
                                          if (err) {
                                            console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                            console.log("ERROR : "+err);
                                            MainObj.status = "CONNECTION ERROR";
                                            console.log("RESPONSE="+JSON.stringify(MainObj));
                                            console.log("END----------timeinsert----------"+now);
                                            res.send(JSON.stringify(MainObj));
                                            connection.rollback(function(){
                                              return err;
                                            })
                                          }else{
                                            MainObj.status = "SUCCESS";
                                            console.log("RESPONSE="+JSON.stringify(MainObj));
                                            console.log("END----------timeinsert----------"+now);
                                            res.send(JSON.stringify(MainObj));
                                          }
                                        })
                                      }else{
                                        insertsunday2(connection,res,req,Dldmid,valuedldm);
                                      }


                                    }

                                  })
                                }else{
                                  insertsaturday2(connection,res,req,Dldmid,valuedldm);
                                }


                              }

                            })
                          }else{
                            insertfriday2(connection,res,req,Dldmid,valuedldm);
                          }

                        }

                      })
                    }else{
                      insertthursday2(connection,res,req,Dldmid,valuedldm);
                    }

                  }

                })

              }else{
                insertwednesday2(connection,res,req,Dldmid,valuedldm);
              }

            }

          })


        }

      }

    })

  }

}

function insertwednesday2(connection,res,req,Dldmid,valuedldm){
  var now = new Date();


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];

  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;
  var sent=0;

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;



  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "SELECT dldm_id FROM doctor_location_day_master WHERE dldm_day_number = ? AND dldm_dlm_id = ?";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";


  for(var wedi=0;wedi<WED.length;wedi++){

    var wedid=Dldmid;
    var wedtime = WED[wedi].time.split("_");

    connection.query(sql2,[wedid,wedtime[0],wedtime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN WEDNESDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+wedid);
        console.log("ERROR : "+err);
        if(sent == 0){
          sent=1;
          MainObj.status = "CONNECTION ERROR";
          console.log("RESPONSE="+JSON.stringify(MainObj));
          console.log("END----------timeinsert----------"+now);
          res.send(JSON.stringify(MainObj));
        }
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        wedcount++;
        if(wedcount == WED.length){
          connection.query(sql1,["THU",DlmId],function(err,row4){

            if(err){
              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              MainObj.status = "CONNECTION ERROR";
              console.log("RESPONSE="+JSON.stringify(MainObj));
              console.log("END----------timeinsert----------"+now);
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{

              Dldmid = row4[0].dldm_id;

              if(THU.length == 0){

                connection.query(sql1,["FRI",DlmId],function(err,row5){

                  if(err){
                    console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    MainObj.status = "CONNECTION ERROR";
                    console.log("RESPONSE="+JSON.stringify(MainObj));
                    console.log("END----------timeinsert----------"+now);
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{

                    Dldmid = row5[0].dldm_id;

                    if(FRI.length==0){

                      connection.query(sql1,["SAT",DlmId],function(err,row6){

                        if(err){
                          console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                          console.log("ERROR : "+err);
                          MainObj.status = "CONNECTION ERROR";
                          console.log("RESPONSE="+JSON.stringify(MainObj));
                          console.log("END----------timeinsert----------"+now);
                          res.send(JSON.stringify(MainObj));
                          connection.rollback(function(){
                            return err;
                          })
                        }else{

                          Dldmid = row6[0].dldm_id;

                          if(SAT.length == 0){

                            connection.query(sql1,["SUN",DlmId],function(err,row7){

                              if(err){
                                console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                console.log("ERROR : "+err);
                                MainObj.status = "CONNECTION ERROR";
                                console.log("RESPONSE="+JSON.stringify(MainObj));
                                console.log("END----------timeinsert----------"+now);
                                res.send(JSON.stringify(MainObj));
                                connection.rollback(function(){
                                  return err;
                                })
                              }else{

                                Dldmid = row7[0].dldm_id;

                                if(SUN.length==0){
                                  connection.commit(function(err){
                                    if (err) {
                                      console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                      console.log("ERROR : "+err);
                                      MainObj.status = "CONNECTION ERROR";
                                      console.log("RESPONSE="+JSON.stringify(MainObj));
                                      console.log("END----------timeinsert----------"+now);
                                      res.send(JSON.stringify(MainObj));
                                      connection.rollback(function(){
                                        return err;
                                      })
                                    }else{
                                      MainObj.status = "SUCCESS";
                                      console.log("RESPONSE="+JSON.stringify(MainObj));
                                      console.log("END----------timeinsert----------"+now);
                                      res.send(JSON.stringify(MainObj));
                                    }
                                  })
                                }else{
                                  insertsunday2(connection,res,req,Dldmid,valuedldm);
                                }


                              }

                            })
                          }else{
                            insertsaturday2(connection,res,req,Dldmid,valuedldm);
                          }


                        }

                      })
                    }else{
                      insertfriday2(connection,res,req,Dldmid,valuedldm);
                    }

                  }

                })
              }else{
                insertthursday2(connection,res,req,Dldmid,valuedldm);
              }

            }

          })

        }

      }

    })

  }

}

function insertthursday2(connection,res,req,Dldmid,valuedldm){
  var now = new Date();


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];

  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;
  var sent=0;

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;



  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "SELECT dldm_id FROM doctor_location_day_master WHERE dldm_day_number = ? AND dldm_dlm_id = ?";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";

  for(var thui=0;thui<THU.length;thui++){

    var thuid=Dldmid;
    var thutime = THU[thui].time.split("_");

    connection.query(sql2,[thuid,thutime[0],thutime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN THURSDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+thuid);
        console.log("ERROR : "+err);
        if(sent == 0){
          sent=1;
          console.log("RESPONSE="+JSON.stringify(MainObj));
          console.log("END----------timeinsert----------"+now);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        thucount++;
        if(thucount == THU.length){
          connection.query(sql1,["FRI",DlmId],function(err,row5){

            if(err){
              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              MainObj.status = "CONNECTION ERROR";
              console.log("RESPONSE="+JSON.stringify(MainObj));
              console.log("END----------timeinsert----------"+now);
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{

              Dldmid = row5[0].dldm_id;

              if(FRI.length==0){


                connection.query(sql1,["SAT",DlmId],function(err,row6){

                  if(err){
                    console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    MainObj.status = "CONNECTION ERROR";
                    console.log("RESPONSE="+JSON.stringify(MainObj));
                    console.log("END----------timeinsert----------"+now);
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{

                    Dldmid = row6[0].dldm_id;

                    if(SAT.length == 0){

                      connection.query(sql1,["SUN",DlmId],function(err,row7){

                        if(err){
                          console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                          console.log("ERROR : "+err);
                          MainObj.status = "CONNECTION ERROR";
                          console.log("RESPONSE="+JSON.stringify(MainObj));
                          console.log("END----------timeinsert----------"+now);
                          res.send(JSON.stringify(MainObj));
                          connection.rollback(function(){
                            return err;
                          })
                        }else{

                          Dldmid = row7[0].dldm_id;

                          if(SUN.length==0){
                            connection.commit(function(err){
                              if (err) {
                                console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                                console.log("ERROR : "+err);
                                MainObj.status = "CONNECTION ERROR";
                                console.log("RESPONSE="+JSON.stringify(MainObj));
                                console.log("END----------timeinsert----------"+now);
                                res.send(JSON.stringify(MainObj));
                                connection.rollback(function(){
                                  return err;
                                })
                              }else{
                                MainObj.status = "SUCCESS";
                                console.log("RESPONSE="+JSON.stringify(MainObj));
                                console.log("END----------timeinsert----------"+now);
                                res.send(JSON.stringify(MainObj));
                              }
                            })
                          }else{
                            insertsunday2(connection,res,req,Dldmid,valuedldm);
                          }


                        }

                      })
                    }else{
                      insertsaturday2(connection,res,req,Dldmid,valuedldm);
                    }


                  }

                })
              }else{
                insertfriday2(connection,res,req,Dldmid,valuedldm);
              }

            }

          })

        }

      }

    })

  }

}

function insertfriday2(connection,res,req,Dldmid,valuedldm){
  var now = new Date();



  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];
  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;
  var sent=0;

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;


  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "SELECT dldm_id FROM doctor_location_day_master WHERE dldm_day_number = ? AND dldm_dlm_id = ?";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";

  for(var frii=0;frii<FRI.length;frii++){

    var friid=Dldmid;
    var fritime = FRI[frii].time.split("_");

    connection.query(sql2,[friid,fritime[0],fritime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN FRIDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+friid);
        console.log("ERROR : "+err);
        if(sent == 0){
          sent=1;
          console.log("RESPONSE="+JSON.stringify(MainObj));
          console.log("END----------timeinsert----------"+now);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        fricount++;
        if(fricount == FRI.length){
          connection.query(sql1,["SAT",DlmId],function(err,row6){

            if(err){
              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              MainObj.status = "CONNECTION ERROR";
              console.log("RESPONSE="+JSON.stringify(MainObj));
              console.log("END----------timeinsert----------"+now);
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{

              Dldmid = row6[0].dldm_id;

              if(SAT.length == 0){

                connection.query(sql1,["SUN",DlmId],function(err,row7){

                  if(err){
                    console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    MainObj.status = "CONNECTION ERROR";
                    console.log("RESPONSE="+JSON.stringify(MainObj));
                    console.log("END----------timeinsert----------"+now);
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{

                    Dldmid = row7[0].dldm_id;

                    if(SUN.length==0){
                      connection.commit(function(err){
                        if (err) {
                          console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                          console.log("ERROR : "+err);
                          MainObj.status = "CONNECTION ERROR";
                          console.log("RESPONSE="+JSON.stringify(MainObj));
                          console.log("END----------timeinsert----------"+now);
                          res.send(JSON.stringify(MainObj));
                          connection.rollback(function(){
                            return err;
                          })
                        }else{
                          MainObj.status = "SUCCESS";
                          console.log("RESPONSE="+JSON.stringify(MainObj));
                          console.log("END----------timeinsert----------"+now);
                          res.send(JSON.stringify(MainObj));
                        }
                      })
                    }else{
                      insertsunday2(connection,res,req,Dldmid,valuedldm);
                    }


                  }

                })
              }else{
                insertsaturday2(connection,res,req,Dldmid,valuedldm);
              }


            }

          })

        }

      }

    })

  }

}

function insertsaturday2(connection,res,req,Dldmid,valuedldm){
  var now = new Date();


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];
  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;
  var sent=0;


  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;



  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "SELECT dldm_id FROM doctor_location_day_master WHERE dldm_day_number = ? AND dldm_dlm_id = ?";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";


  for(var sati=0;sati<SAT.length;sati++){

    var satid=Dldmid;
    var sattime = SAT[sati].time.split("_");

    connection.query(sql2,[satid,sattime[0],sattime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN SATURDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+satid);
        console.log("ERROR : "+err);
        if(sent == 0){
          sent=1;
          console.log("RESPONSE="+JSON.stringify(MainObj));
          console.log("END----------timeinsert----------"+now);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        satcount++;
        if(satcount == SAT.length){
          connection.query(sql1,["SUN",DlmId],function(err,row7){

            if(err){
              console.log("ERROR IN RUNNING SQL1 FOR DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              MainObj.status = "CONNECTION ERROR";
              console.log("RESPONSE="+JSON.stringify(MainObj));
              console.log("END----------timeinsert----------"+now);
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{

              Dldmid = row7[0].dldm_id;

              if(SUN.length==0){
                connection.commit(function(err){
                  if (err) {
                    console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
                    console.log("ERROR : "+err);
                    MainObj.status = "CONNECTION ERROR";
                    console.log("RESPONSE="+JSON.stringify(MainObj));
                    console.log("END----------timeinsert----------"+now);
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{
                    MainObj.status = "SUCCESS";
                    console.log("RESPONSE="+JSON.stringify(MainObj));
                    console.log("END----------timeinsert----------"+now);
                    res.send(JSON.stringify(MainObj));
                  }
                })
              }else{
                insertsunday2(connection,res,req,Dldmid,valuedldm);
              }


            }

          })

        }

      }

    })

  }
}

function insertsunday2(connection,res,req,Dldmid,valuedldm){
  var now = new Date();


  var Object = req.body;
  var MON = [];
  var TUE = [];
  var WED = [];
  var THU = [];
  var FRI = [];
  var SAT = [];
  var SUN = [];
  var moncount=0;
  var tuecount=0;
  var wedcount=0;
  var thucount=0;
  var fricount=0;
  var satcount=0;
  var suncount=0;
  var sent=0;

  var DlmId = Object.dlmid;

  MON = Object.monday;
  TUE = Object.tuesday;
  WED = Object.wednesday;
  THU = Object.thursday;
  FRI = Object.friday;
  SAT = Object.saturday;
  SUN = Object.sunday;



  var MainObj = {
    status:"SUCCESS"
  }

  var sql1 = "SELECT dldm_id FROM doctor_location_day_master WHERE dldm_day_number = ? AND dldm_dlm_id = ?";
  var sql2 = "INSERT INTO doctor_location_time_master (dltm_dldm_id, dltm_time_from, dltm_time_to, dltm_discount_offer_flag) VALUES ((?),(?),(?),(?))";


  for(var suni=0;suni<SUN.length;suni++){

    var sunid=Dldmid;
    var suntime = SUN[suni].time.split("_");

    connection.query(sql2,[sunid,suntime[0],suntime[1],"N"],function(err,result){

      if(err){
        console.log("ERROR IN RUNNING SQL2 IN SUNDAY FOR DLDMID = "+DlmId+" AND DLDMID ="+sunid);
        console.log("ERROR : "+err);
        if(sent == 0){
          sent=1;
          console.log("RESPONSE="+JSON.stringify(MainObj));
          console.log("END----------timeinsert----------"+now);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        suncount++;
        if(suncount == SUN.length){
          connection.commit(function(err){
            if (err) {
              console.log("ERROR IN COMMITING DLDMID = "+DlmId+" AND DLDMID ="+Dldmid);
              console.log("ERROR : "+err);
              MainObj.status = "CONNECTION ERROR";
              console.log("RESPONSE="+JSON.stringify(MainObj));
              console.log("END----------timeinsert----------"+now);
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{
              MainObj.status = "SUCCESS";
              console.log("RESPONSE="+JSON.stringify(MainObj));
              console.log("END----------timeinsert----------"+now);
              res.send(JSON.stringify(MainObj));
            }
          })

        }

      }

    })

  }

}

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
  var sent=0;



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

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_id, dldm_day_number, dldm_dlm_id) VALUES ((?),(?),(?))";
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
        if(sent == 0){
          sent=1;
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
        connection.rollback(function(){
          return err;
        })
        return;
      }else{

        moncount++;
        console.log("moncount = "+moncount);
        if(moncount == MON.length){

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
  var sent=0;



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

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_id, dldm_day_number, dldm_dlm_id) VALUES ((?),(?),(?))";
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
        if(sent == 0){
          sent=1;
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
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
  var sent=0;



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

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_id, dldm_day_number, dldm_dlm_id) VALUES ((?),(?),(?))";
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
        if(sent == 0){
          sent=1;
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
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
  var sent=0;



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

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_id, dldm_day_number, dldm_dlm_id) VALUES ((?),(?),(?))";
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
        if(sent == 0){
          sent=1;
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
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
  var sent=0;



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

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_id, dldm_day_number, dldm_dlm_id) VALUES ((?),(?),(?))";
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
        if(sent == 0){
          sent=1;
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
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
  var sent=0;



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

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_id, dldm_day_number, dldm_dlm_id) VALUES ((?),(?),(?))";
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
        if(sent == 0){
          sent=1;
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
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
  var sent=0;



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

  var sql1 = "INSERT INTO doctor_location_day_master (dldm_id, dldm_day_number, dldm_dlm_id) VALUES ((?),(?),(?))";
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
        if(sent == 0){
          sent=1;
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
        }
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
  var sent=0;
  var DocId = Object.docid;

  var MainObj = {
    status : "SUCCESS",
    info:[]
  }

  var INFO={
    dlmdmid:"",
    locid:"",
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

  var sql2 = 'SELECT DLDM.dldm_dlm_id, DLDM.dldm_day_number, DLTM.dltm_time_from, DLTM.dltm_time_to , DLTM.dltm_dldm_id, DLTM.dltm_id FROM doctor_location_day_master AS DLDM INNER JOIN doctor_location_time_master AS DLTM ON DLDM.dldm_id = DLTM.dltm_dldm_id WHERE DLDM.dldm_dlm_id = ?';

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
          console.log("ERROR IN TIMEINFORMATION IN RUNNING SQL1 FOR DOCMID = "+DocId);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{

          if(result.length==0){
            MainObj.status = "SUCCESS";
            res.send(JSON.stringify(MainObj));
            return;
          }else{

            for(var i=0;i<result.length;i++){
              console.log("value of i "+i);
              console.log("lenght of result "+result.length);
              console.log("valaue of dlmid "+result[i].dlm_id);
              connection.query(sql2,[result[i].dlm_id],function(err,resultt){
                if(err){
                  console.log("ERROR IN TIMEINFORMATION IN RUNNING SQL2 FOR DOCID = "+DocId+" AND DLMDID = "+result[i].dlm_id);
                  console.log("ERROR : "+err);
                  console.log("ERROR CODE : "+err.code);
                  if(sent == 0){
                    sent=1;
                    MainObj.status = "CONNECTION ERROR";
                    res.send(JSON.stringify(MainObj));
                  }
                  return err;
                }else{


                  // if(resultt.length == 0){
                    // MainObj.status = "SUCCESS";
                    // res.send(JSON.stringify(MainObj));
                    // return;
                  // }else{

                    var INFO={
                      dlmid:"",
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
                      INFO.dlmid = resultt[j].dldm_dlm_id;
                    }

                    MainObj.info.push(INFO);
                    console.log("value of count "+count);
                    count++;
                    if(count == result.length){
                      console.log("in if");
                      res.send(JSON.stringify(MainObj));
                    }
                  // }


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

app.post("/timeinformationls",function(req,res){

  var Object = req.body;

  var count=0;
  var DlmId = Object.dlmid;

  var MainObj = {
    status : "SUCCESS",
    dlmdmid:"",
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

  var sql1 = 'SELECT DLDM.dldm_day_number, DLTM.dltm_time_from, DLTM.dltm_time_to , DLTM.dltm_dldm_id, DLTM.dltm_id FROM doctor_location_day_master AS DLDM INNER JOIN doctor_location_time_master AS DLTM ON DLDM.dldm_id = DLTM.dltm_dldm_id WHERE DLDM.dldm_dlm_id = ?';

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN TIMEINFORMATIONLS IN CONNECTING TO DATABASE FOR DLMID = "+DlmId);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql1,[DlmId],function(err,result){

        if(err){
          console.log("ERROR IN TIMEINFORMATIONLS IN RUNNING SQL1 FOR DLMID = "+DlmId);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{

          if(result.length==0){
            MainObj.status = "SUCCESS";
            MainObj.dlmdmid = DlmId;
            res.send(JSON.stringify(MainObj));
            return;
          }else{


            for(var i=0;i<result.length;i++){

              console.log("value of i "+i);
              console.log("lenght of result "+result.length);

              var TIMEOBJ = {
                from:result[i].dltm_time_from,
                to:result[i].dltm_time_to,
                timeid:result[i].dltm_id
              }

              if(result[i].dldm_day_number == "MON"){
                MainObj.mondayid = result[i].dltm_dldm_id;
                MainObj.monday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "TUE"){
                MainObj.tuesdayid = result[i].dltm_dldm_id;
                MainObj.tuesday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "WED"){
                MainObj.wednesdayid = result[i].dltm_dldm_id;
                MainObj.wednesday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "THU"){
                MainObj.thursdayid = result[i].dltm_dldm_id;
                MainObj.thursday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "FRI"){
                MainObj.fridayid = result[i].dltm_dldm_id;
                MainObj.friday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "SAT"){
                MainObj.saturdayid = result[i].dltm_dldm_id;
                MainObj.saturday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "SUN"){
                MainObj.sundayid = result[i].dltm_dldm_id;
                MainObj.sunday.push(TIMEOBJ);
              }
              count++;
            }

            if(count==result.length){
              MainObj.status = "SUCCESS";
              MainObj.dlmdmid = DlmId;
              res.send(JSON.stringify(MainObj));
            }

          }

        }

        connection.release();

      })
    }
  })

})

app.post("/discountupdate",function(req,res){

  var Object = req.body;

  var TimeId =  Object.tid;
  console.log(TimeId);

  var obj = {
    status : "SUCCESS"
  }

  var sql = 'UPDATE doctor_location_time_master SET dltm_discount_offer_flag = ? WHERE dltm_id = ?';

  con.getConnection(function(err, connection) {


      if(err){
        console.log("ERROR IN DISCOUNTUPDATE IN BUILDING CONNECTION FOR TIMEID = "+TimeId);
        console.log("ERROR CODE :"+err.code);
        obj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(obj));
        return err;
      }else{

        connection.query(sql,["Y",TimeId], function(err, result) {

          if(err){
            console.log("ERROR IN DISCOUNTUPDATE IN RUNNING QUERY FOR TIMEID = "+TimeId);
            console.log("ERROR CODE "+err.code);
            obj.status = "CONNECTION ERROR";
            res.send(JSON.stringify(obj));
            return err;
          }else{

            if(result.affectedRows == 1){
              res.send(JSON.stringify(obj));
            }else{
              obj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(obj));
            }
          }

            connection.release();
        });

      }


  });

})

app.post("/timecheck",function(req,res){

  var obj = {
    status : "SUCCESS",
    available : ""
  }

})

app.post("/vitalservicesinfo",function(req,res){


  var obj = {
    status : "SUCCESS",
    info : []
  }


  var sql = 'SELECT sm_service_id, sm_service_name FROM service_master WHERE sm_service_type = ?';

  con.getConnection(function(err, connection) {

    if(err){
      console.log("ERROR IN vitalservicesinfo IN GETTING CONNECTION");
      console.log(err.code);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.query(sql,["VT"], function(err, result) {

        if(err){
          console.log("ERROR IN vitalservicesinfo IN RUNNING SQL");
          console.log(err.code);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(obj));
          return err;
        }else{

          if(result.length == 0){

            obj.status="SUCCESS";
            res.send(JSON.stringify(obj));

          }else{

            for(var i=0;i<result.length;i++){
              var INFO = {
                sid:result[i].sm_service_id,
                sname:result[i].sm_service_name
              }
              obj.info.push(INFO);
            }
            obj.status="SUCCESS";
            res.send(JSON.stringify(obj));
          }
        }

          connection.release();
      });

    }
  });



})

app.post("/serviceinfo",function(req,res){


  var obj = {
    status : "SUCCESS",
    info : []
  }


  var sql = 'SELECT sm_service_id, sm_service_name FROM service_master WHERE sm_service_type = ?';

  con.getConnection(function(err, connection) {

    if(err){
      console.log("ERROR IN SERVICEINFO IN GETTING CONNECTION");
      console.log(err.code);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.query(sql,["CL"], function(err, result) {

        if(err){
          console.log("ERROR IN SERVICEINFO IN RUNNING SQL");
          console.log(err.code);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(obj));
          return err;
        }else{

          if(result.length == 0){

            obj.status="SUCCESS";
            res.send(JSON.stringify(obj));

          }else{

            for(var i=0;i<result.length;i++){
              var INFO = {
                sid:result[i].sm_service_id,
                sname:result[i].sm_service_name
              }
              obj.info.push(INFO);
            }
            obj.status="SUCCESS";
            res.send(JSON.stringify(obj));
          }
        }

          connection.release();
      });

    }
  });

})

app.post("/serviceinsert",function(req,res){

  var Object = req.body;

  var DlmId = Object.dlmid;
  console.log(DlmId);
  var Values = [];
  Values = Object.values;

  var MainObj = {
    status : "SUCCESS"
  }
  var dscmid="";
  var count=0;
  var sent = 0;
  var valuesdcsid=0;


  var stream = fs.createReadStream(__dirname + '/../../janelaajsetup');
  var Mydata = [];
  var csvStream = csv.parse().on("data", function(data){

        var valuedscm=0;

        if(data[0] == "DSCM"){

          valuedscm = parseInt(data[1]);
          // dscmid = "DSCM"+""+data[1];
          valuesdcsid = valuedscm;
          valuedscm = valuedscm + Values.length;
          data[1]=valuedscm.toString();
        }

        Mydata.push(data);
      })
      .on("end", function(){
           var ws = fs.createWriteStream(__dirname + '/../../janelaajsetup');
           csv.write(Mydata, {headers: true}).pipe(ws);

           var sql1 = 'INSERT INTO doctor_clinic_services_master (dcsm_dlm_id, dcsm_sm_service_id, dcsm_id, dcsm_normal_amount, dcsm_discounted_amount, dcsm_discount_flag) VALUES ((?),(?),(?),(?),(?),(?))';

           con.getConnection(function(err,connection){

             if(err){
               console.log("ERROR IN CONNECTION TO DATABASE IN SERVICEINSERT DLMID = "+DlmId);
               console.log("ERROR:"+err);
               console.log("ERROR CODE:"+err.code);
               MainObj.status = "CONNECTION ERROR";
               res.send(JSON.stringify(MainObj));
               return err;
             }else{

               connection.beginTransaction(function(err){

                 if(err){
                   console.log("ERROR IN BEGINING TRANSACTION DATABASE IN SERVICEINSERT DLMID = "+DlmId);
                   console.log("ERROR:"+err);
                   console.log("ERROR CODE:"+err.code);
                   MainObj.status = "CONNECTION ERROR";
                   res.send(JSON.stringify(MainObj));
                   return err;
                 }else{

                   for(var i=0;i<Values.length;i++){

                     dscmid = "DSCM"+""+valuesdcsid;
                     valuesdcsid++;

                     connection.query(sql1,[DlmId,Values[i].sid,dscmid,Values[i].namt,Values[i].damt,Values[i].sflag],function(err,result){

                       if(err){
                         console.log("ERROR IN RUNNING SQL1 IN SERVICEINSERT DLMID = "+DlmId);
                         console.log("ERROR:"+err);
                         console.log("ERROR CODE:"+err.code);
                         connection.rollback(function(){
                           return err;
                         })
                         if(sent==0){
                           sent=1;
                           MainObj.status = "CONNECTION ERROR";
                           res.send(JSON.stringify(MainObj));
                         }
                       }else{

                         count++;
                         console.log(count);
                         if(count==Values.length){
                           console.log("in if"+Values.length);
                           connection.commit(function(err){
                             if(err){
                               console.log("ERROR IN COMMITING TO DATABASE IN SERVICEINSERT DLMID = "+DlmId);
                               console.log("ERROR:"+err);
                               console.log("ERROR CODE:"+err.code);
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

                 connection.release();

               })

             }

           })


         });
         stream.pipe(csvStream);


})

app.post("/serviceselected",function(req,res){

  var Object = req.body;
  var DlmId = Object.dlmid;
  console.log(DlmId);

  var MainObj = {
    status:"SUCCESS",
    serviceinfo : []
  }

  var count2=0;

  var sql = "SELECT SM.sm_service_id, SM.sm_service_name, DCSM.dcsm_id, DCSM.dcsm_normal_amount, DCSM.dcsm_discounted_amount, DCSM.dcsm_discount_flag, DCSM.dcsm_dlm_id FROM service_master AS SM INNER JOIN doctor_clinic_services_master AS DCSM ON SM.sm_service_id = DCSM.dcsm_sm_service_id WHERE DCSM.dcsm_dlm_id = ?";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN serviceselected IN CONNECTING DATABASE FOR DlmID = "+DlmId);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql,[DlmId],function(err,resultt){
        if(err){
          console.log("ERROR IN serviceselected IN RUNNING SQL2 FOR DlmID = "+DlmId);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{

          if(resultt.length == 0){
            MainObj.status = "SUCCESS";
            res.send(JSON.stringify(MainObj));
            return;
          }else{
            for(var j=0;j<resultt.length;j++){

              var o = {
                sname:resultt[j].sm_service_name,
                namount:resultt[j].dcsm_normal_amount,
                damount:resultt[j].dcsm_discounted_amount,
                flag:resultt[j].dcsm_discount_flag,
                dcsmid : resultt[j].dcsm_id,
                sid : resultt[j].sm_service_id
              }

              MainObj.serviceinfo.push(o);
              count2++;

            }

            if(count2 == resultt.length){
              MainObj.status = "SUCCESS";
              console.log(MainObj);
              res.send(JSON.stringify(MainObj));
            }

          }

        }
      });

      connection.release();

    }
  })

})

app.post("/updateservice",function(req,res){

  var Object = req.body;

  var DcsmId =  Object.dcsmid;
  var NormalAmount = parseInt(Object.namount);
  var DiscountAmount = parseInt(Object.damount);
  var DiscountFlag = Object.dflag;
  console.log(DcsmId);
  console.log(DiscountAmount);
  console.log(DiscountFlag);

  var obj = {
    status : "SUCCESS"
  }

  var sql = 'UPDATE doctor_clinic_services_master SET dcsm_normal_amount = ?, dcsm_discounted_amount = ?, dcsm_discount_flag = ? WHERE dcsm_id = ?';

  con.getConnection(function(err, connection) {


      if(err){
        console.log("ERROR IN updateservice IN BUILDING CONNECTION FOR DCSMID = "+DcsmId);
        console.log("ERROR CODE :"+err.code);
        obj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(obj));
        return err;
      }else{

        connection.query(sql,[NormalAmount,DiscountAmount,DiscountFlag,DcsmId], function(err, result) {

          if(err){
            console.log("ERROR IN updateservice IN RUNNING QUERY FOR DCSMID = "+DcsmId);
            console.log(err);
            console.log("ERROR CODE "+err.code);
            obj.status = "CONNECTION ERROR";
            res.send(JSON.stringify(obj));
            return err;
          }else{

            if(result.affectedRows == 1){
              res.send(JSON.stringify(obj));
            }else{
              obj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(obj));
            }
          }

            connection.release();
        });

      }


  });

})

app.post("/updatemanagediscount",function(req,res){

  var Object = req.body;
  var arr = [];
  arr = Object.values;
  console.log("has beeen hit in updatemaneagadiscoujnt");
  console.log(Object.values);
  var sent =0;
  var count =0;
  // var TimeId =  Object.tid;
  // var Flag = Object.flag;
  console.log(arr);

  var obj = {
    status : "SUCCESS"
  }

  var sql = 'UPDATE doctor_location_time_master SET dltm_discount_offer_flag = ? WHERE dltm_id = ?';

  con.getConnection(function(err, connection) {


      if(err){
        console.log("ERROR IN updatemanagediscount IN BUILDING CONNECTION ");
        console.log("ERROR CODE :"+err.code);
        obj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(obj));
        return err;
      }else{

        connection.beginTransaction(function(err){
          if(err){
            console.log("ERROR IN updatemanagediscount IN BUILDING CONNECTION");
            console.log("ERROR CODE :"+err.code);
            obj.status = "CONNECTION ERROR";
            res.send(JSON.stringify(obj));
            return err;
          }else{
            for(var i=0;i<arr.length;i++){

              connection.query(sql,[arr[i].flag,arr[i].timeid], function(err, result) {

                if(err){
                  console.log("ERROR IN updatemanagediscount IN RUNNING QUERY ");
                  console.log("ERROR CODE "+err.code);
                  if(sent == 0){
                    obj.status = "CONNECTION ERROR";
                    res.send(JSON.stringify(obj));
                  }
                  sent = 1;
                  connection.rollback(function(){
                    return err;
                  })

                }else{

                  if(result.affectedRows == 1){

                    count++;

                    if(count == arr.length && sent == 0){
                      connection.commit(function(err){
                        if(err){
                          console.log("ERROR IN updatemanagediscount IN COMMITING ");
                          console.log("ERROR CODE :"+err.code);
                          obj.status = "CONNECTION ERROR";
                          res.send(JSON.stringify(obj));
                          return err;
                        }else{
                          res.send(JSON.stringify(obj));
                        }
                      })
                    }

                  }else{
                    if(sent == 0){
                      obj.status = "CONNECTION ERROR";
                      res.send(JSON.stringify(obj));
                    }
                    sent =1;
                  }
                }

              });
            }
          }
        })

        connection.release();

      }


  });

})

app.post("/managediscount",function(req,res){

  var Object = req.body;

  var count=0;
  var sent=0;
  var DlmId = Object.dlmid;

  var MainObj = {
    status : "SUCCESS",
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


  var TIMEOBJ = {
    from:"",
    to:"",
    timeid:""
  }


  var sql2 = 'SELECT DLDM.dldm_dlm_id, DLDM.dldm_day_number, DLTM.dltm_time_from, DLTM.dltm_time_to , DLTM.dltm_dldm_id, DLTM.dltm_id, DLTM.dltm_discount_offer_flag FROM doctor_location_day_master AS DLDM INNER JOIN doctor_location_time_master AS DLTM ON DLDM.dldm_id = DLTM.dltm_dldm_id WHERE DLDM.dldm_dlm_id = ?';

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN managediscount IN CONNECTING TO DATABASE FOR DLMID = "+DlmId);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{

      connection.query(sql2,[DlmId],function(err,resultt){
        if(err){
          console.log("ERROR IN managediscount IN RUNNING SQL2 FOR DLMID = "+DlmId);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{

            // var INFO={
            //   dlmid:"",
            //   mondayid:"",
            //   monday:[],
            //   tuesdayid:"",
            //   tuesday:[],
            //   wednesdayid:"",
            //   wednesday:[],
            //   thursdayid:"",
            //   thursday:[],
            //   fridayid:"",
            //   friday:[],
            //   saturdayid:"",
            //   saturday:[],
            //   sundayid:"",
            //   sunday:[]
            // }

            if(resultt.length == 0){
              res.send(JSON.stringify(MainObj));
            }else{

              for(var j=0;j<resultt.length;j++){
                count++;
                console.log("value of j "+j);
                console.log("lenght of resultt "+resultt.length);
                console.log("valaue of dltmid "+resultt[j].dltm_id);

                var TIMEOBJ = {
                  from:resultt[j].dltm_time_from,
                  to:resultt[j].dltm_time_to,
                  discountflag : resultt[j].dltm_discount_offer_flag,
                  timeid:resultt[j].dltm_id
                }

                if(resultt[j].dldm_day_number == "MON"){
                  console.log("in monday id "+resultt[j].dltm_dldm_id);
                  MainObj.mondayid = resultt[j].dltm_dldm_id;
                  MainObj.monday.push(TIMEOBJ);
                }else if(resultt[j].dldm_day_number == "TUE"){
                  console.log("in tue id "+resultt[j].dltm_dldm_id);
                  MainObj.tuesdayid = resultt[j].dltm_dldm_id;
                  MainObj.tuesday.push(TIMEOBJ);
                }else if(resultt[j].dldm_day_number == "WED"){
                  console.log("in wed id "+resultt[j].dltm_dldm_id);
                  MainObj.wednesdayid = resultt[j].dltm_dldm_id;
                  MainObj.wednesday.push(TIMEOBJ);
                }else if(resultt[j].dldm_day_number == "THU"){
                  console.log("in thu id "+resultt[j].dltm_dldm_id);
                  MainObj.thursdayid = resultt[j].dltm_dldm_id;
                  MainObj.thursday.push(TIMEOBJ);
                }else if(resultt[j].dldm_day_number == "FRI"){
                  console.log("in fri id "+resultt[j].dltm_dldm_id);
                  MainObj.fridayid = resultt[j].dltm_dldm_id;
                  MainObj.friday.push(TIMEOBJ);
                }else if(resultt[j].dldm_day_number == "SAT"){
                  console.log("in sat id "+resultt[j].dltm_dldm_id);
                  MainObj.saturdayid = resultt[j].dltm_dldm_id;
                  MainObj.saturday.push(TIMEOBJ);
                }else if(resultt[j].dldm_day_number == "SUN"){
                  console.log("in sun id "+resultt[j].dltm_dldm_id);
                  MainObj.sundayid = resultt[j].dltm_dldm_id;
                  MainObj.sunday.push(TIMEOBJ);
                }
              }

              console.log("value of count "+count);
              console.log(resultt.length);
              if(count == (resultt.length)){
                console.log("in if");
                res.send(JSON.stringify(MainObj));
              }
            }



        }
      })

      connection.release();

    }
  })

})

app.post("/deleteservice",function(req,res){

  var Object = req.body;
  var DcsmId = Object.dcsmid

  console.log("Deletetime has been hit");
  console.log(DcsmId);

  var obj = {
    status : "SUCCESS"
  }


  var sql = 'DELETE FROM doctor_clinic_services_master WHERE dcsm_id = ?';

  con.getConnection(function(err, connection) {


      if(err){
        console.log("ERROR IN deleteservice IN BUILDING CONNECTION FOR DCSMID =" +DcsmId);
        console.log("ERROR CODE :"+err.code);
        obj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(obj));
        return err;
      }else{

        connection.query(sql,[DcsmId], function(err, result) {

          if(err){
            console.log("ERROR IN deleteservice IN RUNNING QUERY FOR DCSMID =" +DcsmId);
            console.log(err);
            console.log("ERROR CODE "+err.code);
            obj.status = "CONNECTION ERROR";
            res.send(JSON.stringify(obj));
            return err;
          }else{
            if(result.affectedRows == 1){
              obj.status = "SUCCESS";
              res.send(JSON.stringify(obj));
            }else{
              console.log("ERROR IN deleteservice IN RUNNING QUERY 0 ROWS AFFECTED FOR DCSMID =" +DcsmId);
              obj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(obj));

            }
          }


        });




        connection.release();
      }


  });

})

app.post("/oneviewinfo",function(req,res){

  var Object = req.body;

  var count=0;
  var count2=0;
  var DlmId = Object.dlmid;
  console.log(DlmId);

  var MainObj = {
    status : "SUCCESS",
    timeinfo:[],
    serviceinfo:[]
  }



  var sql1 = 'SELECT DLDM.dldm_dlm_id, DLDM.dldm_day_number, DLTM.dltm_time_from, DLTM.dltm_time_to, DLTM.dltm_discount_offer_flag FROM doctor_location_day_master AS DLDM INNER JOIN doctor_location_time_master AS DLTM ON DLDM.dldm_id = DLTM.dltm_dldm_id WHERE DLDM.dldm_dlm_id = ?';
  var sql2 = 'SELECT SM.sm_service_name, DCSM.dcsm_normal_amount, DCSM.dcsm_discounted_amount, DCSM.dcsm_discount_flag FROM service_master AS SM INNER JOIN doctor_clinic_services_master AS DCSM ON SM.sm_service_id = DCSM.dcsm_sm_service_id WHERE DCSM.dcsm_dlm_id = ?';

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN ONEVIEWINFO IN CONNECTING TO DATABASE FOR DLMID = "+DlmId);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql1,[DlmId],function(err,result){

        if(err){
          console.log("ERROR IN ONEVIEWINFO RUNNING SQL1 FOR DLMMID = "+DlmId);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{

          if(result.length==0){
            MainObj.status = "SUCCESS";
            console.log(MainObj);
            res.send(JSON.stringify(MainObj));
            return;
          }else{

            var INFO={
              monday:[],
              tuesday:[],
              wednesday:[],
              thursday:[],
              friday:[],
              saturday:[],
              sunday:[]
            }

            for(var i=0;i<result.length;i++){

              var TIMEOBJ = {
                from:result[i].dltm_time_from,
                to:result[i].dltm_time_to,
                flag:result[i].dltm_discount_offer_flag
              }

              if(result[i].dldm_day_number == "MON"){
                // INFO.mondayflag = result[i].dltm_discount_offer_flag;
                INFO.monday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "TUE"){
                // INFO.tuesdayflag = result[i].dltm_discount_offer_flag;
                INFO.tuesday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "WED"){
                // INFO.wednesdayflag = result[i].dltm_discount_offer_flag;
                INFO.wednesday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "THU"){
                // INFO.thursdayflag = result[i].dltm_discount_offer_flag;
                INFO.thursday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "FRI"){
                // INFO.fridayflag = result[i].dltm_discount_offer_flag;
                INFO.friday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "SAT"){
                // INFO.saturdayflag = result[i].dltm_discount_offer_flag;
                INFO.saturday.push(TIMEOBJ);
              }else if(result[i].dldm_day_number == "SUN"){
                // INFO.sundayflag = result[i].dltm_discount_offer_flag;
                INFO.sunday.push(TIMEOBJ);
              }

              count++;

            }

            if(count == result.length){

              MainObj.timeinfo.push(INFO);

              connection.query(sql2,[DlmId],function(err,resultt){
                if(err){
                  console.log("ERROR IN ONEVIEWINFO IN RUNNING SQL2 FOR DlmID = "+DlmId);
                  console.log("ERROR : "+err);
                  console.log("ERROR CODE : "+err.code);
                  MainObj.status = "CONNECTION ERROR";
                  res.send(JSON.stringify(MainObj));
                  return err;
                }else{

                  if(resultt.length == 0){
                    MainObj.status = "SUCCESS";
                    res.send(JSON.stringify(MainObj));
                    return;
                  }else{
                    for(var j=0;j<resultt.length;j++){

                      var o = {
                        sname:resultt[j].sm_service_name,
                        namount:resultt[j].dcsm_normal_amount,
                        damount:resultt[j].dcsm_discounted_amount,
                        flag:resultt[j].dcsm_discount_flag
                      }

                      MainObj.serviceinfo.push(o);
                      count2++;

                    }

                    if(count2 == resultt.length){
                      MainObj.status = "SUCCESS";
                      console.log(MainObj);
                      res.send(JSON.stringify(MainObj));
                    }

                  }

                }
              });

            }else{
              MainObj.status = "SUCCESS";
              res.send(JSON.stringify(MainObj));
              return;
            }



            }

          }



        connection.release();

      })


    }
  })

})

app.post("/alllocdis",function(req,res){

  var Object = req.body;

  var DocId = Object.docid;
  var Response = Object.resp;
  console.log(DocId);
  console.log(Response);

  var MainObj = {
    status :""
  }

  var sql0 = 'UPDATE doctor_master SET dm_overall_discount = ? WHERE dm_doctor_id = ?';
  var sql1 = "UPDATE doctor_location_master SET dlm_currentloc_discount_flag = ? WHERE dlm_dm_doctor_id = ?";
  var sql2 = "UPDATE doctor_location_time_master AS dltm INNER JOIN doctor_location_day_master AS dldm ON dltm.dltm_dldm_id = dldm.dldm_id INNER JOIN doctor_location_master AS dlm ON dldm.dldm_dlm_id = dlm.dlm_id SET dltm.dltm_discount_offer_flag = ? WHERE dlm.dlm_dm_doctor_id = ?";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN alllocdis IN OPENING DATABASE TO DATABASE FOR DOCID = "+DocId);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;

    }else{
      connection.beginTransaction(function(err){
        if(err){
          console.log("ERROR IN alllocdis IN BEGINING TRANSCTION TO DATABASE FOR DOCID = "+DocId);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{

                          connection.query(sql1,[Response,DocId],function(err,result1){
                            if(err){
                              console.log("ERROR IN alllocdis IN RUNNING SQL1 TO DATABASE FOR DOCID = "+DocId);
                              console.log("ERROR : "+err);
                              console.log("ERROR CODE : "+err.code);
                              MainObj.status = "CONNECTION ERROR";
                              res.send(JSON.stringify(MainObj));
                              connection.rollback(function(){
                                return err;
                              })
                            }else{
                              if(result1.affectedRows > 0){

                                connection.query(sql2,[Response,DocId],function(err,result2){
                                  if(err){
                                    console.log("ERROR IN alllocdis IN RUNNING SQL2 TO DATABASE FOR DOCID = "+DocId);
                                    console.log("ERROR : "+err);
                                    console.log("ERROR CODE : "+err.code);
                                    MainObj.status = "CONNECTION ERROR";
                                    res.send(JSON.stringify(MainObj));
                                    connection.rollback(function(){
                                      return err;
                                    })
                                  }else{
                                    if(result2.affectedRows > 0){

                                      connection.commit(function(err){
                                        if(err){
                                          console.log("ERROR IN alllocdis IN COMMITING TO DATABASE FOR DOCID = "+DocId);
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
                                      console.log("ERROR IN alllocdis IN RUNNING SQL2 0 ROWS RETURNED TO DATABASE FOR DOCID = "+DocId);
                                      MainObj.status = "CONNECTION ERROR";
                                      res.send(JSON.stringify(MainObj));
                                      connection.rollback(function(){
                                      })
                                    }
                                  }
                                })

                              }else{
                                console.log("ERROR IN alllocdis IN RUNNING SQL1 0 ROWS RETURNED TO DATABASE FOR DOCID = "+DocId);
                                MainObj.status = "CONNECTION ERROR";
                                res.send(JSON.stringify(MainObj));
                                connection.rollback(function(){
                                })
                              }
                            }
                          })
          //
          // connection.query(sql0,[Response,DocId],function(err,result){
          //   if(err){
          //     console.log("ERROR IN alllocdis IN RUNNING SQL0 TO DATABASE FOR DOCID = "+DocId);
          //     console.log("ERROR : "+err);
          //     console.log("ERROR CODE : "+err.code);
          //     MainObj.status = "CONNECTION ERROR";
          //     res.send(JSON.stringify(MainObj));
          //     connection.rollback(function(){
          //       return err;
          //     })
          //   }else{
          //     if (result.affectedRows > 0) {
          //
          //
          //     }else{
          //       console.log("ERROR IN alllocdis IN RUNNING SQL0 0 ROWS RETURNED TO DATABASE FOR DOCID = "+DocId);
          //       MainObj.status = "CONNECTION ERROR";
          //       res.send(JSON.stringify(MainObj));
          //       connection.rollback(function(){
          //       })
          //     }
          //   }
          // })
          connection.release();
        }
      })
    }
  })

})

app.post("/currentlocdis",function(req,res){

  var Object = req.body;

  var LocId = Object.locid;
  var Response = Object.resp;
  console.log(LocId);
  console.log(Response);

  var MainObj = {
    status : "SUCCESS"
  }

  // var sql = "UPDATE doctor_location_time_master AS dltm,doctor_location_master AS dlm INNER JOIN doctor_location_master ON dlm.dlm_id = dldm.dldm_dlm_id INNER JOIN doctor_location_day_master AS dldm ON dldm.dldm_id = dltm.dltm_dldm_id  SET dlm.dlm_currentloc_discount_flag = "Y",dltm.dltm_discount_offer_flag = "Y" WHERE dlm.dlm_lm_location_id = "LOC10172"";

  // var sql = "UPDATE doctor_location_time_master AS dltm INNER JOIN doctor_location_day_master AS dldm ON dldm.dldm_id = dltm.dltm_dldm_id INNER JOIN doctor_location_master AS  ON dlm.dlm_id = dldm.dldm_dlm_id   SET dlm.dlm_currentloc_discount_flag = "Y",dltm.dltm_discount_offer_flag = "Y" WHERE dlm.dlm_lm_location_id = "LOC10172"";

  var sql0 = "UPDATE doctor_location_master SET dlm_currentloc_discount_flag = ? WHERE dlm_lm_location_id = ?";
  var sql1 = "UPDATE doctor_location_time_master AS dltm INNER JOIN doctor_location_day_master AS dldm ON dldm.dldm_id = dltm.dltm_dldm_id INNER JOIN doctor_location_master AS dlm ON dlm.dlm_id = dldm.dldm_dlm_id SET dltm.dltm_discount_offer_flag = ? WHERE dlm.dlm_lm_location_id = ?";
  // var sql1 = "UPDATE doctor_location_time_master AS dltm INNER JOIN doctor_location_day_master AS dldm ON dltm.dltm_dldm_id = dldm.dldm_id INNER JOIN doctor_location_master AS dlm ON dldm.dldm_dlm_id = dlm.dlm_id SET dltm.dltm_discount_offer_flag = ? WHERE dlm.dlm_dm_doctor_id = ?"

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN currentlocdis IN OPENING DATABASE TO DATABASE FOR LocId = "+LocId);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{

      connection.beginTransaction(function(err){
        if(err){
          console.log("ERROR IN currentlocdis IN BEGINING TRANSACTION TO DATABASE FOR LocId = "+LocId);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{
          connection.query(sql0,[Response,LocId],function(err,row){
            if(err){
              console.log("ERROR IN currentlocdis IN RUNNING SQL0 TO DATABASE FOR LocId = "+LocId);
              console.log("ERROR : "+err);
              console.log("ERROR CODE : "+err.code);
              MainObj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{
              if(row.affectedRows > 0){

                connection.query(sql1,[Response,LocId],function(err,row1){
                  if(err){
                    console.log("ERROR IN currentlocdis IN RUNNING SQL1 TO DATABASE FOR LocId = "+LocId);
                    console.log("ERROR : "+err);
                    console.log("ERROR CODE : "+err.code);
                    MainObj.status = "CONNECTION ERROR";
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{
                    if(row1.affectedRows >0){
                      connection.commit(function(err){
                        if(err){
                          console.log("ERROR IN currentlocdis IN COMMITNG TO DATABASE FOR LocId = "+LocId);
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
                      console.log("ERROR IN currentlocdis IN SQL1 0 ROWS RETURNED TO DATABASE FOR LocId = "+LocId);
                      MainObj.status = "CONNECTION ERROR";
                      res.send(JSON.stringify(MainObj));
                      return err;
                    }
                  }
                })

              }else{
                console.log("ERROR IN currentlocdis IN SQL0 0 ROWS RETURNED TO DATABASE FOR LocId = "+LocId);
                MainObj.status = "CONNECTION ERROR";
                res.send(JSON.stringify(MainObj));
                return err;
              }
            }
          })
        }
      })


      connection.release();
    }
  })

})

app.post("/fpnumberpresent",function(req,res){

  var Object = req.body;

  var phnum = Object.number;

  var MainObj = {
    status: "",
    present : "",
    docid : ""
  }

  var sql = "SELECT pld_partner_id FROM partner_login_details_master WHERE pld_mobile = ?";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN fpnumberpresent IN OPENING DATABASE TO DATABASE FOR number = "+phnum);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql,[phnum],function(err,row){
        if(err){
          console.log("ERROR IN fpnumberpresent IN RUNNING SQL TO DATABASE FOR number = "+phnum);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{
          if(row.length > 0 ){
            MainObj.status = "SUCCESS";
            MainObj.present = "Y";
            MainObj.docid = row[0].pld_partner_id;
            res.send(JSON.stringify(MainObj));
          }else{
            MainObj.status = "SUCCESS";
            MainObj.present = "N";
            res.send(JSON.stringify(MainObj));
          }
        }
      })
      connection.release();
    }
  })

})

app.post("/passwordupdate",function(req,res){


  var Object = req.body;

  var docid = Object.docid;
  var pass = Object.pass;
  console.log(docid);
  console.log(pass);

  var MainObj = {
    status: "",
  }

  var sql = "UPDATE partner_login_details_master SET pld_password = ? WHERE pld_partner_id = ?";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN passwordupdate IN OPENING DATABASE TO DATABASE FOR docid = "+docid);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql,[pass,docid],function(err,row){
        if(err){
          console.log("ERROR IN passwordupdate IN RUNNING SQL TO DATABASE FOR docid = "+docid);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{
          if(row.affectedRows == 1 ){
            MainObj.status = "SUCCESS";
            res.send(JSON.stringify(MainObj));
          }else{
            console.log("ERROR IN passwordupdate IN RUNNING SQL 0 ROWS AFFECTED TO DATABASE FOR docid = "+docid);
            MainObj.status = "CONNECTION ERROR";
            res.send(JSON.stringify(MainObj));
            return err;
          }
        }
      })
      connection.release();
    }
  })

})

app.post("/getdetails",function(req,res){

  var Object = req.body;

  var docid = Object.docid;
  console.log(docid);

  var MainObj = {
    status: "",
    aadhar_number : "",
    voterid_number : "",
    passport_number : "",
    passport_flag : "",
    aadhar_flag : "",
    voterid_flag : "",
    mbbs_flag : "",
    md_flag : "",
    ms_flag : "",
    diploma_flag : ""
  }

  var sql = "SELECT dm_aadhar_number,dm_voter_id_number,dm_passport_number,dm_passport_flag,dm_aadhar_verify_flag,dm_voter_id_verify_flag,dm_doctor_mbbs_flag,dm_doctor_md_flag,dm_doctor_ms_flag,dm_doctor_diploma_flag FROM doctor_master WHERE dm_doctor_id = ?";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN getdetails IN OPENING DATABASE TO DATABASE FOR docid = "+docid);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql,[docid],function(err,row){
        if(err){
          console.log("ERROR IN getdetails IN RUNNING SQL TO DATABASE FOR docid = "+docid);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{
          if(row.length > 0 ){
            MainObj.status = "SUCCESS";
            MainObj.aadhar_number = row[0].dm_aadhar_number;
            MainObj.voterid_number = row[0].dm_voter_id_number;
            MainObj.passport_number = row[0].dm_passport_number;
            MainObj.passport_flag = row[0].dm_passport_flag;
            MainObj.aadhar_flag = row[0].dm_aadhar_verify_flag;
            MainObj.voterid_flag = row[0].dm_voter_id_verify_flag;
            MainObj.md_flag = row[0].dm_doctor_md_flag;
            MainObj.mbbs_flag = row[0].dm_doctor_mbbs_flag;
            MainObj.ms_flag = row[0].dm_doctor_ms_flag;
            MainObj.diploma_flag = row[0].dm_doctor_diploma_flag;
            console.log(MainObj);
            res.send(JSON.stringify(MainObj));
          }else{
            console.log("ERROR IN getdetails IN RUNNING SQL 0 ROWS RETURNED TO DATABASE FOR docid = "+docid);
            MainObj.status = "CONNECTION ERROR";
            res.send(JSON.stringify(MainObj));
            return err;
          }
        }
      })
      connection.release();
    }
  })


})

app.post("/updatediscount",function(req,res){


  var Object = req.body;

  var DocId = Object.docid;
  var LocId = Object.locid;
  var AllDisc = Object.alldisc;
  var SingleDisc = Object.singledisc;
  console.log(DocId);
  console.log(LocId);
  console.log(AllDisc);
  console.log(SingleDisc);

  var MainObj = {
    status : "SUCCESS"
  }

  var sql = 'UPDATE doctor_location_master SET dlm_currentloc_discount_flag = ? WHERE dlm_dm_doctor_id = ? AND dlm_lm_location_id = ?';
  var sql1 = 'UPDATE doctor_master SET dm_overall_discount = ? WHERE dm_doctor_id = ?';


  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN updatediscount IN CONNECTING TO DATABASE FOR DOCID = "+DocId);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{

      connection.beginTransaction(function(err){
        if(err){
          console.log("ERROR IN updatediscount IN BEGINING TRANSCTION TO DATABASE FOR DOCID = "+DocId);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          connection.rollback(function(err){
            return err;
          })
        }else{
          connection.query(sql,[SingleDisc,DocId,LocId],function(err,result){
            if(err){
              console.log("ERROR IN updatediscount IN RUNNING SQL TO DATABASE FOR DOCID = "+DocId);
              console.log("ERROR : "+err);
              console.log("ERROR CODE : "+err.code);
              MainObj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(MainObj));
              connection.rollback(function(){
                return err;
              })
            }else{
              if(result.affectedRows == 1){
                connection.query(sql1,[AllDisc,DocId],function(err,resultt){
                  if(err){
                    console.log("ERROR IN updatediscount IN RUNNING SQL1 TO DATABASE FOR DOCID = "+DocId);
                    console.log("ERROR : "+err);
                    console.log("ERROR CODE : "+err.code);
                    MainObj.status = "CONNECTION ERROR";
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{
                    if(resultt.affectedRows == 1){
                      connection.commit(function(err){
                        if(err){
                          console.log("ERROR IN updatediscount IN COMMITING TO DATABASE FOR DOCID = "+DocId);
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
                      console.log("ERROR IN updatediscount IN RUNNING SQL1 TO DATABASE FOR DOCID = "+DocId);
                      connection.rollback(function(){
                      })
                      MainObj.status = "CONNECTION ERROR";
                      res.send(JSON.stringify(MainObj));
                    }
                  }
                })
              }else{
                console.log("ERROR IN updatediscount IN RUNNING SQL TO DATABASE FOR DOCID = "+DocId);
                connection.rollback(function(){
                })
                MainObj.status = "CONNECTION ERROR";
                res.send(JSON.stringify(MainObj));
              }
            }
          })
        }
      })


      connection.release();
    }
  })

})

app.post("/vitalprofilingcomple",function(req,res){

  var Object = req.body;
  var DocId = Object.docid;

  var MainObj = {
    status : "SUCCESS"
  }

  var sql = 'UPDATE doctor_master SET dm_profiling_complete = ? WHERE dm_doctor_id = ?';

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN vitalprofilingcomple IN CONNECTING TO DATABASE FOR DOCID = "+DocId);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql,["Y",DocId],function(err,row){
        if(err){
          console.log("ERROR IN vitalprofilingcomple IN RUNNING SQL FOR DOCID = "+DocId);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{
          if(row.affectedRows == 1){
            MainObj.status = "SUCCESS";
            res.send(JSON.stringify(MainObj));
          }else{
            console.log("ERROR IN vitalprofilingcomple IN RUNNNING SQL 0 ROWS RETURDN TO DATABASE FOR DOCID = "+DocId);
            MainObj.status = "CONNECTION ERROR";
            res.send(JSON.stringify(MainObj));
          }
        }
      })
      connection.release();
    }
  })

})

app.post("/updateproffesion",function(req,res){


  var Object = req.body;

  var DocId = Object.docid;
  var Image = Object.image;
  var Mbbs = Object.MBBS;
  var Md = Object.MD;
  var Ms = Object.MS;
  var Diploma = Object.Diploma;
  var Verification = parseInt(Object.verification_no);
  console.log(Object.verification_no);
  console.log(parseInt(Object.verification_no));
  var AdhaarFlag = "N";
  var VoterIdFlag = "N";
  var PassportFlag = "N";
  var AdhaarNumber = "";
  var VoterIdNumber = "";
  var PassportNumber = "";

  var sql0 = "";

  if(Verification == 1){
    sql0 = "SELECT COUNT(dm_doctor_id) AS cnt FROM doctor_master WHERE dm_aadhar_number = ?";
    AdhaarFlag = "Y";
    AdhaarNumber = Object.number;
  }else if(Verification == 2){
    sql0 = "SELECT COUNT(dm_doctor_id) AS cnt FROM doctor_master WHERE dm_voter_id_number = ?";
    VoterIdFlag = "Y";
    VoterIdNumber = Object.number;
  }else{
    sql0 = "SELECT COUNT(dm_doctor_id) AS cnt FROM doctor_master WHERE dm_passport_number = ?";
    PassportFlag = "Y";
    PassportNumber = Object.number;
  }

  console.log(DocId);
  console.log(Verification);
  console.log(Object.number);
  var MainObj = {
    status : "SUCCESS"
  }

  var sql = 'UPDATE doctor_master SET dm_doctor_mbbs_flag = ?, dm_doctor_md_flag = ?, dm_doctor_ms_flag = ?, dm_doctor_diploma_flag = ?, dm_aadhar_verify_flag = ?, dm_voter_id_verify_flag = ?, dm_passport_flag = ?, dm_aadhar_number = ?, dm_voter_id_number = ?, dm_passport_number = ? WHERE dm_doctor_id = ?';
  var sql1 = 'UPDATE doctor_master SET dm_profiling_complete = ? WHERE dm_doctor_id = ?';

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN updateproffesion IN CONNECTING TO DATABASE FOR DOCID = "+DocId);
      console.log("ERROR : "+err);
      console.log("ERROR CODE : "+err.code);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{

      connection.beginTransaction(function(err){
        if(err){
          console.log("ERROR IN updateproffesion IN BEGINING TRANSACTION TO DATABASE FOR DOCID = "+DocId);
          console.log("ERROR : "+err);
          console.log("ERROR CODE : "+err.code);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{
          connection.query(sql0,[Object.number],function(err,row0){
            if(err){

            }else{

              if(row0[0].cnt == 0){
                connection.query(sql,[Mbbs,Md,Ms,Diploma,AdhaarFlag,VoterIdFlag,PassportFlag,AdhaarNumber,VoterIdNumber,PassportNumber,DocId],function(err,result){
                  if(err){
                    console.log("ERROR IN updateproffesion IN RUNNING SQL TO DATABASE FOR DOCID = "+DocId);
                    console.log("ERROR : "+err);
                    console.log("ERROR CODE : "+err.code);
                    MainObj.status = "CONNECTION ERROR";
                    res.send(JSON.stringify(MainObj));
                    connection.rollback(function(){
                      return err;
                    })
                  }else{
                    if(result.affectedRows == 1){

                      connection.query(sql1,['Y',DocId],function(err,result){
                        if(err){
                          console.log("ERROR IN updateproffesion IN RUNNING SQL1 TO DATABASE FOR DOCID = "+DocId);
                          console.log("ERROR : "+err);
                          console.log("ERROR CODE : "+err.code);
                          MainObj.status = "CONNECTION ERROR";
                          res.send(JSON.stringify(MainObj));
                          connection.rollback(function(){
                            return err;
                          })
                        }else{
                          if(result.affectedRows == 1){
                            connection.commit(function(err){
                              if(err){
                                console.log("ERROR IN updateproffesion IN COMMITING SQL1 TO DATABASE FOR DOCID = "+DocId);
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
                            console.log("ERROR IN updateproffesion IN RUNING SQL TO DATABASE FOR DOCID = "+DocId);
                            MainObj.status = "CONNECTION ERROR";
                            res.send(JSON.stringify(MainObj));
                            connection.rollback(function(){
                            })
                          }
                        }
                      })

                    }else{
                      console.log("ERROR IN updateproffesion IN RUNING SQL TO DATABASE FOR DOCID = "+DocId);
                      MainObj.status = "CONNECTION ERROR";
                      res.send(JSON.stringify(MainObj));
                      connection.rollback(function(){
                        return err;
                      })
                    }
                  }
                })

              }else{
                console.log("NUMBER ALREADY EXIST IN DATABSE DATABASE FOR DOCID = "+DocId);
                MainObj.status = "CONNECTION ERROR";
                res.send(JSON.stringify(MainObj));
              }


            }
          })

        }
      })


      connection.release();
    }
  })


})

app.post("/fettimings2",function(req,res){

  var Object = req.body;
  var DocId = Object.docid;
  var count=0;
  var count2=0;

  console.log(DocId);

  var MainObj = {
    status : "",
    alltimings : []
    }
  var used = [];


    var sql2 = 'SELECT DLDM.dldm_dlm_id, DLDM.dldm_day_number, DLTM.dltm_time_from, DLTM.dltm_time_to , DLTM.dltm_dldm_id, DLTM.dltm_id FROM doctor_location_day_master AS DLDM INNER JOIN doctor_location_time_master AS DLTM ON DLDM.dldm_id = DLTM.dltm_dldm_id WHERE DLDM.dldm_dlm_id = ?';
    var sql1 = 'SELECT DLDM.dldm_day_number, DLTM.dltm_dldm_id, DLTM.dltm_id, DLTM.dltm_time_from, DLTM.dltm_time_to FROM doctor_location_day_master AS DLDM INNER JOIN doctor_location_time_master AS DLTM ON DLDM.dldm_id = DLTM.dltm_dldm_id WHERE (DLTM.dltm_time_from = ? AND DLTM.dltm_time_to = ?) AND DLDM.dldm_dlm_id = ?';

    con.getConnection(function(err,connection){
      if(err){
        console.log("1"+err);
      }else{
        connection.query(sql2,[DocId],function(err,result){
          if(err){
            console.log("2"+err);
          }else{

            if(result.length > 0){

              console.log("intial value result "+result.length);

              for(var i=0;i<result.length;i++){

                console.log("in loop "+count);
                var from = result[i].dltm_time_from;
                var to = result[i].dltm_time_to;
                console.log(from);
                console.log(to);
                console.log(DocId);


                var flag = 0;

                for(var j=0;j<used.length;j++){
                  if(from == used[j].from && to == used[j].to){
                    count++;
                    flag = 1;
                    break;
                  }else{
                    flag = 0;
                  }
                }

                var usedobj = {
                  from :"",
                  to : ""
                }
                usedobj.from = from;
                usedobj.to = to;
                used.push(usedobj);

                if(flag == 0){
                  connection.query(sql1,[from,to,DocId],function(err,resultt){
                    if(err){

                    }else{
                      count++;
                      var time = {
                        from : "",
                        to : "",
                        monid : 0,
                        mon : "N",
                        tueid : 0,
                        tue : "N",
                        wedid : 0,
                        wed : "N",
                        thuid : 0,
                        thu : "N",
                        friid : 0,
                        fri : "N",
                        satid : 0,
                        sat : "N",
                        sunid : 0,
                        sun : "N"
                      }

                      if(resultt.length > 0){

                        console.log("initaial value resultt "+resultt.length);

                        time.from = resultt[0].dltm_time_from;
                        time.to = resultt[0].dltm_time_to;
                        // time.id = resultt[0].dltm_id;

                        for(var k=0;k<resultt.length;k++){

                          if(resultt[k].dldm_day_number == "MON"){
                            time.mon = "Y";
                            time.monid = resultt[k].dltm_id;
                          }else if(resultt[k].dldm_day_number == "TUE"){
                            time.tue = "Y";
                            time.tueid = resultt[k].dltm_id;
                          }else if(resultt[k].dldm_day_number == "WED"){
                            time.wed = "Y";
                            time.wedid = resultt[k].dltm_id;
                          }else if(resultt[k].dldm_day_number == "THU"){
                            time.thu = "Y";
                            time.thuid = resultt[k].dltm_id;
                          }else if(resultt[k].dldm_day_number == "FRI"){
                            time.fri = "Y";
                            time.friid = resultt[k].dltm_id;
                          }else if(resultt[k].dldm_day_number == "SAT"){
                            time.sat = "Y";
                            time.satid = resultt[k].dltm_id;
                          }else if (resultt[k].dldm_day_number == "SUN") {
                            time.sun = "Y";
                            time.sunid = resultt[k].dltm_id;
                          }

                        }

                        MainObj.alltimings.push(time);

                        if(count == result.length){
                          console.log(MainObj);
                          MainObj.status = "SUCCESS";
                          res.send(JSON.stringify(MainObj));
                        }

                      }else{
                        MainObj.status = "SUCCESS";
                        res.send(JSON.stringify(MainObj));
                      }
                    }
                  })
                }

              }


              console.log("final value count "+count);
              // if(count == result.length){
                // MainObj.status = "SUCCESS";
                // res.send(JSON.stringify(MainObj));
              // }

            }else{
              MainObj.status = "SUCCESS";
              res.send(JSON.stringify(MainObj));
            }

          }
        })
        connection.release();
      }
    })

})

app.post("/chooselocation",function(req,res){


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
      console.log("ERROR IN BUILDING CONNECTION IN chooselocation FOR DocId = "+DocId);
      console.log("ERROR CODE :"+err.code);
      console.log("ERROR : "+err);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{
      connection.query(sql,[DocId],function(err,result){
        if(err){
          console.log("ERROR IN RUNNING SQL IN chooselocation FOR DocId = "+DocId);
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

app.post("/iftimeexist",function(req,res){

  var Object = req.body;

  var locid = Object.locid;

  console.log(locid);

  var MainObj = {
    status : "SUCCESS",
    time_exist : ""
  }

  var sent=0;
  var count =0;

  var sql0 = "SELECT dlm_id FROM doctor_location_master WHERE dlm_lm_location_id = ?";
  var sql = "SELECT dldm_id FROM doctor_location_day_master WHERE dldm_dlm_id = ?";
  var sql2 = "SELECT dltm_time_from FROM doctor_location_time_master WHERE dltm_dldm_id = ?";

  con.getConnection(function(err,connection){
    if(err){
      console.log("ERROR IN BUILDING CONNECTION IN iftimeexist FOR locid = "+locid);
      console.log("ERROR CODE :"+err.code);
      console.log("ERROR : "+err);
      MainObj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(MainObj));
      return err;
    }else{

      connection.query(sql0,[locid],function(err,row0){
        if(err){
          console.log("ERROR IN RUNNING SQL0 IN iftimeexist FOR locid = "+locid);
          console.log("ERROR CODE :"+err.code);
          console.log("ERROR : "+err);
          MainObj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(MainObj));
          return err;
        }else{
          console.log(row0[0].dlm_id);

          connection.query(sql,[row0[0].dlm_id],function(err,row){
            if(err){
              console.log("ERROR IN RUNNING SQL IN iftimeexist FOR locid = "+locid);
              console.log("ERROR CODE :"+err.code);
              console.log("ERROR : "+err);
              MainObj.status = "CONNECTION ERROR";
              res.send(JSON.stringify(MainObj));
              return err;
            }else{
              console.log("row of this lenght is   "+row.length);
              if(row.length >0){

                for(var i =0;i<row.length;i++){

                  connection.query(sql2,[row[i].dldm_id],function(err,row2){
                    count++;
                    if(err){
                      console.log("ERROR IN RUNNING SQL1 IN iftimeexist FOR locid = "+locid);
                      console.log("ERROR CODE :"+err.code);
                      console.log("ERROR : "+err);
                      if(sent ==0){
                        MainObj.status = "CONNECTION ERROR";
                        res.send(JSON.stringify(MainObj));
                      }
                      sent = 1;
                      return err;
                    }else{
                      if(row2.length > 0){
                        if(sent ==0){
                          MainObj.status = "SUCCESS";
                          MainObj.time_exist = "Y";
                          res.send(JSON.stringify(MainObj));
                        }
                        sent =1;
                      }else{
                        console.log(count);
                        console.log(row.length);
                        if(count == (row.length) && sent ==0){
                          MainObj.status = "SUCCESS";
                          MainObj.time_exist = "N";
                          res.send(JSON.stringify(MainObj));
                        }
                      }
                    }
                  })

                }

              }else{
                MainObj.status = "SUCCESS";
                MainObj.time_exist = "N";
                res.send(JSON.stringify(MainObj));
              }
            }
          })

        }
      })


      connection.release();
    }
  })

})

function VitalInsertFinalValue(req,res,id){



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
    var ADDRESSLINE1 = Object.address1;
    var ADDRESSLINE2 = Object.address2;
    var CITY = Object.city;
    var STATE = Object.state;
    var PINCODE = Object.pincode;
    var DISTRICT = Object.district;
    var ADDHAARNUMBER = Object.adnumber;
    var IMAGE = Object.image.toString();

    var REGISTERDATE="";
    console.log(ID);
    console.log(PLD_ROLE);
    console.log(NAME);
    console.log(DOB);
    console.log(GENDER);
    console.log(EMAIL);
    console.log(PASSWORD);
    console.log(MOBILE);
    console.log(ADDRESSLINE1);
    console.log(CITY);
    console.log(STATE);
    console.log(PINCODE);
    console.log(ADDHAARNUMBER);
    console.log("has been hit in insertfinvalue");


    var sql0 = "SELECT STR_TO_DATE((?), '%d %m %Y') AS datee";
    var sql = "INSERT INTO doctor_master (dm_doctor_id, dm_doctor_name, dm_dob, dm_gender, dm_doctor_contact_mobile, dm_doctor_email, dm_address_line1, dm_address_line2, dm_city, dm_district, dm_state, dm_pincode, dm_reg_date,dm_role,dm_aadhar_number,dm_doctor_photo) VALUES((?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),SYSDATE(),(?),(?),(?))";
    var sql1 = "INSERT INTO partner_login_details_master (pld_role, pld_username, pld_password, pld_partner_id, pld_mobile) VALUES ((?),(?),(?),(?),(?))";


    con.getConnection(function(err, connection) {

      if(err){
        console.log("ERROR IN VitalInsertFinalValue IN OPENING DATABASE IN INSERFINVALUE FUNCTION FOR ID ="+id);
        console.log(err);
        obj.status = "CONNECTION ERROR";
        res.send(JSON.stringify(obj));
        return err;
      }else{

        connection.beginTransaction(function(err){

          if(err){
            console.log("ERROR IN VitalInsertFinalValue IN OPENING DATABASE IN BEGINING TRANSACTION FUNCTION FOR ID ="+id);
            console.log(err);
            obj.status = "CONNECTION ERROR";
            res.send(JSON.stringify(obj));
            return err;
          }else{


            connection.query(sql0,[DOB],function(err,row0){
              if(err){
                console.log("ERROR IN VitalInsertFinalValue IN RUNNING SQL0 FUNCTION FOR ID ="+id);
                console.log(err);
                obj.status = "CONNECTION ERROR";
                res.send(JSON.stringify(obj));
                connection.rollback(function(){
                  return err;
                })
              }else{

                connection.query(sql,[ID,NAME,row0[0].datee,GENDER,MOBILE,EMAIL,ADDRESSLINE1,ADDRESSLINE2,CITY,DISTRICT,STATE,PINCODE,PLD_ROLE,ADDHAARNUMBER,IMAGE], function(err, result) {

                    if(err){
                      console.log("ERROR IN VitalInsertFinalValue IN RUNNING SQL FUNCTION FOR ID ="+id);
                      console.log(err);
                      obj.status = err.code;
                      res.send(JSON.stringify(obj));
                      connection.rollback(function(){
                        return err;
                      })
                    }else{

                      if(result.affectedRows == 1){

                        connection.query(sql1,[PLD_ROLE,EMAIL,PASSWORD,ID,MOBILE],function(err1,result1){


                          if(err1){
                            console.log("ERROR IN VitalInsertFinalValue IN RUNNING SQL1 FUNCTION FOR ID ="+id);
                            console.log(err);
                            obj.status = err.code;
                            res.send(JSON.stringify(obj));
                            connection.rollback(function(){
                              return err;
                            })
                          }else{

                            if(result1.affectedRows == 1){

                              connection.commit(function(err){
                                if(err){
                                  console.log("ERROR IN VitalInsertFinalValue IN COMMITING FUNCTION FOR ID ="+id);
                                  console.log(err);
                                  obj.status = "CONNECTION ERROR";
                                  res.send(JSON.stringify(obj));
                                  connection.rollback(function(){
                                    return err;
                                  })
                                }else{
                                  obj.status = "SUCCESS";
                                  obj.id = ID;
                                  res.send(JSON.stringify(obj));
                                }
                              })
                            }else{
                              console.log("ERROR IN VitalInsertFinalValue IN RUNNING SQL1 0 ROWS AFFECTED UNCTION FOR ID ="+id);
                              console.log(err);
                              obj.status = "CONNECTION ERROR";
                              res.send(JSON.stringify(obj));
                              connection.rollback(function(){
                              })
                            }

                          }

                        });


                      }else{
                        console.log("ERROR IN VitalInsertFinalValue IN RUNNING SQL 0 ROWS AFFECTED UNCTION FOR ID ="+id);
                        console.log(err);
                        obj.status = "CONNECTION ERROR";
                        res.send(JSON.stringify(obj));
                        connection.rollback(function(){
                        })
                      }
                    }

                  });

              }
            })



          }

          connection.release();


        });

      }
    });

}

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
  var IMAGE = Object.image.toString();
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
  console.log("has been hit in insertfinvalue");


  var sql0 = "SELECT STR_TO_DATE((?), '%d %m %Y') AS datee";
  var sql = "INSERT INTO doctor_master (dm_doctor_id, dm_doctor_name, dm_dob, dm_gender, dm_doctor_contact_mobile, dm_doctor_speciality_id, dm_doctor_email, dm_medical_registration_number, dm_registration_council, dm_registration_year, dm_doctor_experience, dm_reg_date,dm_role,dm_doctor_photo) VALUES((?),(?),(?),(?),(?),(?),(?),(?),(?),(?),(?),SYSDATE(),(?),(?))";
  var sql1 = "INSERT INTO partner_login_details_master (pld_role, pld_username, pld_password, pld_partner_id, pld_mobile) VALUES ((?),(?),(?),(?),(?))";


  con.getConnection(function(err, connection) {

    if(err){
      console.log("ERROR IN OPENING DATABASE IN INSERFINVALUE FUNCTION FOR ID ="+id);
      console.log(err);
      obj.status = "CONNECTION ERROR";
      res.send(JSON.stringify(obj));
      return err;
    }else{

      connection.beginTransaction(function(err){

        if(err){
          console.log("ERROR IN OPENING DATABASE IN BEGINING TRANSACTION FUNCTION FOR ID ="+id);
          console.log(err);
          obj.status = "CONNECTION ERROR";
          res.send(JSON.stringify(obj));
          return err;
        }else{


          connection.query(sql0,[DOB],function(err,row0){
            if(err){
              console.log(err);
              console.log("in 0");
              obj.status = err.code;
              res.send(JSON.stringify(obj));
              connection.rollback(function(){
                return err;
              })
            }else{

              connection.query(sql,[ID,NAME,row0[0].datee,GENDER,MOBILE,SPECIALITY_ID,EMAIL,REGISTRATION_NUMBER,REGISTRATION_COUNCIL,REGISTRATION_YEAR,EXPERIENCE,PLD_ROLE,IMAGE], function(err, result) {

                  if(err){
                    console.log(err);
                    console.log("in 2");
                    obj.status = err.code;
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
          })



        }

        connection.release();


      });

    }
  });


}

app.listen(port,function(err1){
  for(var i=0;i<1;i++){
    var now = new Date();
  console.log(date.format(now, 'YYYY/MM/DD HH:mm:ss'));
  }
  console.log("Listening on the port 3000");
});
