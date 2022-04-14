var config = require('../cong');
var jsonexport = require('jsonexport');
const { NotMatchedErrorLog } = require('../models');
var moment = require('moment-timezone');

const create = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    NotMatchedErrorLog.create((body), function (err, errorlogs) {
        if (err) {
            console.log(err);
            return res.status(500).send(+err);
        }
        return res.send({ message: 'Successfully created new errorlogs.', data: errorlogs }, 201);
    });
}
const filterErroLogs = function (req, res, next) {
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
    NotMatchedErrorLog.find({
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
            var filterresponse = response.filter(x=>x.conversationid != null);
            for (var i = 0; i < filterresponse.length; i++) {
                var createddate = new Date(filterresponse[i].createdAt);
                var createdstringdate = moment.utc(createddate).tz('America/New_York').format('MM/DD/YYYY hh:mm a');
                // var date= moment(d).format('MM/DD/YYYY hh:mm a');
                filterresponse[i].createdAt = createdstringdate;
                var updateddate = new Date(filterresponse[i].updatedAt);
                var updatedstringdate = moment.utc(updateddate).tz('America/New_York').format('MM/DD/YYYY hh:mm a');
                // var updatedAtdate= moment(d).format('MM/DD/YYYY hh:mm a');
                filterresponse[i].updatedAt = updatedstringdate;
            }
            var jsonobjstring = JSON.stringify(filterresponse);
            var jsonobj = JSON.parse(jsonobjstring);

            var jsonContain = [{ ReportingData: jsonobj }];
            jsonexport(jsonContain, {
                headers: config.errorHeaders,
                rename: config.errorHeaderNames
             },function(err, csv){
                if(err !== null){
                    return console.log(err);
                }
                else{
                    console.log("Success created ");                    
                    res.setHeader('Content-disposition', 'attachment; filename=ErrorReporting.csv');
                    res.set('Content-Type', 'text/csv');
                    res.status(200).end(csv);
                }
            });
        }
        else{
            return res.status(404).send('Not Found');
        }
    }).collation({ locale: "en" }).sort({ error_message: 'asc' }).lean();
}
module.exports.create = create;
module.exports.filterErroLogs = filterErroLogs;