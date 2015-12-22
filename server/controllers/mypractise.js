var mongoose = require('mongoose'),
    Product = mongoose.model('Product');

module.exports = function(Users, app) {

    return {

        addproduct: function(req, res) {

           var myproduct = new Product(req.body);

              console.log(req.body);

           myproduct.save(function(err,items) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the product details'
                    });
                }
                else
                {

                    res.send(items);

                }

             });

            
           
        },
         retreiveproduct: function(req, res) {

             Product.find({},function(err,items) {

                    if(err)
                    {
                        console.log(err);
                    }
                   else
                   {
                    res.send(items);
                    }

              });
           
        },
         editproduct: function(req, res) {

           Product.update({_id:req.body.productid},{productname:req.body.productname,colour:req.body.productcolour,price:req.body.productprice},function(err) {

                    if(err)
                    {
                        console.log(err);
                    }
                   else
                   {
                     
                    Product.find({},function(err,items) {
                          if(err)
                          {
                              console.log(err);
                          }
                         else
                         {
                             res.send(items);
                          }
                      });

                   }

              });

        },
         deleteproduct: function(req, res) {

              var deleteid=req.body.deletingproductid;

             Product.remove({_id:deleteid},function(err) {

                    if(err)
                    {
                        console.log(err);
                    }
                   else
                   {
                    res.send(200);
                    }

              });
        },
        addresourceproducts:function(req,res)
        {
          console.log(req.body);

          var myproduct = new Product(req.body);

              console.log(req.body);

           myproduct.save(function(err,items) {
                if (err) {
                    return res.status(500).json({
                        error: 'Cannot save the product details'
                    });
                }
                else
                {

                    res.send(items);

                }

             });
        },
        retreiveresourceproducts:function(req,res)
        {
          console.log("pradeep"+JSON.stringify(req.body));
          res.json({"productid":"123","name":"pradeep","age":"25"});
        },
        updateresourceproducts:function(req,res)
        {
          console.log("update"+req.params.productid);
          console.log("update"+req.body.productid); 
          console.log("update"+req.body.name);  
          console.log("update"+req.body.age); 
          res.send({"productid":"123","name":"pradeep","age":"35"});
        },
        retreiveallproducts:function(req,res)
        {

              console.log("prasad");
          res.send([{"productid":"123"},{"productid":"456"}]);
           
        },
        deleteproducts:function(req,res)
        {
          console.log("delete"+JSON.stringify(req.body)); 
          res.send({"productid":"123","name":"pradeep","age":"29"});
        }

    }

};