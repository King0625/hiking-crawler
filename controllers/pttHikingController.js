const rp = require('request-promise');
const cheerio = require('cheerio');

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
            // console.log(flattened)
            // res.send(flattened_arr);
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
        const depart_time = () => {
            if(title.match(pattern).length == 0){
                return body[0].match(pattern);
            }else{
                return title.match(pattern)[0];
            }
        }
        // const depart_time = ;
        const data = {
            title: title,
            post_time: $('.article-metaline').eq(2).children().eq(1).text(),
            // pattern: /([\d]{4}(\/|\.))?[\d]{1,2}[/\.-][\d]{1,2}/,
            depart_time: depart_time(),
            content: body[0]
        }
        return data;
    })
    .catch(err => {
        return err;
    })
}
