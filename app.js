var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var cheerio = require('cheerio');


//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());



var urls = [],
    cuteurls = [];
    funnyindex = 0;
    cuteindex = 0;




request('https://www.reddit.com/r/funny/', function(err, resp, body){
    if(!err && resp.statusCode == 200){
        var $ = cheerio.load(body);
        $('a.title', '#siteTable').each(function(){
            var url = $(this).attr('href');
            if(url.indexOf('.jpg')!= -1){
                 urls.push(url);
            }
            
        });
        console.log(urls);
    }
});

request('https://www.reddit.com/r/aww/', function(err, resp, body){
    if(!err && resp.statusCode == 200){
        var $ = cheerio.load(body);
        $('a.title', '#siteTable').each(function(){
            var url = $(this).attr('href');
            if(url.indexOf('.jpg')!= -1){
                 cuteurls.push(url);
            }
        
        });
        
    }
});

//=========================================================
// Bots Dialogs
//=========================================================

var intents = new builder.IntentDialog();
bot.dialog('/', intents);


intents.matches(/^yes/i, [
    function (session) {
        if(funnyindex < urls.length){
            funnyindex ++;
        }
        else{
            funnyindex = 0;
        }
        session.beginDialog('/funnypic');
    }
]);

intents.matches(/^no/i, [
    function(session) {
        if(cuteindex < urls.length){
            cuteindex ++;
        }
        else{
            cuteindex = 0;
        }
        session.beginDialog('/fine')
    }
])


intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s! My name is FunnyBot.', session.userData.name);
        session.send("Do you want to see a funny pic, yes or no?");
    }
]);

bot.dialog('/funnypic', [
    function (session, results) {
        var card = createHeroCard1(session);
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);  
        builder.Prompts.text(session, 'Want to see another funny pic, yes or no?');
        session.endDialog();
        
      }
    
    
]);

bot.dialog('/fine',[
    function(session,results){
        var card = createHeroCard2(session);
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
        builder.Prompts.text(session, 'Do you want to see a funny pic now, yes or no?');
        session.endDialog();
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

function createHeroCard2(session) {
    return new builder.HeroCard(session)
        .title('Pic just for you')
        .subtitle('Here is cute pic instead ;)')
        .text('pics come from reddit')
        .images([
            builder.CardImage.create(session, cuteurls[cuteindex])
        ])
        .buttons([
            builder.CardAction.openUrl(session, cuteurls[cuteindex], 'See image')
        ]);
        
}


function createHeroCard1(session) {
    return new builder.HeroCard(session)
        .title('Funny Pic for you')
        .subtitle('Have a nice day!')
        .text('pics come from reddit')
        .images([
            builder.CardImage.create(session, urls[funnyindex])
        ])
        .buttons([
            builder.CardAction.openUrl(session, urls[funnyindex], 'See image')
        ]);
        
}
