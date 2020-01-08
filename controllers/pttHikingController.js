const rp = require('request-promise');
const cheerio = require('cheerio');
const moment = require('moment');
const Model = require('../models');
const Invitation = Model.Invitation;

exports.getFirstPage = (req, res, next) => {
    // Hello from jenkins
    crawlFirst()
    .then(totalPage => {

        const promises = [];
        // P.S. 之後可用 recursion 濾掉特定日期之前的資料
        for(let i = 0; i < 20; i++){
            promises.push(crawlFirst(totalPage - i));
        }
        
        Promise.all(promises)
        .then(results => {
            const flattened_arr = [].concat(...results);
            const promises = [];
            flattened_arr.forEach(url => {
                promises.push(crawlPost(url));
            })
            Promise.all(promises)
            .then(results => {
                var newArray = results.filter(value => Object.keys(value).length !== 0)
                res.send(newArray);
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
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36" 
        },
        transform: function(body){
            return cheerio.load(body);
        }
    }

    return rp(options)
    .then($ => {
        const lastPageUrl = $('.wide').eq(1).attr('href');
        var totalPage = Number(lastPageUrl.match(/[\d]+/)[0]) + 1;
        if(page == ""){
            return totalPage;
        }else{
            const datas = [];
            $('.r-ent').each(function(i ,el){
                const topicUrl = $(this).children('.title').children('a').attr('href');
                const topicName = $(this).children('.title').children('a').text();
                
                if(topicName.startsWith("[揪人]")){
                    var data = "https://www.ptt.cc" + topicUrl;
                    datas.push(data);
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
        const formated_depart_time = formatTime(depart_time);
        const data = {
            ptt_id: url.match(/Hiking\/([\d\w\.]+).html/)[1],
            subject: title,
            departure_date: moment(formated_depart_time).format(),
            description: body[0],
            ptt_url: url
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
        }else{
            year = moment().format('YYYY');
        }

        return year + "-" + time.join('-');
    }

}
