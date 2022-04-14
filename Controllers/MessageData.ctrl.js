const { MessageData, Conversation } = require('../models');
const https = require('https');
var moment = require('moment-timezone');
var _ = require('lodash');
const { BlobServiceClient } = require('@azure/storage-blob');
var config = require('../cong');
var fs = require('fs');

var PdfPrinter = require('pdfmake');
var fonts = {
    Roboto: {
      normal: 'fonts/Roboto-Regular.ttf',
      bold: 'fonts/Roboto-Medium.ttf',
      italics: 'fonts/Roboto-Italic.ttf',
      bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
  };


const create = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const body = req.body;
    if (!body && !body.conversationid) {
        return res.status(500).send('Please provide conversation id');
    } else {

        MessageData.create((body), function (err, msgs) {
            if (err) {
                console.log(err);
                return res.status(500).send('Server Server');
            }
            return res.send({ message: 'Successfully added new message in database.', msgs: msgs }, 201);
        });
    }
}

const get = function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    const conversationid = req.params.conversationid;
    if (!conversationid) {
        return res.status(500).send('Please provide conversation id.');
    } else {
        MessageData.find({ conversationid: conversationid }, function (err, msg) {
            if (err) {
                console.log(err);
                return res.status(401).send('Not Found');
            }

            if (msg != null)
                return res.send({ MessageData: msg }, 200);
            else
                return res.status(404).send('Not Found');
        }).sort({ datetime: 1 });

    }
}

const getTranscripts = function (req, res, next) {
    try {
        moment.tz.setDefault("America/New_York");
        res.setHeader('Content-Type', 'application/json');
        var startdate = req.query.from;
        var enddate = req.query.to;
        var start = moment.tz(startdate, 'YYYY-MM-DD', 'America/New_York').startOf('day');
        start = start.utc().format();
        var end = moment.tz(enddate, 'YYYY-MM-DD', 'America/New_York').endOf('day');
        end = end.utc().format();
        console.log("start date " + start + " End date " + end);
        if (!start || !end) {
            return res.status(500).send('Please provide the date range.');
        } else {

            Conversation.find({
                createdAt: {
                    $gte: start,
                    $lt: end
                }
            }, 'conversationid conversationobject createdAt', function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(401).send('Not Found');
                }
                console.log("DATA ");
                let conversations = [];
                Array.from(data).map((conversation) => {
                    var messagedata = conversation.conversationobject ? JSON.parse(conversation.conversationobject) : conversation.conversationobject;
                    conversations.push({
                        fname: messagedata != null && typeof messagedata != "undefined" ? messagedata.fname : '',
                        conversationId: conversation.conversationid,
                        createdAt: conversation.createdAt
                    });
                });

                MessageData.find({ conversationid: { $in: _.map(conversations, x => x.conversationId) } }, function (err, msg) {
                    if (err) {
                        console.log(err);
                        return res.status(401).send('Not Found');
                    }
                    if (msg != null && msg.length > 0) {
                        console.log("Get Message DATA ");
                        var MessageData = _.chain(msg).groupBy("conversationid")
                            .map((value, key) => ({
                                ConversationId: key,
                                fname: _.find(conversations, x => x.conversationId == key)["fname"] || "",
                                createdAt: moment.utc(
                                    _.find(conversations, x => x.conversationId == key)["createdAt"] || moment.utc())
                                    .tz('America/New_York').format('MM/DD/YYYY hh:mm a') || "",
                                Dialogues: value.map((_val) => {
                                    return {
                                        message: _val.text,
                                        sender: _val.sender,
                                        datetime: moment.utc(_val.datetime).tz('America/New_York').format('MM/DD/YYYY hh:mm a')
                                    }
                                })
                            })).value()

                        const blobServiceClient = BlobServiceClient.fromConnectionString(config.NNBlobStorageConnectionString);

                        // Create a unique name for the container
                        const containerName = 'transcripts';

                        // Get a reference to a container
                        const containerClient = blobServiceClient.getContainerClient(containerName);
                        // Create a unique name for the blob
                        const blobName = 'NN_' + start + '-to-' + end + '.json';

                        // Get a block blob client
                        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

                        console.log('\nUploading to Azure storage as blob:\n\t', blobName);

                        // Upload data to the blob
                        blockBlobClient.upload(JSON.stringify(MessageData), MessageData.length).then((uploadBlobResponse) => {
                            return res.status(200).send({ Message: "Uploaded successfully", Filename: config.StoragePath + blobName });
                        }).catch((error)=>{
                            return res.status(500).send({"message":"Error to uploading JSON file in Blob Storage.","Error":error});
                        });
                    }
                    else {
                        return res.status(200).send({ Conversations: {} });
                    }
                });
            })
        }
    }
    catch (e) {
        return res.status(500).send({"message":"Something went wrong","Error":e});
    }
}

const DownloadTranscript = function(req,res,next){
    const conversationid = req.params.conversationid;
    if (!conversationid) {
        return res.status(500).send('Please provide conversation id.');
    } else {
        MessageData.find({ conversationid: conversationid }, function(err, msg) {
            if (err) {
                console.log(err);
                return res.status(401).send('Not Found');
            }

            if (msg != null)
            {
                createPdfBinary(msg, function (binary) {
                    res.contentType('application/pdf');
                    return res.status(200).send(binary);
                }, function (error) {
                    res.send('ERROR:' + error);
                });
            }
            else
                return res.status(404).send('Not Found');
        }).sort({datetime:1});
    }
}

const DownloadPDF = function(req,res,next){
    var pdflink = req.params.link;
    if (!pdflink) {
        return res.status(500).send('Please provide pdf link.');
    } else {
        pdflink = 'https://factsscreengrabs.blob.core.windows.net/browserguides/' + pdflink;
        https.get(pdflink, (resp) => {
            var data = []; 
    
            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data.push(chunk);
            });
    
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                data = Buffer.concat(data);
                res.contentType('application/pdf');
                return res.status(200).send(data);
            });
    
        }).on("error", (err) => {
            console.log("Error: " + err.message);
            res.status(500).send('ERROR:' + error);
        });
    }
}

function createPdfBinary(msgList, callback) {

    var bodyData = [];
    var printer = new PdfPrinter(fonts);
    
    var chatcontent = {
        info: {
            title: 'Chat Transcript',
            author: 'Nelnet',
            subject: 'Nelnet - Chat Transcript',
            keywords: 'Chat Transctipt'
        }, content: [], styles: {
            leftStyle: {
                alignment: 'left'
            },
            rightStyle: {
                color: "#1b5ca5",
                alignment: 'left'
            },
            rightStyle2: {
                color: "#778191",
                alignment: 'left'
            },
            colorred: {
                color: '#119c55'
            },
            colorgreen: {
                fontSize: 11,
                color: '#51617c',
                alignment: 'justify'
            },
            blanklinestyle: {
                fontSize: 6
            },
            tableExample: {
                margin: [0, 5, 0, 15],
                color: '#777777'
            },
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10],
                color: "#15549a",
                alignment: 'center'
            }
        }, header: function (currentPage, pageCount) {
            return {
                margin: 10,
                columns: [
                    {
                        fontSize: 9,
                        text: [
                            {
                                text: "Nelnet - Chat Transcript"
                            }
                        ],
                        alignment: 'right'
                    }
                ]
            };
        }, footer: function (currentPage, pageCount) {
            return {
                margin: 10,
                columns: [
                    {
                        fontSize: 9,
                        text: [
                            {
                                text: currentPage.toString() + ' of ' + pageCount
                            }
                        ],
                        alignment: 'right'
                    },
                    {
                        fontSize: 9,
                        text: moment().tz('America/New_York').format('MM-DD-YYYY')+"(EST)",
                        alignment: 'right'
                    }
                ]
            };

        }
    };
    chatcontent.content.push({ text: "Nelnet", style: 'header' });

    var reg = new RegExp('([a-zA-Z\d]+://)?((\w+:\w+@)?([a-zA-Z\d.-]+\.[A-Za-z]{2,4})(:\d+)?(/.*)?)', 'i')
    
    Array.from(msgList).map((msgdata)=>{
        var msg = msgdata._doc;
        if(msg.attachments){
            msg.attachments = JSON.parse(msg.attachments);
        }
        if(msg.channeldata){
            msg.channeldata = JSON.parse(msg.channeldata);
        }
        if (msg.attachments && msg.attachments.length > 0 &&  msg.attachments[0].content && msg.attachments[0].content.buttons) {

            if (msg.sender == "xander") {

                var b = msg.text + '\r\n';
                var i = 0;


                Array.from(msg.attachments[0].content.buttons).map((button)=>{
                    b = b + button.title + '\r\n';
                    i++;
                }),

                    //alert(msg.buttons.title);
                    chatcontent.content.push({
                        columns: [

                            {
                                // star-sized columns fill the remaining space
                                // if there's more than one star-column, available width is divided equally
                                width: 'auto',
                                text: "Bailey" + ': ',
                                style: 'colorred'
                            },
                            {
                                // star-sized columns fill the remaining space
                                // if there's more than one star-column, available width is divided equally
                                width: 'auto',
                                text: b,
                                style: 'colorgreen',
                                bold: true,
                                alignment: ''
                            },


                        ],
                        style: 'leftStyle',

                        // optional space between columns
                        columnGap: 10
                    }, { text: '                                ', style: 'blanklinestyle' })

            } else {
                chatcontent.content.push({
                    columns: [
                        {
                            // auto-sized columns have their widths based on their content
                            width: 'auto',
                            text: 'You: ',
                            style: 'rightStyle',
                        },
                        {
                            // auto-sized columns have their widths based on their content
                            width: 480,
                            text: msg.text,
                            style: 'rightStyle2',

                        }

                    ],
                    style: 'rightStyle',
                    // optional space between columns
                    columnGap: 20
                }, { text: '                                ', style: 'blanklinestyle' })

            }
        }
        else {
            if (msg.sender == "xander") {
                if (msg.msgtype === "endOfConversation") {
                    //msg.message = "Conversation Ended."
                }
                else {
                    if (msg.channeldata && msg.channeldata.type == "showscreengrab") {
                        console.log("Show Screen Grab Block ",msg.channeldata.type);
                        console.log("Link ",msg.channeldata.link);
                        var b = msg.text + '\r\n';
                        b = b + msg.channeldata.link + '\r\n';
    
                        chatcontent.content.push({
                            columns: [
    
                                {
                                    // star-sized columns fill the remaining space
                                    // if there's more than one star-column, available width is divided equally
                                    width: 'auto',
                                    text: "Bailey" + ': ',
                                    style: 'colorred'
                                },
                                {
                                    // star-sized columns fill the remaining space
                                    // if there's more than one star-column, available width is divided equally
                                    width: 480,
                                    text: b,
                                    style: 'colorgreen',
                                    alignment: ''
                                },
    
    
                            ],
                            style: 'leftStyle',
    
                            // optional space between columns
                            columnGap: 10
                        }, { text: '                                ', style: 'blanklinestyle' })
                    }
                    else if (msg.channeldata && msg.channeldata.type == "buttonwithlink") {
                        console.log("Show Screen Grab Block ",msg.channeldata.type);
                        console.log("Link ",msg.channeldata.link);
                        console.log("Link Text ",msg.channeldata.Text);
                        var b = msg.text + '\r\n';
                        b = b + msg.channeldata.Text+"("+msg.channeldata.link + ")"+'\r\n';
    
                        chatcontent.content.push({
                            columns: [
    
                                {
                                    // star-sized columns fill the remaining space
                                    // if there's more than one star-column, available width is divided equally
                                    width: 'auto',
                                    text: "Bailey" + ': ',
                                    style: 'colorred'
                                },
                                {
                                    // star-sized columns fill the remaining space
                                    // if there's more than one star-column, available width is divided equally
                                    width: 480,
                                    text: b,
                                    style: 'colorgreen',
                                    bold: true,
                                    alignment:''
                                },
    
    
                            ],
                            style: 'leftStyle',
    
                            // optional space between columns
                            columnGap: 10
                        }, { text: '                                ', style: 'blanklinestyle' })
                    }
                    else if (msg.channeldata && msg.channeldata.type == "showcontinuebtn") {
                        var alignment = ''
                        var bd = ["Continue Chat"];
                        bodyData.push(bd);
                        chatcontent.content.push({
                            columns: [
                                {
                                    // star-sized columns fill the remaining space
                                    // if there's more than one star-column, available width is divided equally
                                    width: 'auto',
                                    text: "Bailey" + ': ',
                                    style: 'colorred'
                                },
                                {
                                    // star-sized columns fill the remaining space
                                    // if there's more than one star-column, available width is divided equally
                                    width: 480,
                                    style: 'colorgreen',
                                    text: "Continue Chat",
                                    bold: true,
                                    alignment:alignment
                                },


                            ],
                            style: 'leftStyle',

                            // optional space between columns
                            columnGap: 10

                        }, { text: '                                ', style: 'blanklinestyle' })
                    }
                    else {
                        var alignment = 'justify'
                        if (reg.test(msg.text)) {
                            alignment = '';
                        }
                        var bd = [msg.text];
                        bodyData.push(bd);
                        chatcontent.content.push({
                            columns: [

                                {
                                    // star-sized columns fill the remaining space
                                    // if there's more than one star-column, available width is divided equally
                                    width: 'auto',
                                    text: "Bailey" + ': ',
                                    style: 'colorred'
                                },
                                {
                                    // star-sized columns fill the remaining space
                                    // if there's more than one star-column, available width is divided equally
                                    width: 480,
                                    style: 'colorgreen',
                                    text: msg.text,
                                    alignment:alignment
                                },


                            ],
                            style: 'leftStyle',

                            // optional space between columns
                            columnGap: 10

                        }, { text: '                                ', style: 'blanklinestyle' })
                    }
                }
            }
            else {
                chatcontent.content.push({
                    columns: [
                        {
                            // auto-sized columns have their widths based on their content
                            width: 'auto',
                            text: 'You: ',
                            style: 'rightStyle',
                        },
                        {
                            // auto-sized columns have their widths based on their content
                            width: 480,
                            text: msg.text.toString(),
                            style: 'rightStyle2'
                        }

                    ],
                    style: 'rightStyle',
                    // optional space between columns
                    columnGap: 20
                }, { text: '                                ', style: 'blanklinestyle' })

            }
        }
    });

	var doc = printer.createPdfKitDocument(chatcontent);
    // doc.pipe(fs.createWriteStream('document.pdf'));
    // doc.end();

	var chunks = [];
	var result;

	doc.on('data', function (chunk) {
		chunks.push(chunk);
	});
	doc.on('end', function () {
		result = Buffer.concat(chunks);
		// callback('data:application/pdf;base64,' + result.toString('base64'));
		callback(result);
	});
	doc.end();

}

module.exports.create = create;
module.exports.get = get;
module.exports.getTranscripts = getTranscripts;
module.exports.DownloadTranscript = DownloadTranscript;
module.exports.DownloadPDF = DownloadPDF;