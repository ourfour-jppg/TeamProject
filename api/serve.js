var request=require('request')
var mongodb=require('mongodb')
// var mongod_mod=require('./mongod_mod')
var express=require('express')
var body_parser=require('body-parser')
//mogdo操作
var db,db_home,db_user,db_shopping,db_goods
mongodb.connect('mongodb://localhost:27017/',function(err,c){
    if(err){
        console.log('连接失败')
    }else{
        db=c.db('bailian')
        db_home=db.collection('home')
        db_user=db.collection('user')
        db_shopping=db.collection('shopping')
        db_goods=db.collection('goods')
        // resolve()
    }
})
var app = express();
app.use(express.static('../'))
app.use(body_parser.urlencoded())
//主页api/home
app.get('/api/home',function(req,res,err){
    console.log('home>>',req.query)
    res.append('Access-Control-Allow-Origin','*')
    var p=new Promise(function(resolve,rejected){
        //搜索home里所有文档并且升序
        db_home.find().sort({ order: 1}).toArray(function(err,data){
            //猜猜你喜欢
            var cc
            db_goods.find().limit(50).sort({price:1}).toArray((err,j)=>{
                cc={
                     title:'猜你喜欢',
                     promotion:j.map(function(obj){
                                    return {
                                        img:obj.img,
                                        title:obj.title,
                                        price:obj.price,
                                        reference:obj.price,
                                        id:obj.id,
                                    };
                                })
                }
                
                console.log(cc)
                data.push(cc)
                res.json(data)
            })
            
        })

    }).then((resolve,rejected)=>{

    })
})
//帐号密码验证
app.post('/api/login',function(req,res,err){
    console.log('login>>',req.body)
    var ur=req.body.user,pawd=req.body.password
    res.append('Access-Control-Allow-Origin','*')
    db_user.find({user:ur,password:pawd}).toArray(function(err,data){
        var res_data={
                ok:0,
                user:'',
                id:''
            }
        if(data.length){
            res_data.ok=1
            res_data.user=data[0].user
            res_data.id=data[0]._id
        }
        res.json(res_data)
    })
})
//注册
app.post('/api/register',function(req,res,err){
    // user=用户名&password=用户密码&phone=手机号&email=电子邮箱
    // {
    // ok:0,
    // message:'用户名重复了',
    // user:'',//用户名
    // id:000//用户id
    // }
    console.log('register>>',req.body)
    var r_data={
            user:req.body.user,
            password:req.body.password,
            phone:req.body.phone,
            email:req.body.email
        }
    res.append('Access-Control-Allow-Origin','*')
    db_user.find({user:r_data.user}).toArray(function(err,f_data){
        var res_data={
                ok:0,
                message:'用户名重复了',
                user:'',
                id:''
            }
        console.log(err,f_data)
        if(f_data.length){
            res.json(res_data)
        }else{
            db_user.insertOne(r_data,function(err,data){
                console.log(db_user.find({user:r_data.user}))
                console.log(data)
                if(!err){
                        console.log(f_data)
                        // db_user.find({userr,r:req.user}).toArray(function(err,f_data){
                        // })
                        res_data.ok=1
                        res_data.message='注册成功'
                        res_data.user=data.ops[0].user
                        res_data.id=data.ops[0]._id.toString()
                        res.json(res_data)
                    
                }else{
                    res_data[err]='写入失败'
                    res.json(res_data)
                }
            })
        }
    })
})
//购物车
app.post('/api/shoppingcart',function(req,res,err){
    //way=get&id=001&data=json字串
    //way
    //  get 为获取
    //  set 为保存
    console.log('shoppingcart>>',req.body)
    res.append('Access-Control-Allow-Origin','*')
    var r_data={
            way:req.body.way,
            id:req.body.id,
            json:req.body.data
        }
    if(r_data.way=='get'){
        db_shopping.find({_id:r_data.id}).toArray(function(err,f_data){
            var _data={}
            if(!f_data.length){
               db_shopping.insertOne({_id:r_data.id,data:_data},function(err,data){
                    console.log(err,data)
                    res.json(_data)
               })
            }else{
                res.json(f_data[0].data)
            }
        })
    }else if(r_data.way=='set'){
        db_shopping.updateOne({_id:r_data.id},{$set:{data:r_data.json}},function(err,rdata){
            console.log(err)
            if(!err){
                res.json(r_data.json)
            }else{
                res.json({err:'写入错误'})
            }
        })
    }
})
//商品
app.post('/api/goods',function(req,res,err){
    console.log('login>>',req.body)
    var _data={
        id:req.body.id
        }
    res.append('Access-Control-Allow-Origin','*')
    db_goods.find({id:_data.id}).toArray(function(err,data){
        res.json(data)
    })
})
//搜索
app.post('/api/quire',function(req,res,err){
    console.log('quire>>',req.body)
    var _data={
        inquire:req.body.inquire,//要模糊搜索的文字
        start:req.body.start,//开始位置
        num:req.body.num,//读取数量
        sort:req.body.sort,//排序1为正序0为倒序不带此参数则默认
        maxprice:req.body.maxprice,//最大价格
        mixprice:req.body.mixprice,//最小价格
        type:req.body.type//类型
        }
    res.append('Access-Control-Allow-Origin','*')
    var ep= new RegExp(_data.inquire,'ig')
        if(_data.maxprice!=undefined){
            //价格分段
            var g=db_goods.find({$or:[{title:ep},{type:ep}],price:{$gt:Number(_data.mixprice)},price:{$lt:Number(_data.maxprice)}})
        }else{
            //默认
            var g=db_goods.find({$or:[{title:ep},{type:ep}]})
        }
        //排序
        if(_data.sort!=undefined){
            if(Number(_data.sort)==0){
                _data.sort=-1
            }else{
                _data.sort=1
            }
            // console.log('排序q',g)
            g=g.sort({price:_data.sort})
            console.log('排序',g)
            // console.log(1)
                 

        }
        //分页
        if(_data.start!=undefined ){
            console.log(_data.start)
            g=g.skip(Number(_data.start)).limit(Number(_data.num))
        }
        g.toArray(function(err,data){
            console.log(data)
                 
            var j_g=[]
            for(var i=0;i<data.length;i++){
                var _data_1={
                    img:data[i].img,
                    title:data[i].title,
                    title_ad:data[i].title_ad,
                    price:data[i].price,
                    id:data[i].id,
                    }
                j_g.push(_data_1)
            }
            var ret={
                start:_data.start?_data.start:0,//数据库里的位置
                sum:j_g.length,//结果总数量
                data:j_g
                }
            res.json(ret)
        })

})
app.listen(1803);
