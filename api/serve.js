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
            res.json(data)
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

app.listen(1803);
