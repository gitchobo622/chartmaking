const express = require('express');
const mysql = require('mysql');
const path = require('path');
const static = require('serve-static');
const dbconfig = require('./config/dbconfig.json');
const bodyParser = require('body-parser');

const pool = mysql.createPool({
    connectionLimit: 10,
    host:dbconfig.host,
    user:dbconfig.user,
    password:dbconfig.password,
    database:dbconfig.database,
    debug:false,
    timezone: '09:00' //서울시간 (표준시보다 +9시간)
})
    
    const app = express();
    app.use(bodyParser.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    
    app.use('/public', static(path.join(__dirname,'public')))
    app.get('/', (req, res)=>{ 
        res.sendFile(__dirname+'/public/main.html')
    })
    app.get('/main2', (req, res)=>{ 
        res.sendFile(__dirname+'/public/selectchart.html');
    })

    app.get('/main3', (req, res)=>{ 
        res.sendFile(__dirname+'/public/employee_chart.html');
    })
   //-----------------------------------------------------------


    app.post('/employee', (req, res) => {
        console.log('chartdatafromdb 호출됨');
        
        pool.getConnection((err, conn) => {
            const event = req.body.salary1;
            const resData = {
                result: 'error',
                emp_no: [],
                salary: []
            };
    
            if (err) {
                conn.release();
                console.log('MySQL 커넥션 에러 발생');
                res.json(resData);
                return;
            }
    
            const exec = conn.query('SELECT `emp_no`, `salary` FROM `new`.`employees` where `salary` >= ? ORDER BY `salary` ASC', [event], (err, rows) => {
                if (err) {
                    console.log('MySQL 쿼리 에러');
                    res.status(500).json({ result: 'error' });
                    res.json(resData);
                    return;
                }
    
                if (rows[0]) {
                    resData.result = 'ok';
                    rows.forEach((value) => {
                        resData.emp_no.push(value.emp_no);
                        resData.salary.push(value.salary);
                    });
                }
    
                res.json(resData);
                conn.release(); // 커넥션 해제는 응답을 보낸 후에 처리해야 합니다.
            });
        });
    });




    //-----------------------------------------------------------


    app.post('/chartdatafromdb', (req, res) => {
        console.log('chartdatafromdb 호출됨');
        
        pool.getConnection((err, conn) => {
            const resData = {
                result: 'error',
                temp: [],
                reg_date: []
            };
    
            if (err) {
                conn.release();
                console.log('MySQL 커넥션 에러 발생');
                res.json(resData);
                return;
            }
    
            const exec = conn.query('SELECT `temperature`, `reg_date` FROM `building_temperature` ORDER BY `reg_date` ASC', (err, rows) => {
                if (err) {
                    console.log('MySQL 쿼리 에러');
                    res.status(500).json({ result: 'error' });
                    res.json(resData);
                    return;
                }
    
                if (rows[0]) {
                    resData.result = 'ok';
                    rows.forEach((value) => {
                        resData.temp.push(value.temperature);
                        resData.reg_date.push(value.reg_date);
                    });
                }
    
                res.json(resData);
                conn.release(); // 커넥션 해제는 응답을 보낸 후에 처리해야 합니다.
            });
        });
    });



       //-----------------------------------------------------------


    app.post('/chartdatafromdbwithid', (req, res) => {
        console.log('chartdatafromdb 호출됨');
        const event = req.body.bid;
        console.log('bid is', event);

        pool.getConnection((err, conn) => {
            const resData = {
                result: 'error',
                temp: [],
                reg_date: []
            };
            if (err) {
                conn.release();
                console.log('MySQL 커넥션 에러 발생');
                res.json(resData);
                return;
            }
             const exec = conn.query('SELECT `temperature`, `reg_date` FROM `building_temperature` WHERE `building_id` = ? ORDER BY `reg_date` ASC;' , [event],            
            (err, rows) => {
                if (err) {
                    console.log('MySQL 쿼리 에러');
                    res.status(500).json({ result: 'error' });
                    res.json(resData);
                    return;
                }

                if (rows[0]) {
                    resData.result = 'ok';
                    rows.forEach((value) => {
                        resData.temp.push(value.temperature);
                        resData.reg_date.push(value.reg_date);
                    });
                }
    
                res.json(resData);
                conn.release(); // 커넥션 해제는 응답을 보낸 후에 처리해야 합니다.
            });
        });
    });


    app.listen(3040, ()=>{
        console.log('3040번 듣고있습니다.');
    });
    
