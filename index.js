const express = require('express');
const paypal = require('paypal-rest-sdk');
var PORT = process.env.PORT || 3000;
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': "AZpF8ztf3OuNVNyWT5n3FM2UDA--GDRyFw7dt0s_UOph0c4bBU_bLNssPJO8ND32w8F_jpHFOmQWV2Id",
  'client_secret': "EGEVByMprrwjEzUmgofTiA4T2jFvoQqoFm7GQuUCwpqaP6eAHl8BxtTxyOJ922a7-KJhqgxXh5yy6ITx",
});

const app = express();

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));

app.post('/pay', (req, res) => {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "https://paypalnodeorigano.herokuapp.com/success",
          "cancel_url": "https://paypalnodeorigano.herokuapp.com/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Red Sox Hat",
                  "sku": "001",
                  "price": "25.00",
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "25.00"
          },
          "description": "Hat for the best team ever"
      }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
  });

  app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "25.00"
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send('Success');
      }
  });
  });

  app.get('/cancel', (req, res) => res.send('Cancelled'));


app.listen(PORT, () => console.log(`Server Started on ${PORT}`));