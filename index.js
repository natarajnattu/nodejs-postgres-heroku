const cool = require('cool-ascii-faces');
const express = require('express');
const app = express();
const pg = require('pg');
const dburl = process.env.DATABASE_URL
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
    response.render('pages/index');
});
app.get('/chat', function (request, response) {
    response.render('pages/chat');
});

app.get('/cool', function (request, response) {
    response.send(cool());
});

app.get('/times', function (request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i = 0; i < times; i++)
        result += i + ' ';
    response.send(result)
});

app.get('/db', function (request, response) {
    pg.connect(dburl, function (err, client, done) {
        client.query('SELECT * FROM test_table', function (err, result) {
            done();
            if (err) {
                console.error(err);
                response.send("Error " + err);
            } else {
                response.render('pages/db', {
                    results: result.rows
                })
            }
        });
    });
});

app.get('/db_individual', function (request, response) {
    var param = request.query;
    pg.connect(process.env.DATABASE_URL, function (err, client, done) {
        client.query('SELECT * FROM test_table where id=' + param.id, function (err, result) {
            done();
            if (err) {
                console.error(err);
                response.send("Error " + err);
            } else {
                response.send(result.rows)
            }
        });
    });
});

app.get('/postM', function (request, response) {
    var param = request.query;
    var uq_i_d = param.chat_id;
    var us_name = param.name;
    var us_message = param.message;
    pg.connect(process.env.DATABASE_URL, function (err, client, done) {
        var insert_query = "insert into messageuni(chat_id, status, message) values('" + uq_i_d + "','" + us_name + "','" + us_message + "')";
        client.query(insert_query, function (err, result) {
            done();
            if (err) {
                console.error(err);
                response.send("Error " + err);
            } else {
                var resp = {
                    status: "1"
                }
                response.send(resp)
            }
        });
    });
});

app.get('/getM', function (request, response) {
    var param = request.query;
    var datetime = param.last_datetime;
    var chat_id = param.id_ch;
    pg.connect(process.env.DATABASE_URL,
        function (err, client, done) {
            console.log(datetime)
            if (datetime) {
                console.log(datetime)
                var sql_query = "select * FROM messageuni where updated_time > '" + datetime + "' and chat_id='" + chat_id + "'";
                console.log(sql_query)

                client.query(sql_query, function (err, result) {
                    done();
                    if (err) {
                        console.error(err);
                        response.send("Error " + err);
                    } else {
                        response.send(result.rows)
                    }
                });
            } else {
                client.query('SELECT  * FROM (SELECT * FROM messageuni ORDER BY updated_time DESC LIMIT 5) AS aa ORDER BY updated_time ASC', function (err, result) {
                    done();
                    if (err) {
                        console.error(err);
                        response.send("Error " + err);
                    } else {
                        response.send(result.rows)
                    }
                });
            }
        });
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
