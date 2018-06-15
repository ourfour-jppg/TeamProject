var request=require('request')
var mongodb=require('mongodb')
var cheerio=require('cheerio')
var fs = require("fs");
// var mongod_mod=require('./mongod_mod')
var db,db_home,db_goods
// post_body()
// download('https://p1.ssl.qhimg.com/d/inn/ab9df40c/so.png','222.jpg','../img/home/')
console.log(encodeURI('进口'))
// console.log(decodeURI('%E8%BF%9B%E5%8F%A3'))
// getHTML_ID('http://product.bl.com/3189100.html?bl_ad=P668824_-_%u536B%u751F%u5DFE_-_5')
// maxImg(3377609)
var p=new Promise(function(resolve,rejected){
    mongodb.connect('mongodb://localhost:27017/',function(err,c){
            if(err){
                console.log('连接失败')
            }else{
                db=c.db('bailian')
                db_home=db.collection('home')
                db_goods=db.collection('goods')
                // resolve()
            }
        })
    resolve()
// 'http://www.bl.com/js/mdata/group.html'
}).then(function(resolve,rejected){
    // home()
    // post_list('生鲜',(data)=>{
    //     console.log(data)
             
    // })
    // http://www.bl.com/js/mdata/floor2.html
    p_list('家清')
})

//下载地址,文件名,保存目录
function download(url,name,url_r,fn){
    // console.log(fn)
    console.log('开始下载',name)
    request.get(url)
    .on('response', function(response) {
        console.log(name,response.statusCode)
        if(response.statusCode=='200'){
            console.log('下载成功')
            fn()
        }else{
            console.log('重试')
            download(url,name,url_r,fn)
        }
      })
    .on('error',function(err){
        console.log(err)
        console.log('重试')
        download(url,name,url_r,fn)
        
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
//
function p_list(mane){
    console.log('开始抓取',mane)
    post_list(mane,function(data){
        var arr_url=data
        var i=-1
        var data_list
        db_goods.find().toArray((err,jg)=>{
            data_list=jg.map(function(obj){
                return obj.id;
            })
            console.log('数据库列表',data_list)
            dg()
        })
        function dg(){
            i++
            if(i>=arr_url.length){
                console.log('全部完成')
                return 0;
            }
            var _data={},id=getHTML_ID(arr_url[i])
            console.log('id>>',id)
            for(var i_sz=0;i_sz<data_list.length;i_sz++){
                if(id==data_list[i_sz]){
                    console.log('跳过>>>',id)
                    id=-1
                    break;
                }
            }
            if(id<0){
                dg()
                return 0;
            }
            //获取大图
            maxImg(id,function(arr_url){
                _data['img']=arr_url
                     
                //获取商品属性
                goodsattr(id,function(attr){
                    console.log(attr)
                    console.log(1)
                    _data['title']=attr.name
                    _data['title_ad']='赠品数量有限，赠完为止'
                    _data['price']=attr.price
                    _data['id']=id
                    _data['reference']=attr.price*1.2
                    _data['num']=attr.categoryId
                    _data['prescription']='满999减100元'
                    _data['type']=mane
                    //获取详情页
                    goodsinit(id,function(div){
                        _data['introduce']=div
                        //写入数据库
                        db_goods.insertOne(_data,function(err,res){
                            if(!err){
                                console.log('写入数据库成功>>'+id)
                                dg()
                            }
                        })
                    })
                })
            })
        }
        
    })
}
// 获取商品表页
function post_list(mane,fn){
    console.log('获取商品表页')
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
function maxImg(id,fn){
    console.log('正在获取大图列表>>')
    var url_r='../img/goods/800x800/'
    var obj={
            url:'http://product.bl.com/json/getPicture.html',
            form:{productid: id}
        }
    var arr_url=[]
    request.post(obj,function(err,res,data){
        if(err){
            console.log('重试>')
            maxImg(id,fn)
        }else{
            // console.log(data)
            data=JSON.parse(data)
            console.log(data)
            var num=0
            // download(data[num].L.name,)
            console.log(data[num])
            if(data[num].L){
                download(data[num].L.url,id+'_'+num+'.jpg',url_r,xz)
                arr_url.push(url_r.slice(3)+id+'_'+num+'.jpg')
            }else{
                xz()
            }
            
            function xz(){
                num++
                if(num<data.length && data[num].L){
                        arr_url.push(url_r.slice(3)+id+'_'+num+'.jpg')
                        console.log(data[num])
                        download(data[num].L.url,id+'_'+num+'.jpg',url_r,xz)
                }else{
                    console.log('商品大图下载完成>'+id) 
                    fn(arr_url)
                }
            }
        }
    })
}
//商品价格属性
function goodsattr(id,fn){
    console.log('价格属性')
    var obj={
            url:'http://product.bl.com/cms/json/getTrace.html',
            form:{cook:id}
        }
    request.post(obj,function(err,res,data){
        if(!err){
            data=JSON.parse(data)
            if(data.length==0){
                request.get('http://product.bl.com/'+id+'.html',function(err,head,body){
                    var $=cheerio.load(body)
                    data=[{
                        name:$('h1').text(),
                        price:$('#FlashPrice').text().slice(5),
                        categoryId:id
                    }]
                    fn(data[0])
                })
            }else{
                fn(data[0])
            }
            
        }else{
            console.log('商品价格属性获取失败>>正在重试')                 
            goodsattr(id,fn)
        }
    })
}
//商品详情
function goodsinit(id,fn){
    console.log('商品详情')
    var obj={
            url:'http://product.bl.com/json/getDescribe.html',
            form:{productid:id}
        }
    request.post(obj,function(err,res,data){
        if(!err){
            fn(data)
        }else{
            console.log('商品详情获取失败>>正在重试')                 
            goodsinit(id,fn)
        }
    })
}
//获取html中的id
function getHTML_ID(url){
    url=url.split('?')
    url=url[0].split('/')
    url=url[url.length-1].split('.')
    // console.log(url[0])
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


