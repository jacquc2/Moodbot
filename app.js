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
            session.beginDialog('/funnypic');
            funnyindex ++;
            session.endDialog();
            
        }
        else{
            session.beginDialog('/goodbye');
            session.endDialog();
        }

    }
    
]);

intents.matches(/^no/i, [
    function(session) {
        if(cuteindex < urls.length){
            session.beginDialog('/fine')
            cuteindex ++;
            session.endDialog();
        }
        else{
            session.beginDialog('/goodbye');
            session.endDialog();
        }
        
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
        session.send('Hello %s!.', session.userData.name);
        session.send("Ready to see a funny pic to improve your mood? :)");
    }
]);

bot.dialog('/funnypic', [
    function (session, results) {
        var card = createHeroCard1(session);
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);  
        builder.Prompts.text(session, "Ready to see another one?");
        session.endDialog();
        
      }
    
    
]);

bot.dialog('/goodbye', [
    function(session,results){
        var card = createHeroCard3(session);
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
        session.endDialog();
    }
])

bot.dialog('/fine',[
    function(session,results){
        var card = createHeroCard2(session);
        var msg = new builder.Message(session).addAttachment(card);
        session.send(msg);
        builder.Prompts.text(session, 'Ready to see a funny pic now?');
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
        .title('Alright no funny pics')
        .subtitle('Here is cute pic instead')
        
        .images([
            builder.CardImage.create(session, cuteurls[cuteindex])
        ])
        .buttons([
            builder.CardAction.openUrl(session, cuteurls[cuteindex], 'See image')
        ]);
        
}

function createHeroCard3(session) {
    return new builder.HeroCard(session)
        .title("That's all I have for now!")
        .subtitle("Hope you enjoyed the pics :)")
        .text("Don't forget to visit me tomorrow")
        .images([
            builder.CardImage.create(session, 'https://s-media-cache-ak0.pinimg.com/736x/79/9e/91/799e91f4b7e03368cfdfb8ba97b508d9.jpg')
        ])
        .buttons([
            builder.CardAction.openUrl(session,'https://s-media-cache-ak0.pinimg.com/736x/79/9e/91/799e91f4b7e03368cfdfb8ba97b508d9.jpg', 'See image')
        ]);
        
}


function createHeroCard1(session) {
    return new builder.HeroCard(session)
        .title('Funny Pic')
        .subtitle('Have a nice day!')
        
        .images([
            builder.CardImage.create(session, urls[funnyindex])
        ])
        .buttons([
            builder.CardAction.openUrl(session, urls[funnyindex], 'See image')
        ]);
        
}
