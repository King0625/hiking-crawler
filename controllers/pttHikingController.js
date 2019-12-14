const rp = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment');
const Model = require('../models');
const Invitation = Model.Invitation;

exports.getFirstPage = (req, res, next) => {

    crawlFirst()
    .then(totalPage => {

        const promises = [];
        var i = 0
        for(let i = 0; i < 15; i++){
            promises.push(crawlFirst(totalPage - i));
        }
        // crawlFirst(totalPage - i)
        // .then(results => {
        //     // res.send(results[results.length - 1].post_time);
        //     if(results[results.length - 1].post_time == '12/13'){
        //         res.send(results);
        //         // console.log(results);
        //         // flag == false;
        //     }
        // })
        // .catch(err => {
        //     res.send(err);
        // })

        // }
        // console.log(promises);
        
        Promise.all(promises)
        .then(results => {
            // const arr = [];
            // results.forEach(result => {
            //     arr.concat(result);
            // })
            const flattened_arr = [].concat(...results);
            // res.send(flattened_arr);
            const promises = [];
            flattened_arr.forEach(url => {
                promises.push(crawlPost(url));
            })
            Promise.all(promises)
            .then(results => {

                res.send(results);
            })
            .catch(err => {
                res.send(err);
            })
        })
        .catch(err => {
            res.send(err);
        })
    })
    .catch(err => {
        res.send(err);
    })

}

function crawlFirst(page = ""){
    const options = {
        method: "GET",
        url: `https://www.ptt.cc/bbs/Hiking/index${page}.html`,
        // proxy: "https://" + proxy,
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36" 
        },
        // tunnel: false,
        transform: function(body){
            return cheerio.load(body);
        }
    }

    return rp(options)
    .then($ => {
        const lastPageUrl = $('.wide').eq(1).attr('href');
        var totalPage = Number(lastPageUrl.match(/[\d]+/)[0]) + 1;
        // console.log(totalPage);
        if(page == ""){
            return totalPage;
        }else{
            const datas = [];
            $('.r-ent').each(function(i ,el){
                const topicUrl = $(this).children('.title').children('a').attr('href');
                const topicName = $(this).children('.title').children('a').text();
                
                const post_time = $(this).children('.meta').children('.date').text();
                // console.log(post_time);
                if(topicName.startsWith("[揪人]")){
                    // var data = {
                    //     topicName: topicName,
                    //     topicUrl: "https://ptt.cc/" + topicUrl,
                    //     post_time: post_time
                    // };
                    var data = "https://www.ptt.cc" + topicUrl;
                    // console.log(data);
                    datas.push(data);
                    // title.push("https://ptt.cc/" + $(this).attr('href'));
                }
            });

            return datas;
        }
    })
    .catch(err => {
        return err;
    })
}

function crawlPost(url){
    const options = {
        method: "GET",
        url: url,
        transform: function (body) {
            return cheerio.load(body);
        }
    }

    return rp(options)
    .then($ => {
        const content = $('#main-content').text();
        const pattern = /([\d]{4}(\/|\.))?[\d]{1,2}[/\.][\d]{1,2}/;
        const title = $('.article-metaline').eq(1).children().eq(1).text()
        const body = content.match(/\n(.*?\n)+--/);

        const depart_time = title.match(pattern).length == 0 ? body[0].match(pattern) : title.match(pattern)[0];
        // const depart_time = ;
        const formated_depart_time = formatTime(depart_time);
        console.log(depart_time);
        const data = {
            postId: url.match(/Hiking\/([\d\w\.]+).html/)[1],
            subject: title,
            departure_date: moment(formated_depart_time).format(),
            description: body[0]
        }
        return data;
    })
    .catch(err => {
        return err;
    })
}

function twelveHourTime(time){
    return moment(time, ["hh:mm:ss"]).format("h:mm A");
}

function formatTime(time){
    if(time.match(/\d+\.\d+\.\d+/)){
        time = time.split('.');
        var time = time.map(part => {
            if(part.length == 1){
                part = "0" + part
                // console.log(part);
            }
            return part;
        });
        // console.log(time);
        return time.join('-');
        
    }else if(time.match(/\d+\/\d+/)){
        time = time.split('/');
        var time = time.map(part => {
            if(part.length == 1){
                part = "0" + part
                // console.log(part);
            }
            return part;
        });
        if(moment().format('MM') - time[0] > 5){
            year = moment().add(1, 'year').format('YYYY');

            // console.log(moment().format('MM'));
            // console.log(time.join('/'));
        }else{
            year = moment().format('YYYY');
        }

        return year + "-" + time.join('-');
        // console.log(time);
    }

}
