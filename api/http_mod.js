var request=require('request')
var mongodb=require('mongodb')
var cheerio=require('cheerio')
var fs = require("fs");
// var mongod_mod=require('./mongod_mod')
var db,db_home
// post_body()
// download('https://p1.ssl.qhimg.com/d/inn/ab9df40c/so.png','222.jpg','../img/home/')
console.log(encodeURI('进口'))
// console.log(decodeURI('%E8%BF%9B%E5%8F%A3'))
// getHTML_ID('http://product.bl.com/3189100.html?bl_ad=P668824_-_%u536B%u751F%u5DFE_-_5')
maxImg(3377609)
var p=new Promise(function(resolve,rejected){
    mongodb.connect('mongodb://localhost:27017/',function(err,c){
            if(err){
                console.log('连接失败')
            }else{
                db=c.db('bailian')
                db_home=db.collection('home')
                // resolve()
            }
        })
    // resolve()
// 'http://www.bl.com/js/mdata/group.html'
}).then(function(resolve,rejected){
    // home()
    post_list('生鲜',(data)=>{
        console.log(data)
             
    })
    // http://www.bl.com/js/mdata/floor2.html
})

//下载地址,文件名,保存目录
function download(url,name,url_r,fn){
    console.log('开始下载',name)
    request.get(url)
    .on('response', function(response) {
        console.log(name,response.statusCode)
        if(response.statusCode=='200'){
            console.log('下载成功')
            fn()
        }else{
            console.log('重试')
            download(url,name,url_r)
        }
      })
    .pipe(fs.createWriteStream(url_r+name))
}
//

//获取网页
function body(url,fn){
    console.log('正在连接>>')
    request.get(url,function (err,res,data){
        if(err){
            console.log(err)
            console.log('重试>>')
            body(url,fn)
        }else{
            data=data.slice(17,-2)
            data=data.replace(/\\"/ig,'"')
            var $=cheerio.load(data)
            fn($)
        }      
    })
}
//获取文件名
function fsName(url){
    var ar=url.split('/')
    return ar[ar.length-1]
}
//错误回调
function err_(err){
    console.log(err)
}

//爬列表页
//获取图片大图和小图
//http://product.bl.com/json/getPicture.html
//POST
//productid: 3377609
//[{"L":{"type":1,"sort":0,"url":"http://img19.iblimg.com/mp-175/mp/goods/622734629_800x800.jpg","realUrl":null,"specCode":"10008","isEnable":"1","attrType":"1","videoLink":null},"M":{"type":1,"sort":0,"url":"http://img19.iblimg.com/mp-175/mp/goods/622734629_360x360.jpg","realUrl":null,"specCode":"10007","isEnable":"1","attrType":"1","videoLink":null},"S":{"type":1,"sort":0,"url":"http://img19.iblimg.com/mp-175/mp/goods/622734629_60x60.jpg","realUrl":null,"specCode":"10001","isEnable":"1","attrType":"1","videoLink":null}},{"L":{"type":0,"sort":1,"url":"http://img16.iblimg.com/mp-175/mp/goods/1452629420_800x800.jpg","realUrl":null,"specCode":"10008","isEnable":"1","attrType":"1","videoLink":null},"M":{"type":0,"sort":1,"url":"http://img16.iblimg.com/mp-175/mp/goods/1452629420_360x360.jpg","realUrl":null,"specCode":"10007","isEnable":"1","attrType":"1","videoLink":null},"S":{"type":0,"sort":1,"url":"http://img16.iblimg.com/mp-175/mp/goods/1452629420_60x60.jpg","realUrl":null,"specCode":"10001","isEnable":"1","attrType":"1","videoLink":null}},{"L":{"type":0,"sort":2,"url":"http://img19.iblimg.com/mp-175/mp/goods/1401502990_800x800.jpg","realUrl":null,"specCode":"10008","isEnable":"1","attrType":"1","videoLink":null},"M":{"type":0,"sort":2,"url":"http://img19.iblimg.com/mp-175/mp/goods/1401502990_360x360.jpg","realUrl":null,"specCode":"10007","isEnable":"1","attrType":"1","videoLink":null},"S":{"type":0,"sort":2,"url":"http://img19.iblimg.com/mp-175/mp/goods/1401502990_60x60.jpg","realUrl":null,"specCode":"10001","isEnable":"1","attrType":"1","videoLink":null}},{},{},{},{},{},{}]
//
//
//价格信息
//http://product.bl.com/cms/json/getTrace.html
//POST
//
//cook: 3377609
//
//[{"id":3377609,"name":"易果生鲜 原膳阿拉斯加银鳕鱼块390g","price":249.0,"url":"http://img19.iblimg.com/mp-175/mp/goods/622734629_360x360.jpg","proSellBit":4,"goodsStatus":"0","priceType":13,"brandSid":156683,"categoryId":"103417"}]
//
//商品详情
//http://product.bl.com/json/getDescribe.html
//POST
//productid: 3377609
//返回div
function post_list(mane,fn){
    var obj={
        url:'http://search.bl.com/js/mainGoodList.html',
        form:{
            k:encodeURI(mane),
            c:'',
            isava:'',
            act:'',
            promotion:'',
            actType:'',
            ruleNo:'',
            yunType:'',
            isColl:0,
            isMatch:'',
            ifPickup:'',
            goodsType:'',
            props:{},
            markFlag:'',
            sorCol:'',
            sorTye:'',
            pageIndex:1,
            pageSize:100
        }
    }
    request.post(obj,function(err,res,data){
        if(err){
            console.log('连接失败>>')
            console.log('正在重试>>')
            post_list(mane,fn)
        }else{
            var $=cheerio.load(data)
            var li=$('li')
            var a=$('.pro-img a',li)
            console.log(a)
            var data=[]
            for(var i=0;i<a.length;i++){
                var d=a.eq(i).attr('href')
                if(d!='javascript:;'){
                    data.push(d)
                }
            }
            fn(data)
            // console.log('ccc')
        }
        
             
    })

}
//获取商品大图片
function maxImg(id){
    console.log('正在获取>>.')
    var obj={
            url:'http://product.bl.com/json/getPicture.html',
            form:{productid: id}
        }
    request.post(obj,function(err,res,data){
        
        if(err){
            console.log('重试>')
            maxImg(id)
        }else{
            console.log(data)
            console.log(JSON.parse(data))
            var num=0
            download()
                 
        }
    })


}

function getHTML_ID(url){
    url=url.split('?')
    url=url[0].split('/')
    url=url[url.length-1].split('.')
    console.log(url[0])
    return url[0];
         
}



//
// function ()

//爬首页
function home(){


    //团购
    body('http://www.bl.com/js/mdata/group.html',function($){
         var img=$('img')
         var li=$('li')
         var data=[]
         var _data,src
         for(var i=0;i<li.length;i++){
            src=img.eq(i+1).attr('src')
            download(src,fsName(src),'../img/home/')
                _data={
                img:'img/home/'+fsName(src),
                title:$('.new_czt_name',li.eq(i)).text(),
                price:$('.money span',li.eq(i)).text()-0,
                reference:$('.price',li.eq(i)).text().slice(5)-0,
                id:0,
             }
             data.push(_data)
         }
        src=img.attr('src')
        download(src,fsName(src),'../img/home/')
        data={
            order:1,
            banner:[{
                img:'img/home/'+fsName(src),
                id:0
            }],
            promotion:data
         }
        console.log(data)
        db_home.insertOne(data,err_)
        console.log('完成')
    })
    // 促销专题
    body('http://www.bl.com/js/mdata/featuredChannel.html',function($){
         var img=$('.new_tm_lul li img')
         var banner=[]
         var _data
         var data
         var src
         for(var i=0;i<img.length;i++){
            src=img.eq(i).attr('src')
            download(src,fsName(src),'../img/home/')
            _data={
                img:'img/home/'+fsName(src),
                url:'#'
            }
            banner.push(_data)
         }
         var img=$('.new_tm_r li img')
         var width285=[]
         for(var i=0;i<img.length;i++){
            src=img.eq(i).attr('src')
            download(src,fsName(src),'../img/home/')
                _data={
                    img:'img/home/'+fsName(src),
                    url:'#'
                }
             width285.push(_data)
         }
         data={
            order:2,
            banner:banner,
            width285:width285
         }
        console.log(data)
        db_home.insertOne(data,err_)
        console.log('完成')
    })

    //板块
    //7个板块
    for(let n=1;n<=7;n++){
        body('http://www.bl.com/js/mdata/floor'+n+'.html',function($){
            var _title=$('h3').text()
            var _banner=[]
            var img=$('.floor_slide img')
            for(var i=0;i<img.length;i++){
                _img=img.eq(i)
                src=_img.attr('src')
                download(src,fsName(src),'../img/home/')
                _data={
                        img:'img/home/'+fsName(src),
                        id:0
                    }
                _banner.push(_data)
            }

            var img=$('.floor_main img')
            var src,_data,_img,data,
                _width450=[],
                _width285=[],
                _width230=[],
                _width220=[],
                _width104=[]
            for(var i=0;i<img.length;i++){
                _img=img.eq(i)
                src=_img.attr('src')
                download(src,fsName(src),'../img/home/')
                if(_img.attr('width')=='451'){
                    _data={
                        img:'img/home/'+fsName(src),
                        id:0
                    }
                    _width450.push(_data)
                }else if(_img.attr('width')=='285'){
                    _data={
                        img:'img/home/'+fsName(src),
                        id:0
                    }
                    _width285.push(_data)
                }else if(_img.attr('width')=='230'){
                     _data={
                        img:'img/home/'+fsName(src),
                        id:0
                    }
                    _width230.push(_data)
                }else if(_img.attr('width')=='220'){
                    _data={
                        img:'img/home/'+fsName(src),
                        id:0
                    }
                    _width220.push(_data)
                }else if(_img.attr('width')=='104'){
                    _data={
                        img:'img/home/'+fsName(src),
                        url:'#'
                    }
                    _width104.push(_data)
                }
            }
            data={
                order:2+n,
                title:_title,
                banner:_banner,
                width450:_width450,
                width285:_width285,
                width230:_width230,
                width220:_width220,
                log:_width104
            }
            console.log(data)
            db_home.insertOne(data,err_)
            console.log('完成')
        })
    }
}


