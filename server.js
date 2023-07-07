const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const _=require("lodash");
app.use(bodyParser.urlencoded ( {extended:true}))
app.use(express.static("public"))
app.set('view engine' , 'ejs')

const mongoose=require("mongoose");
mongoose.connect("mongodb+srv://shalu-sharma:test123@cluster0.v5xfvi5.mongodb.net/todoListDB",{useNewUrlParser:true})
.then(()=>console.log("Mongoose connected Successfully."))
.catch((err)=>console.log(err))

const itemSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    } 
})
const listSchema=mongoose.Schema({
    name:String,
    items:[itemSchema]
})
const Item=mongoose.model("Item",itemSchema)
const List=mongoose.model("List",listSchema)
const item1={
    name:"Welcome to your todo List."
}
const item2={
    name:"Hit the + button to add new item."
}
const item3={
    name:"<-- Hit this to delete item."
}
const defaultItems=[item1,item2,item3]

app.get('/', (req, res) => {
    Item.find({}).then((foundItems)=>{
        if(foundItems.length===0){
            Item.insertMany(defaultItems).then(()=>console.log("Default Items saved scuccessfully."))
            res.redirect("/")
        }
        else{
            res.render("index",{listTitle:"Today",newItems:foundItems})
        }
    })
});
app.get("/:customListName",(req,res)=>{
    const customListName=_.capitalize(req.params.customListName);
    List.findOne({name:customListName}).then((foundList)=>{
        if(!foundList){
            const list=new List({
                name:customListName,
                items:defaultItems
            })
            list.save().then(()=>console.log("List saved."))
            res.redirect("/"+customListName)
            }
        else{
            res.render("index",{listTitle:customListName,newItems:foundList.items})
        }
    })

})
app.post('/', (req,res) => {
    const listTitle=req.body.list;
    if(!req.body.activity){
        if(listTitle==="Today"){
            Item.find({}).then((items)=>{
                res.render("error",{errorMessage:"Empty items can't be added.",listTitle:listTitle})
            })
        }
        else{
            List.find({name:listTitle}).then((list)=>{
                res.render("error",{errorMessage:"Empty items can't be added.",listTitle:listTitle})
            })
        }
       
    }
    else{
var newItem=new Item({
    name:req.body.activity
   });
   if(listTitle==="Today"){
    newItem.save()
    res.redirect("/")
   }
   else{
    List.findOne({name:listTitle}).then((list)=>{
        console.log(listTitle)
        list.items.push(newItem)
        list.save();
        res.redirect("/"+listTitle)
    })
   }


    }
    
})
app.post("/delete",(req,res)=>{
    const listName=req.body.listTitle;
    console.log(listName)
    const itemId=req.body.checkbox;
    if(listName==="Today"){
        Item.findByIdAndRemove({_id:itemId}).then(()=>console.log("Item deleted Successfully."))
        res.redirect("/")
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemId}}}).then(()=>{
            res.redirect("/"+listName)
            console.log("Item deleted succcessfully from "+ listName +" List.")
        })
    }
    
})
app.get('/work', (req, res) => {
    res.render('index' ,  {listTitle:"Work list",newItems:worklist , listtype:"work"})
});

app.listen( process.env.PORT||3000,function() {
    console.log('server is listening on port 3000')
} ) 