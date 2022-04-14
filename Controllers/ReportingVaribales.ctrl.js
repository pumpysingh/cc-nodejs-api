var config = require('../cong');
var fs = require('fs');
var jsonexport = require('jsonexport');
const { ReportingVariables, NotMatchedErrorLog } = require('../models');
// var moment = require('moment');
var moment = require('moment-timezone');

const create = function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body && !body.conversationid) {
        return res.status(500).send('Please provide conversation id');
    } else {

        ReportingVariables.create((body), function(err, msgs) {
            if (err) {
                console.log(err);
                return res.status(500).send('Server Server');
            }
            return res.send({ message: 'Successfully added new message in database.', msgs: msgs }, 201);
        });
    }
}

const update = function (req, res, next) {
    console.log("in update");
    console.log(req.body.conversationid);
    if (!req.body && !req.body.conversationid) {
        return res.status(500).send('Please provide conversation id');
    } else {
        ReportingVariables.findOne({ conversationid: req.body.conversationid }, function (err, reportingvariables) {
            if (err) {
                console.log(err);
                res.send(500);
            } else {
                if (reportingvariables != null) {
                    if (req.body.variables) {
                        if (req.body.variables.length > 0) {
                            console.log("variables ",req.body.variables);
                            for (var i = 0; i < req.body.variables.length; i++) {
                                reportingvariables.repromptvariables[req.body.variables[i].key] = req.body.variables[i].value;
                                var indexOfHeader = config.errorReportHeaders.indexOf(req.body.variables[i].key);
                                if(indexOfHeader > -1)
                                {
                                    var reportReq ={
                                        conversationid: req.body.conversationid,
                                        intent_name: config.errorReportHeaderNames[indexOfHeader],
                                        error_message: 'Matched'
                                    }
                                    NotMatchedErrorLog.create((reportReq), function (err, errorlogs) {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }
                            }
                            reportingvariables.save();
                        }
                    }
                    console.log("success updated reporting key");
                    res.status(200).send(reportingvariables);
                } else {
                    console.log("reporting  ",reportingvariables);
                    res.status(404).send('Conversation ID not Found');
                }

            }
        });
    }
}

const get = function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const conversationid = req.params.conversationid;
    if (!conversationid) {
        return res.status(500).send('Please provide conversation id.');
    } else {
        ReportingVariables.find({ conversationid: conversationid }, function(err, msg) {
            if (err) {
                console.log(err);
                return res.status(401).send('Not Found');
            }

            if (msg != null)
                return res.send({ MessageData: msg }, 200);
            else
                return res.status(404).send('Not Found');
        }).sort({datetime:1});

    }
}

const filter = function (req, res, next) {
    moment.tz.setDefault("America/New_York");
    res.setHeader('Content-Type', 'application/json');
    var reqdata = req.body;
    console.log("req data ", reqdata);
    var startdate = reqdata.from;
    var enddate = reqdata.to;
    var start = moment.tz(startdate, 'YYYY-MM-DD', 'America/New_York').startOf('day');
    start = start.utc().format();
    var end = moment.tz(enddate, 'YYYY-MM-DD', 'America/New_York').endOf('day');
    end = end.utc().format();
    console.log("start date "+start+" End date "+end);
    ReportingVariables.find({
        createdAt: {
            $gte: start,
            $lt: end
        }
    }, function (err, response) {
        if (err) {
            console.log(err);
            return res.status(401).send('Not Found');
        }

        if (response != null){
            var filterresponse = response.filter(x=>x.repromptvariables);
            for (var i = 0; i < filterresponse.length; i++) {
                var createddate = new Date(filterresponse[i].createdAt);
                var createdstringdate = moment.utc(createddate).tz('America/New_York').format('MM/DD/YYYY hh:mm a');
                // var date= moment(d).format('MM/DD/YYYY hh:mm a');
                filterresponse[i].createdAt = createdstringdate;
                console.log("Date val ",filterresponse[i].createdAt);
                var updateddate = new Date(filterresponse[i].updatedAt);
                var updatedstringdate = moment.utc(updateddate).tz('America/New_York').format('MM/DD/YYYY hh:mm a');
                // var updatedAtdate= moment(d).format('MM/DD/YYYY hh:mm a');
                filterresponse[i].updatedAt = updatedstringdate;
                console.log("Date val ",filterresponse[i].updatedAt);
            }
            var jsonobjstring = JSON.stringify(filterresponse);
            var jsonobj = JSON.parse(jsonobjstring);

            var jsonContain = [{ ReportingData: jsonobj }];
            jsonexport(jsonContain, {
                headers: config.headers,
                rename: config.HeaderNames
             },function(err, csv){
                if(err !== null){
                    return console.log(err);
                }
                else{
                    console.log("Success created ",csv);
                    // fs.writeFile('testRenameHeaderLargeData45.csv', csv, function(err) {
                    //     if(err !== null){
                    //         return console.log(err);
                    //     }
                    //     console.log("Successfully created");
                    // });
                    
                    res.setHeader('Content-disposition', 'attachment; filename=reportingdata.csv');
                    res.set('Content-Type', 'text/csv');
                    res.status(200).end(csv);
                }
            });
        }
        else{
            return res.status(404).send('Not Found');
        }
    }).sort({ createdAt: 'asc' }).lean();
}


module.exports.create = create;
module.exports.get = get;
module.exports.filter = filter;
module.exports.update = update;