const jwt = require('jsonwebtoken');
const CONFIG = require('../cong');
const fs = require('fs')
const directlineapi = require('../Services/DIRECTLINE.JS')
const config = require('../cong.js')
const { Conversation, Loan, MessageData, ThrottleUser } = require('../models');
var moment = require('moment-timezone');
var CryptoJS = require("crypto-js");

module.exports = {
    startConversation: (req, res, next) => {
        var start = moment().tz("America/New_York").startOf('day');
        start = start.utc().format();
        var end = moment().tz("America/New_York").endOf('day');
        end = end.utc().format();
        console.log("Current datetime ", start + " -- end " + end);
        ThrottleUser.findOne({ createdAt: { $gte: start, $lt: end } }, function (err, throttleUser) {
            if (err) {
                console.log(err);
                res.send(500);
            } else {
                if (throttleUser) {
                    console.log("Conversation ", throttleUser);
                    var count = throttleUser.counter;
                    // if (count <= config.maximumuserperday) {
                    var client = new directlineapi();
                    throttleUser.counter = count + 1;
                    throttleUser.save();
                    console.log(config.directlinesecert);
                    console.log("-----------------------Hello-----------------------");
                    client.createConversation(config.directlinesecert).then(function (result) {
                        console.log("-----------------------Hello-----------------------");
                        console.log("result");
                        console.log(result);
                        console.log("build conversation object");
                        var websiteURL = '';
                        var userIP = '';
                        if(req.body){
                            websiteURL = req.body.websiteURL || "";
                            userIP = req.body.userIP || "";
                        }
                        var conversationobj = { "conversationid": result.conversationId, "websiteURL": websiteURL, "userIP": userIP, "botbuilderobject": JSON.stringify(result), "channel": "directline" };
                        console.log("-----------------------Hello-----------------------");
                        console.log(conversationobj);
                        Conversation.create((conversationobj), function (err, conversation) {
                            console.log("callback called");
                            if (err) {
                                console.log(err);
                                return res.status(500).send('Server Server');
                            }
                            if(conversation){
                                var payload = {
                                    userip: userIP
                                }
                                var token = jwt.sign(payload, CONFIG.token_secret, {
                                    expiresIn: 86400 // expires in 24 hours
                                });
                                // Encrypt
                                var ciphertext = CryptoJS.AES.encrypt(CONFIG.cognitiveToken, result.conversationId).toString();
                                // Decrypt
                                // var bytes = CryptoJS.AES.decrypt(ciphertext, result.conversationId);
                                // var originalText = bytes.toString(CryptoJS.enc.Utf8);

                                // console.log(originalText); // 'my message'
                                return res.send({ message: 'Successfully created new conversation.', conversation: conversation, token: token, speechToken: ciphertext }, 201);
                            }
                            else{
                                return res.send({ message: 'Something went wrong'}, 500);
                            }
                        });
                    }, function (errr) {
                        console.log(errr);
                        res.send(500);

                    });
                }
                else {
                    console.log("Not Found");
                    var reqobj = { "counter": 1, createdAt: moment().tz("America/New_York").utc().format(), updatedAt: moment().tz("America/New_York").utc().format()};
                    ThrottleUser.create((reqobj), function (err, throttleUser) {
                        if (err) {
                            console.log(err);
                            res.send(500);
                        } else {
                            if (throttleUser) {
                                console.log("Conversation ", throttleUser);
                                var client = new directlineapi();
                                console.log(config.directlinesecert);
                                console.log("-----------------------Hello-----------------------");
                                client.createConversation(config.directlinesecert).then(function (result) {
                                    console.log("-----------------------Hello-----------------------");
                                    console.log("result");
                                    console.log(result);
                                    console.log("build conversation object");
                                    var websiteURL = '';
                                    var userIP = '';
                                    if (req.body) {
                                        websiteURL = req.body.websiteURL || "";
                                        userIP = req.body.userIP || "";
                                    }
                                    // var conversationobj={"conversationid":result.conversationId,"phone":"9714376669","botbuilderobject":Json.stringify(result)};
                                    var conversationobj = { "conversationid": result.conversationId, "websiteURL": websiteURL, "userIP": userIP, "botbuilderobject": JSON.stringify(result) };
                                    console.log("-----------------------Hello-----------------------");
                                    console.log(conversationobj);
                                    Conversation.create((conversationobj), function (err, conversation) {
                                        console.log("callback called");
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send('Server Server');
                                        }
                                        if(conversation){
                                            var payload = {
                                                userip: userIP
                                            }
                                            var token = jwt.sign(payload, CONFIG.token_secret, {
                                                expiresIn: 86400 // expires in 24 hours
                                            });
                                            // Encrypt
                                            var ciphertext = CryptoJS.AES.encrypt(CONFIG.cognitiveToken, result.conversationId).toString();
                                            return res.send({ message: 'Successfully created new conversation.', conversation: conversation, token: token, speechToken: ciphertext }, 201);
                                        }
                                        else{
                                            return res.send({ message: 'Something went wrong'}, 500);
                                        }
                                    });
                                }, function (errr) {
                                    console.log(errr);
                                    res.send(500);
                                })
                            }
                            else {
                                console.log("Not Found");
                                res.send(500);
                            }
                        }
                    });
                }
            }
        });
    },
    streamURL: (req, res, next) => {
        console.log(req);
        var client = new directlineapi();
        client.WebSocketURL(config.directlinesecert, req.body.conversationID, req.body.watermark_value).then(function (result) {
            console.log(result);
            res.send(result);
        }, function(errr) {
            // console.log(errr);
            res.send(500);

        })
    },

    update: (req, res, next) => {
        console.log("in update");
        console.log(req.body.conversationid);
        Conversation.findOne({ conversationid: req.body.conversationid }, function(err, conversation) {
            if (err) {
                console.log(err);
                res.send(500);
            } else {
                if (conversation != null) {
                    conversation.phone = req.body.ssn;
                    conversation.conversationobject = JSON.stringify(req.body.conversationobject);
                    conversation.save();
                    res.status(200).send(conversation);
                } else {
                    res.status(404)
                }

            }
        });
    },
    conversationloan: (req, res, next) => {
        const conversationid = req.params.conversationid;
        Conversation.findOne({ conversationid: conversationid }, function(err, conversation) {
            conversationloan = {};
            if (err) {
                console.log(err);
                res.send(500);
            } else {
                if (conversation != null) {
                    const ssn = conversation.ssn;
                    Loan.find({ phone: ssn }, function(err, loan) {
                        if (err) {
                            console.log(err);
                            res.status(200).send([]);
                        } else {
                            delete conversation.data;

                            conversationloan.data = conversation;
                            conversationloan.Loans = loan;
                            delete conversationloan.data.data;
                            conversationloan.data.data = "";
                            res.status(200).send({ "conversationloan": conversationloan });
                        }

                    });
                } else {
                    res.status(404)
                }

            }
        });
    },
    tokenrefresh: (req, res, next) => {
        const token = req.params.token;

        var client = new directlineapi();
        client.refreshtoken(token).then(function(result) {
            console.log(result);
            res.status(200).send(result);

        }, function(errr) {
            console.log(errr);
            res.send(500);

        })
    },
    updatestatus: (req, res, next) => {
        console.log("in update");
        console.log(req.params.conversationid);
        var conv_status = req.query.status ? req.query.status : "archive";
        Conversation.findOne({ conversationid: req.params.conversationid }, function(err, conversation) {
            if (err) {
                console.log(err);
                res.send(500);
            } else {
                if (conversation != null) {
                    conversation.status = conv_status;
                    conversation.save();
                    res.status(200).send(conversation);
                } else {
                    res.status(404)
                }

            }
        });
    },
    messagedata: (req, res, next) => {

        var page_num = req.query.page ? req.query.page : 1;
        var page_limit = req.query.limit ? req.query.limit : 10;
        var page_sort = req.query.sort ? req.query.sort : 'createdAt';
        var page_sortorder = req.query.sortorder ? req.query.sortorder : 'desc';
        var status = req.query.status ? req.query.status : 'active';
        var channel = req.query.channel ? req.query.channel : 'all';
        sort_obj = {};
        sort_obj[page_sort] = page_sortorder;
        var conv_id = [];
        var query = { status: status };
        if(channel != "all"){
            query = { status: status, channel:channel };
        }
        Conversation.paginate(query, { select: 'conversationid createdAt updatedAt phone conversationobject status channel', page: parseInt(page_num), limit: parseInt(page_limit), sort: sort_obj },
            function(err, messages) {
                if (messages) {
                    var result = {};
                    result.docs = [];
                    for (var i in messages.docs) {
                        result.docs[i] = {}
                        conv_id.push(messages.docs[i].conversationid);
                        var messagedata = messages.docs[i].conversationobject ? JSON.parse(messages.docs[i].conversationobject) : messages.docs[i].conversationobject;
                        if (messagedata != null || messagedata != undefined) {
                            result.docs[i].fname = messagedata.fname;
                            result.docs[i].lname = messagedata.lname;
                            result.docs[i].conversationid = messages.docs[i].conversationid;
                            result.docs[i].createdAt = messages.docs[i].createdAt;
                            result.docs[i].updatedAt = messages.docs[i].updatedAt;
                            result.docs[i].phone = messages.docs[i].phone;
                            result.docs[i].status = messages.docs[i].status;
                            result.docs[i].id = messages.docs[i].id;
                        } else {
                            result.docs[i] = messages.docs[i];
                        }
                    }

                    const aggregatorOpts = [{
                        $match: {
                            'conversationid': { $in: conv_id },
                            'msg_reprompt': true
                        }
                    }, {
                        $group: {
                            _id: { conversationid: "$conversationid" },
                            count: { $sum: 1 }
                        }
                    }]

                    var promise = MessageData.aggregate(aggregatorOpts).exec();
                    promise.then(function(doc) {

                        newresult = result.docs.map(function(e) {
                            var newarray = doc.find(function(element) {
                                return element._id.conversationid == e.conversationid;
                            });
                            var newelement = JSON.parse(JSON.stringify(e));

                            // console.log(newelement);
                            if (newarray) {
                                newelement.errorcount = newarray.count;
                            } else {
                                newelement.errorcount = 0;
                            }
                            // console.log(newelement)
                            return newelement;
                        })
                        var response = {}
                        response.docs = newresult;
                        response.total = messages.total;
                        response.limit = messages.limit;
                        response.page = messages.page;
                        response.pages = messages.pages;


                        res.status(200).send(response);
                    }, function(err) {
                        console.log("err" + err);
                        res.status(500).send({ error: err });
                    })
                } else {
                    console.log(err)
                    res.status(500).send(err);
                }
            }
        );
    },
    createConversation: (req, res, next) => {
        console.log("request ",req);
        console.log("-----------------------Hello-----------------------");
        console.log("build conversation object");
        // var conversationobj={"conversationid":result.conversationId,"phone":"9714376669","botbuilderobject":Json.stringify(result)};
        var conversationobj = { "conversationid": req.body.conversationId, "botbuilderobject": JSON.stringify(req.body), "channel": req.body.channel };
        console.log("-----------------------Hello-----------------------");
        console.log(conversationobj);
        Conversation.create((conversationobj), function (err, conversation) {
            console.log("callback called");
            if (err) {
                console.log(err);
                return res.status(500).send('Server Server');
            }
            return res.send({ message: 'Successfully created new conversation.', conversation: conversation }, 201);
        });

    },
    getThrottleCounter: (req, res, next) => {
        var start = moment().tz("America/New_York").startOf('day');
        start = start.utc().format();
        var end = moment().tz("America/New_York").endOf('day');
        end = end.utc().format();

        ThrottleUser.findOne({ createdAt: { $gte: start, $lt: end } }, function (err, throttleUser) {
            if (err) {
                console.log(err);
                res.send(500);
            } else {
                if (throttleUser) {
                    return res.status(200).send(throttleUser);
                }
                else{
                    return res.status(200).send({ counter: 0 });
                }
            }
        });
    },
    getConversation: (req, res, next) => {
        console.log("in get conv");
        console.log(req.params.conversationid);
        Conversation.findOne({ conversationid: req.params.conversationid }, function(err, conversation) {
            if (err) {
                console.log(err);
                res.send(500);
            } else {
                if (conversation != null) {
                    res.status(200).send(conversation);
                } else {
                    res.status(404)
                }
            }
        });
    }
}