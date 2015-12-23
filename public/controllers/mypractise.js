'use strict';

/* jshint -W098 */
angular.module('mean.mypractise').controller('MypractiseController', ['$scope', 'Global', 'Mypractise','$http',
  function($scope, Global, Mypractise,$http) {
    $scope.global = Global;
    $scope.package = {
      name: 'mypractise'
    };

     $http.get("/api/retreiveproduct")
    .then(function(response) 
     {
     	$scope.allproducts = response.data;
     });


     $scope.addproduct = function(){
        var productname=$scope.productnamedetails;
        var productcolour=$scope.productcolour;
        var productprice=$scope.productprice;

            var productdetails={};

            productdetails.productname=productname;
            productdetails.colour=productcolour;
            productdetails.price=productprice;

         if(productname == undefined || productcolour == undefined || productprice == undefined)
         {

         	alert("please enter the mandatory details");
         }
         else
         {

              $scope.details = new Mypractise(productdetails); 
              $scope.details.$save(function(response) {

                console.log(response);
      
              });

         /*	$http.post("/api/addproduct",productdetails)
		       .success(function(response) 
		      {

                    $scope.allproducts.push(response);
                     alert("product successfully added");

		      }).error(function(response)
		        {
                     console.log(response);
              });*/


         }

            
    };

     $scope.deleteproduct = function(deleteid){
      
      /*  if (confirm("Are you sure you want delete this product") == true) {     
    
                $http.post("/api/deleteproduct",productdetails)
                       .success(function(response) 
                      {

                        var products = _.reject($scope.allproducts, function(product){ return product._id == deleteid; });

                        $scope.allproducts=products;

                      }).error(function(response)
                        {
                             console.log(response);
                      });

         }  */   
 
     };

     $scope.addresourceproduct = function(){

        var details = new Mypractise(productdetails); 
              details.$save(function(response) {

                console.log(response);
      
              });

     };

     $scope.retreiveallresourceproduct = function(){

        Mypractise.query(function(response){

               console.log(response);

        });

     };

     $scope.retreiveparticulerresourceproduct = function(){

        Mypractise.get({'productid':deleteid},function(response){

               console.log(response);

        });

     };

     
     $scope.editresourceproduct = function(){
                var details=$scope.details;
                    details.$update(function(response1){        
                     console.log(response1);
               });

     };

     $scope.deleteresourceproduct = function(){
	            var deatails=$scope.details;
               deatails.$remove(function(response1){
                  
                  console.log(response1);

               });
     };

     $scope.editproduct = function(editdetails){

                bootbox.dialog({
           message :'<table><tr><td>Productg Name</td><td><input type="text" id="editproductname"  value="'+editdetails.productname+'"></td></tr><br><tr><td>Product Colour </td><td><input type="text" id="editproductcolour" value="'+editdetails.colour+'"></td></tr><tr><td>Product Price</td><td><input type="text" id="editproductprice" value="'+editdetails.price+'"></td></tr></table>',
           title: "",
           buttons: {
               success: {
               label: "Savechanges",
               className: "btn-success",
               callback: function() 
               {

                  var productdetails={};

                  productdetails.productname=$("#editproductname").val();
                  productdetails.productcolour=$("#editproductcolour").val();
                  productdetails.productprice=$("#editproductprice").val();
                  productdetails.productid=editdetails._id;

     
                $http.post("/api/editproduct",productdetails)
                       .success(function(response) 
                      {
                            alert("succussfully updated");
                            $scope.allproducts=response;

                      }).error(function(response)
                        {
                             console.log(response);
                      });


                  
               }
             },
             failur: {
          label: "cancel",
          className: "btn-success",
          callback: function() {


                 }
              }
         }
       }); 
     };

  }
]);
