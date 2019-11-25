using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Data.SqlClient;
using System.Collections.Generic;
using Microsoft.Extensions.Primitives;
using System.Text;

namespace FunctionBFApp
{
    public static class Function1
    {
          [FunctionName("GetAllProducts")]
          public static async Task<IActionResult> GetAllProducts(
               [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
               ILogger log)
          {
               log.LogInformation("C# HTTP trigger function processed a request.");
               var connString = Environment.GetEnvironmentVariable("sqldb_connection", EnvironmentVariableTarget.Process);
               log.LogInformation("connstring = " + connString);
             

               using (SqlConnection conn = new SqlConnection(connString))
               {
                    conn.Open();

                    List<Product> products = new List<Product>();

                    var text = "select * from Product";

                    using (SqlCommand cmd = new SqlCommand(text, conn))
                    {
                         // Execute the command and log the # rows affected.
                         var reader = cmd.ExecuteReader();
                         var c = 0;
                         while (reader.Read())
                         {
                              var id = reader.GetInt32(0);
                              var name = reader.GetString(1);
                              var description = reader.GetString(2);
                              var smallImageUrl = reader.GetString(3);
                              var largeImageUrl = reader.GetString(4);
                              var imageName = reader.GetString(5);

                              c++;

                              products.Add
                                   (
                                        new Product
                                        {
                                             Id = id,
                                             Name = name,
                                             Description = description,
                                             SmallImageUrl = smallImageUrl,
                                             LargeImageUrl = smallImageUrl,
                                             ImageName = imageName
                                        }
                                   );

                              //log.LogInformation($"id={id} -- entry={entry}");
                         }
                         log.LogInformation($"{c} rows were selected");
                    }

                    return new OkObjectResult(JsonConvert.SerializeObject(products));       
               }
          }

          [FunctionName("GetProductById")]
          public static async Task<IActionResult> GetProductById(
               [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
               ILogger log)
          {
               log.LogInformation("C# HTTP trigger function processed a request.");
               var connString = Environment.GetEnvironmentVariable("sqldb_connection");

               string productIdString = req.Query["productId"];

               using (SqlConnection conn = new SqlConnection(connString))
               {
                    conn.Open();

                    Product retResult = null;

                    var productId = Convert.ToInt32(productIdString);
                    var sql = "select * from Product where Id=" + productId;
                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                         // Execute the command and log the # rows affected.
                         var reader = cmd.ExecuteReader();

                         if (reader.Read())
                         {
                              var id = reader.GetInt32(0);
                              var name = reader.GetString(1);
                              var description = reader.GetString(2);
                              var smallImageUrl = reader.GetString(3);
                              var largeImageUrl = reader.GetString(4);
                              var imageName = reader.GetString(5);

                              retResult = new Product
                              {
                                   Id = id,
                                   Name = name,
                                   Description = description,
                                   SmallImageUrl = smallImageUrl,
                                   LargeImageUrl = largeImageUrl,
                                   ImageName = imageName
                              };
                         }
                    }

                    return new OkObjectResult(JsonConvert.SerializeObject(retResult));        
               }
          }

          [FunctionName("GetNumberofProductsInCart")]
          public static async Task<IActionResult> GetNumberofProductsInCart(
               [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
               ILogger log)
          {
               log.LogInformation("C# HTTP trigger function processed a request.");
               var connString = Environment.GetEnvironmentVariable("sqldb_connection");
               var distinctProductsInCartCount = 0;


               using (SqlConnection conn = new SqlConnection(connString))
               {
                    conn.Open();

                    Product retResult = null;

                    var sql = "select sum(QuantityDesired) from Cart";
                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                         // Execute the command and log the # rows affected.
                         var tmpResult = cmd.ExecuteScalar();
                         if (!int.TryParse(tmpResult.ToString(), out distinctProductsInCartCount))
                              distinctProductsInCartCount = 0;
                    }

                    return new OkObjectResult(JsonConvert.SerializeObject(distinctProductsInCartCount));
               }
          }

          [FunctionName("GetProductsInCart")]
          public static async Task<IActionResult> GetProductsInCart(
               [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
               ILogger log)
          {
               log.LogInformation("C# HTTP trigger function processed a request.");
               var connString = Environment.GetEnvironmentVariable("sqldb_connection");
               var distinctProductsInCartCount = 0;


               using (SqlConnection conn = new SqlConnection(connString))
               {
                    conn.Open();

                    List<CartItem> cartItems = new List<CartItem>();

                    StringBuilder sbSql = new StringBuilder();
                    sbSql.AppendLine(" select c.ProductId, c.QuantityDesired, p.Name, p.Description, ");
                    sbSql.AppendLine(" p.SmallImageUrl, p.LargeImageUrl, p.ImageName ");
                    sbSql.AppendLine(" from Cart c inner join Product p on c.ProductId = p.Id");

                    using (SqlCommand cmd = new SqlCommand(sbSql.ToString(), conn))
                    {
                         // Execute the command and log the # rows affected.
                         var reader = cmd.ExecuteReader();
                         var c = 0;
                         while (reader.Read())
                         {
                              var productId = reader.GetInt32(0);
                              var quantityDesired = reader.GetInt32(1);
                              var name = reader.GetString(2);
                              var description = reader.GetString(3);
                              var smallImageUrl = reader.GetString(4);
                              var largeImageUrl = reader.GetString(5);
                              var imageName = reader.GetString(6);


                              c++;

                              var productDetails = new Product
                              {
                                   Id = productId,
                                   Description = description,
                                   Name = name,
                                   SmallImageUrl = smallImageUrl,
                                   LargeImageUrl = largeImageUrl,
                                   ImageName = imageName
                              };

                              cartItems.Add
                                   (
                                        new CartItem
                                        {
                                             ProductId = productId,
                                             QuantityDesired = quantityDesired,
                                             ProductDetails = productDetails
                                        }
                                   );
                         }
                         log.LogInformation($"{c} rows were selected");
                    }

                    return new OkObjectResult(JsonConvert.SerializeObject(cartItems));
               }
          }



          [FunctionName("AddItemToCart")]
          public static async Task<IActionResult> AddItemToCart(
              [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req,
              ILogger log)
          {
               log.LogInformation("C# HTTP trigger function processed a request.");
               var connString = Environment.GetEnvironmentVariable("sqldb_connection");

               string productIdString = req.Query["productId"];
               string quantityString = req.Query["quantity"];
               if (string.IsNullOrEmpty(productIdString) || string.IsNullOrEmpty(quantityString))
                    new BadRequestObjectResult("Please pass a productId and quantity in the query string or in the request body.");


               using (SqlConnection conn = new SqlConnection(connString))
               {
                    conn.Open();

                    

                    var productId = Convert.ToInt32(productIdString);
                    var quantity = Convert.ToInt32(quantityString);

                    var sql = $"insert into Cart select {productId}, {quantity}";


                    var checkSql = $"select * from Cart where ProductId=${productId}";
                    using (SqlCommand checkCmd = new SqlCommand(checkSql, conn))
                    {
                         var readerCheck = checkCmd.ExecuteReader();
                         if (readerCheck.Read())
                         {
                              var preExistingQty = readerCheck.GetInt32(1);
                              quantity += preExistingQty;
                              sql = $"update Cart set QuantityDesired = {quantity} where ProductId={productId}";
                         }

                         readerCheck.Close();
                         
                    }

                    using (SqlCommand cmd = new SqlCommand(sql,conn))
                    {
                         // Execute the command and log the # rows affected.
                         var rowsAffected = cmd.ExecuteNonQuery();

                         if (rowsAffected == 1)
                              return new OkObjectResult("Product quantity added to cart!");
                         else
                              return new BadRequestObjectResult("Error adding product quantity to cart!");
                    }
               }
          }


          [FunctionName("RemoveItem")]
          public static async Task<IActionResult> RemoveItem(
              [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = null)] HttpRequest req,
              ILogger log)
          {
               log.LogInformation("C# HTTP trigger function processed a request.");
               var connString = Environment.GetEnvironmentVariable("sqldb_connection");

               string productIdString = req.Query["productId"];

               if (string.IsNullOrEmpty(productIdString))
                    new BadRequestObjectResult("Please pass a productId in the query string or in the request body.");


               using (SqlConnection conn = new SqlConnection(connString))
               {
                    conn.Open();

                    var productId = Convert.ToInt32(productIdString);

                    var sql = $"delete from Cart where ProductId ={productId}";

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                         try
                         {
                              // Execute the command and log the # rows affected.
                              var rowsAffected = cmd.ExecuteNonQuery();
                              return new OkObjectResult("Product removed from cart!");
                         }
                         catch(Exception ex)
                         {
                              return new BadRequestObjectResult("Error removing product from cart!");
                         }
                    }
               }
          }

          [FunctionName("UpdateProductInCart")]
          public static async Task<IActionResult> UpdateProductInCart(
              [HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = null)] HttpRequest req,
              ILogger log)
          {
               log.LogInformation("C# HTTP trigger function processed a request.");
               var connString = Environment.GetEnvironmentVariable("sqldb_connection");

               string productIdString = req.Query["productId"];
               string quantityString = req.Query["quantity"];
               if (string.IsNullOrEmpty(productIdString) || string.IsNullOrEmpty(quantityString))
                    new BadRequestObjectResult("Please pass a productId and quantity in the query string or in the request body.");


               if (string.IsNullOrEmpty(productIdString))
                    new BadRequestObjectResult("Please pass a productId in the query string or in the request body.");


               using (SqlConnection conn = new SqlConnection(connString))
               {
                    conn.Open();

                    var productId = Convert.ToInt32(productIdString);
                    var quantity = Convert.ToInt32(quantityString);

                    var sql = $"update Cart set QuantityDesired={quantity} where ProductId ={productId}";

                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                         // Execute the command and log the # rows affected.
                         var rowsAffected = cmd.ExecuteNonQuery();

                         if (rowsAffected == 1)
                              return new OkObjectResult("Product Quantity updated in cart!");
                         else
                              return new BadRequestObjectResult("Error updating product quantity in cart!");
                    }
               }
          }
     }


     public class Product
     {
          public int Id { get; set; }
          public string Name { get; set; }
          public string Description { get; set; }
          public string SmallImageUrl { get; set; }
          public string LargeImageUrl { get; set; }
          public string ImageName { get; set; }
     }

     public class CartItem
     {
          public int ProductId { get; set; }
          public int QuantityDesired { get; set; }
          public Product ProductDetails { get; set; }

     }
}
